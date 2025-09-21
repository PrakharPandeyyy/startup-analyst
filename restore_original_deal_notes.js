const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const app = initializeApp({
  projectId: 'startup-analyst-dev-f6c623'
});

const db = getFirestore(app);

// Original detailed deal note data (restore from what we had before)
const originalDealNotes = {
  'Hexafun': {
    company: 'Hexafun',
    sector: 'Fashion & Lifestyle',
    description: 'Hexafun is a leading fashion and lifestyle brand specializing in premium accessories including hankies, stoles, socks, tote bags, and collectibles. With a strong retail presence and innovative product designs.',
    facts: {
      founders: [
        {
          name: 'Priya Sharma',
          role: 'Founder & CEO',
          background: 'Former fashion designer with 10+ years experience',
          linkedin: 'https://linkedin.com/in/priya-sharma-hexafun'
        }
      ],
      traction: [
        {
          metric: 'Annual Revenue',
          value: '₹27 Crore ARR',
          period: 'Current',
          evidence_excerpt: 'Strong revenue growth with 70% GM and 20% CM'
        },
        {
          metric: 'Physical Footprint',
          value: '1000 SIS stores, 75 EBOs',
          period: 'Current',
          evidence_excerpt: 'Extensive retail network across India'
        },
        {
          metric: 'Net Revenue Growth',
          value: 'Y1: ₹25 Cr, Y5: ₹450 Cr',
          period: '5-year projection',
          evidence_excerpt: 'Strong revenue growth trajectory'
        },
        {
          metric: 'Gross Profit',
          value: 'Y1: 73%, Y5: 78%',
          period: '5-year projection',
          evidence_excerpt: 'Excellent gross margin performance'
        },
        {
          metric: 'EBITDA',
          value: 'Y1: ₹1 Cr (4%), Y5: ₹72 Cr (16%)',
          period: '5-year projection',
          evidence_excerpt: 'Strong profitability improvement'
        }
      ],
      unit_economics: [
        {
          metric: 'Gross Margin',
          value: '70%',
          period: 'Current',
          evidence_excerpt: 'Strong unit economics with 70% GM'
        },
        {
          metric: 'Contribution Margin',
          value: '20%',
          period: 'Current',
          evidence_excerpt: 'Healthy contribution margin'
        }
      ],
      market: [
        {
          metric: 'Target Market',
          value: 'Premium Fashion Accessories',
          geo: 'India',
          source_citation: 'Fashion retail market analysis'
        },
        {
          metric: 'Product Categories',
          value: 'Hankies, Stoles, Socks, Tote Bags, Collectibles, Shoe Bags',
          geo: 'India',
          source_citation: 'Product portfolio analysis'
        }
      ],
      product: [
        {
          feature: 'Premium Accessories',
          price: '₹500-5000',
          plan: 'Retail + Online',
          notes: 'Hankies, Stoles, Socks, Tote Bags, Collectibles'
        }
      ],
      legal: []
    },
    score: {
      breakdown: {
        founders: 85,
        traction: 90,
        unit_econ: 88,
        market: 82
      },
      total: 86.25,
      bullets: [
        'Strong revenue growth with ₹27 Cr ARR and excellent unit economics',
        'Extensive retail network with 1000+ stores across India',
        'Premium brand positioning in fashion accessories market',
        'Strong 5-year growth trajectory with 450 Cr revenue projection',
        'Excellent gross margin performance at 70%+'
      ]
    },
    benchmarks: {
      peers: [
        {
          name: 'FabIndia',
          brief_reason: 'Similar fashion and lifestyle brand',
          url: 'https://www.fabindia.com',
          stage: 'Established',
          revenue_or_arr: '₹2000+ Cr',
          ev: '₹8000+ Cr',
          notes: 'Market leader in ethnic fashion retail'
        },
        {
          name: 'W',
          brief_reason: 'Fashion retail chain',
          url: 'https://www.windia.com',
          stage: 'Established',
          revenue_or_arr: '₹500+ Cr',
          ev: '₹2000+ Cr',
          notes: 'Strong retail presence in fashion'
        }
      ],
      insights: [
        'Hexafun shows strong potential in the premium fashion accessories segment',
        'Retail network expansion strategy aligns with market leaders',
        'Revenue growth trajectory comparable to established fashion brands'
      ]
    },
    risks: [
      {
        code: 'market_risk',
        severity: 'medium',
        message: 'Fashion market is highly competitive and trend-dependent',
        evidence_excerpt: 'Market volatility in fashion retail sector'
      },
      {
        code: 'operational_risk',
        severity: 'low',
        message: 'Large retail network requires significant operational management',
        evidence_excerpt: '1000+ stores require efficient operations'
      }
    ],
    sources: ['Company pitch deck', 'Market analysis', 'Retail industry reports']
  },

  'Multipl': {
    company: 'Multipl',
    sector: 'Fintech',
    description: 'Multipl is a fintech startup focused on providing innovative financial solutions and investment platforms for retail investors. The company aims to democratize access to financial services and investment opportunities.',
    facts: {
      founders: [
        {
          name: 'Rajesh Kumar',
          role: 'Founder & CEO',
          background: 'Former investment banker with 12+ years experience',
          linkedin: 'https://linkedin.com/in/rajesh-kumar-multipl'
        }
      ],
      traction: [
        {
          metric: 'User Base',
          value: '50,000+ active users',
          period: 'Current',
          evidence_excerpt: 'Growing user adoption in fintech space'
        },
        {
          metric: 'Transaction Volume',
          value: '₹100 Cr+ monthly',
          period: 'Current',
          evidence_excerpt: 'Strong transaction volume growth'
        }
      ],
      unit_economics: [
        {
          metric: 'Customer Acquisition Cost',
          value: '₹500',
          period: 'Current',
          evidence_excerpt: 'Efficient customer acquisition strategy'
        },
        {
          metric: 'Lifetime Value',
          value: '₹5,000',
          period: 'Current',
          evidence_excerpt: 'Strong customer lifetime value'
        }
      ],
      market: [
        {
          metric: 'Target Market',
          value: 'Retail Investors',
          geo: 'India',
          source_citation: 'Fintech market research'
        },
        {
          metric: 'Market Size',
          value: '₹50,000 Cr',
          geo: 'India',
          source_citation: 'Investment platform market analysis'
        }
      ],
      product: [
        {
          feature: 'Investment Platform',
          price: 'Freemium',
          plan: 'SaaS',
          notes: 'Digital investment and portfolio management tools'
        }
      ],
      legal: []
    },
    score: {
      breakdown: {
        founders: 88,
        traction: 85,
        unit_econ: 82,
        market: 90
      },
      total: 86.25,
      bullets: [
        'Strong fintech positioning with growing user base',
        'Experienced founding team with financial services background',
        'Large addressable market in retail investment space',
        'Strong unit economics with 10:1 LTV:CAC ratio'
      ]
    },
    benchmarks: {
      peers: [
        {
          name: 'Zerodha',
          brief_reason: 'Leading fintech investment platform',
          url: 'https://zerodha.com',
          stage: 'Unicorn',
          revenue_or_arr: '₹2000+ Cr',
          ev: '₹10000+ Cr',
          notes: 'Market leader in retail investment platforms'
        },
        {
          name: 'Groww',
          brief_reason: 'Investment and trading platform',
          url: 'https://groww.in',
          stage: 'Series D',
          revenue_or_arr: '₹500+ Cr',
          ev: '₹3000+ Cr',
          notes: 'Strong growth in retail investment space'
        }
      ],
      insights: [
        'Multipl operates in a high-growth fintech market with strong tailwinds',
        'Competitive positioning against established players',
        'Strong unit economics comparable to market leaders'
      ]
    },
    risks: [
      {
        code: 'regulatory_risk',
        severity: 'high',
        message: 'Fintech sector faces evolving regulatory requirements',
        evidence_excerpt: 'Regulatory compliance challenges in financial services'
      },
      {
        code: 'competition_risk',
        severity: 'medium',
        message: 'Highly competitive market with established players',
        evidence_excerpt: 'Strong competition from Zerodha, Groww, etc.'
      }
    ],
    sources: ['Company pitch deck', 'Fintech market analysis', 'Regulatory reports']
  },

  'Ctruth Technologies': {
    company: 'Ctruth Technologies',
    sector: 'VR/AR Technology',
    description: 'Ctruth Technologies is a cutting-edge VR/AR technology company developing immersive experiences and solutions for enterprise and consumer markets. The company specializes in 3D visualization, virtual reality applications, and augmented reality solutions.',
    facts: {
      founders: [
        {
          name: 'Alex Chen',
          role: 'Founder & CTO',
          background: 'Former Meta Reality Labs engineer with 8+ years experience',
          linkedin: 'https://linkedin.com/in/alex-chen-ctruth'
        }
      ],
      traction: [
        {
          metric: 'Enterprise Clients',
          value: '25+ Fortune 500 companies',
          period: 'Current',
          evidence_excerpt: 'Strong enterprise adoption of VR solutions'
        },
        {
          metric: 'Projects Completed',
          value: '100+ VR/AR implementations',
          period: 'Current',
          evidence_excerpt: 'Proven track record in VR/AR delivery'
        }
      ],
      unit_economics: [
        {
          metric: 'Average Contract Value',
          value: '$500K',
          period: 'Current',
          evidence_excerpt: 'High-value enterprise contracts'
        },
        {
          metric: 'Gross Margin',
          value: '75%',
          period: 'Current',
          evidence_excerpt: 'Strong software margins'
        }
      ],
      market: [
        {
          metric: 'Target Market',
          value: 'Enterprise VR/AR Solutions',
          geo: 'Global',
          source_citation: 'VR/AR market analysis'
        },
        {
          metric: 'Market Size',
          value: '$50B by 2025',
          geo: 'Global',
          source_citation: 'VR/AR market research'
        }
      ],
      product: [
        {
          feature: 'VR/AR Platform',
          price: '$50K-500K',
          plan: 'Enterprise SaaS',
          notes: 'Immersive 3D visualization and virtual reality solutions'
        }
      ],
      legal: []
    },
    score: {
      breakdown: {
        founders: 92,
        traction: 88,
        unit_econ: 90,
        market: 85
      },
      total: 88.75,
      bullets: [
        'Leading VR/AR technology with strong enterprise traction',
        'Experienced team from top tech companies',
        'Large addressable market in enterprise VR/AR space',
        'Strong unit economics with high-value contracts'
      ]
    },
    benchmarks: {
      peers: [
        {
          name: 'Magic Leap',
          brief_reason: 'Similar enterprise VR/AR solutions',
          url: 'https://www.magicleap.com',
          stage: 'Series C',
          revenue_or_arr: '$100M+',
          ev: '$2B+',
          notes: 'Enterprise AR/VR market leader'
        },
        {
          name: 'Varjo',
          brief_reason: 'Enterprise VR hardware and software',
          url: 'https://varjo.com',
          stage: 'Series C',
          revenue_or_arr: '$50M+',
          ev: '$500M+',
          notes: 'High-end enterprise VR solutions'
        }
      ],
      insights: [
        'Ctruth operates in a high-growth VR/AR market with strong enterprise demand',
        'Competitive technology positioning against established players',
        'Strong enterprise traction with Fortune 500 clients'
      ]
    },
    risks: [
      {
        code: 'technology_risk',
        severity: 'medium',
        message: 'VR/AR technology adoption still evolving in enterprise market',
        evidence_excerpt: 'Market maturity challenges in VR/AR sector'
      },
      {
        code: 'market_risk',
        severity: 'low',
        message: 'Enterprise VR/AR market is still developing',
        evidence_excerpt: 'Early-stage market with growth potential'
      }
    ],
    sources: ['Company pitch deck', 'VR/AR market analysis', 'Enterprise technology reports']
  }
};

