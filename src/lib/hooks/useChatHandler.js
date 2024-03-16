import { ChatbotUIContext } from "@/context/context"
import { useRouter } from "next/navigation"
import { useContext, useRef, useState } from "react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

// Temporary message objects are created and appended to chatMessages
// tempUserChatMessage contains userInput
// tempAssistantChatMessage has no content (filled after receiving response)
const createTempMessages = (
    messageContent,
    chatMessages,
    setChatMessages
) => {

    let tempUserChatMessage = {
        message: {
            chat_id: "",
            content: messageContent,
            created_at: "",
            id: uuidv4(),
            role: "user",
            sequence_number: chatMessages.length,
            updated_at: "",
            user_id: ""
        },
    }

    let tempAssistantChatMessage = {
        message: {
            chat_id: "",
            content: "",
            created_at: "",
            id: uuidv4(),
            role: "assistant",
            sequence_number: chatMessages.length + 1,
            updated_at: "",
            user_id: ""
        },
    }

    let newMessages = [
        ...chatMessages,
        tempUserChatMessage,
        tempAssistantChatMessage
    ]

    console.log("Inside createTempMessages, newMessages created: ", newMessages)

    setChatMessages(newMessages)

    console.log("Inside createTempMessages after appending to chatMessages: ", chatMessages)

    return {
        tempUserChatMessage,
        tempAssistantChatMessage
    }
}

// POST request to server side chat api, send response to be processed
const handleHostedChat = async ({
    payload,
    tempAssistantChatMessage,
    setIsGenerating,
    setChatMessages,
}) => {
    console.log("Payload: ", payload)
    const response = await fetch('api/chat', {
        method: "POST",
        body: JSON.stringify({ payload }),
    })
    const { body } = await response.json()

    if (!response.ok) {
        console.log("Bad response")
        if (response.status === 404 && !isHosted) {
            toast.error(
                "Model not found."
            )
        }

        const errorData = await response.json()

        toast.error(errorData.message)

        setIsGenerating(false)
        setChatMessages(prevMessages => prevMessages.slice(0, -2))
    }

    console.log("Good response: ", body.message)
    console.log("tempAssistantChatMessage: ", tempAssistantChatMessage)
    return await processResponse({
        responseMessage: body.message,
        lastChatMessage: tempAssistantChatMessage,
        setChatMessages: setChatMessages
    })
}

// chatMessages updated by appending generated text to the content field
// of lastChatMessage. tempAssistantChatMessage is the placeholder passed down as lastChatMessage
const processResponse = async ({
    responseMessage,
    lastChatMessage,
    setChatMessages
}) => {
    const fullText = responseMessage.content

    setChatMessages(prev =>
        prev.map(chatMessage => {
            if (chatMessage.message.id === lastChatMessage.message.id) {
                const updatedChatMessage = {
                    message: {
                        ...chatMessage.message,
                        content: fullText
                    },
                }

                return updatedChatMessage
            }

            return chatMessage
        })
    )
    return fullText
}

export const useChatHandler = () => {
    const router = useRouter()

    const {
        chatMessages,
        setChatMessages,
    } = useContext(ChatbotUIContext)

    const handleNewChat = () => {
        setUserInput("")
        setChatMessages([])
        setIsGenerating(false)
        setFirstTokenReceived(false)

        router.push("/chat")
    }

    const chatInputRef = useRef(null)

    const handleFocusChatInput = () => {
        console.log("Focused on chat input")
        chatInputRef.current?.focus()
    }

    const handleSendMessage = async ({
        userInput,
        setUserInput,
        setIsGenerating,
        setFirstTokenReceived
    }) => {
        console.log("handleSendMessage executing")

        try {
            setUserInput("") // clear user input box
            setIsGenerating(true)

            // create temporary message objects
            const { tempUserChatMessage, tempAssistantChatMessage } =
                createTempMessages(
                    userInput,
                    chatMessages,
                    setChatMessages
                )

            // payload is constructed from previous messages
            let payload = {
                chatMessages: [...chatMessages, tempUserChatMessage],
            }

            let generatedText = ""

            generatedText = await handleHostedChat({
                payload,
                tempAssistantChatMessage,
                setIsGenerating,
                setFirstTokenReceived,
                setChatMessages,
            })

            console.log("Generated text: ", generatedText)
            setIsGenerating(false)

        } catch (error) {
            console.log("error has happened anish: ", error)
            setIsGenerating(false)
        }
    }

    return {
        chatInputRef,
        handleNewChat,
        handleSendMessage,
        handleFocusChatInput,
    }
}

