import { useState, useContext, useEffect } from "react";
import "./SettingsModal.css";
import { MyContext } from "./MyContext.jsx";

export default function SettingsModal({ isOpen, onClose, onOpenAuth }) {
  const {
    user,
    logout,
    theme,
    setTheme,
    setAllThreads,
    setPrevChats,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
  } = useContext(MyContext);

  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenLogin = () => {
    onClose();
    if (onOpenAuth) onOpenAuth("login");
  };

  const handleOpenSignup = () => {
    onClose();
    if (onOpenAuth) onOpenAuth("signup");
  };

  const handleClearAllChats = () => {
    if (window.confirm("Are you sure you want to clear all your chats?")) {
      setAllThreads([]);
      setPrevChats([]);
      setNewChat(true);
      setPrompt("");
      setReply(null);
      if (setCurrThreadId) {
        setCurrThreadId(Date.now().toString());
      }
    }
  };

  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>
            <i className="fa-solid fa-gear"></i> Settings
          </h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="settings-body">
          {/* Navigation */}
          <div className="settings-nav">
            <button
              type="button"
              className={`settings-nav-item ${
                activeTab === "general" ? "active" : ""
              }`}
              onClick={() => setActiveTab("general")}
            >
              <i className="fa-solid fa-sliders"></i> General
            </button>
            <button
              type="button"
              className={`settings-nav-item ${
                activeTab === "account" ? "active" : ""
              }`}
              onClick={() => setActiveTab("account")}
            >
              <i className="fa-solid fa-user"></i> Account
            </button>
            <button
              type="button"
              className={`settings-nav-item ${
                activeTab === "data" ? "active" : ""
              }`}
              onClick={() => setActiveTab("data")}
            >
              <i className="fa-solid fa-database"></i> Data Controls
            </button>
            <button
              type="button"
              className={`settings-nav-item ${
                activeTab === "about" ? "active" : ""
              }`}
              onClick={() => setActiveTab("about")}
            >
              <i className="fa-solid fa-circle-info"></i> About
            </button>
          </div>

          {/* Content Area */}
          <div className="settings-content">
            {activeTab === "general" && (
              <div>
                <div className="settings-section-title">General Preferences</div>
                
                {/* Theme Selector */}
                <div className="setting-row">
                  <div className="setting-info">
                    <span className="setting-title">Theme</span>
                    <span className="setting-desc">Switch between light and dark interface mode</span>
                  </div>
                  <div className="theme-toggle-group">
                    <button
                      type="button"
                      className={`theme-toggle-btn ${theme === "light" ? "active" : ""}`}
                      onClick={() => setTheme("light")}
                    >
                      <i className="fa-solid fa-sun text-amber-500"></i> Light
                    </button>
                    <button
                      type="button"
                      className={`theme-toggle-btn ${theme === "dark" ? "active" : ""}`}
                      onClick={() => setTheme("dark")}
                    >
                      <i className="fa-solid fa-moon text-indigo-400"></i> Dark
                    </button>
                  </div>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <span className="setting-title">AI Model</span>
                    <span className="setting-desc">Language model powering responses</span>
                  </div>
                  <span className="setting-value-badge">LLaMA 3.3 70B</span>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <span className="setting-title">Language</span>
                    <span className="setting-desc">Interface and assistant language</span>
                  </div>
                  <span className="setting-value-badge">English (Auto-detect)</span>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div>
                <div className="settings-section-title">Account Settings</div>

                {user ? (
                  <div>
                    <div className="user-profile-card">
                      <div className="user-avatar-large">
                        {user.avatar || (user.name ? user.name[0].toUpperCase() : "U")}
                      </div>
                      <div className="user-details">
                        <h3>{user.name || "NexaAI User"}</h3>
                        <p>{user.email}</p>
                        <span className="plan-badge">Free Plan</span>
                      </div>
                    </div>

                    <div className="setting-row">
                      <div className="setting-info">
                        <span className="setting-title">Subscription Plan</span>
                        <span className="setting-desc">Currently on Free tier with standard rate limits</span>
                      </div>
                      <button type="button" className="btn-primary-settings">
                        <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade
                      </button>
                    </div>

                    <div className="setting-row">
                      <div className="setting-info">
                        <span className="setting-title">Log out of session</span>
                        <span className="setting-desc">Sign out of your account on this device</span>
                      </div>
                      <button
                        type="button"
                        className="btn-danger-settings"
                        onClick={() => {
                          logout();
                          onClose();
                        }}
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="guest-account-card">
                    <div className="guest-icon-badge">
                      <i className="fa-solid fa-user-slash"></i>
                    </div>
                    <h3>You are not logged in</h3>
                    <p>
                      Sign in or create an account to save your chat threads across devices and unlock customized AI preferences.
                    </p>
                    <div className="guest-actions">
                      <button
                        type="button"
                        className="btn-primary-settings"
                        onClick={handleOpenLogin}
                      >
                        <i className="fa-solid fa-arrow-right-to-bracket"></i> Log In
                      </button>
                      <button
                        type="button"
                        className="btn-secondary-settings"
                        onClick={handleOpenSignup}
                      >
                        <i className="fa-solid fa-user-plus"></i> Sign Up
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "data" && (
              <div>
                <div className="settings-section-title">Data Controls</div>
                <div className="setting-row">
                  <div className="setting-info">
                    <span className="setting-title">Clear all chats</span>
                    <span className="setting-desc">Delete all conversation threads and reset chat window</span>
                  </div>
                  <button
                    type="button"
                    className="btn-danger-settings"
                    onClick={handleClearAllChats}
                  >
                    <i className="fa-solid fa-trash"></i> Clear All
                  </button>
                </div>
              </div>
            )}

            {activeTab === "about" && (
              <div>
                <div className="settings-section-title">About NexaAI</div>
                <div className="setting-row">
                  <div className="setting-info">
                    <span className="setting-title">Version</span>
                    <span className="setting-desc">Current web release</span>
                  </div>
                  <span className="setting-value-badge">v1.0.0</span>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <span className="setting-title">Developer</span>
                    <span className="setting-desc">Crafted with ❤️ by DurgeshNandan</span>
                  </div>
                  <span className="setting-value-badge">DurgeshNandan</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
