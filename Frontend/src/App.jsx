import "./App.css";
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import Auth from "./Auth.jsx";
import SettingsModal from "./SettingsModal.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState, useEffect } from "react";
import { v1 as uuidv1 } from "uuid";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Authentication state
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Modal and sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
    setNewChat(true);
    setReply(null);
    setPrompt("");
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
    setNewChat(true);
    setReply(null);
    setPrompt("");
  };

  const providerValues = {
    prompt,
    setPrompt,

    reply,
    setReply,

    currThreadId,
    setCurrThreadId,

    newChat,
    setNewChat,

    prevChats,
    setPrevChats,

    allThreads,
    setAllThreads,

    // Authentication
    user,
    setUser,
    login,
    logout,

    // Theme
    theme,
    setTheme,
    toggleTheme,

    // Sidebar
    sidebarOpen,
    setSidebarOpen,

    // Modals
    authModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    settingsModalOpen,
    setSettingsModalOpen,
  };

  return (
    <MyContext.Provider value={providerValues}>
      <div className={`app ${theme}`}>
        <Sidebar />
        <ChatWindow />

        {/* Global Modals */}
        <Auth
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authMode}
        />

        <SettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setAuthModalOpen(true);
          }}
        />
      </div>
    </MyContext.Provider>
  );
}

export default App;