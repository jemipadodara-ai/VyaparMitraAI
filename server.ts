import express from "express";
import path from "path";
import fs from "fs";
import initSqlJs, { Database } from "sql.js";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT)||3000;

// SQLite Database File Path
const DB_FILE_PATH = path.join(process.cwd(), "vyaparmitra.sqlite");
let db: Database | null = null;

async function initSqlDatabase() {
  try {
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_FILE_PATH)) {
      const fileBuffer = fs.readFileSync(DB_FILE_PATH);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
      saveSqlDatabase();
    }

    // Create SQL Tables for Users and Tasks
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        business_name TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        pin TEXT DEFAULT '',
        business_type TEXT DEFAULT 'Retailer',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        customer_name TEXT,
        action_type TEXT,
        summary TEXT,
        summary_gujarati TEXT,
        items_quantity TEXT,
        amount REAL,
        formatted_amount TEXT,
        payment_status TEXT,
        due_date TEXT,
        due_date_label TEXT,
        priority TEXT,
        status TEXT,
        suggested_next_action TEXT,
        suggested_next_action_gujarati TEXT,
        whatsapp_message TEXT,
        whatsapp_message_english TEXT,
        confidence_score INTEGER,
        detected_language TEXT,
        original_audio_text TEXT,
        created_at TEXT
      );
    `);
    saveSqlDatabase();
    console.log("SQLite Database initialized successfully at:", DB_FILE_PATH);
  } catch (err) {
    console.error("Failed to initialize SQLite database:", err);
  }
}

function saveSqlDatabase() {
  if (db) {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_FILE_PATH, buffer);
    } catch (err) {
      console.error("Error saving SQLite database file:", err);
    }
  }
}

// Express body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "dummy-key",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

const taskResponseSchema = {
  type: Type.OBJECT,
  properties: {
    customerName: {
      type: Type.STRING,
      description: "Name of customer, person, or business mentioned (e.g., મનોજભાઈ, Rajesh Fashion). If not mentioned, return 'General Customer' or 'ગ્રાહક'."
    },
    actionType: {
      type: Type.STRING,
      description: "Must be exactly one of: 'Order', 'Payment Reminder', 'Delivery Instruction', 'Customer Follow-up', 'Task'."
    },
    summary: {
      type: Type.STRING,
      description: "Short clear task summary in English."
    },
    summaryGujarati: {
      type: Type.STRING,
      description: "Short clear task summary in Gujarati script."
    },
    itemsQuantity: {
      type: Type.STRING,
      description: "Item details & quantities (e.g. '25 box', '50 sarees', 'Tuition Fee'). Return 'N/A' if none."
    },
    amount: {
      type: Type.NUMBER,
      description: "Numeric total or pending amount in INR (e.g. 12500). Return null if no amount."
    },
    formattedAmount: {
      type: Type.STRING,
      description: "Formatted INR string with symbol (e.g., '₹12,500' or '₹0')."
    },
    paymentStatus: {
      type: Type.STRING,
      description: "Must be exactly one of: 'Pending', 'Partial', 'Paid', 'Not Applicable'."
    },
    dueDate: {
      type: Type.STRING,
      description: "Short due date (e.g., 'Tomorrow', '2026-08-10', 'Saturday')."
    },
    dueDateLabel: {
      type: Type.STRING,
      description: "Friendly Gujarati date string (e.g., 'કાલે (Tomorrow)', 'આગામી શનિવાર')."
    },
    priority: {
      type: Type.STRING,
      description: "Priority: 'High', 'Medium', or 'Low'."
    },
    status: {
      type: Type.STRING,
      description: "Task status: 'New', 'In Progress', 'Completed', or 'Pending Payment'."
    },
    suggestedNextAction: {
      type: Type.STRING,
      description: "Practical operational next step in English."
    },
    suggestedNextActionGujarati: {
      type: Type.STRING,
      description: "Practical operational next step in Gujarati script."
    },
    whatsappMessage: {
      type: Type.STRING,
      description: "Polite, ready-to-send Gujarati WhatsApp message with business greeting, item/payment details, and clear respectful closing."
    },
    whatsappMessageEnglish: {
      type: Type.STRING,
      description: "English translation of the WhatsApp message."
    },
    confidenceScore: {
      type: Type.INTEGER,
      description: "Accuracy confidence score percentage between 80 and 100."
    },
    detectedLanguage: {
      type: Type.STRING,
      description: "Must be one of: 'Gujarati', 'Gujlish', 'English', 'Mixed'."
    }
  },
  required: [
    "customerName",
    "actionType",
    "summary",
    "summaryGujarati",
    "itemsQuantity",
    "formattedAmount",
    "paymentStatus",
    "dueDate",
    "dueDateLabel",
    "priority",
    "status",
    "suggestedNextAction",
    "suggestedNextActionGujarati",
    "whatsappMessage",
    "whatsappMessageEnglish",
    "confidenceScore",
    "detectedLanguage"
  ]
};

const SYSTEM_INSTRUCTION = `You are a high-precision AI business assistant for Indian shopkeepers, wholesalers, manufacturers, contractors, tuition classes, and small business owners.
You receive informal voice transcriptions or typed instructions in Gujarati script, Gujlish (transliterated Gujarati written in English script like "kal manojbhai ne 25 box mokalvana chhe"), or mixed English.

