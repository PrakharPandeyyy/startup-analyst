import { Router, Request, Response } from "express";
import { colDealNotes, colUsers } from "../integrations/firestore";

export const ragRouter = Router();

// POST /v1/rag/search - Search through all deal notes
ragRouter.post("/search", async (req: Request, res: Response) => {
  try {
    const { query, category, minScore, limit = 10 } = req.body || {};
    
    if (!query) {
      return res.status(400).json({ error: "query_required" });
    }

    // Get all deal notes
    let dealNotesQuery = colDealNotes().orderBy("createdAt", "desc");
    
    if (limit) {
      dealNotesQuery = dealNotesQuery.limit(parseInt(limit as string));
    }

    const dealNotesSnapshot = await dealNotesQuery.get();
    const dealNotes = dealNotesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate(),
        updatedAt: data?.updatedAt?.toDate()
      };
    });

    // If no deal notes, return empty results
    if (dealNotes.length === 0) {
      return res.json({
        results: [],
        total: 0,
        query,
        filters: { category, minScore }
      });
    }

    // Filter by category and minScore if provided
    let filteredDealNotes = dealNotes;
    
    if (category || minScore) {
      const startupIds = dealNotes.map((dn: any) => dn.startupId);
      
      // Only query users if we have startup IDs
      if (startupIds.length > 0) {
        const usersSnapshot = await colUsers()
          .where("role", "==", "startup")
          .where("id", "in", startupIds)
          .get();
        
        const users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const userMap = users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as Record<string, any>);

        filteredDealNotes = dealNotes.filter((dn: any) => {
          const user = userMap[dn.startupId];
          if (!user) return false;
          
          if (category && user.category !== category) return false;
          if (minScore && user.score < minScore) return false;
          
          return true;
        });
      }
    }

    // Simple text search in deal note content
    const searchResults = filteredDealNotes.filter((dn: any) => {
      const dealNoteStr = JSON.stringify(dn.dealNote).toLowerCase();
      const queryStr = query.toLowerCase();
      return dealNoteStr.includes(queryStr);
    });

    // Get company details for each result
    const resultsWithCompanies = await Promise.all(
      searchResults.map(async (dn: any) => {
        const userDoc = await colUsers().doc(dn.startupId).get();
        const user = userDoc.data();
        
        return {
          dealNote: dn,
          company: {
            id: userDoc.id,
            name: user?.name,
            category: user?.category,
            score: user?.score,
            description: user?.description
          }
        };
      })
    );

    res.json({
      results: resultsWithCompanies,
      total: resultsWithCompanies.length,
      query,
      filters: { category, minScore }
    });
  } catch (err: any) {
    console.error(`Error searching deal notes: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});

// GET /v1/rag/deal-notes/:id - Get specific deal note by ID
ragRouter.get("/deal-notes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const dealNoteDoc = await colDealNotes().doc(id).get();
    if (!dealNoteDoc.exists) {
      return res.status(404).json({ error: "deal_note_not_found" });
    }

    const dealNote = dealNoteDoc.data();
    
    // Get company details
    const userDoc = await colUsers().doc((dealNote as any)?.startupId).get();
    const user = userDoc.data();

    res.json({
      dealNote: {
        id: dealNoteDoc.id,
        ...dealNote,
        createdAt: dealNote?.createdAt?.toDate(),
        updatedAt: dealNote?.updatedAt?.toDate()
      },
      company: {
        id: userDoc.id,
        name: user?.name,
        category: user?.category,
        score: user?.score,
        description: user?.description
      }
    });
  } catch (err: any) {
    console.error(`Error getting deal note: ${err}`);
    res.status(500).json({ error: "internal_error", message: err?.message || String(err) });
  }
});
