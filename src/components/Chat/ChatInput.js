import { ChatbotUIContext } from "@/context/context";
import useHotkey from "@/lib/hooks/useHotkey";
// import { LLM_LIST } from "@/lib/models/llm/llm-list";
// import { cn } from "@/lib/utils";
import {
    // IconBolt,
    // IconCirclePlus,
    // IconPlayerStopFilled,
    IconSend
} from "@tabler/icons-react";
import React, { useContext, useState } from "react";
// import { useTranslation } from "react-i18next";
import { Input } from "@/components/Chat/Input";
import { TextareaAutosize } from "@/components/Chat/TextareaAutosize";
// import { ChatCommandInput } from "./chat-command-input";
// import { ChatFilesDisplay } from "./chat-files-display";
import { useChatHandler } from "@/lib/hooks/useChatHandler";
// import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command";
// import { useSelectFileHandler } from "./chat-hooks/use-select-file-handler";

const ChatInput = ({ }) => {
    // const { t } = useTranslation();

    useHotkey("l", () => {
        handleFocusChatInput();
    });

    const [isTyping, setIsTyping] = useState(false);

    const {
        userInput,
        chatMessages,
        // isGenerating,
        // selectedPreset,
        // selectedAssistant,
        // focusPrompt,
        // setFocusPrompt,
        // focusFile,
        // focusTool,
        // setFocusTool,
        // isToolPickerOpen,
        // isPromptPickerOpen,
        // setIsPromptPickerOpen,
        // isAtPickerOpen,
        // setFocusFile,
        // chatSettings,
        // selectedTools,
        // setSelectedTools
    } = useContext(ChatbotUIContext);

    const {
        chatInputRef,
        handleSendMessage,
        // handleStopMessage,
        handleFocusChatInput
    } = useChatHandler();

    // const { handleInputChange } = usePromptAndCommand();

    // const { filesToAccept, handleSelectDeviceFile } = useSelectFileHandler();

    // const fileInputRef = useRef(null);

    // useEffect(() => {
    //     setTimeout(() => {
    //         handleFocusChatInput();
    //     }, 200); // FIX: hacky
    // }, [selectedPreset, selectedAssistant]);

    const handleKeyDown = (event) => {
        if (!isTyping && event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            // setIsPromptPickerOpen(false);
            handleSendMessage(userInput, chatMessages, false);
        }

        // if (
        //     isPromptPickerOpen &&
        //     (event.key === "Tab" ||
        //         event.key === "ArrowUp" ||
        //         event.key === "ArrowDown")
        // ) {
        //     event.preventDefault();
        //     setFocusPrompt(!focusPrompt);
        // }

        // if (
        //     isAtPickerOpen &&
        //     (event.key === "Tab" ||
        //         event.key === "ArrowUp" ||
        //         event.key === "ArrowDown")
        // ) {
        //     event.preventDefault();
        //     setFocusFile(!focusFile);
        // }

        // if (
        //     isToolPickerOpen &&
        //     (event.key === "Tab" ||
        //         event.key === "ArrowUp" ||
        //         event.key === "ArrowDown")
        // ) {
        //     event.preventDefault();
        //     setFocusTool(!focusTool);
        // }
    };

    const handlePaste = (event) => {
        // const imagesAllowed = LLM_LIST.find(
        //     (llm) => llm.modelId === chatSettings?.model
        // )?.imageInput;
        // if (!imagesAllowed) return;

        const items = event.clipboardData.items;
        for (const item of items) {
            if (item.type.indexOf("image") === 0) {
                const file = item.getAsFile();
                if (!file) return;
                handleSelectDeviceFile(file);
            }
        }
    };

    return (
        <>
            {/* <ChatFilesDisplay /> */}

            {/* <div className="flex flex-wrap justify-center gap-2">
                {selectedTools &&
                    selectedTools.map((tool, index) => (
                        <div
                            key={index}
                            className="mt-2 flex justify-center"
                            onClick={() =>
                                setSelectedTools(
                                    selectedTools.filter(
                                        (selectedTool) => selectedTool.id !== tool.id
                                    )
                                )
                            }
                        >
                            <div className="flex cursor-pointer items-center justify-center space-x-1 rounded-lg bg-purple-600 px-3 py-1 hover:opacity-50">
                                <IconBolt size={20} />

                                <div>{tool.name}</div>
                            </div>
                        </div>
                    ))}
            </div> */}

            <div className="border-input relative mt-3 flex min-h-[60px] w-full items-center justify-center rounded-xl border-2">
                {/* <div className="absolute bottom-[76px] left-0 max-h-[300px] w-full overflow-auto rounded-xl dark:border-none">
                    <ChatCommandInput />
                </div> */}

                <>
                    {/* <IconCirclePlus
                        className="absolute bottom-[12px] left-3 cursor-pointer p-1 hover:opacity-50"
                        size={32}
                        onClick={() => fileInputRef.current?.click()}
                    /> */}

                    {/* Hidden input to select files from device */}
                    {/* <Input
                        ref={fileInputRef}
                        className="hidden"
                        type="file"
                        onChange={(e) => {
                            if (!e.target.files) return;
                            handleSelectDeviceFile(e.target.files[0]);
                        }}
                        accept={filesToAccept}
                    /> */}
                </>

                <TextareaAutosize
                    textareaRef={chatInputRef}
                    className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-md flex w-full resize-none rounded-md border-none bg-transparent px-14 py-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Ask anything."
                    // onValueChange={handleInputChange}
                    value={userInput}
                    minRows={1}
                    maxRows={18}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onCompositionStart={() => setIsTyping(true)}
                    onCompositionEnd={() => setIsTyping(false)}
                />

                <div className="absolute bottom-[14px] right-3 cursor-pointer hover:opacity-50">
                    {/* {isGenerating ? (
                        <IconPlayerStopFilled
                            className="hover:bg-background animate-pulse rounded bg-transparent p-1"
                            onClick={handleStopMessage}
                            size={30}
                        />
                    ) : ( */}
                    <IconSend
                        className="bg-primary text-secondary rounded p-1"
                        onClick={() => {
                            if (!userInput) return;

                            handleSendMessage(userInput, chatMessages, false);
                        }}
                        size={30}
                    />
                    {/* )} */}
                </div>
            </div>
        </>
    );
};

export default ChatInput