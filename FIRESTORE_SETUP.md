# 🔥 Firestore Setup Guide

## 📋 **Required Setup Steps**

### **1. Deploy Firestore Indexes**

The new API requires several composite indexes for efficient querying:

```bash
# Deploy the indexes
./deploy-firestore-indexes.sh
```

**Indexes Created:**
- `users` collection: `role + category`, `role + score`
- `deal_notes` collection: `startupId + createdAt`
- `pitch_decks` collection: `startupId + createdAt`
- `questionnaires` collection: `startupId + createdAt`
- `scheduled_calls` collection: `startupId + createdAt`, `status + scheduledTime`

### **2. Initialize Sample Data (Optional)**

```bash
# Install dependencies
npm install @google-cloud/firestore

# Run the initialization script
node init-firestore-data.js
```

**Sample Data Created:**
- 3 startup users (TechAI, MediTech, EcoGreen)
- 1 investor user (John Investor)
- 2 sample deal notes with full structure

### **3. Verify Collections**

After setup, you should have these collections in Firestore:

```
users/
├── user_1 (TechAI Solutions - startup)
├── user_2 (MediTech Health - startup)
├── user_3 (EcoGreen Energy - startup)
└── user_4 (John Investor - investor)

deal_notes/
├── deal_note_1 (TechAI Solutions)
└── deal_note_2 (MediTech Health)

pitch_decks/ (empty initially)
questionnaires/ (empty initially)
scheduled_calls/ (empty initially)
```

## 🔧 **Manual Index Creation (Alternative)**

If the script doesn't work, create indexes manually in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `startup-analyst-dev-f6c623`
3. Go to Firestore Database → Indexes
4. Click "Create Index"
5. Add the following indexes:

### **Users Collection Indexes**
- **Collection**: `users`
- **Fields**: `role` (Ascending), `category` (Ascending)
- **Fields**: `role` (Ascending), `score` (Descending)

### **Deal Notes Collection Indexes**
- **Collection**: `deal_notes`
- **Fields**: `startupId` (Ascending), `createdAt` (Descending)

### **Pitch Decks Collection Indexes**
- **Collection**: `pitch_decks`
- **Fields**: `startupId` (Ascending), `createdAt` (Descending)

### **Questionnaires Collection Indexes**
- **Collection**: `questionnaires`
- **Fields**: `startupId` (Ascending), `createdAt` (Descending)

### **Scheduled Calls Collection Indexes**
- **Collection**: `scheduled_calls`
- **Fields**: `startupId` (Ascending), `createdAt` (Descending)
- **Fields**: `status` (Ascending), `scheduledTime` (Ascending)

## 🚨 **Important Notes**

1. **Index Creation Time**: Composite indexes can take 5-10 minutes to build
2. **Query Performance**: Without proper indexes, queries will fail or be slow
3. **Collection Names**: Use exact collection names as defined in the code
4. **Field Types**: Ensure field types match the schema (string, number, timestamp)

## ✅ **Verification**

After setup, test these queries to verify indexes work:

```bash
# Test user query by role and category
curl -X GET "https://analyst-backend-549120538825.us-central1.run.app/v1/companies?category=fintech" \
  -H "x-debug-role: investor"

# Test deal note query
curl -X GET "https://analyst-backend-549120538825.us-central1.run.app/v1/companies/sample_startup_1/deal-note" \
  -H "x-debug-role: investor"

# Test RAG search
curl -X POST "https://analyst-backend-549120538825.us-central1.run.app/v1/rag/search" \
  -H "Content-Type: application/json" \
  -H "x-debug-role: investor" \
  -d '{"query": "fintech AI", "category": "fintech"}'
```

## 🎯 **Ready for Production**

Once indexes are deployed and sample data is loaded:
- ✅ All API endpoints will work correctly
- ✅ Queries will be fast and efficient
- ✅ RAG search will function properly
- ✅ Bot integration will work seamlessly

**The system is ready for frontend integration and demo!** 🚀
