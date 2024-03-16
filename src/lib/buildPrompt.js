import { encode } from "gpt-tokenizer";

const buildBasePrompt = () => {
    let fullPrompt = "User Instructions:\n";

    return fullPrompt;
};

function buildRetrievalText(fileItems) {
    const retrievalText = fileItems
        .map(item => `<BEGIN SOURCE>\n${item.content}\n</END SOURCE>`)
        .join("\n\n")

    return `You may use the following sources if needed to answer the user's question. If you don't know the answer, say "I don't know."\n\n${retrievalText}`
}

export async function buildFinalMessages(payload) {
    const {
        chatMessages
    } = payload

    const BUILT_PROMPT = buildBasePrompt()
    const CHUNK_SIZE = 512
    const PROMPT_TOKENS = 1024

    let remainingTokens = CHUNK_SIZE - PROMPT_TOKENS

    let usedTokens = 0
    usedTokens += PROMPT_TOKENS

    const processedChatMessages = chatMessages.map((chatMessage, index) => {
        const nextChatMessage = chatMessages[index + 1]

        if (nextChatMessage === undefined) {
            return chatMessage
        }

        return chatMessage
    })

    let finalMessages = []

    for (let i = processedChatMessages.length - 1; i >= 0; i--) {
        const message = processedChatMessages[i].message
        const messageTokens = encode(message.content).length

        if (messageTokens <= remainingTokens) {
            remainingTokens -= messageTokens
            usedTokens += messageTokens
            finalMessages.unshift(message)
        } else {
            break
        }
    }

    let tempSystemMessage = {
        chat_id: "",
        content: BUILT_PROMPT,
        created_at: "",
        id: processedChatMessages.length + "",
        role: "system",
        sequence_number: processedChatMessages.length,
        updated_at: "",
        user_id: ""
    }

    finalMessages.unshift(tempSystemMessage)

    finalMessages = finalMessages.map(message => {
        let content = message.content

        return {
            role: message.role,
            content
        }
    })

    return finalMessages
};

