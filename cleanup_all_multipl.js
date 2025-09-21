const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'startup-analyst-dev-f6c623'
  });
}

const db = admin.firestore();

async function cleanupAllMultipl() {
  console.log('🗑️ Starting comprehensive cleanup of ALL Multipl entries...\n');
  
  try {
    // 1. Delete ALL users with company name containing "Multipl" or "multipl"
    console.log('1️⃣ Deleting ALL Multipl users...');
    const usersQuery = await db.collection('users').get();
    
    for (const doc of usersQuery.docs) {
      const userData = doc.data();
      const companyName = userData.companyName || '';
      const name = userData.name || '';
      
      if (companyName.toLowerCase().includes('multipl') || 
          name.toLowerCase().includes('multipl')) {
        const userId = doc.id;
        console.log(`Deleting user: ${userId} (${companyName || name})`);
        
        // Delete all related data for this user
        // Pitch decks
        const pitchDecksQuery = await db.collection('pitch_decks')
          .where('startupId', '==', userId)
          .get();
        for (const pitchDoc of pitchDecksQuery.docs) {
          await pitchDoc.ref.delete();
          console.log(`  Deleted pitch deck: ${pitchDoc.id}`);
        }
        
        // Questionnaires
        const questionnairesQuery = await db.collection('questionnaires')
          .where('startupId', '==', userId)
          .get();
        for (const qDoc of questionnairesQuery.docs) {
          await qDoc.ref.delete();
          console.log(`  Deleted questionnaire: ${qDoc.id}`);
        }
        
        // Founder answers
        const founderAnswersQuery = await db.collection('founder_answers')
          .where('startupId', '==', userId)
          .get();
        for (const aDoc of founderAnswersQuery.docs) {
          await aDoc.ref.delete();
          console.log(`  Deleted founder answers: ${aDoc.id}`);
        }
        
        // Scheduled calls
        const scheduledCallsQuery = await db.collection('scheduled_calls')
          .where('startupId', '==', userId)
          .get();
        for (const cDoc of scheduledCallsQuery.docs) {
          await cDoc.ref.delete();
          console.log(`  Deleted scheduled call: ${cDoc.id}`);
        }
        
        // Deal notes
        const dealNotesQuery = await db.collection('deal_notes')
          .where('startupId', '==', userId)
          .get();
        for (const dDoc of dealNotesQuery.docs) {
          await dDoc.ref.delete();
          console.log(`  Deleted deal note: ${dDoc.id}`);
        }
        
        // Delete the user
        await doc.ref.delete();
        console.log(`  Deleted user: ${userId}`);
      }
    }
    
    // 2. Delete ALL deal notes with company name containing "Multipl" or "multipl"
    console.log('\n2️⃣ Deleting ALL Multipl deal notes...');
    const allDealNotesQuery = await db.collection('deal_notes').get();
    
    for (const doc of allDealNotesQuery.docs) {
      const data = doc.data();
      if (data.dealNote && data.dealNote.company) {
        const companyName = data.dealNote.company.toLowerCase();
        if (companyName.includes('multipl')) {
          await doc.ref.delete();
          console.log(`Deleted deal note: ${doc.id} (${data.dealNote.company})`);
        }
      }
    }
    
    console.log('\n✅ ALL Multipl entries deleted successfully!');
    console.log('✅ Database is now clean of all Multipl entries');
    
  } catch (error) {
    console.error('❌ Error cleaning up Multipl entries:', error);
    process.exit(1);
  }
}

cleanupAllMultipl();
