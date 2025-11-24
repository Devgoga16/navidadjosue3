import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import type {
  User,
  Participant,
  DrawResult,
  LoginRequest,
  RegisterRequest,
} from "@shared/api";

// In-memory database
const users = new Map<string, User & { password: string }>();
const participants = new Map<string, Participant>();
const drawResults = new Map<string, DrawResult>();

// Helper to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize with test admin user
  const adminId = generateId();
  users.set("admin@amigosecreto.com", {
    id: adminId,
    email: "admin@amigosecreto.com",
    name: "Administrador",
    phone: "+1234567890",
    role: "admin",
    password: "admin123",
  });

  // Auth Routes
  app.post("/api/auth/register", (req: Request, res: Response) => {
    try {
      const { name, email, phone, role, password } =
        req.body as RegisterRequest;

      if (!name || !email || !phone || !role || !password) {
        return res.json({
          success: false,
          message: "All fields are required",
        });
      }

      if (users.has(email)) {
        return res.json({
          success: false,
          message: "Email already registered",
        });
      }

      const id = generateId();
      const user: User & { password: string } = {
        id,
        email,
        name,
        phone,
        role: role as "admin" | "participant",
        password,
      };

      users.set(email, user);

      // Create participant entry if role is participant
      if (role === "participant") {
        participants.set(id, {
          id,
          name,
          email,
          phone,
          createdAt: new Date().toISOString(),
        });
      }

      const { password: _, ...userWithoutPassword } = user;
      return res.json({
        success: true,
        user: userWithoutPassword,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: "Registration failed",
      });
    }
  });

  app.post("/api/auth/login", (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as LoginRequest;

      if (!email || !password) {
        return res.json({
          success: false,
          message: "Email and password required",
        });
      }

      const user = users.get(email);

      if (!user || user.password !== password) {
        return res.json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const { password: _, ...userWithoutPassword } = user;
      return res.json({
        success: true,
        user: userWithoutPassword,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: "Login failed",
      });
    }
  });

  // Get all participants (admin only)
  app.get("/api/participants", (_req: Request, res: Response) => {
    const participantsList = Array.from(participants.values());
    return res.json({
      participants: participantsList,
    });
  });

  // Perform the draw
  app.post("/api/draw", (_req: Request, res: Response) => {
    try {
      const participantList = Array.from(participants.values());

      if (participantList.length < 2) {
        return res.json({
          success: false,
          message: "Se necesitan al menos 2 participantes para hacer el sorteo",
        });
      }

      // Shuffle and assign
      const shuffled = [...participantList].sort(() => Math.random() - 0.5);
      drawResults.clear();

      for (let i = 0; i < shuffled.length; i++) {
        const current = shuffled[i];
        const assigned = shuffled[(i + 1) % shuffled.length];

        drawResults.set(current.id, {
          participantId: current.id,
          assignedTo: assigned.name,
          assignedToId: assigned.id,
        });
      }

      const results = Array.from(drawResults.values());
      return res.json({
        success: true,
        results,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: "Draw failed",
      });
    }
  });

  // Get my assignment
  app.post("/api/my-assignment", (req: Request, res: Response) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.json({
          success: false,
          message: "User ID required",
        });
      }

      const result = drawResults.get(userId);

      return res.json({
        assigned: result ? result.assignedTo : null,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: "Failed to retrieve assignment",
      });
    }
  });

  // Example routes (keep for compatibility)
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  return app;
}
