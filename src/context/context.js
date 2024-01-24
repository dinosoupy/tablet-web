//TODO: Cleanup unsused context variables

import { createContext } from "react";

export const ChatbotUIContext = createContext({
    // PROFILE STORE
    profile: null,
    setProfile: () => { },

    // ITEMS STORE
    // assistants: [],
    collections: [],
    chats: [],
    files: [],
    folders: [],
    presets: [],
    prompts: [],
    tools: [],
    workspaces: [],
    // setAssistants: () => { }, 
    setCollections: () => { },
    setChats: () => { },
    setFiles: () => { },
    setFolders: () => { },
    setPresets: () => { },
    setPrompts: () => { },
    setTools: () => { },
    setWorkspaces: () => { },

    // MODELS STORE
    // availableLocalModels: [],
    // setAvailableLocalModels: () => { },
    // availableOpenRouterModels: [],
    // setAvailableOpenRouterModels: () => { },

    // // WORKSPACE STORE
    // selectedWorkspace: null,
    // setSelectedWorkspace: () => { },

    // // PRESET STORE
    // selectedPreset: null,
    // setSelectedPreset: () => { },

    // ASSISTANT STORE
    // selectedAssistant: null,
    // assistantImages: [],
    // openaiAssistants: [],
    // setSelectedAssistant: () => { },
    // setAssistantImages: () => { },
    // setOpenaiAssistants: () => { },

    // PASSIVE CHAT STORE
    userInput: "",
    selectedChat: null,
    chatMessages: [],
    chatSettings: null,
    chatFileItems: [],
    setUserInput: () => { },
    setChatMessages: () => { },
    setChatSettings: () => { },
    setSelectedChat: () => { },
    setChatFileItems: () => { },

    // CHAT INPUT COMMAND STORE
    isPromptPickerOpen: false,
    slashCommand: "",
    isAtPickerOpen: false,
    atCommand: "",
    isToolPickerOpen: false,
    toolCommand: "",
    focusPrompt: false,
    focusFile: false,
    focusTool: false,
    setIsPromptPickerOpen: () => { },
    setSlashCommand: () => { },
    setIsAtPickerOpen: () => { },
    setAtCommand: () => { },
    setIsToolPickerOpen: () => { },
    setToolCommand: () => { },
    setFocusPrompt: () => { },
    setFocusFile: () => { },
    setFocusTool: () => { },

    // ACTIVE CHAT STORE
    isGenerating: false,
    firstTokenReceived: false,
    abortController: null,
    setIsGenerating: () => { },
    setFirstTokenReceived: () => { },
    setAbortController: () => { },

    // ATTACHMENTS STORE
    chatFiles: [],
    chatImages: [],
    newMessageFiles: [],
    newMessageImages: [],
    showFilesDisplay: false,
    setChatFiles: () => { },
    setChatImages: () => { },
    setNewMessageFiles: () => { },
    setNewMessageImages: () => { },
    setShowFilesDisplay: () => { },

    // RETRIEVAL STORE
    useRetrieval: false,
    sourceCount: 4,
    setUseRetrieval: () => { },
    setSourceCount: () => { },

    // TOOL STORE
    selectedTools: [],
    setSelectedTools: () => { },
    toolInUse: "none",
    setToolInUse: () => { },
});
