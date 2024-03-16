import Loading from "@/app/loading"; // react suspense boundary
import { useChatHandler } from "@/lib/hooks/useChatHandler";
import useHotkey from "@/lib/hooks/useHotkey"; // custom useEffect hook to add and remove keydown event listener
import { useEffect, useState } from "react";
import { useScroll } from "@/lib/hooks/useScroll";
import { ChatInput } from "@/components/Chat/ChatInput";
import { ChatMessages } from "@/components/Chat/ChatMessages"
import { ChatScrollButtons } from "@/components/Chat/ChatScrollButtons";

const ChatUI = () => {
    useHotkey("o", () => handleNewChat());

    const { handleNewChat, handleFocusChatInput } = useChatHandler(); // custom hook to display chat

    const {
        messagesStartRef,
        messagesEndRef,
        handleScroll,
        scrollToBottom,
        setIsAtBottom,
        isAtTop,
        isAtBottom,
        isOverflowing,
        scrollToTop,
    } = useScroll(); // custom hook for scroll behaviour

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        scrollToBottom();
        setIsAtBottom(true);
        console.log("is at bottom", isAtBottom)
        handleFocusChatInput();
        setLoading(false);
    }, []);

    useEffect(() => {
        console.log("is at top", isAtTop)
        console.log("is at bottom", isAtBottom)
        console.log("is overflowing", isOverflowing)
    }, [isAtTop, isAtBottom, isOverflowing])

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="m-4 bg-white h-[600px] w-[500px] flex flex-none flex-col items-center rounded-md">
            <div className="absolute left-4 top-2.5 flex justify-center border-2">
                <ChatScrollButtons
                    isAtTop={isAtTop}
                    isAtBottom={isAtBottom}
                    isOverflowing={isOverflowing}
                    scrollToTop={scrollToTop}
                    scrollToBottom={scrollToBottom}
                />
            </div>

            <div className="bg-secondary flex max-h-[50px] min-h-[50px] w-full items-center justify-center border-b-2 px-20 font-bold">
                <div className="max-w-[300px] truncate sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]">
                    Chat
                </div>
            </div>

            <div
                className="flex size-full flex-col overflow-auto m-4 border-2"
                onScroll={handleScroll}
            >
                <div ref={messagesStartRef} />

                <ChatMessages />

                <div ref={messagesEndRef} />
            </div>

            <div className="relative w-full items-end pb-8 pt-5 ">
                <ChatInput />
            </div>
        </div>
    )
};

export default ChatUI;
