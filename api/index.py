from multiprocessing import Process, Queue, Manager
from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer
import os
import uuid
import time
import json
import psutil
import asyncio
import argparse
import uvicorn
from typing import Union

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

from .llm_process.llm_process import start_llm_process
from .schemas import CompletionParams, TokenCountParams, ModelLoadParams, ProcessCleanParams
from logging import getLogger
from .utils.utils import create_model_list

logger = getLogger("uvicorn")

# create context manager to perform setup and teardown for the whole app
@asynccontextmanager
async def lifespan(app: FastAPI): # generator function
    logger.info("starting...")

    app.state.models = create_model_list()
    app.state.llm_processes = {}
    init_task_scheduler()
    yield
    logger.info("stopping...")

def init_task_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(recurring_task_cleanup, 'interval', minutes=5)
    scheduler.start()

def recurring_task_cleanup():
    pass

app = FastAPI(lifespan=lifespan, docs_url="/api/docs", openapi_url="/api/openapi.json")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# process management class
class LLMProcess:
    def __init__(self):
        self.manager = Manager()
        self.request_queue = self.manager.Queue()
        self.response_queue = self.manager.Queue()
        self.process = None
        self.start_time = time.time()
        self.last_activity_time = time.time()
        self.queues = {}
        self.model_info = {}

    def start(self):
        # process executes the target function with the given args
        self.process = Process(
            target=self.run_llm_process, 
            args=(self.request_queue, self.response_queue))
        self.process.start()

    def stop(self):
        # passing None into the queue to gracefully shut down process
        self.request_queue.put(None)
        self.process.join(timeout=5)
        if self.process.is_alive(): # force kill process after 5 sec if still alive (fallback)
            self.process.terminate()

    # add request to queue within process      
    async def add_request_to_queue(
        self,
        task: str,
        params: Union[CompletionParams, TokenCountParams, ModelLoadParams]) -> str:
        request_id = str(uuid.uuid4())
        current_time = time.time()
        await asyncio.get_event_loop().run_in_executor(
            None,
            self.request_queue.put,
            (task, request_id, params))
        self.queues[request_id] = {task: params, "start_time": current_time}
        return request_id

    # get response from queue within process
    async def get_response_from_queue(self):
        response_id, response_message_json = await asyncio.get_event_loop().run_in_executor(
            None,
            self.response_queue.get)
        return response_id, response_message_json

    def push_back_result(self, response_id: str, response_str: str):
        self.response_queue.put(( response_id, response_str ))

    async def task_request_streaming(
        self, 
        task: str, 
        params: Union[CompletionParams, TokenCountParams, ModelLoadParams]):
        request_id = await self.add_request_to_queue(task, params)
        while True:
            try:
                response_id, response_message_json = await self.get_response_from_queue()
            except Exception as e:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Unexpected error occurred at task_request_streaming: {str(e)}")

            if response_id == request_id:
                response = json.loads(response_message_json)
                status = response.get("status")
                message = response.get("message")

                if "stream_done" in message:
                    del self.queues[response_id]
                    break
                else:
                    yield message
            else:
                self.push_back_result(response_id, response_message_json)

    async def task_request(self, task: str, params: Union[CompletionParams, TokenCountParams, ModelLoadParams]):
        request_id = await self.add_request_to_queue(task, params)
        while True:
            try:
                response_id, response_message_json = await self.get_response_from_queue()
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Unexpected error occurred at task_request: {str(e)}")

            if response_id == request_id:
                response = json.loads(response_message_json, strict=False)
                status = response.get("status")
                message = response.get("message")
                del self.queues[response_id]
                return status, message
            else:
                self.push_back_result(response_id, response_message_json)
                
    @staticmethod
    def run_llm_process(request_queue: Queue, response_queue: Queue):
        asyncio.run(start_llm_process(request_queue, response_queue))
        
    def clean_queues(self, timeout: int):
        current_time = time.time()
        for request_id, task_info in list(self.queues.items()):
            start_time = task_info["start_time"]
            if current_time - start_time > timeout:
                del self.queues[request_id]
                logger.debug(f"Removed expired request: {request_id}")
                
    def get_queues_info(self):
        queue_info = {}
        queue_info["request_queue_size"] = self.request_queue.qsize()
        queue_info["response_queue_size"] = self.response_queue.qsize()
        queue_info["queues"] = self.queues
        return queue_info

    def get_cpu_usage(self):
        process = psutil.Process(self.process.pid)
        cpu_usage = process.cpu_percent()
        return cpu_usage

    def get_memory_usage(self):
        process = psutil.Process(self.process.pid)
        memory_usage = process.memory_info().rss
        return memory_usage

def get_llm_process(model_id: str) -> LLMProcess:
    if model_id in app.state.llm_processes:
        llm_process: LLMProcess = app.state.llm_processes[model_id]
        return llm_process
    else:
        raise HTTPException(status_code=400, detail=f"No LLM process found for model_id: {model_id}")
    
def terminate_llm_process(model_id: str):
    llm_process = app.state.llm_processes.get(model_id)
    if llm_process:
        llm_process.stop()
        del app.state.llm_processes[model_id]
        return True, ""
    else: 
        error_message = f"Terminate process failed. model_id = {model_id} not found."
        return False, error_message