Your job:
1. Extract customer name, task category, item details, quantities, money amounts, payment status, due dates, priority, and operational next steps.
2. Generate a highly professional, polite, and culturally natural Gujarati WhatsApp message ready for direct messaging.
   - Use warm business greetings like "નમસ્તે [ગ્રાહકનું નામ]" or "જય શ્રી કૃષ્ણા".
   - Clearly state items, quantity, payment pending/received amount, due date.
   - Include a polite sign-off like "- આપનો વેપારી મિત્ર / વેપાર વાણી".
3. Return valid, beautifully formatted JSON according to the schema. Always ensure amounts and quantities are accurately detected.`;

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: "SQLite", service: "VyaparMitra AI API" });
});

// --- SQL DATABASE ROUTES ---

// Get all business users
app.get("/api/db/users", (req, res) => {
  if (!db) return res.status(500).json({ error: "Database not initialized" });
  try {
    const stmt = db.prepare("SELECT * FROM users ORDER BY created_at ASC");
    const users: any[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      users.push({
        id: row.id,
        businessName: row.business_name,
        ownerName: row.owner_name,
        phoneNumber: row.phone_number,
        pin: row.pin,
        businessType: row.business_type,
        createdAt: row.created_at,
      });
    }
    stmt.free();
    return res.json({ success: true, users });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Create a new business user account in SQL DB
app.post("/api/db/users", (req, res) => {
  if (!db) return res.status(500).json({ error: "Database not initialized" });
  try {
    const { id, businessName, ownerName, phoneNumber, pin, businessType, createdAt } = req.body;
    if (!id || !businessName || !ownerName) {
      return res.status(400).json({ error: "Missing required user fields" });
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO users (id, business_name, owner_name, phone_number, pin, business_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run([
      id,
      businessName,
      ownerName,
      phoneNumber || "",
      pin || "",
      businessType || "Retailer",
      createdAt || new Date().toISOString(),
    ]);
    stmt.free();
    saveSqlDatabase();

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get tasks for a specific user from SQL DB
app.get("/api/db/tasks", (req, res) => {
  if (!db) return res.status(500).json({ error: "Database not initialized" });
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "userId query parameter is required" });
    }

    const stmt = db.prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC");
    stmt.bind([userId]);

    const tasks: any[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      tasks.push({
        id: row.id,
        customerName: row.customer_name,
        actionType: row.action_type,
        summary: row.summary,
        summaryGujarati: row.summary_gujarati,
        itemsQuantity: row.items_quantity,
        amount: row.amount,
        formattedAmount: row.formatted_amount,
        paymentStatus: row.payment_status,
        dueDate: row.due_date,
        dueDateLabel: row.due_date_label,
        priority: row.priority,
        status: row.status,
        suggestedNextAction: row.suggested_next_action,
        suggestedNextActionGujarati: row.suggested_next_action_gujarati,
        whatsappMessage: row.whatsapp_message,
        whatsappMessageEnglish: row.whatsapp_message_english,
        confidenceScore: row.confidence_score,
        detectedLanguage: row.detected_language,
        originalAudioText: row.original_audio_text,
        createdAt: row.created_at,
      });
    }
    stmt.free();
    return res.json({ success: true, tasks });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Insert or Save a task into SQL DB
app.post("/api/db/tasks", (req, res) => {
  if (!db) return res.status(500).json({ error: "Database not initialized" });
  try {
    const { userId, task } = req.body;
    if (!userId || !task || !task.id) {
      return res.status(400).json({ error: "userId and task with id are required" });
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO tasks (
        id, user_id, customer_name, action_type, summary, summary_gujarati,
        items_quantity, amount, formatted_amount, payment_status, due_date,
        due_date_label, priority, status, suggested_next_action,
        suggested_next_action_gujarati, whatsapp_message, whatsapp_message_english,
        confidence_score, detected_language, original_audio_text, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      task.id,
      userId,
      task.customerName || "",
      task.actionType || "Task",
      task.summary || "",
      task.summaryGujarati || "",
      task.itemsQuantity || "N/A",
      task.amount !== undefined ? task.amount : null,
      task.formattedAmount || "₹0",
      task.paymentStatus || "Not Applicable",
      task.dueDate || "",
      task.dueDateLabel || "",
      task.priority || "Medium",
      task.status || "New",
      task.suggestedNextAction || "",
      task.suggestedNextActionGujarati || "",
      task.whatsappMessage || "",
      task.whatsappMessageEnglish || "",
      task.confidenceScore || 95,
      task.detectedLanguage || "Gujarati",
      task.originalAudioText || "",
      task.createdAt || new Date().toISOString(),
    ]);
    stmt.free();
    saveSqlDatabase();

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Update task status in SQL DB
app.patch("/api/db/tasks/:id/status", (req, res) => {
  if (!db) return res.status(500).json({ error: "Database not initialized" });
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    const stmt = db.prepare("UPDATE tasks SET status = ? WHERE id = ?");
    stmt.run([status, taskId]);
    stmt.free();
    saveSqlDatabase();
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a task from SQL DB
app.delete("/api/db/tasks/:id", (req, res) => {
  if (!db) return res.status(500).json({ error: "Database not initialized" });
  try {
    const taskId = req.params.id;
    const stmt = db.prepare("DELETE FROM tasks WHERE id = ?");
    stmt.run([taskId]);
    stmt.free();
    saveSqlDatabase();
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Clear all tasks for a specific user in SQL DB
app.delete("/api/db/tasks/user/:userId", (req, res) => {
  if (!db) return res.status(500).json({ error: "Database not initialized" });
  try {
    const userId = req.params.userId;
    const stmt = db.prepare("DELETE FROM tasks WHERE user_id = ?");
    stmt.run([userId]);
    stmt.free();
    saveSqlDatabase();
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Text / Transcribed Instruction Parser
app.post("/api/parse-instruction", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ success: false, error: "Please provide a valid text instruction." });
    }

    const ai = getGeminiClient();
    const prompt = `Convert this informal business instruction into a structured task and Gujarati WhatsApp confirmation message:\n\n"${text.trim()}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: taskResponseSchema,
        temperature: 0.1, // low temperature for maximum consistency & extraction accuracy
      },
    });

    if (!response.text) {
      throw new Error("No response generated from Gemini AI.");
    }

    const parsedData = JSON.parse(response.text.trim());
    parsedData.id = "task-" + Date.now();
    parsedData.originalAudioText = text.trim();
    parsedData.createdAt = new Date().toISOString();

    return res.json({
      success: true,
      data: parsedData,
      rawText: text.trim(),
    });
  } catch (error: any) {
    console.error("Error in /api/parse-instruction:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to process instruction with AI.",
    });
  }
});

