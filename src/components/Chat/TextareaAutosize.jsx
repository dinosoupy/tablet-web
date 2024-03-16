import ReactTextareaAutosize from "react-textarea-autosize"
import { ArrowLongUpIcon } from '@heroicons/react/24/outline'

export const TextareaAutosize = ({
    value,
    onValueChange,
    textareaRef,
    className,
    placeholder = "",
    minRows = 1,
    maxRows = 6,
    onKeyDown = () => { },
    onPaste = () => { },
    onCompositionStart = () => { },
    onCompositionEnd = () => { }
}) => {
    return (
        <>
            <ReactTextareaAutosize
                ref={textareaRef}
                className="bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full resize-none rounded-md border-2 px-3 py-2 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                minRows={minRows}
                maxRows={minRows > maxRows ? minRows : maxRows}
                placeholder={placeholder}
                value={value}
                onChange={event => onValueChange(event.target.value)}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                onCompositionStart={onCompositionStart}
                onCompositionEnd={onCompositionEnd}
            />
            <ArrowLongUpIcon
                className="rounded w-28 p-1"
                onClick={() => {
                    if (!userInput) return;

                    handleSendMessage(userInput, chatMessages);
                }}
            />
        </>
    )
}