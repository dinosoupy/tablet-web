import Loading from "@/app/loading"; // react suspense boundary
import { useChatHandler } from "@/lib/hooks/useChatHandler";
import { ChatbotUIContext } from "@/context/context"; // variables from distant parents (intead of passing props)
// import { getChatFilesByChatId } from "@/db/chat-files";
// import { getChatById } from "@/db/chats";
// import { getMessageFileItemsByMessageId } from "@/db/message-file-items";
// import { getMessagesByChatId } from "@/db/messages";
// import { getMessageImageFromStorage } from "@/db/storage/message-images";
// import { convertBlobToBase64 } from "@/lib/blobToBase64"; // image blob to b64
import useHotkey from "@/lib/hooks/useHotkey"; // custom useEffect hook to add and remove keydown event listener
import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useScroll } from "@/lib/hooks/useScroll";
import { ChatInput } from "@/components/Chat/ChatInput";
import { ChatMessages } from "@/components/Chat/ChatMessages"
import { ChatScrollButtons } from "@/components/Chat/ChatScrollButtons";
// import { ChatSecondaryButtons } from "@/components/Chat/ChatSecondaryButtons";

const ChatUI = () => {
    useHotkey("o", () => handleNewChat());

    const params = useParams();

    const {
        setChatMessages,
        // selectedChat,
        // setSelectedChat,
        // setChatSettings,
        setChatImages,
        // assistants,
        // setSelectedAssistant,
        // setChatFileItems,
        // setChatFiles,
        // setShowFilesDisplay,
        // setUseRetrieval,
    } = useContext(ChatbotUIContext); // consume values from react context

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
        // function to retrieve chat messages and scroll to the bottom
        const fetchData = async () => {
            // await fetchMessages();
            // await fetchChat();

            scrollToBottom();
            setIsAtBottom(true);
        };

        // is chat id exists, retrieve messages and focus on chat input
        if (params.chatid) {
            fetchData().then(() => {
                handleFocusChatInput();
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    // const fetchMessages = async () => {
    //     const fetchedMessages = await getMessagesByChatId(params.chatid);

    //     // fetch images in response
    //     const imagePromises = fetchedMessages.flatMap((message) =>
    //         message.image_paths
    //             ? message.image_paths.map(async (imagePath) => {
    //                 const url = await getMessageImageFromStorage(imagePath);

    //                 if (url) {
    //                     const response = await fetch(url);
    //                     const blob = await response.blob();
    //                     const base64 = await convertBlobToBase64(blob);

    //                     return {
    //                         messageId: message.id,
    //                         path: imagePath,
    //                         base64,
    //                         url,
    //                         file: null,
    //                     };
    //                 }

    //                 return {
    //                     messageId: message.id,
    //                     path: imagePath,
    //                     base64: "",
    //                     url,
    //                     file: null,
    //                 };
    //             })
    //             : []
    //     );

    //     const images = await Promise.all(imagePromises.flat());
    //     setChatImages(images);

    //     // fetch files in response
    //     const messageFileItemPromises = fetchedMessages.map(
    //         async (message) => await getMessageFileItemsByMessageId(message.id)
    //     );

    //     const messageFileItems = await Promise.all(messageFileItemPromises);

    //     const uniqueFileItems = messageFileItems.flatMap(
    //         (item) => item.file_items
    //     );
    //     setChatFileItems(uniqueFileItems);

    //     const chatFiles = await getChatFilesByChatId(params.chatid);

    //     setChatFiles(
    //         chatFiles.files.map((file) => ({
    //             id: file.id,
    //             name: file.name,
    //             type: file.type,
    //             file: null,
    //         }))
    //     );

    //     setUseRetrieval(true);
    //     setShowFilesDisplay(true);

    //     const fetchedChatMessages = fetchedMessages.map((message) => {
    //         return {
    //             message,
    //             fileItems: messageFileItems
    //                 .filter((messageFileItem) => messageFileItem.id === message.id)
    //                 .flatMap((messageFileItem) =>
    //                     messageFileItem.file_items.map((fileItem) => fileItem.id)
    //                 ),
    //         };
    //     });

    //     setChatMessages(fetchedChatMessages);
    // };

    // const fetchChat = async () => {
    //     const chat = await getChatById(params.chatid);
    //     if (!chat) return;

    //     if (chat.assistant_id) {
    //         const assistant = assistants.find(
    //             (assistant) => assistant.id === chat.assistant_id
    //         );

    //         if (assistant) {
    //             setSelectedAssistant(assistant);
    //         }
    //     }

    //     setSelectedChat(chat);
    //     setChatSettings({
    //         model: chat.model,
    //         prompt: chat.prompt,
    //         temperature: chat.temperature,
    //         contextLength: chat.context_length,
    //         includeProfileContext: chat.include_profile_context,
    //         includeWorkspaceInstructions: chat.include_workspace_instructions,
    //         embeddingsProvider: chat.embeddings_provider,
    //     });
    // };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="relative flex h-full flex-col items-center">
            <div className="absolute left-4 top-2.5 flex justify-center">
                <ChatScrollButtons
                    isAtTop={isAtTop}
                    isAtBottom={isAtBottom}
                    isOverflowing={isOverflowing}
                    scrollToTop={scrollToTop}
                    scrollToBottom={scrollToBottom}
                />
            </div>

            {/* <div className="absolute right-4 top-1 flex h-[40px] items-center space-x-2">
                <ChatSecondaryButtons />
            </div> */}

            <div className="bg-secondary flex max-h-[50px] min-h-[50px] w-full items-center justify-center border-b-2 px-20 font-bold">
                <div className="max-w-[300px] truncate sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]">
                    Chat
                </div>
            </div>

            <div
                className="flex size-full flex-col overflow-auto border-b"
                onScroll={handleScroll}
            >
                <div ref={messagesStartRef} />

                {/* <ChatMessages /> */}

                <div ref={messagesEndRef} />
            </div>

            <div className="relative w-[300px] items-end pb-8 pt-5 sm:w-[400px] md:w-[500px] lg:w-[660px] xl:w-[800px]">
                <ChatInput />
            </div>
        </div>
    );
};

export default ChatUI
