export const consumeReadableStream = async (
    stream,
    callback
) => {
    const reader = stream.getReader()
    const decoder = new TextDecoder()

    try {
        while (true) {
            const { done, value } = await reader.read()

            if (done) {
                break
            }

            if (value) {
                callback(decoder.decode(value))
            }
        }
    } catch (error) {
        if (signal.aborted) {
            console.error("Stream reading was aborted:", error)
        } else {
            console.error("Error consuming stream:", error)
        }
    } finally {
        reader.releaseLock()
    }
}