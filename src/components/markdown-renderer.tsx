"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  children: string;
  className?: string;
  noProse?: boolean;
  onLinkClick?: (href: string) => void;
}

export function MarkdownRenderer({ children, className, noProse, onLinkClick }: MarkdownRendererProps) {
  return (
    <div className={cn(
      !noProse && "prose prose-sm dark:prose-invert break-words max-w-none",
      "prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-bold prose-a:transition-all",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a: (props) => {
            const isInternal = props.href?.startsWith('/') || props.href?.includes('scorpioedu.org');
            if (isInternal) {
              const href = props.href?.replace(/^https?:\/\/scorpioedu\.org/, '') || '/';
              return (
                <Link 
                  href={href} 
                  onClick={(e) => {
                    if (onLinkClick) {
                      e.preventDefault();
                      onLinkClick(href);
                    }
                  }}
                  className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 font-bold transition-colors underline decoration-emerald-500/30 hover:decoration-emerald-500 cursor-pointer"
                >
                  {props.children}
                </Link>
              );
            }
            return (
              <a 
                {...props} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 font-bold transition-colors cursor-pointer"
              />
            );
          }
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}