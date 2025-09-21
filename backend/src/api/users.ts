import { Router, Request, Response } from "express";
import { colUsers } from "../integrations/firestore";
import { Timestamp } from "@google-cloud/firestore";

export const usersRouter = Router();

// POST /v1/users - Create user
usersRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { email, username, password, firstName, lastName, companyName, phoneNumber, companyWebsite, role } = req.body || {};
    
    if (!email || !username || !password || !firstName || !lastName || !companyName || !phoneNumber || !role) {
      return res.status(400).json({ error: "email_username_password_firstName_lastName_companyName_phoneNumber_role_required" });
    }

    const now = Timestamp.now();
    const userData = {
      email,
      username,
      password,
      firstName,
      lastName,
      name: companyName,
      phoneNumber,
      companyWebsite: companyWebsite || null,
      role,
      createdAt: now,
      updatedAt: now
    };

    // Filter out undefined values
    const filteredUserData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== undefined)
    );

    const docRef = await colUsers().add(filteredUserData);

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
    console.error(`Error creating user: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/users/:id - Get user by ID
usersRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const userDoc = await colUsers().doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "user_not_found" });
    }

    const userData = userDoc.data() as any;
    const { password, ...userWithoutPassword } = userData;

    res.json({
      id: userDoc.id,
      ...userWithoutPassword,
      createdAt: userData.createdAt?.toDate(),
      updatedAt: userData.updatedAt?.toDate()
    });
  } catch (err: any) {
    console.error(`Error getting user: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// PUT /v1/users/:id - Update user
usersRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body || {};
    
    // Remove fields that shouldn't be updated directly
    const { id: userId, password, createdAt, ...allowedUpdates } = updateData;
    
    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({ error: "no_valid_fields_to_update" });
    }

    const now = Timestamp.now();
    const finalUpdateData = {
      ...allowedUpdates,
      updatedAt: now
    };

    // Filter out undefined values
    const filteredUpdateData = Object.fromEntries(
      Object.entries(finalUpdateData).filter(([_, value]) => value !== undefined)
    );

    await colUsers().doc(id).update(filteredUpdateData);

    // Get updated user data
    const userDoc = await colUsers().doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "user_not_found" });
    }

    const userData = userDoc.data() as any;
    const { password: userPassword, ...userWithoutPassword } = userData;

    res.json({
      id: userDoc.id,
      ...userWithoutPassword,
      createdAt: userData.createdAt?.toDate(),
      updatedAt: userData.updatedAt?.toDate()
    });
  } catch (err: any) {
    console.error(`Error updating user: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});
