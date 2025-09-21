const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const app = initializeApp({
  projectId: 'startup-analyst-dev-f6c623'
});

const db = getFirestore(app);

async function updateAllDealNotesStructure() {
  console.log('🔄 Updating all deal notes structure...');
  
  try {
    // Get all deal notes
    const dealNotesSnapshot = await db.collection('deal_notes').get();
    console.log(`📊 Found ${dealNotesSnapshot.size} deal notes to process`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const doc of dealNotesSnapshot.docs) {
      const dealNoteData = doc.data();
      const dealNote = dealNoteData.dealNote;
      
      console.log(`\n📄 Processing: ${dealNote.company || 'Unknown Company'} (${doc.id})`);
      
      // Check if it already has description field
      if (dealNote.description) {
        console.log('   ℹ️  Already has description field - skipping');
        skippedCount++;
        continue;
      }
      
      // Extract description from various possible locations
      let description = null;
      
      if (dealNote.brief?.brief_1_2_sentences) {
        description = dealNote.brief.brief_1_2_sentences;
        console.log('   📝 Found brief.brief_1_2_sentences');
      } else if (dealNote.brief && typeof dealNote.brief === 'string') {
        description = dealNote.brief;
        console.log('   📝 Found brief as string');
      } else if (dealNote.summary) {
        description = dealNote.summary;
        console.log('   📝 Found summary field');
      } else if (dealNote.overview) {
        description = dealNote.overview;
        console.log('   📝 Found overview field');
      } else {
        // Generate a default description based on company name
        const companyName = dealNote.company || 'Company';
        description = `${companyName} is an innovative startup focused on delivering cutting-edge solutions to modern business challenges.`;
        console.log('   📝 Generated default description');
      }
      
      // Create updated deal note structure
      const updatedDealNote = {
        ...dealNote,
        description: description
      };
      
      // Remove the old brief structure if it exists
      if (updatedDealNote.brief) {
        delete updatedDealNote.brief;
        console.log('   🗑️  Removed old brief structure');
      }
      
      // Update the document
      await doc.ref.update({
        dealNote: updatedDealNote,
        updatedAt: new Date()
      });
      
      console.log('   ✅ Updated successfully');
      console.log(`   📝 Description: ${description.substring(0, 100)}...`);
      updatedCount++;
    }
    
    console.log(`\n🎉 Update completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Updated: ${updatedCount} deal notes`);
    console.log(`   - Skipped: ${skippedCount} deal notes (already had description)`);
    console.log(`   - Total processed: ${dealNotesSnapshot.size} deal notes`);
    
    // Verify a few examples
    console.log('\n🔍 Verification - checking a few examples:');
    const verifySnapshot = await db.collection('deal_notes').limit(3).get();
    
    verifySnapshot.forEach(doc => {
      const data = doc.data();
      const dealNote = data.dealNote;
      console.log(`\n📄 ${dealNote.company || 'Unknown'}:`);
      console.log(`   - Has description: ${!!dealNote.description}`);
      console.log(`   - Has brief: ${!!dealNote.brief}`);
      console.log(`   - Description: ${dealNote.description?.substring(0, 80)}...`);
    });

  } catch (error) {
    console.error('❌ Error updating deal notes structure:', error);
  }
}

updateAllDealNotesStructure();
