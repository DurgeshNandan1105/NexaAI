import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState, useContext, useRef, useEffect } from "react";
import { API_BASE_URL, getAuthHeaders } from "./config.js";

function ChatWindow() {
    const {
        prompt,
        setPrompt,
        setReply,
        currThreadId,
        setCurrThreadId,
        setPrevChats,
        setNewChat,
        user,
        logout,
        setAuthModalOpen,
        setAuthMode,
        setSettingsModalOpen,
        setSidebarOpen
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        if (setCurrThreadId) {
            setCurrThreadId(Date.now().toString());
        }
        setPrevChats([]);
        if (setSidebarOpen) setSidebarOpen(false);
    };

    const getReply = async () => {
        if (!prompt || !prompt.trim() || loading) return;
        const currentPrompt = prompt.trim();
        setPrompt("");
        setLoading(true);
        setNewChat(false);

        // Immediately show the user's message in chat
        setPrevChats((prev) => [...prev, { role: "user", content: currentPrompt }]);

        const options = {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                message: currentPrompt,
                threadId: currThreadId
            })
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, options);
            const res = await response.json();
            if (!response.ok) {
                console.error("API error:", res.error);
                setPrevChats((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: `Error: ${res.error || "Failed to generate response."}`
                    }
                ]);
                setLoading(false);
                return;
            }
            // Add assistant response to prevChats and trigger typing effect
            setPrevChats((prev) => [
                ...prev,
                { role: "assistant", content: res.reply }
            ]);
            setReply(res.reply);
        } catch (err) {
            console.error("Fetch error:", err);
            setPrevChats((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Error: Unable to connect to backend server."
                }
            ]);
        }
        setLoading(false);
    };

    const handleProfileClick = () => {
        setIsOpen((prev) => !prev);
    };

    const handleOpenAuth = (mode) => {
        setIsOpen(false);
        if (setAuthMode) setAuthMode(mode);
        if (setAuthModalOpen) setAuthModalOpen(true);
    };

    const handleOpenSettings = () => {
        setIsOpen(false);
        if (setSettingsModalOpen) setSettingsModalOpen(true);
    };

    return (
        <div className="chatWindow">
            <div className="navbar">
                {/* Left Navbar: Hamburger Menu (Mobile) + Brand Title */}
                <div className="navLeft">
                    <button
                        className="mobileMenuBtn"
                        onClick={() => setSidebarOpen && setSidebarOpen((prev) => !prev)}
                        aria-label="Toggle sidebar"
                        title="Chat History"
                        type="button"
                    >
                        <i className="fa-solid fa-bars"></i>
                    </button>

                    <span className="navTitle">
                        NexaAI <i className="fa-solid fa-chevron-down"></i>
                    </span>
                </div>

                {/* Right Navbar: New Chat (Mobile) + User Profile Menu */}
                <div className="navRight">
                    <button
                        className="mobileNewChatBtn"
                        onClick={handleNewChat}
                        aria-label="New chat"
                        title="New Chat"
                        type="button"
                    >
                        <i className="fa-solid fa-pen-to-square"></i>
                    </button>

                    <div className="userIconDiv" ref={dropdownRef}>
                        <div
                            className={`userIcon ${!user ? "guest" : ""}`}
                            onClick={handleProfileClick}
                            title={user ? (user.email || user.name) : "Account & Settings"}
                        >
                            {user ? (
                                user.avatar || (user.name ? user.name[0].toUpperCase() : <i className="fa-solid fa-user"></i>)
                            ) : (
                                <i className="fa-solid fa-user"></i>
                            )}
                        </div>

                        {isOpen && (
                            <div className="dropDown">
                                {user ? (
                                    <>
                                        <div className="dropDownHeader">
                                            <span className="user-name">{user.name || "NexaAI User"}</span>
                                            <span className="user-email">{user.email}</span>
                                        </div>
                                        <div className="dropDownDivider"></div>
                                        <div
                                            className="dropDownItem"
                                            onClick={handleOpenSettings}
                                        >
                                            <i className="fa-solid fa-gear"></i> Settings
                                        </div>
                                        <div
                                            className="dropDownItem"
                                            onClick={handleOpenSettings}
                                        >
                                            <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
                                        </div>
                                        <div className="dropDownDivider"></div>
                                        <div
                                            className="dropDownItem danger"
                                            onClick={() => {
                                                setIsOpen(false);
                                                logout();
                                            }}
                                        >
                                            <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="dropDownHeader">
                                            <span className="user-name">Guest User</span>
                                            <span className="user-email">Not signed in</span>
                                        </div>
                                        <div className="dropDownDivider"></div>
                                        <div
                                            className="dropDownItem highlight"
                                            onClick={() => handleOpenAuth("login")}
                                        >
                                            <i className="fa-solid fa-arrow-right-to-bracket"></i> Log in
                                        </div>
                                        <div
                                            className="dropDownItem highlight"
                                            onClick={() => handleOpenAuth("signup")}
                                        >
                                            <i className="fa-solid fa-user-plus"></i> Sign up
                                        </div>
                                        <div className="dropDownDivider"></div>
                                        <div
                                            className="dropDownItem"
                                            onClick={handleOpenSettings}
                                        >
                                            <i className="fa-solid fa-gear"></i> Settings
                                        </div>
                                        <div
                                            className="dropDownItem"
                                            onClick={handleOpenSettings}
                                        >
                                            <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Chat loading={loading} />

            <div className="chatInput">
                <div className="inputBox">
                    <input
                        placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => (e.key === "Enter" ? getReply() : "")}
                        disabled={loading}
                    />
                    <div
                        id="submit"
                        className={!prompt.trim() || loading ? "disabled" : ""}
                        onClick={getReply}
                    >
                        <i className="fa-solid fa-arrow-up"></i>
                    </div>
                </div>
                <p className="info">
                    NexaAI can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;