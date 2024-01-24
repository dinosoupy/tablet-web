// Only used in use-chat-handler.tsx to keep it clean

// import { createChatFiles } from "@/db/chat-files"
// import { createChat } from "@/db/chats"
// import { createMessageFileItems } from "@/db/message-file-items"
// import { createMessages, updateMessage } from "@/db/messages"
// import { uploadMessageImage } from "@/db/storage/message-images"
import { buildFinalMessages } from "@/lib/buildPrompt"
import { consumeReadableStream } from "@/lib/consumeStream"
// import React from "react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

// export const validateChatSettings = (
//     chatSettings: ChatSettings | null,
//     modelData: LLM | undefined,
//     profile: Tables<"profiles"> | null,
//     selectedWorkspace: Tables<"workspaces"> | null,
//     messageContent: string
// ) => {
//     if (!chatSettings) {
//         throw new Error("Chat settings not found")
//     }

//     if (!modelData) {
//         throw new Error("Model not found")
//     }

//     if (!profile) {
//         throw new Error("Profile not found")
//     }

//     if (!selectedWorkspace) {
//         throw new Error("Workspace not found")
//     }

//     if (!messageContent) {
//         throw new Error("Message content not found")
//     }
// }

export const handleRetrieval = async (
    userInput,
    newMessageFiles,
    chatFiles,
    embeddingsProvider,
    sourceCount
) => {
    const response = await fetch("/api/retrieval/retrieve", {
        method: "POST",
        body: JSON.stringify({
            userInput,
            fileIds: [...newMessageFiles, ...chatFiles].map(file => file.id),
            embeddingsProvider,
            sourceCount
        })
    })

    if (!response.ok) {
        console.error("Error retrieving:", response)
    }

    const { results } = (await response.json())

    return results
}

export const createTempMessages = (
    messageContent,
    chatMessages,
    chatSettings,
    b64Images,
    isRegeneration,
    setChatMessages
) => {
    let tempUserChatMessage = {
        message: {
            chat_id: "",
            content: messageContent,
            created_at: "",
            id: uuidv4(),
            image_paths: b64Images,
            model: chatSettings.model,
            role: "user",
            sequence_number: chatMessages.length,
            updated_at: "",
            user_id: ""
        },
        fileItems: []
    }

    let tempAssistantChatMessage = {
        message: {
            chat_id: "",
            content: "",
            created_at: "",
            id: uuidv4(),
            image_paths: [],
            model: chatSettings.model,
            role: "assistant",
            sequence_number: chatMessages.length + 1,
            updated_at: "",
            user_id: ""
        },
        fileItems: []
    }

    let newMessages = []

    if (isRegeneration) {
        const lastMessageIndex = chatMessages.length - 1
        chatMessages[lastMessageIndex].message.content = ""
        newMessages = [...chatMessages]
    } else {
        newMessages = [
            ...chatMessages,
            tempUserChatMessage,
            tempAssistantChatMessage
        ]
    }

    setChatMessages(newMessages)

    return {
        tempUserChatMessage,
        tempAssistantChatMessage
    }
}

// export const handleLocalChat = async (
//     payload,
//     profile,
//     chatSettings,
//     tempAssistantMessage,
//     isRegeneration,
//     newAbortController,
//     setIsGenerating,
//     setFirstTokenReceived,
//     setChatMessages,
//     setToolInUse
// ) => {
//     const formattedMessages = await buildFinalMessages(payload, profile, [])

//     // Ollama API: https://github.com/jmorganca/ollama/blob/main/docs/api.md
//     const response = await fetchChatResponse(
//         process.env.NEXT_PUBLIC_OLLAMA_URL + "/api/chat",
//         {
//             model: chatSettings.model,
//             messages: formattedMessages,
//             options: {
//                 temperature: payload.chatSettings.temperature
//             }
//         },
//         false,
//         newAbortController,
//         setIsGenerating,
//         setChatMessages
//     )

//     return await processResponse(
//         response,
//         isRegeneration
//             ? payload.chatMessages[payload.chatMessages.length - 1]
//             : tempAssistantMessage,
//         false,
//         newAbortController,
//         setFirstTokenReceived,
//         setChatMessages,
//         setToolInUse
//     )
// }

export const handleHostedChat = async (
    payload,
    profile,
    modelData,
    tempAssistantChatMessage,
    isRegeneration,
    newAbortController,
    newMessageImages,
    chatImages,
    setIsGenerating,
    setFirstTokenReceived,
    setChatMessages,
    setToolInUse
) => {
    const provider =
        modelData.provider === "openai" && profile.use_azure_openai
            ? "azure"
            : modelData.provider

    let formattedMessages = await buildFinalMessages(payload, profile, chatImages)

    const response = await fetchChatResponse(
        `/api/chat/${provider}`,
        {
            chatSettings: payload.chatSettings,
            messages: formattedMessages,
            tools: []
        },
        // true,
        // newAbortController,
        setIsGenerating,
        setChatMessages
    )

    return await processResponse(
        response,
        isRegeneration
            ? payload.chatMessages[payload.chatMessages.length - 1]
            : tempAssistantChatMessage,
        true,
        newAbortController,
        setFirstTokenReceived,
        setChatMessages,
        setToolInUse
    )
}

export const fetchChatResponse = async (
    url,
    body,
    // isHosted,
    // controller,
    setIsGenerating,
    setChatMessages
) => {
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        // signal: controller.signal
    })

    if (!response.ok) {
        if (response.status === 404 && !isHosted) {
            toast.error(
                "Model not found. Make sure you have it downloaded via Ollama."
            )
        }

        const errorData = await response.json()

        toast.error(errorData.message)

        setIsGenerating(false)
        setChatMessages(prevMessages => prevMessages.slice(0, -2))
    }

    return response
}

