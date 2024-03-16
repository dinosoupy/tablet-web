import { ChatbotUIContext } from "@/context/context";
import useHotkey from "@/lib/hooks/useHotkey";
import { ArrowLongUpIcon } from '@heroicons/react/24/outline'
import React, { useContext, useState } from "react";
import { useChatHandler } from "@/lib/hooks/useChatHandler";
import ReactTextareaAutosize from "react-textarea-autosize"

export const ChatInput = ({ }) => {
    const {
        chatMessages,
        setChatMessages,
    } = useContext(ChatbotUIContext);

    const {
        chatInputRef,
        handleSendMessage,
        handleFocusChatInput
    } = useChatHandler();

    useHotkey("l", () => {
        handleFocusChatInput();
    });

    const [isTyping, setIsTyping] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [firstTokenReceived, setFirstTokenReceived] = useState(false);

    const handleInputChange = (value) => {
        setUserInput(value)
    }

    const handleKeyDown = (event) => {
        if (!isTyping && event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage({ userInput, setUserInput, setIsGenerating });
        }
    };

    return (
        <>
            <div className="bg-white relative mt-3 flex min-h-[50px] w-full p-2 items-center justify-center rounded-md">
                <ReactTextareaAutosize
                    ref={chatInputRef}
                    className="bg-transparent placeholder:text-muted-foreground focus:outline-none rounded-md flex w-full resize-none px-3 py-2 text-sm text-black"
                    minRows={1}
                    maxRows={18}
                    placeholder="Ask anything."
                    value={userInput}
                    onChange={event => handleInputChange(event.target.value)}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={() => setIsTyping(true)}
                    onCompositionEnd={() => setIsTyping(false)}
                />
                <ArrowLongUpIcon
                    className="text-black rounded-md border-2 w-10 p-1"
                    onClick={() => {
                        if (!userInput) return;

                        handleSendMessage(userInput, chatMessages, setIsGenerating);
                    }}
                />
            </div>
        </>
    );
}