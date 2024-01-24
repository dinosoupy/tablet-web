import { useChatHandler } from "@/lib/hooks/useChatHandler"
import { ChatbotUIContext } from "@/context/context"
import { useContext, useState } from "react"
import { Message } from "@/components/Chat/Message"


const ChatMessages = ({ }) => {
    const { chatMessages, chatFileItems } = useContext(ChatbotUIContext)

    const { handleSendEdit } = useChatHandler()

    const [editingMessage, setEditingMessage] = useState()

    return chatMessages
        .sort((a, b) => a.message.sequence_number - b.message.sequence_number)
        .map((chatMessage, index, array) => {
            const messageFileItems = chatFileItems.filter(
                (chatFileItem, _, self) =>
                    chatMessage.fileItems.includes(chatFileItem.id) &&
                    self.findIndex(item => item.id === chatFileItem.id) === _
            )

            return (
                <Message
                    key={chatMessage.message.sequence_number}
                    message={chatMessage.message}
                    fileItems={messageFileItems}
                    isEditing={editingMessage?.id === chatMessage.message.id}
                    isLast={index === array.length - 1}
                    onStartEdit={setEditingMessage}
                    onCancelEdit={() => setEditingMessage(undefined)}
                    onSubmitEdit={handleSendEdit}
                />
            )
        })
}

export default ChatMessages