export const processResponse = async (
    response,
    lastChatMessage,
    // isHosted,
    // controller,
    setFirstTokenReceived,
    setChatMessages,
    setToolInUse
) => {
    let fullText = ""
    let contentToAdd = ""

    if (response.body) {
        await consumeReadableStream(
            response.body,
            chunk => {
                setFirstTokenReceived(true)
                setToolInUse("none")

                try {
                    contentToAdd = JSON.parse(chunk).message.content
                    fullText += contentToAdd
                } catch (error) {
                    console.error("Error parsing JSON:", error)
                }

                setChatMessages(prev =>
                    prev.map(chatMessage => {
                        if (chatMessage.message.id === lastChatMessage.message.id) {
                            const updatedChatMessage = {
                                message: {
                                    ...chatMessage.message,
                                    content: chatMessage.message.content + contentToAdd
                                },
                                fileItems: chatMessage.fileItems
                            }

                            return updatedChatMessage
                        }

                        return chatMessage
                    })
                )
            },
            // controller.signal
        )

        return fullText
    } else {
        throw new Error("Response body is null")
    }
}

export const handleCreateChat = async (
    chatSettings,
    profile,
    selectedWorkspace,
    messageContent,
    selectedAssistant,
    newMessageFiles,
    setSelectedChat,
    setChats,
    setChatFiles
) => {
    const createdChat = await createChat({
        user_id: profile.user_id,
        workspace_id: selectedWorkspace.id,
        assistant_id: selectedAssistant?.id || null,
        context_length: chatSettings.contextLength,
        include_profile_context: chatSettings.includeProfileContext,
        include_workspace_instructions: chatSettings.includeWorkspaceInstructions,
        model: chatSettings.model,
        name: messageContent.substring(0, 100),
        prompt: chatSettings.prompt,
        temperature: chatSettings.temperature,
        embeddings_provider: chatSettings.embeddingsProvider
    })

    setSelectedChat(createdChat)
    setChats(chats => [createdChat, ...chats])

    await createChatFiles(
        newMessageFiles.map(file => ({
            user_id: profile.user_id,
            chat_id: createdChat.id,
            file_id: file.id
        }))
    )

    setChatFiles(prev => [...prev, ...newMessageFiles])

    return createdChat
}

export const handleCreateMessages = async (
    chatMessages,
    currentChat,
    profile,
    modelData,
    messageContent,
    generatedText,
    newMessageImages,
    isRegeneration,
    retrievedFileItems,
    setChatMessages,
    setChatFileItems,
    setChatImages
) => {
    const finalUserMessage = {
        chat_id: currentChat.id,
        user_id: profile.user_id,
        content: messageContent,
        model: modelData.modelId,
        role: "user",
        sequence_number: chatMessages.length,
        image_paths: []
    }

    const finalAssistantMessage = {
        chat_id: currentChat.id,
        user_id: profile.user_id,
        content: generatedText,
        model: modelData.modelId,
        role: "assistant",
        sequence_number: chatMessages.length + 1,
        image_paths: []
    }

    let finalChatMessages = []

    if (isRegeneration) {
        const lastStartingMessage = chatMessages[chatMessages.length - 1].message

        const updatedMessage = await updateMessage(lastStartingMessage.id, {
            ...lastStartingMessage,
            content: generatedText
        })

        chatMessages[chatMessages.length - 1].message = updatedMessage

        finalChatMessages = [...chatMessages]

        setChatMessages(finalChatMessages)
    } else {
        const createdMessages = await createMessages([
            finalUserMessage,
            finalAssistantMessage
        ])

        // Upload each image (stored in newMessageImages) for the user message to message_images bucket
        const uploadPromises = newMessageImages
            .filter(obj => obj.file !== null)
            .map(obj => {
                let filePath = `${profile.user_id}/${currentChat.id}/${createdMessages[0].id
                    }/${uuidv4()}`

                return uploadMessageImage(filePath, obj.file).catch(error => {
                    console.error(`Failed to upload image at ${filePath}:`, error)
                    return null
                })
            })

        const paths = (await Promise.all(uploadPromises)).filter(
            Boolean
        )

        setChatImages(prevImages => [
            ...prevImages,
            ...newMessageImages.map((obj, index) => ({
                ...obj,
                messageId: createdMessages[0].id,
                path: paths[index]
            }))
        ])

        const updatedMessage = await updateMessage(createdMessages[0].id, {
            ...createdMessages[0],
            image_paths: paths
        })

        const createdMessageFileItems = await createMessageFileItems(
            retrievedFileItems.map(fileItem => {
                return {
                    user_id: profile.user_id,
                    message_id: createdMessages[1].id,
                    file_item_id: fileItem.id
                }
            })
        )

        finalChatMessages = [
            ...chatMessages,
            {
                message: updatedMessage,
                fileItems: []
            },
            {
                message: createdMessages[1],
                fileItems: retrievedFileItems.map(fileItem => fileItem.id)
            }
        ]

        setChatFileItems(prevFileItems => {
            const newFileItems = retrievedFileItems.filter(
                fileItem => !prevFileItems.some(prevItem => prevItem.id === fileItem.id)
            )

            return [...prevFileItems, ...newFileItems]
        })

        setChatMessages(finalChatMessages)
    }
}