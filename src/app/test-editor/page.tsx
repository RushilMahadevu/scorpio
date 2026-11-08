"use client";
import { useState } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";

export default function TestEditor() {
  const [content, setContent] = useState("<p>Hello world</p>");
  return (
    <div className="min-h-dvh bg-background p-4 text-foreground sm:p-10">
      <RichTextEditor content={content} onChange={setContent} />
    </div>
  );
}
