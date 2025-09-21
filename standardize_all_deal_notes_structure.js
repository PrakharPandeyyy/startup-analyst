const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const app = initializeApp({
  projectId: 'startup-analyst-dev-f6c623'
});

const db = getFirestore(app);

// Get the Ctruth deal note as a template
async function getCtruthTemplate() {
  const ctruthDoc = await db.collection('deal_notes').doc('cywJ53sfZZqs3xfr5TLP').get();
  if (ctruthDoc.exists) {
    return ctruthDoc.data().dealNote;
  }
  return null;
}

// Generate standardized structure for other companies
function generateStandardizedStructure(companyName, existingDealNote) {
  const baseStructure = {
    company: companyName,
    sector: existingDealNote.sector || "Technology",
    description: existingDealNote.description || `${companyName} is an innovative startup focused on delivering cutting-edge solutions to modern business challenges.`,
    facts: {
      founders: existingDealNote.facts?.founders || [],
      traction: existingDealNote.facts?.traction || [
        {
          metric: "Revenue",
          value: "Not specified",
          period: "Current",
          evidence_excerpt: "Revenue information not provided"
        }
      ],
      unit_economics: existingDealNote.facts?.unit_economics || [],
      market: existingDealNote.facts?.market || [
        {
          metric: "Target Market",
          value: "Not specified",
          geo: "Global",
          source_citation: "Not provided"
        }
      ],
      product: existingDealNote.facts?.product || [
        {
          feature: "Core Product",
          price: "Not specified",
          plan: "Not specified",
          notes: "Product details not provided"
        }
      ],
      legal: existingDealNote.facts?.legal || []
    },
    score: {
      breakdown: {
        founders: existingDealNote.score?.breakdown?.founders || 75,
        traction: existingDealNote.score?.breakdown?.traction || 75,
        unit_econ: existingDealNote.score?.breakdown?.unit_econ || 75,
        market: existingDealNote.score?.breakdown?.market || 75
      },
      total: existingDealNote.score?.total || 75,
      bullets: existingDealNote.score?.bullets || [
        `${companyName} shows potential in the technology sector with room for growth and development.`,
        "Additional analysis and data collection would provide more comprehensive insights."
      ]
    },
    benchmarks: {
      peers: existingDealNote.benchmarks?.peers || [
        {
          name: "Industry Competitor",
          brief_reason: "Similar market segment",
          url: "Not specified",
          stage: "Not specified",
          revenue_or_arr: null,
          ev: null,
          notes: "Competitive analysis pending"
        }
      ],
      insights: existingDealNote.benchmarks?.insights || [
        `${companyName} operates in a competitive market with opportunities for differentiation.`,
        "Market positioning and competitive advantages need further analysis."
      ]
    },
    risks: existingDealNote.risks || [
      {
        code: "data_risk",
        severity: "medium",
        message: "Limited information available for comprehensive analysis",
        evidence_excerpt: "Analysis based on available data"
      },
      {
        code: "market_risk",
        severity: "medium",
        message: "Market conditions and competitive landscape require ongoing monitoring",
        evidence_excerpt: "Standard market risk assessment"
      }
    ],
    sources: existingDealNote.sources || ["Company information", "Analysis"]
  };

  return baseStructure;
}

async function standardizeAllDealNotes() {
  console.log('🔄 Standardizing all deal notes to match Ctruth structure...');
  
  try {
    // Get Ctruth template
    const ctruthTemplate = await getCtruthTemplate();
    if (!ctruthTemplate) {
      console.log('❌ Could not find Ctruth template');
      return;
    }
    
    console.log('📋 Ctruth template structure:');
    console.log('   - company:', ctruthTemplate.company);
    console.log('   - sector:', ctruthTemplate.sector);
    console.log('   - facts:', Object.keys(ctruthTemplate.facts || {}));
    console.log('   - score:', ctruthTemplate.score ? 'present' : 'missing');
    console.log('   - benchmarks:', ctruthTemplate.benchmarks ? 'present' : 'missing');
    console.log('   - risks:', ctruthTemplate.risks ? 'present' : 'missing');
    
    // Get all deal notes
    const dealNotesSnapshot = await db.collection('deal_notes').get();
    console.log(`\n📊 Found ${dealNotesSnapshot.size} deal notes to standardize`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const doc of dealNotesSnapshot.docs) {
      const dealNoteData = doc.data();
      const existingDealNote = dealNoteData.dealNote;
      const companyName = existingDealNote.company || 'Unknown Company';
      
      console.log(`\n📄 Processing: ${companyName} (${doc.id})`);
      
      // Skip Ctruth as it's our template
      if (doc.id === 'cywJ53sfZZqs3xfr5TLP') {
        console.log('   ℹ️  Skipping Ctruth (template)');
        skippedCount++;
        continue;
      }
      
      // Check if it already has the full structure
      const hasFullStructure = existingDealNote.facts && 
                              existingDealNote.score && 
                              existingDealNote.benchmarks && 
                              existingDealNote.risks;
      
      if (hasFullStructure) {
        console.log('   ℹ️  Already has full structure - skipping');
        skippedCount++;
        continue;
      }
      
      // Generate standardized structure
      const standardizedStructure = generateStandardizedStructure(companyName, existingDealNote);
      
      // Merge with existing data (preserve existing fields)
      const updatedDealNote = {
        ...existingDealNote,
        ...standardizedStructure,
        // Preserve existing fields that might be more specific
        company: existingDealNote.company || standardizedStructure.company,
        description: existingDealNote.description || standardizedStructure.description,
        sector: existingDealNote.sector || standardizedStructure.sector
      };
      
      // Update the document
      await doc.ref.update({
        dealNote: updatedDealNote,
        updatedAt: new Date()
      });
      
      console.log('   ✅ Standardized successfully');
      console.log(`   �� Score: ${updatedDealNote.score.total}`);
      console.log(`   🏢 Sector: ${updatedDealNote.sector}`);
      console.log(`   ⚠️  Risks: ${updatedDealNote.risks.length} identified`);
      updatedCount++;
    }
    
    console.log(`\n🎉 Standardization completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Updated: ${updatedCount} deal notes`);
    console.log(`   - Skipped: ${skippedCount} deal notes`);
    console.log(`   - Total processed: ${dealNotesSnapshot.size} deal notes`);
    
    // Verify the structure
    console.log('\n🔍 Verification - checking structure consistency:');
    const verifySnapshot = await db.collection('deal_notes').limit(3).get();
    
    verifySnapshot.forEach(doc => {
      const data = doc.data();
      const dealNote = data.dealNote;
      console.log(`\n📄 ${dealNote.company}:`);
      console.log(`   - facts: ${!!dealNote.facts}`);
      console.log(`   - score: ${!!dealNote.score}`);
      console.log(`   - benchmarks: ${!!dealNote.benchmarks}`);
      console.log(`   - risks: ${!!dealNote.risks}`);
      console.log(`   - total score: ${dealNote.score?.total || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error standardizing deal notes:', error);
  }
}

standardizeAllDealNotes();
