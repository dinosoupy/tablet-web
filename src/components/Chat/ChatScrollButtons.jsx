import { ArrowUpCircleIcon, ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import React from "react";

export const ChatScrollButtons = ({
    isAtTop,
    isAtBottom,
    isOverflowing,
    scrollToTop,
    scrollToBottom
}) => {
    return (
        <>
            {!isAtTop && isOverflowing && (
                <ArrowUpCircleIcon
                    className="cursor-pointer opacity-50 hover:opacity-100"
                    size={32}
                    onClick={scrollToTop}
                />
            )}

            {!isAtBottom && isOverflowing && (
                <ArrowDownCircleIcon
                    className="text-black rounded-md border-2 w-10 p-1"
                    size={32}
                    onClick={scrollToBottom}
                />
            )}
        </>
    )
}


