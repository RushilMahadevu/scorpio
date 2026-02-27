"use client";
import { useState } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";

export default function TestEditor() {
  const [content, setContent] = useState("<p>Hello world</p>");
  return (
    <div className="p-10 h-screen bg-zinc-100">
      <RichTextEditor content={content} onChange={setContent} />
    </div>
  );
}
