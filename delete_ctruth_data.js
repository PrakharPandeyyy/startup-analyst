const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'startup-analyst-dev-f6c623'
  });
}

const db = admin.firestore();

async function deleteCtruthData() {
  console.log('🗑️ Starting deletion of all Ctruth-related data...\n');
  
  try {
    // 1. Find and delete Ctruth user
    console.log('1️⃣ Finding Ctruth user...');
    const usersQuery = await db.collection('users')
      .where('companyName', '==', 'Ctruth Technologies')
      .get();
    
    if (!usersQuery.empty) {
      const ctruthUser = usersQuery.docs[0];
      const ctruthUserId = ctruthUser.id;
      console.log(`Found Ctruth user: ${ctruthUserId}`);
      
      // 2. Delete all pitch decks for this user
      console.log('2️⃣ Deleting pitch decks...');
      const pitchDecksQuery = await db.collection('pitch_decks')
        .where('startupId', '==', ctruthUserId)
        .get();
      
      for (const doc of pitchDecksQuery.docs) {
        await doc.ref.delete();
        console.log(`Deleted pitch deck: ${doc.id}`);
      }
      
      // 3. Delete all questionnaires for this user
      console.log('3️⃣ Deleting questionnaires...');
      const questionnairesQuery = await db.collection('questionnaires')
        .where('startupId', '==', ctruthUserId)
        .get();
      
      for (const doc of questionnairesQuery.docs) {
        await doc.ref.delete();
        console.log(`Deleted questionnaire: ${doc.id}`);
      }
      
      // 4. Delete all founder answers for this user
      console.log('4️⃣ Deleting founder answers...');
      const founderAnswersQuery = await db.collection('founder_answers')
        .where('startupId', '==', ctruthUserId)
        .get();
      
      for (const doc of founderAnswersQuery.docs) {
        await doc.ref.delete();
        console.log(`Deleted founder answers: ${doc.id}`);
      }
      
      // 5. Delete all scheduled calls for this user
      console.log('5️⃣ Deleting scheduled calls...');
      const scheduledCallsQuery = await db.collection('scheduled_calls')
        .where('startupId', '==', ctruthUserId)
        .get();
      
      for (const doc of scheduledCallsQuery.docs) {
        await doc.ref.delete();
        console.log(`Deleted scheduled call: ${doc.id}`);
      }
      
      // 6. Delete all deal notes for this user
      console.log('6️⃣ Deleting deal notes...');
      const dealNotesQuery = await db.collection('deal_notes')
        .where('startupId', '==', ctruthUserId)
        .get();
      
      for (const doc of dealNotesQuery.docs) {
        await doc.ref.delete();
        console.log(`Deleted deal note: ${doc.id}`);
      }
      
      // 7. Delete the user itself
      console.log('7️⃣ Deleting Ctruth user...');
      await ctruthUser.ref.delete();
      console.log(`Deleted user: ${ctruthUserId}`);
      
    } else {
      console.log('No Ctruth user found');
    }
    
    // 8. Also delete any deal notes with "Ctruth" in the company name
    console.log('8️⃣ Deleting any remaining Ctruth deal notes...');
    const allDealNotesQuery = await db.collection('deal_notes').get();
    
    for (const doc of allDealNotesQuery.docs) {
      const data = doc.data();
      if (data.dealNote && data.dealNote.company && 
          data.dealNote.company.toLowerCase().includes('ctruth')) {
        await doc.ref.delete();
        console.log(`Deleted Ctruth deal note: ${doc.id}`);
      }
    }
    
    console.log('\n✅ All Ctruth-related data deleted successfully!');
    
  } catch (error) {
    console.error('❌ Error deleting Ctruth data:', error);
    process.exit(1);
  }
}

deleteCtruthData();
