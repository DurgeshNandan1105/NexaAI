import { useState, useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { API_BASE_URL } from "./config.js";

export default function Auth({ isOpen, onClose, initialMode = "login" }) {
  const { login } = useContext(MyContext);
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError("");
    setLoading(false);
  }, [initialMode, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "signup"
          ? `${API_BASE_URL}/api/auth/signup`
          : `${API_BASE_URL}/api/auth/login`;

      const payload =
        mode === "signup"
          ? {
              name: name.trim(),
              email: email.trim(),
              password: password,
            }
          : {
              email: email.trim(),
              password: password,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Authentication failed. Please try again.");
        setLoading(false);
        return;
      }

      // Save real token and user data returned by backend
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      login(data.user);
      onClose();
    } catch (err) {
      console.error("Auth fetch error:", err);
      setError("Unable to connect to the backend server. Please make sure it is running.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    if (loading) return;
    setMode(newMode);
    setError("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[480px] rounded-2xl bg-[#0f172a] border border-slate-800/80 p-8 sm:p-12 shadow-2xl my-auto transition-all flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ minWidth: "320px" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          disabled={loading}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Logo & Heading */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <img
            alt="NexaAI"
            src="/NexaAI1.png"
            className="h-12 w-12 rounded-xl shadow-md object-cover mb-6"
          />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {mode === "login"
              ? "Sign in to your account"
              : "Create your account"}
          </h2>
        </div>

        {/* Form with Real Backend Integration */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3.5 text-sm text-red-400 flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Full Name for Sign Up */}
          {mode === "signup" && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="auth-fullname"
                className="text-sm font-medium text-slate-200"
              >
                Full Name
              </label>
              <input
                id="auth-fullname"
                name="name"
                type="text"
                disabled={loading}
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="w-full rounded-lg bg-slate-900/80 border border-slate-700/70 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 transition duration-150 disabled:opacity-50"
              />
            </div>
          )}

          {/* Email Address */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="auth-email"
              className="text-sm font-medium text-slate-200"
            >
              Email address
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg bg-slate-900/80 border border-slate-700/70 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 transition duration-150 disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="auth-password"
                className="text-sm font-medium text-slate-200"
              >
                Password
              </label>
              {mode === "login" && (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Password reset is not configured for demo accounts.");
                  }}
                  className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition"
                >
                  Forgot password?
                </a>
              )}
            </div>
            <input
              id="auth-password"
              name="password"
              type="password"
              required
              disabled={loading}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              className="w-full rounded-lg bg-slate-900/80 border border-slate-700/70 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 transition duration-150 disabled:opacity-50"
            />
          </div>

          {/* Confirm Password for Sign Up */}
          {mode === "signup" && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="auth-confirm-password"
                className="text-sm font-medium text-slate-200"
              >
                Confirm Password
              </label>
              <input
                id="auth-confirm-password"
                name="confirm-password"
                type="password"
                required
                disabled={loading}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-lg bg-slate-900/80 border border-slate-700/70 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 transition duration-150 disabled:opacity-50"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-3 px-4 text-sm shadow-md transition duration-150 cursor-pointer text-center flex items-center justify-center gap-2 ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </span>
                </>
              ) : mode === "login" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-400">
          {mode === "login" ? (
            <p>
              Not a member?{" "}
              <button
                type="button"
                disabled={loading}
                onClick={() => switchMode("signup")}
                className="font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1 disabled:opacity-50"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                disabled={loading}
                onClick={() => switchMode("login")}
                className="font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1 disabled:opacity-50"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
