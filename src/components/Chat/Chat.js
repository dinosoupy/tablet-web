"use client";

import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import createPrompt from "@/utils/createPrompt";

export default function Chat() {
  const { messages, setMessages, input, setInput, handleInputChange } = useChat(
    {
      api: "http://localhost:4000/v1/chat/completions",
    }
  );

  const reqBody = {
    model: "llama-2-7b-chat.Q4_K_M.gguf",
    prompt: "",
    messages: [],
    max_tokens: 4096,
    temperature: 0.8,
    seed: 0,
    stream: false,
    apply_chat_template: true,
    complete_text: false,
    top_p: 1,
    stop: [],
    repetition_penalty: 0,
    repetition_context_size: 20,
    top_k: 40,
    min_p: 0.05,
    typical_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    repet_penalty: 1.1,
    mirostat_mode: 0,
    mirostat_tau: 5,
    mirostat_eta: 0.1,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newUserMessage = {
      id: uuidv4(),
      role: "user",
      base_input: input,
      content: createPrompt("RESPONSE_SPACE_PROMPT", input),
    };
    setInput("");

    const updatedMessages = [...messages, newUserMessage];
    reqBody.messages = updatedMessages;
    setMessages(updatedMessages);

    try {
      console.log(reqBody);
      const response = await fetch(
        "http://localhost:4000/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqBody),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newAssistantMessage = {
        id: uuidv4(),
        role: "assistant",
        content: data.choices[0].message.content,
      };

      setMessages((prev) => {
        return [...prev, newAssistantMessage];
      });
      console.log("Server response:", data);
    } catch (error) {
      console.error("Error sending request to server:", error);
    }
  };

  const header = [
    "ID",
    "Responder Type",
    "Extremely Engaging",
    "Moderately Engaging",
    "Neutral",
    "Moderately Disinterested",
    "Extremely Disinterested",
    "Input",
  ];

  const filePath = "./response.csv";
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    const processResponses = async (lastMessage, secondLastMessage) => {
      const content = lastMessage.content.replace(/\n/g, "");
      if (content) {
        const matches = content.match(/\{\{([\s\S]*?)\}\}/);
        if (matches && matches.length > 1) {
          const contentWithinBraces = matches[1];
          const responseArray = contentWithinBraces.split(",");
          const row = [];

          row[0] = lastMessage.id;
          row[1] = "RESPONSE_SPACE_PROMPT";
          row[6] = secondLastMessage.base_input;

          for (let i = 0; i < 5; i++) {
            const [_, responseContent] = responseArray[i].trim().split(":");
            console.log(i, responseContent);
            row[i + 2] = responseContent;
          }

          console.log(`${row.join(",")}\n`);
          setResponses([...responses, row]);
        }
      }
    };

    const processLastMessage = async () => {
      if (messages.length < 2) return; // Ensure there are messages

      const lastMessage = messages[messages.length - 1];
      const secondLastMessage = messages[messages.length - 2];
      if (lastMessage.role === "assistant") {
        processResponses(lastMessage, secondLastMessage);
      }
    };

    processLastMessage();
  }, [messages]);

  return (
    <div className="relative flex flex-col w-full max-w-3xl h-[600px] px-4 py-4 mx-auto bg-[color:rgb(var(--background-secondary-rgb))] border border-gray-700 rounded-xl">
      <div className="flex flex-col justify-between h-full">
        <div className="overflow-y-auto mb-2">
          {messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap text-xl">
              {m.role === "user" ? (
                <div className="py-4">
                  <p className="font-bold text-green-400">User</p>
                  {m.base_input}
                </div>
              ) : (
                <div className="py-4">
                  <p className="font-bold text-blue-400">Annie</p>
                  {m.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <form className="mt-auto" onSubmit={handleSubmit}>
          <input
            className="w-full p-2 border border-gray-700 rounded shadow-xl bg-[color:rgb(var(--background-secondary-rgb))]"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>

        <div className="overflow-y-auto mb-2">
          {responses.map((r) => (
            <div key={r.id} className="whitespace-pre-wrap text-xl">
              {r}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
