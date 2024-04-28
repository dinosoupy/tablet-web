// Canvas is the main elements containing the cells and alert bar
"use client";

import Chat from "@/components/Chat/Chat";

const Canvas = () => {
  return (
    <div className="mx-auto flex overflow-auto whitespace-nowrap flex-nowrap items-start">
      <Chat />
    </div>
  );
};

export default Canvas;
