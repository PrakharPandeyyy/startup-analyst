import { Router, Request, Response } from "express";
import { colUsers } from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";
import bcrypt from "bcrypt";

export const authRouter = Router();

// POST /v1/auth/register - Register new user
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, username, password, firstName, lastName, companyName, phoneNumber, companyWebsite, role } = req.body || {};
    
    if (!email || !username || !password || !firstName || !lastName || !companyName || !phoneNumber || !role) {
      return res.status(400).json({ error: "email_username_password_firstName_lastName_companyName_phoneNumber_role_required" });
    }

    // Check if email already exists (email should be unique)
    const emailQuery = await colUsers().where("email", "==", email).get();
    if (!emailQuery.empty) {
      return res.status(400).json({ error: "email_already_exists" });
    }

    // Note: Username uniqueness check removed - usernames can be the same across different users
    // Only email needs to be unique for authentication

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const now = Timestamp.now();
    const userData = {
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      name: companyName,
      phoneNumber,
      companyWebsite: companyWebsite || null,
      role,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await colUsers().add(userData);

    res.json({
      id: docRef.id,
      email,
      username,
      firstName,
      lastName,
      name: companyName,
      phoneNumber,
      companyWebsite: companyWebsite || null,
      role,
      createdAt: now.toDate()
    });
  } catch (err: any) {
    console.error(`Error registering user: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// POST /v1/auth/login - Login user
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ error: "email_password_required" });
    }

    // Find user by email
    const userQuery = await colUsers().where("email", "==", email).get();
    if (userQuery.empty) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    const userDoc = userQuery.docs[0];
    const user = userDoc.data() as any;

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      id: userDoc.id,
      ...userWithoutPassword,
      createdAt: user.createdAt?.toDate(),
      updatedAt: user.updatedAt?.toDate()
    });
  } catch (err: any) {
    console.error(`Error logging in user: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/auth/me - Get current user
authRouter.get("/me", async (req: Request, res: Response) => {
  try {
    // In a real app, you'd get user ID from JWT token
    // For now, return a mock response
    res.json({
      id: "current_user_id",
      email: "user@example.com",
      username: "currentuser",
      firstName: "Current",
      lastName: "User",
      name: "Current Company",
      phoneNumber: "+1234567890",
      companyWebsite: "https://currentcompany.com",
      role: "startup",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (err: any) {
    console.error(`Error getting current user: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});
