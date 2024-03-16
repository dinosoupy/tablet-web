// Canvas is the main elements containing the cells and alert bar
'use client'

import ChatUI from '@/components/Chat/ChatUI'

const Canvas = () => {
    return (
        <div className="mx-auto flex overflow-auto whitespace-nowrap flex-nowrap items-start">
            <ChatUI></ChatUI>
            <ChatUI></ChatUI>
            <ChatUI></ChatUI>
            <ChatUI></ChatUI>
            <ChatUI></ChatUI>
            <ChatUI></ChatUI>
        </div>
    );
};

export default Canvas;