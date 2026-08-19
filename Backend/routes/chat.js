import express from "express";
import Thread from "../models/Thread.js";
import getGroqAPIResponse from "../utils/Groq.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Get threads for logged in user only (guests don't share global threads)
router.get("/thread", optionalAuth, async (req, res) => {
    try {
        if (!req.userId) {
            return res.json([]);
        }
        const threads = await Thread.find({ userId: req.userId }).sort({ updatedAt: -1 });
        res.json(threads);
    } catch (err) {
        console.error("Fetch threads error:", err);
        res.status(500).json({ error: "Failed to fetch threads" });
    }
});

// Get specific thread messages
router.get("/thread/:threadId", optionalAuth, async (req, res) => {
    const { threadId } = req.params;

    try {
        const query = req.userId ? { threadId, userId: req.userId } : { threadId };
        const thread = await Thread.findOne(query);

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.json(thread.messages);
    } catch (err) {
        console.error("Fetch chat error:", err);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
});

// Delete a thread
router.delete("/thread/:threadId", optionalAuth, async (req, res) => {
    const { threadId } = req.params;

    try {
        const query = req.userId ? { threadId, userId: req.userId } : { threadId };
        const deletedThread = await Thread.findOneAndDelete(query);

        if (!deletedThread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        res.status(200).json({
            success: "Thread deleted successfully"
        });
    } catch (err) {
        console.error("Delete thread error:", err);
        res.status(500).json({ error: "Failed to delete thread" });
    }
});

// Post a chat message and get AI response
router.post("/chat", optionalAuth, async (req, res) => {
    const { threadId, message } = req.body;
    if (!threadId || !message) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        let thread = await Thread.findOne({ threadId });
        if (!thread) {
            thread = new Thread({
                threadId,
                userId: req.userId || null,
                title: message.length > 30 ? message.substring(0, 30) + "..." : message,
                messages: [{ role: "user", content: message }]
            });
        } else {
            // Update thread userId if user logged in
            if (req.userId && !thread.userId) {
                thread.userId = req.userId;
            }
            thread.messages.push({ role: "user", content: message });
        }

        const assistantReply = await getGroqAPIResponse(message);
        if (!assistantReply) {
            return res.status(500).json({ error: "No response received from AI model" });
        }

        thread.messages.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();
        await thread.save();

        res.json({ reply: assistantReply });
    } catch (err) {
        console.error("Error in /api/chat:", err);
        res.status(500).json({ error: err.message || "Something went wrong" });
    }
});

export default router;