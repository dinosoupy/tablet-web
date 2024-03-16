"use client"

import { ChatbotUIContext } from '@/context/context'
import { useState } from 'react'

export const GlobalState = ({ children }) => {
    const [chatMessages, setChatMessages] = useState([])

    return (
        <ChatbotUIContext.Provider value={{ chatMessages, setChatMessages }}>
            {children}
        </ChatbotUIContext.Provider>
    )
}