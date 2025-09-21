const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://analyst-backend-549120538825.us-central1.run.app';

// Test data
const testUser = {
  email: 'test-flow@example.com',
  password: 'test123456',
  firstName: 'Test',
  lastName: 'User',
  companyName: 'TestFlow Technologies',
  phoneNumber: '+1234567890',
  companyWebsite: 'https://testflow.com'
};

const testAnswers = [
  {
    questionText: "What is your company's main value proposition?",
    answerText: "We provide AI-powered solutions for enterprise automation, reducing manual work by 80% and increasing efficiency across all business processes."
  },
  {
    questionText: "What is your target market and customer base?",
    answerText: "Our target market includes mid to large enterprises (500+ employees) in the technology, finance, and healthcare sectors. We currently serve 50+ enterprise clients."
  },
  {
    questionText: "What is your current revenue and growth trajectory?",
    answerText: "We have achieved $2.5M ARR with 150% year-over-year growth. Our monthly recurring revenue is growing at 12% month-over-month."
  },
  {
    questionText: "What are your key competitive advantages?",
    answerText: "Our proprietary AI algorithms, 5-year head start in the market, and exclusive partnerships with major cloud providers give us significant competitive moats."
  },
  {
    questionText: "What is your funding history and future plans?",
    answerText: "We raised $5M in Series A funding 18 months ago. We're planning a Series B round of $15M in the next 6 months to expand internationally."
  }
];

async function testCompleteFlow() {
  console.log('�� Starting complete end-to-end flow test...\n');
  
  try {
    // Step 1: Create user
    console.log('1️⃣ Creating test user...');
    const userResponse = await axios.post(`${BASE_URL}/v1/auth/register`, testUser);
    const userId = userResponse.data.userId;
    console.log(`✅ User created with ID: ${userId}\n`);
    
    // Step 2: Upload pitch deck
    console.log('2️⃣ Uploading pitch deck...');
    const pitchDeckPath = path.join(__dirname, 'data', 'Hexafun.pdf');
    
    if (!fs.existsSync(pitchDeckPath)) {
      throw new Error(`Pitch deck not found at ${pitchDeckPath}`);
    }
    
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(pitchDeckPath);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('pitchDeck', blob, 'Hexafun.pdf');
    formData.append('startupId', userId);
    
    const uploadResponse = await axios.post(`${BASE_URL}/v1/startups/upload-pitch`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    const pitchDeckId = uploadResponse.data.pitchDeckId;
    const questionnaireId = uploadResponse.data.questionnaireId;
    console.log(`✅ Pitch deck uploaded with ID: ${pitchDeckId}`);
    console.log(`✅ Questionnaire generated with ID: ${questionnaireId}\n`);
    
    // Step 3: Fill questionnaire answers
    console.log('3️⃣ Filling questionnaire answers...');
    const answersResponse = await axios.post(`${BASE_URL}/v1/startups/${userId}/questionnaire/${questionnaireId}/answers`, {
      answers: testAnswers
    });
    console.log(`✅ Questionnaire answers saved\n`);
    
    // Step 4: Invoke Startup-Analyst
    console.log('4️⃣ Invoking Startup-Analyst...');
    const analystResponse = await axios.post(`${BASE_URL}/v1/startup-analyst/run`, {
      startupId: userId,
      companyName: testUser.companyName,
      companyWebsite: testUser.companyWebsite,
      pitchDeckId: pitchDeckId,
      questionnaireId: questionnaireId
    });
    
    console.log('📊 Startup-Analyst Response:');
    console.log(JSON.stringify(analystResponse.data, null, 2));
    
    // Step 5: Verify deal note was created
    console.log('\n5️⃣ Verifying deal note creation...');
    const dealNotesResponse = await axios.get(`${BASE_URL}/v1/startups/deal-notes`);
    const userDealNotes = dealNotesResponse.data.dealNotes.filter(note => note.startupId === userId);
    
    if (userDealNotes.length > 0) {
      console.log(`✅ Deal note created with ID: ${userDealNotes[0].id}`);
      console.log(`📈 Company: ${userDealNotes[0].dealNote.company}`);
      console.log(`🎯 Score: ${userDealNotes[0].dealNote.score?.total || 'N/A'}`);
    } else {
      console.log('⚠️ No deal note found for this user');
    }
    
    console.log('\n🎉 Complete flow test finished!');
    
    // Save test results
    const testResults = {
      userId,
      pitchDeckId,
      questionnaireId,
      analystResponse: analystResponse.data,
      dealNotes: userDealNotes,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('test_flow_results.json', JSON.stringify(testResults, null, 2));
    console.log('📄 Test results saved to test_flow_results.json');
    
  } catch (error) {
    console.error('❌ Error in complete flow test:', error.response?.data || error.message);
    process.exit(1);
  }
}

testCompleteFlow();
