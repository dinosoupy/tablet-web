import { useEffect } from "react"

const useHotkey = (key, callback) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.metaKey && event.shiftKey && event.key === key) {
                event.preventDefault()
                callback()
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [key, callback])
}

export default useHotkey