import { Router, Request, Response } from "express";
import { colUsers } from "../integrations/firestore";

export const companiesRouter = Router();

// GET /v1/companies - Get all companies (for investors)
companiesRouter.get("/", async (req: Request, res: Response) => {
  try {
    const usersSnapshot = await colUsers().where("role", "==", "startup").get();
    
    if (usersSnapshot.empty) {
      return res.json({ companies: [] });
    }
    
    const companies = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        score: data.score,
        category: data.category,
        companyWebsite: data.companyWebsite,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    });
    
    res.json({ companies });
  } catch (err: any) {
    console.error(`Error getting companies: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/companies/:id - Get company by ID (for investors)
companiesRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const userDoc = await colUsers().doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "company_not_found" });
    }
    
    const data = userDoc.data();
    
    // Only return companies (startups)
    if (data?.role !== "startup") {
      return res.status(404).json({ error: "company_not_found" });
    }
    
    res.json({
      id: userDoc.id,
      name: data.name,
      description: data.description,
      score: data.score,
      category: data.category,
      companyWebsite: data.companyWebsite,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    });
  } catch (err: any) {
    console.error(`Error getting company: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});