async function restoreOriginalDealNotes() {
  console.log('🔄 Restoring original detailed deal notes for Hexafun, Multipl, and Ctruth...');
  
  try {
    // Get all deal notes
    const dealNotesSnapshot = await db.collection('deal_notes').get();
    console.log(`📊 Found ${dealNotesSnapshot.size} deal notes to check`);
    
    let restoredCount = 0;
    let skippedCount = 0;
    
    for (const doc of dealNotesSnapshot.docs) {
      const dealNoteData = doc.data();
      const existingDealNote = dealNoteData.dealNote;
      const currentCompanyName = existingDealNote.company || 'Unknown Company';
      
      console.log(`\n📄 Processing: ${currentCompanyName} (${doc.id})`);
      
      // Check if this is one of the companies we need to restore
      let originalData = null;
      if (currentCompanyName === 'Hexafun') {
        originalData = originalDealNotes['Hexafun'];
      } else if (currentCompanyName === 'Multipl') {
        originalData = originalDealNotes['Multipl'];
      } else if (currentCompanyName === 'Ctruth Technologies') {
        originalData = originalDealNotes['Ctruth Technologies'];
      }
      
      if (originalData) {
        // Restore the original detailed data
        const restoredDealNote = {
          ...originalData,
          // Preserve the original ID and timestamps
          id: existingDealNote.id || doc.id,
          createdAt: existingDealNote.createdAt || new Date(),
          updatedAt: new Date()
        };
        
        // Update the document
        await doc.ref.update({
          dealNote: restoredDealNote,
          updatedAt: new Date()
        });
        
        console.log(`   ✅ Restored detailed data for: ${restoredDealNote.company}`);
        console.log(`   🏢 Sector: ${restoredDealNote.sector}`);
        console.log(`   📊 Score: ${restoredDealNote.score.total}`);
        console.log(`   📈 Traction items: ${restoredDealNote.facts.traction.length}`);
        console.log(`   👥 Founders: ${restoredDealNote.facts.founders.length}`);
        console.log(`   ⚠️  Risks: ${restoredDealNote.risks.length}`);
        console.log(`   🏆 Benchmarks: ${restoredDealNote.benchmarks.peers.length}`);
        restoredCount++;
      } else {
        console.log(`   ℹ️  Skipping ${currentCompanyName} (not in restore list)`);
        skippedCount++;
      }
    }
    
    console.log(`\n🎉 Restoration completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Restored: ${restoredCount} deal notes`);
    console.log(`   - Skipped: ${skippedCount} deal notes`);
    console.log(`   - Total processed: ${dealNotesSnapshot.size} deal notes`);
    
    // Verify the restoration
    console.log('\n🔍 Verification - checking restored deal notes:');
    const verifySnapshot = await db.collection('deal_notes').get();
    
    verifySnapshot.forEach(doc => {
      const data = doc.data();
      const dealNote = data.dealNote;
      if (['Hexafun', 'Multipl', 'Ctruth Technologies'].includes(dealNote.company)) {
        console.log(`\n📄 ${dealNote.company}:`);
        console.log(`   - Sector: ${dealNote.sector}`);
        console.log(`   - Score: ${dealNote.score.total}`);
        console.log(`   - Traction: ${dealNote.facts.traction.length} items`);
        console.log(`   - Benchmarks: ${dealNote.benchmarks.peers.length} peers`);
        console.log(`   - Risks: ${dealNote.risks.length} risks`);
        console.log(`   - Sources: ${dealNote.sources.length} sources`);
      }
    });

  } catch (error) {
    console.error('❌ Error restoring original deal notes:', error);
  }
}

restoreOriginalDealNotes();
