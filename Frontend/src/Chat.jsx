import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function CodeBlock({ children, ...props }) {
    const [copied, setCopied] = useState(false);
    const preRef = useRef(null);

    // Look for language class in code element
    const codeChild = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === "code"
    );
    const className = codeChild?.props?.className || "";
    const match = /language-(\w+)/.exec(className);
    const language = match ? match[1] : "code";

    const handleCopy = () => {
        const text = preRef.current?.innerText || "";
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="code-block-wrapper">
            <div className="code-block-header">
                <span className="code-lang">{language}</span>
                <button className="copy-btn" onClick={handleCopy} type="button">
                    {copied ? (
                        <>
                            <i className="fa-solid fa-check"></i> Copied!
                        </>
                    ) : (
                        <>
                            <i className="fa-regular fa-clipboard"></i> Copy code
                        </>
                    )}
                </button>
            </div>
            <pre ref={preRef} className="code-pre" {...props}>
                {children}
            </pre>
        </div>
    );
}

function TableBlock({ children, ...props }) {
    return (
        <div className="table-container">
            <table {...props}>{children}</table>
        </div>
    );
}

const markdownComponents = {
    table: TableBlock,
    pre: CodeBlock,
    a: ({ node, children, ...props }) => (
        <a target="_blank" rel="noopener noreferrer" {...props}>
            {children}
        </a>
    )
};

function Chat({ loading }) {
    const { newChat, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (reply === null) {
            setLatestReply(null);
            return;
        }

        if (!prevChats?.length) return;

        // Split reply into words for typing effect
        const content = reply.split(" ");
        let idx = 0;
        setLatestReply(content[0] || "");

        const interval = setInterval(() => {
            idx++;
            if (idx >= content.length) {
                setLatestReply(null); // Finish typing, render full content
                clearInterval(interval);
            } else {
                setLatestReply(content.slice(0, idx + 1).join(" "));
            }
        }, 25);

        return () => clearInterval(interval);
    }, [reply]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [prevChats, latestReply, loading]);

    return (
        <div className="chats">
            {newChat && (!prevChats || prevChats.length === 0) && (
                <div className="welcomeScreen">
                    <h1 className="welcomeTitle">What can I help with today?</h1>
                </div>
            )}

            <div className="chats-inner">
                {prevChats?.map((chat, idx) => {
                    const isLast = idx === prevChats.length - 1;
                    const isAssistant = chat.role === "assistant";
                    const content =
                        isLast && isAssistant && latestReply !== null
                            ? latestReply
                            : chat.content;

                    return (
                        <div
                            className={
                                chat.role === "user" ? "userDiv" : "gptDiv"
                            }
                            key={idx}
                        >
                            {chat.role === "user" ? (
                                <div className="userMessage">
                                    {chat.content}
                                </div>
                            ) : (
                                <div className="markdown-content">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[
                                            rehypeRaw,
                                            rehypeHighlight
                                        ]}
                                        components={markdownComponents}
                                    >
                                        {content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    );
                })}

                {loading && (
                    <div className="gptDiv">
                        <div className="typing-indicator">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>
        </div>
    );
}

export default Chat;