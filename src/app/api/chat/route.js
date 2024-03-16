import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(req) {

    const { payload } = await req.json()

    let prompt = ""

    payload.chatMessages.map(({ message }) => {
        console.log("Message content: ", message.content)
        prompt += message.content
    })

    try {
        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        });

        console.log("Prompt: ", prompt)
        // const model = "mistralai/mixtral-8x7b-instruct-v0.1";
        // const input = { prompt: prompt };
        // const output = await replicate.run(model, { input });

        // console.log(output);

        let testMessage = {
            message: {
                chat_id: "",
                content: "blah blah",
                created_at: "",
                id: "126758", //GENERATE UUID HERE 
                role: "assistant",
                sequence_number: 1,
                updated_at: "",
                user_id: ""
            },
        }

        return NextResponse.json({ body: testMessage }, { status: 200 })

    } catch (error) {
        let errorMessage = error.message || "An unexpected error occurred"
        const errorCode = error.status || 500

        if (errorMessage.toLowerCase().includes("api key not found")) {
            errorMessage =
                "Mistral API Key not found. Please set it in your profile settings."
        } else if (errorCode === 401) {
            errorMessage =
                "Mistral API Key is incorrect. Please fix it in your profile settings."
        }

        console.log("Throwing error", error)
        return new Response(JSON.stringify({
            message: errorMessage
        }), {
            status: errorCode
        })
    }
}