import {
    IconCircleArrowDownFilled,
    IconCircleArrowUpFilled
} from "@tabler/icons-react";
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
                <IconCircleArrowUpFilled
                    className="cursor-pointer opacity-50 hover:opacity-100"
                    size={32}
                    onClick={scrollToTop}
                />
            )}

            {!isAtBottom && isOverflowing && (
                <IconCircleArrowDownFilled
                    className="cursor-pointer opacity-50 hover:opacity-100"
                    size={32}
                    onClick={scrollToBottom}
                />
            )}
        </>
    );
};
