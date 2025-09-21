const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'startup-analyst-dev-f6c623'
  });
}

const db = admin.firestore();

async function updateMultiplDealNote() {
  console.log('🔄 Updating Multipl deal note with latest data...\n');
  
  try {
    const multiplUserId = 'QZXOTWiaFbVYJ2je7u1O';
    
    // 1. Read the updated deal note from data folder
    console.log('1️⃣ Reading updated deal note from data folder...');
    const dealNotePath = path.join(__dirname, 'data', 'dealnote.json');
    
    if (!fs.existsSync(dealNotePath)) {
      throw new Error(`Deal note file not found at ${dealNotePath}`);
    }
    
    const updatedDealNoteData = JSON.parse(fs.readFileSync(dealNotePath, 'utf8'));
    console.log(`✅ Read updated deal note data\n`);
    
    // 2. Find the existing deal note for our Multipl user
    console.log('2️⃣ Finding existing deal note...');
    const dealNotesQuery = await db.collection('deal_notes')
      .where('startupId', '==', multiplUserId)
      .get();
    
    if (dealNotesQuery.empty) {
      throw new Error('No deal note found for Multipl user');
    }
    
    const dealNoteDoc = dealNotesQuery.docs[0];
    const dealNoteId = dealNoteDoc.id;
    console.log(`✅ Found existing deal note: ${dealNoteId}\n`);
    
    // 3. Update the deal note with new data
    console.log('3️⃣ Updating deal note...');
    await dealNoteDoc.ref.update({
      dealNote: updatedDealNoteData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ Deal note updated successfully\n`);
    
    // 4. Update user profile with new deal note data
    console.log('4️⃣ Updating user profile...');
    const userRef = db.collection('users').doc(multiplUserId);
    await userRef.update({
      score: updatedDealNoteData.score?.total || 86.25,
      description: updatedDealNoteData.description || updatedDealNoteData.brief?.brief_1_2_sentences || 'Multipl is an Indian fintech platform that enables consumers to save and invest towards specific spending goals.',
      category: updatedDealNoteData.sector || 'fintech',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ User profile updated\n`);
    
    console.log('🎉 Multipl deal note updated successfully!');
    console.log('\n📊 Update Summary:');
    console.log(`   📋 Deal Note ID: ${dealNoteId}`);
    console.log(`   🎯 Score: ${updatedDealNoteData.score?.total || 86.25}`);
    console.log(`   🏷️ Sector: ${updatedDealNoteData.sector || 'fintech'}`);
    console.log(`   📝 Description: ${updatedDealNoteData.description ? 'Updated' : 'Using brief'}`);
    
  } catch (error) {
    console.error('❌ Error updating Multipl deal note:', error);
    process.exit(1);
  }
}

updateMultiplDealNote();
