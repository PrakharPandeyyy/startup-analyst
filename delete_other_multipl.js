const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'startup-analyst-dev-f6c623'
  });
}

const db = admin.firestore();

async function deleteOtherMultipl() {
  console.log('🗑️ Starting deletion of other Multipl entries...\n');
  
  try {
    // Keep our new Multipl user ID
    const keepUserId = 'QZXOTWiaFbVYJ2je7u1O';
    console.log(`Keeping Multipl user: ${keepUserId}\n`);
    
    // 1. Find and delete other Multipl users
    console.log('1️⃣ Finding other Multipl users...');
    const usersQuery = await db.collection('users')
      .where('companyName', '==', 'Multipl')
      .get();
    
    for (const doc of usersQuery.docs) {
      if (doc.id !== keepUserId) {
        const userId = doc.id;
        console.log(`Deleting Multipl user: ${userId}`);
        
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
    
    // 2. Delete any other Multipl deal notes not associated with our user
    console.log('\n2️⃣ Deleting other Multipl deal notes...');
    const allDealNotesQuery = await db.collection('deal_notes').get();
    
    for (const doc of allDealNotesQuery.docs) {
      const data = doc.data();
      if (data.dealNote && data.dealNote.company && 
          data.dealNote.company.toLowerCase().includes('multipl') &&
          data.startupId !== keepUserId) {
        await doc.ref.delete();
        console.log(`Deleted Multipl deal note: ${doc.id}`);
      }
    }
    
    console.log('\n✅ All other Multipl entries deleted successfully!');
    console.log(`✅ Kept Multipl user: ${keepUserId}`);
    
  } catch (error) {
    console.error('❌ Error deleting other Multipl entries:', error);
    process.exit(1);
  }
}

deleteOtherMultipl();