def create_llm_process(model_id: str) -> LLMProcess:
    llm_process = LLMProcess()
    app.state.llm_processes[model_id] = llm_process
    llm_process.start()
    return llm_process

@app.get("/api/healthchecker")
def healthchecker():
    return {"status": "success", "message": "Integrate FastAPI Framework with Next.js"}
    
@app.get("/management/processes")
async def get_management_processes():
    processes_info = {}
    for model_id, llm_process in app.state.llm_processes.items():
        process_info = {
            "model_id": model_id,
            "model_name": llm_process.model_info["model_name"],
            "model_path": llm_process.model_info["model_path"],
            "model_type": llm_process.model_info["model_type"],
            "context_length": llm_process.model_info["context_length"],
            "process_id": llm_process.process.pid,
            "cpu_usage": llm_process.get_cpu_usage(),
            "memory_usage": llm_process.get_memory_usage(),
            "current_queue": llm_process.get_queues_info()
        }
        processes_info[model_id] = process_info
    return {"processes": processes_info}

@app.post("/management/process/clean-up")
async def post_process_clean_up(params: ProcessCleanParams, model_id: str = Header(default="0", alias="X-Model-Id")):
    llm_process: LLMProcess = get_llm_process(model_id)
    llm_process.clean_queues(params.timeout)
    return {"process_clean_up": "success"}


@app.post("/v1/completions")
@app.post("/v1/chat/completions")
async def post_completion(request:Request, params: CompletionParams, model_id: str = Header(default="0", alias="X-Model-Id")):
    llm_process: LLMProcess = get_llm_process(model_id)

    if request.url.path == "/v1/completions" and params.prompt == "":
        raise HTTPException(status_code=400, detail="/v1/completions needs prompt string")
    if request.url.path == "/v1/chat/completions" and params.messages == []:
        raise HTTPException(status_code=400, detail="/v1/chat/completions needs messages list")

    if request.url.path == "/v1/chat/completions":
        params.apply_chat_template = True

    if params.stream:
        async def stream_completion():
            async for chunk in llm_process.task_request_streaming('completions_stream', params):
                yield f"data: {json.dumps(chunk)}\n\n"
        return StreamingResponse(stream_completion(), media_type="text/event-stream")
    else:
        status_code, response = await llm_process.task_request('completions_stream', params)
        if status_code == 200:
            return response
        else: 
            raise HTTPException(status_code=status_code, detail=response)


@app.post("/v1/internal/token-count")
async def post_token_count(params: TokenCountParams, model_id: str = Header(default="0", alias="X-Model-Id")):
    llm_process: LLMProcess = get_llm_process(model_id)

    status_code, response = await llm_process.task_request('token-count', params)
    if status_code == 200:
        return {'length': response}
    else: 
        raise HTTPException(status_code=status_code, detail=response)


@app.get("/v1/internal/model/info")
async def get_v1_internal_model_info(model_id: str = Header(default="0", alias="X-Model-Id")):
    llm_process: LLMProcess = get_llm_process(model_id)
    model_name = llm_process.model_info["model_name"]
    model_type = llm_process.model_info["model_type"]
    return {"model_name": model_name, "model_type": model_type}

@app.get("/v1/internal/model/list")
def get_v1_internal_model_list():
    model_names = list(app.state.models.keys())
    model_names = sorted(model_names)
    return {"model_names": model_names}


@app.post("/v1/internal/model/unload")
def post_model_unload(model_id: str = Header(default="0", alias="X-Model-Id")):
    llm_process: LLMProcess = get_llm_process(model_id)
    success, message =  terminate_llm_process(model_id)
    if success:
        return {"unload": "success"}
    else:
        raise HTTPException(status_code=500, detail=f"Unload model failed. {message=}")


@app.post("/v1/internal/model/load")
def post_model_load(params: ModelLoadParams, model_id: str = Header(default="0", alias="X-Model-Id")):
    model_name = params.llm_model_name
 
    if model_name not in app.state.models:
        raise HTTPException(status_code=400, detail=f"Error: {model_name} not found.")
    if app.state.llm_processes.get(model_id):
        raise HTTPException(status_code=400, detail=f"Error: model_id {model_id} already exists. Unload first.")

    params.llm_model_path = os.path.join("api", app.state.models[model_name]['path'])

    llm_process: LLMProcess = create_llm_process(model_id)

    status_code, response = asyncio.run(llm_process.task_request('load', params))
    if status_code == 200:
        llm_process.model_info = response
        return {"load": "success"}
    else: 
        success, message = terminate_llm_process(model_id)
        if not success:
            raise HTTPException(status_code=500, detail=f"Unload model failed. {message=}")
        raise HTTPException(status_code=status_code, detail=response)
    

def parse_arguments():
    parser = argparse.ArgumentParser(description='FastAPI server arguments')
    parser.add_argument('-a', '--addr',  type=str, default='127.0.0.1', help='ip addr to listen (default: 127.0.0.1)')
    parser.add_argument('-p', '--port',  type=int, default=4000, help='port number to listen (default: 4000)')
    parser.add_argument('--log-level', choices=['debug', 'info', 'warning', 'error', 'critical'], default='debug', help='Log level')
    args = parser.parse_args()
    return args


if __name__ == "__main__":
    args = parse_arguments()

    uvicorn.run(app, host=args.addr, port=args.port, access_log=True, log_level=args.log_level)