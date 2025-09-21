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

async function setupCtruthComplete() {
  console.log('🚀 Starting complete Ctruth setup...\n');
  
  try {
    // 1. Create Ctruth user
    console.log('1️⃣ Creating Ctruth user...');
    const ctruthUser = {
      email: 'ctruth@ctruh.com',
      username: 'ctruth',
      password: '$2b$10$example_hash', // This would be hashed in real scenario
      firstName: 'Vinay',
      lastName: 'Agastya',
      companyName: 'Ctruth Technologies',
      phoneNumber: '+91-9876543210',
      companyWebsite: 'https://www.ctruh.com/',
      role: 'startup',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const userRef = await db.collection('users').add(ctruthUser);
    const ctruthUserId = userRef.id;
    console.log(`✅ Ctruth user created with ID: ${ctruthUserId}\n`);
    
    // 2. Create pitch deck record
    console.log('2️⃣ Creating pitch deck record...');
    const pitchDeck = {
      startupId: ctruthUserId,
      fileName: 'Ctruth.pdf',
      gcsUri: 'gs://startup-analyst-uploads/Ctruth.pdf',
      contentType: 'application/pdf',
      sizeBytes: 4300000, // 4.3MB
      status: 'uploaded',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const pitchDeckRef = await db.collection('pitch_decks').add(pitchDeck);
    const pitchDeckId = pitchDeckRef.id;
    console.log(`✅ Pitch deck record created with ID: ${pitchDeckId}\n`);
    
    // 3. Generate questionnaire (using the agent)
    console.log('3️⃣ Generating questionnaire...');
    const questionnaire = {
      startupId: ctruthUserId,
      pitchDeckId: pitchDeckId,
      questions: [
        {
          id: 'q1',
          text: 'What is your company\'s main value proposition and how does it differentiate from competitors?',
          type: 'text',
          category: 'product'
        },
        {
          id: 'q2',
          text: 'What is your target market and customer acquisition strategy?',
          type: 'text',
          category: 'market'
        },
        {
          id: 'q3',
          text: 'What is your current revenue model and growth trajectory?',
          type: 'text',
          category: 'revenue'
        },
        {
          id: 'q4',
          text: 'What are your key competitive advantages and market positioning?',
          type: 'text',
          category: 'competition'
        },
        {
          id: 'q5',
          text: 'What is your funding history and future capital requirements?',
          type: 'text',
          category: 'funding'
        }
      ],
      status: 'ready',
      schemaVersion: '1.0',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const questionnaireRef = await db.collection('questionnaires').add(questionnaire);
    const questionnaireId = questionnaireRef.id;
    console.log(`✅ Questionnaire created with ID: ${questionnaireId}\n`);
    
    // 4. Fill questionnaire answers
    console.log('4️⃣ Filling questionnaire answers...');
    const answers = [
      {
        questionId: 'q1',
        questionText: 'What is your company\'s main value proposition and how does it differentiate from competitors?',
        answerText: 'Ctruth is a 3D technology platform that enables businesses to create, manage, and deploy immersive 3D experiences across web, mobile, and AR/VR platforms. Our key differentiator is our proprietary 3D engine that delivers high-quality 3D content with minimal file sizes, making it accessible across all devices and network conditions.'
      },
      {
        questionId: 'q2',
        questionText: 'What is your target market and customer acquisition strategy?',
        answerText: 'Our target market includes e-commerce companies, real estate developers, automotive manufacturers, and educational institutions. We focus on B2B sales through direct outreach, partnerships with system integrators, and content marketing. Our customer acquisition strategy emphasizes ROI demonstration through pilot projects.'
      },
      {
        questionId: 'q3',
        questionText: 'What is your current revenue model and growth trajectory?',
        answerText: 'We operate on a SaaS model with tiered pricing based on usage and features. Current ARR is $2.5M with 150% year-over-year growth. We have 50+ enterprise clients and are expanding internationally. Monthly recurring revenue is growing at 15% month-over-month.'
      },
      {
        questionId: 'q4',
        questionText: 'What are your key competitive advantages and market positioning?',
        answerText: 'Our key advantages include proprietary 3D compression technology, cross-platform compatibility, and a team with deep expertise in 3D graphics. We position ourselves as the go-to platform for businesses wanting to integrate 3D experiences without technical complexity. Our technology reduces 3D file sizes by 80% while maintaining quality.'
      },
      {
        questionId: 'q5',
        questionText: 'What is your funding history and future capital requirements?',
        answerText: 'We raised $5M in Series A funding 18 months ago from leading VCs. We\'re planning a Series B round of $15M in the next 6 months to expand internationally, hire key talent, and accelerate product development. The funds will be used for market expansion in North America and Europe.'
      }
    ];
    
    const founderAnswers = {
      startupId: ctruthUserId,
      questionnaireId: questionnaireId,
      answers: answers,
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const answersRef = await db.collection('founder_answers').add(founderAnswers);
    const answersId = answersRef.id;
    console.log(`✅ Questionnaire answers saved with ID: ${answersId}\n`);
    
    // 5. Upload the deal note from data folder
    console.log('5️⃣ Uploading deal note from data folder...');
    const dealNotePath = path.join(__dirname, 'Startup-Analyst', 'outputs', 'notes', 'deal_note_Ctruh_1758132738_ce4994.json');
    
    if (!fs.existsSync(dealNotePath)) {
      throw new Error(`Deal note file not found at ${dealNotePath}`);
    }
    
    const dealNoteData = JSON.parse(fs.readFileSync(dealNotePath, 'utf8'));
    
    const dealNote = {
      startupId: ctruthUserId,
      dealNote: dealNoteData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const dealNoteRef = await db.collection('deal_notes').add(dealNote);
    const dealNoteId = dealNoteRef.id;
    console.log(`✅ Deal note uploaded with ID: ${dealNoteId}\n`);
    
    // 6. Update user profile with deal note data
    console.log('6️⃣ Updating user profile with deal note data...');
    await userRef.update({
      score: dealNoteData.score?.total || 85,
      description: dealNoteData.brief?.brief_1_2_sentences || 'Ctruth is a 3D technology platform enabling immersive experiences across web, mobile, and AR/VR platforms.',
      category: dealNoteData.sector || 'Technology',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ User profile updated with deal note data\n`);
    
    // 7. Save setup data for reference
    const setupData = {
      ctruthUserId,
      pitchDeckId,
      questionnaireId,
      answersId,
      dealNoteId,
      companyWebsite: 'https://www.ctruh.com/',
      companyName: 'Ctruth Technologies',
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('ctruth_complete_setup.json', JSON.stringify(setupData, null, 2));
    console.log('📄 Setup data saved to ctruth_complete_setup.json');
    
    console.log('\n🎉 Complete Ctruth setup finished successfully!');
    console.log('\n📊 Setup Summary:');
    console.log(`   👤 User ID: ${ctruthUserId}`);
    console.log(`   📄 Pitch Deck ID: ${pitchDeckId}`);
    console.log(`   ❓ Questionnaire ID: ${questionnaireId}`);
    console.log(`   💬 Answers ID: ${answersId}`);
    console.log(`   📋 Deal Note ID: ${dealNoteId}`);
    console.log(`   🌐 Website: https://www.ctruh.com/`);
    
  } catch (error) {
    console.error('❌ Error in Ctruth setup:', error);
    process.exit(1);
  }
}

setupCtruthComplete();
