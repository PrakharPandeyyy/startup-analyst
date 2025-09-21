const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const app = initializeApp({
  projectId: 'startup-analyst-dev-f6c623'
});

const db = getFirestore(app);

async function updateExistingData() {
  console.log('🔄 Updating existing data with companyWebsite and phoneNumber...');
  
  try {
    // Update Hexafun user
    const hexafunRef = db.collection('users').doc('jqhq39c1tSUXzoqXjoBI');
    await hexafunRef.update({
      companyWebsite: 'https://hexafun.com',
      phoneNumber: '+91-9876543210',
      updatedAt: new Date()
    });
    console.log('✅ Updated Hexafun user with website and phone');

    // Update Multipl user
    const multiplRef = db.collection('users').doc('egW359aftDqogWhkQZ2C');
    await multiplRef.update({
      companyWebsite: 'https://multipl.com',
      phoneNumber: '+91-9876543211',
      updatedAt: new Date()
    });
    console.log('✅ Updated Multipl user with website and phone');

    // Update Ctruth user
    const ctruthRef = db.collection('users').doc('hPHEGaQA1Edp5IojQZeX');
    await ctruthRef.update({
      companyWebsite: 'https://www.ctruh.com/',
      phoneNumber: '+1-555-123-4567',
      updatedAt: new Date()
    });
    console.log('✅ Updated Ctruth user with website and phone');

    // Update any other users that might exist
    const usersSnapshot = await db.collection('users').get();
    let updatedCount = 0;
    
    usersSnapshot.forEach(async (doc) => {
      const userData = doc.data();
      
      // Only update if companyWebsite or phoneNumber is missing
      if (!userData.companyWebsite || !userData.phoneNumber) {
        const updates = {
          updatedAt: new Date()
        };
        
        if (!userData.companyWebsite) {
          updates.companyWebsite = `https://${userData.name?.toLowerCase().replace(/\s+/g, '')}.com` || 'https://example.com';
        }
        
        if (!userData.phoneNumber) {
          updates.phoneNumber = '+1-555-000-0000';
        }
        
        await doc.ref.update(updates);
        updatedCount++;
        console.log(`✅ Updated user ${doc.id} with missing fields`);
      }
    });

    console.log(`\n🎉 Data update completed!`);
    console.log(`📊 Updated ${updatedCount + 3} users total`);
    console.log('📋 All existing data now includes companyWebsite and phoneNumber');

  } catch (error) {
    console.error('❌ Error updating data:', error);
  }
}

updateExistingData();
