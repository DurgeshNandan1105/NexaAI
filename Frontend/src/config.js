// Base URL for backend API calls
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Helper to get authorization and guest session headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  let guestId = localStorage.getItem("guestId");
  if (!guestId) {
    guestId =
      "guest_" +
      Math.random().toString(36).substring(2, 11) +
      "_" +
      Date.now();
    localStorage.setItem("guestId", guestId);
  }

  return {
    "Content-Type": "application/json",
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : { "X-Guest-Id": guestId }),
  };
};
