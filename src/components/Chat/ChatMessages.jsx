import { ChatbotUIContext } from "@/context/context"
import { useContext } from "react"
import { Message } from "@/components/Chat/Message"


export const ChatMessages = ({ }) => {
    const { chatMessages } = useContext(ChatbotUIContext)

    return chatMessages
        .sort((a, b) => a.message.sequence_number - b.message.sequence_number)
        .map((chatMessage) => {
            return (
                <Message
                    key={chatMessage.message.sequence_number}
                    message={chatMessage.message}
                />
            )
        })
}