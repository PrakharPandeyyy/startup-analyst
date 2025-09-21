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

async function setupCleanMultipl() {
  console.log('🚀 Starting fresh, clean Multipl setup...\n');
  
  try {
    // 1. Create clean Multipl user with correct name
    console.log('1️⃣ Creating clean Multipl user...');
    const multiplUser = {
      email: 'paddy@multipl.com',
      username: 'multipl',
      password: '$2b$10$example_hash',
      firstName: 'Paddy',
      lastName: 'Raghavan',
      companyName: 'Multipl',
      name: 'Multipl', // This is the key field for display
      phoneNumber: '+91-9876543210',
      companyWebsite: 'https://multipl.com',
      role: 'startup',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const userRef = await db.collection('users').add(multiplUser);
    const multiplUserId = userRef.id;
    console.log(`✅ Clean Multipl user created with ID: ${multiplUserId}\n`);
    
    // 2. Create pitch deck record
    console.log('2️⃣ Creating pitch deck record...');
    const pitchDeck = {
      startupId: multiplUserId,
      fileName: 'Multipl_Pitch.pdf',
      gcsUri: 'gs://startup-analyst-uploads/Multipl_Pitch.pdf',
      contentType: 'application/pdf',
      sizeBytes: 72000000,
      status: 'uploaded',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const pitchDeckRef = await db.collection('pitch_decks').add(pitchDeck);
    const pitchDeckId = pitchDeckRef.id;
    console.log(`✅ Pitch deck record created with ID: ${pitchDeckId}\n`);
    
    // 3. Generate questionnaire
    console.log('3️⃣ Generating questionnaire...');
    const questionnaire = {
      startupId: multiplUserId,
      pitchDeckId: pitchDeckId,
      questions: [
        {
          id: 'q1',
          text: 'What is your total addressable market (TAM) and how do you plan to capture it?',
          type: 'text',
          category: 'market'
        },
        {
          id: 'q2',
          text: 'What is your customer acquisition cost (CAC) and customer lifetime value (LTV)?',
          type: 'text',
          category: 'unit_economics'
        },
        {
          id: 'q3',
          text: 'What is your monthly recurring revenue (MRR) and growth trajectory?',
          type: 'text',
          category: 'revenue'
        },
        {
          id: 'q4',
          text: 'Who are your main competitors and how do you differentiate?',
          type: 'text',
          category: 'competition'
        },
        {
          id: 'q5',
          text: 'What is your go-to-market strategy and customer acquisition approach?',
          type: 'text',
          category: 'strategy'
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
        questionText: 'What is your total addressable market (TAM) and how do you plan to capture it?',
        answerText: 'Our TAM is the Indian savings and investment market, which is $500B+ and growing at 15% annually. We focus on the goal-based savings segment ($50B TAM) where consumers save for specific purchases. We plan to capture this through our embedded finance model with partner brands and our disciplined savings platform.'
      },
      {
        questionId: 'q2',
        questionText: 'What is your customer acquisition cost (CAC) and customer lifetime value (LTV)?',
        answerText: 'Our CAC is ₹150 through our partner brand integrations and digital marketing. Our LTV is ₹2,500 based on average user engagement of 18 months and our revenue model. We achieve a healthy LTV:CAC ratio of 16:1, which is sustainable for our business model.'
      },
      {
        questionId: 'q3',
        questionText: 'What is your monthly recurring revenue (MRR) and growth trajectory?',
        answerText: 'Our current MRR is ₹4.2 Cr with 150% year-over-year growth. We have 700K+ registered users and 200K+ KYC-verified accounts with INR 100+ Cr Assets Under Advice. We project CY26 revenue of INR 50 Cr+ and are growing at 15% month-over-month.'
      },
      {
        questionId: 'q4',
        questionText: 'Who are your main competitors and how do you differentiate?',
        answerText: 'Our main competitors are traditional savings apps like PiggyVest and investment platforms like Groww. We differentiate through our embedded finance model with partner brands - we\'re not just a savings app, we\'re a conversion tool for brands. Our unique value proposition is enabling consumers to save towards specific spending goals with partner brands.'
      },
      {
        questionId: 'q5',
        questionText: 'What is your go-to-market strategy and customer acquisition approach?',
        answerText: 'Our go-to-market strategy is B2B2C through partner brand integrations. We acquire customers through our partner brands in categories like travel, shopping, and gadgets. Our approach is to embed our savings functionality into the brand\'s customer journey, increasing conversions for brands while providing users a disciplined savings vehicle.'
      }
    ];
    
    const founderAnswers = {
      startupId: multiplUserId,
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
    const dealNotePath = path.join(__dirname, 'data', 'dealnote.json');
    
    if (!fs.existsSync(dealNotePath)) {
      throw new Error(`Deal note file not found at ${dealNotePath}`);
    }
    
    const dealNoteData = JSON.parse(fs.readFileSync(dealNotePath, 'utf8'));
    
    const dealNote = {
      startupId: multiplUserId,
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
      score: dealNoteData.score?.total || 86.25,
      description: dealNoteData.description || dealNoteData.brief?.brief_1_2_sentences || 'Multipl is an Indian fintech platform that enables consumers to save and invest towards specific spending goals with partner brands.',
      category: dealNoteData.sector || 'fintech',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ User profile updated with deal note data\n`);
    
    // 7. Save setup data for reference
    const setupData = {
      multiplUserId,
      pitchDeckId,
      questionnaireId,
      answersId,
      dealNoteId,
      companyWebsite: 'https://multipl.com',
      companyName: 'Multipl',
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('clean_multipl_setup.json', JSON.stringify(setupData, null, 2));
    console.log('📄 Setup data saved to clean_multipl_setup.json');
    
    console.log('\n🎉 Clean Multipl setup finished successfully!');
    console.log('\n📊 Setup Summary:');
    console.log(`   👤 User ID: ${multiplUserId}`);
    console.log(`   📄 Pitch Deck ID: ${pitchDeckId}`);
    console.log(`   ❓ Questionnaire ID: ${questionnaireId}`);
    console.log(`   💬 Answers ID: ${answersId}`);
    console.log(`   📋 Deal Note ID: ${dealNoteId}`);
    console.log(`   🌐 Website: https://multipl.com`);
    console.log(`   🎯 Score: ${dealNoteData.score?.total || 86.25}`);
    console.log(`   🏷️ Sector: ${dealNoteData.sector || 'fintech'}`);
    console.log(`   📝 Name: Multipl (correctly set)`);
    
  } catch (error) {
    console.error('❌ Error in clean Multipl setup:', error);
    process.exit(1);
  }
}

setupCleanMultipl();
