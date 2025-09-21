const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const app = initializeApp({
  projectId: 'startup-analyst-dev-f6c623'
});

const db = getFirestore(app);

async function updateCtruthDealNoteStructure() {
  console.log('🔄 Updating Ctruth deal note structure...');
  
  try {
    // Get the Ctruth deal note
    const dealNoteRef = db.collection('deal_notes').doc('cywJ53sfZZqs3xfr5TLP');
    const dealNoteDoc = await dealNoteRef.get();
    
    if (!dealNoteDoc.exists) {
      console.log('❌ Ctruth deal note not found');
      return;
    }
    
    const dealNoteData = dealNoteDoc.data();
    console.log('📋 Current structure:', JSON.stringify(dealNoteData.dealNote.brief, null, 2));
    
    // Extract the brief_1_2_sentences content
    const briefContent = dealNoteData.dealNote.brief?.brief_1_2_sentences || 
                        dealNoteData.dealNote.brief || 
                        'Ctruth Technologies is developing an AI-powered, no-code Unified XR Commerce Studio that enables businesses to create, manage, and deploy immersive 3D and XR experiences across web, mobile, and headsets.';
    
    console.log('📝 Brief content to move:', briefContent);
    
    // Update the deal note structure
    const updatedDealNote = {
      ...dealNoteData.dealNote,
      description: briefContent, // Move brief content to description
      brief: undefined // Remove the nested brief structure
    };
    
    // Remove undefined fields
    delete updatedDealNote.brief;
    
    // Update the document
    await dealNoteRef.update({
      dealNote: updatedDealNote,
      updatedAt: new Date()
    });
    
    console.log('✅ Updated Ctruth deal note structure');
    console.log('📋 New structure:');
    console.log('   - description:', updatedDealNote.description);
    console.log('   - brief: removed');
    
    // Verify the update
    const updatedDoc = await dealNoteRef.get();
    const updatedData = updatedDoc.data();
    console.log('\n🔍 Verification:');
    console.log('   - description exists:', !!updatedData.dealNote.description);
    console.log('   - brief exists:', !!updatedData.dealNote.brief);
    console.log('   - description content:', updatedData.dealNote.description?.substring(0, 100) + '...');
    
  } catch (error) {
    console.error('❌ Error updating Ctruth deal note structure:', error);
  }
}

updateCtruthDealNoteStructure();