// Direct Audio Base64 Parser (Multimodal Audio Input)
app.post("/api/parse-audio", async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ success: false, error: "No audio data provided." });
    }

    const ai = getGeminiClient();
    const cleanBase64 = audioBase64.includes(",") ? audioBase64.split(",")[1] : audioBase64;

    const audioPart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType || "audio/webm",
      },
    };

    const textPart = {
      text: "Transcribe this spoken Gujarati / Gujlish voice instruction accurately, convert it into a structured business task card, and write a Gujarati WhatsApp message.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts: [audioPart, textPart] },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: taskResponseSchema,
        temperature: 0.1,
      },
    });

    if (!response.text) {
      throw new Error("Failed to process audio with Gemini AI.");
    }

    const parsedData = JSON.parse(response.text.trim());
    parsedData.id = "task-" + Date.now();
    parsedData.createdAt = new Date().toISOString();

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Error in /api/parse-audio:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Audio processing failed.",
    });
  }
});

// Text-to-Speech endpoint for Gujarati voice playback
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceName } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: "Text is required for speech synthesis." });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say clearly in Gujarati: ${text}` }] }],
      config: {
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio returned from speech synthesis model.");
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
    });
  } catch (error: any) {
    console.error("Error in /api/tts:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Speech synthesis failed.",
    });
  }
});

// Start Express Server with Vite Middleware
async function startServer() {
  await initSqlDatabase();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
