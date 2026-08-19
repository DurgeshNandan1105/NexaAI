import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import { API_BASE_URL, getAuthHeaders } from "./config.js";

function Sidebar() {
    const {
        allThreads,
        setAllThreads,
        currThreadId,
        setNewChat,
        setPrompt,
        setReply,
        setCurrThreadId,
        setPrevChats,
        prevChats,
        user,
        sidebarOpen,
        setSidebarOpen
    } = useContext(MyContext);

    const getAllThreads = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/thread`, {
                headers: getAuthHeaders()
            });
            const res = await response.json();
            if (Array.isArray(res)) {
                const filteredData = res.map((thread) => ({
                    threadId: thread.threadId,
                    title: thread.title
                }));
                setAllThreads(filteredData);
            } else {
                setAllThreads([]);
            }
        } catch (err) {
            console.error("Error fetching threads:", err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId, prevChats?.length, user]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
        if (setSidebarOpen) setSidebarOpen(false);
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        if (setSidebarOpen) setSidebarOpen(false);
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/thread/${newThreadId}`,
                {
                    headers: getAuthHeaders()
                }
            );
            const res = await response.json();
            setPrevChats(Array.isArray(res) ? res : []);
            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.error("Error changing thread:", err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/thread/${threadId}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders()
                }
            );
            const res = await response.json();
            if (response.ok) {
                setAllThreads((prev) =>
                    prev.filter((t) => t.threadId !== threadId)
                );
                if (currThreadId === threadId) {
                    createNewChat();
                }
            }
        } catch (err) {
            console.error("Error deleting thread:", err);
        }
    };

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            <div
                className={`sidebar-backdrop ${sidebarOpen ? "open" : ""}`}
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
            />

            <section className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                {/* Clean Top Header */}
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <img src="/NexaAI1.png" alt="Nexa logo" className="logo" />
                        <span className="sidebar-brand-title">NexaAI</span>
                    </div>

                    <div className="sidebar-header-actions">
                        <button
                            type="button"
                            className="sidebar-icon-btn"
                            onClick={createNewChat}
                            title="New Chat"
                            aria-label="New chat"
                        >
                            <i className="fa-solid fa-pen-to-square"></i>
                        </button>

                        <button
                            type="button"
                            className="sidebar-icon-btn mobileCloseSidebarBtn"
                            onClick={() => setSidebarOpen && setSidebarOpen(false)}
                            aria-label="Close sidebar"
                            title="Close sidebar"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                {/* Dedicated New Chat Button */}
                <div className="newChatWrapper">
                    <button
                        type="button"
                        onClick={createNewChat}
                        className="newChatActionBtn"
                    >
                        <i className="fa-solid fa-plus"></i>
                        <span>New chat</span>
                    </button>
                </div>

                {/* History List */}
                <ul className="history">
                    {allThreads?.map((thread, idx) => (
                        <li
                            key={idx}
                            onClick={() => changeThread(thread.threadId)}
                            className={
                                thread.threadId === currThreadId ? "highlighted" : ""
                            }
                        >
                            <span className="thread-title">{thread.title}</span>
                            <i
                                className="fa-solid fa-trash"
                                title="Delete Chat"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteThread(thread.threadId);
                                }}
                            ></i>
                        </li>
                    ))}
                </ul>

                {/* Sign / Footer */}
                <div className="sign">
                    <p>By DurgeshNandan &hearts;</p>
                </div>
            </section>
        </>
    );
}

export default Sidebar;