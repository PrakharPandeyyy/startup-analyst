const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore({ 
  projectId: 'startup-analyst-dev-f6c623' 
});

async function initializeFirestoreData() {
  console.log('Initializing Firestore with sample data...');

  try {
    // Create sample users
    const users = [
      {
        name: 'TechAI Solutions',
        role: 'startup',
        description: 'AI-powered fintech platform for automated trading',
        score: 8.5,
        category: 'fintech'
      },
      {
        name: 'MediTech Health',
        role: 'startup',
        description: 'Healthcare AI platform for patient diagnosis',
        score: 7.8,
        category: 'healthcare'
      },
      {
        name: 'EcoGreen Energy',
        role: 'startup',
        description: 'Renewable energy management platform',
        score: 6.9,
        category: 'cleantech'
      },
      {
        name: 'John Investor',
        role: 'investor',
        description: 'Venture Capital Partner',
        score: null,
        category: null
      }
    ];

    for (const user of users) {
      const docRef = await firestore.collection('users').add({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Created user: ${user.name} with ID: ${docRef.id}`);
    }

    // Create sample deal notes
    const dealNotes = [
      {
        startupId: 'sample_startup_1',
        dealNote: {
          run_id: 'sample_1',
          company: 'TechAI Solutions',
          sector: 'fintech',
          description: 'AI-powered fintech platform for automated trading',
          score: {
            total: 8.5,
            breakdown: {
              founders: 8,
              traction: 9,
              unit_econ: 7,
              market: 8
            }
          },
          facts: {
            founders: [
              { name: 'John Doe', title: 'CEO' },
              { name: 'Jane Smith', title: 'CTO' }
            ],
            traction: [
              { metric: 'users', value: 100000 },
              { metric: 'revenue', value: 1000000 }
            ]
          }
        }
      },
      {
        startupId: 'sample_startup_2',
        dealNote: {
          run_id: 'sample_2',
          company: 'MediTech Health',
          sector: 'healthcare',
          description: 'Healthcare AI platform for patient diagnosis',
          score: {
            total: 7.8,
            breakdown: {
              founders: 7,
              traction: 8,
              unit_econ: 6,
              market: 9
            }
          },
          facts: {
            founders: [
              { name: 'Dr. Alice Johnson', title: 'CEO' },
              { name: 'Dr. Bob Wilson', title: 'CTO' }
            ],
            traction: [
              { metric: 'users', value: 50000 },
              { metric: 'revenue', value: 500000 }
            ]
          }
        }
      }
    ];

    for (const dealNote of dealNotes) {
      const docRef = await firestore.collection('deal_notes').add({
        ...dealNote,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Created deal note for: ${dealNote.dealNote.company} with ID: ${docRef.id}`);
    }

    console.log('Firestore initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
}

initializeFirestoreData();
