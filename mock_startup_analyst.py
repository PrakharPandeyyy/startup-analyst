#!/usr/bin/env python3
"""
Mock Startup-Analyst for testing the integration flow
This generates a realistic deal note based on the Ctruth company data
"""

import json
import time
import uuid
from datetime import datetime

def generate_mock_deal_note(company_name, company_website, questionnaire_answers):
    """Generate a mock deal note for testing"""
    
    run_id = f"{int(time.time())}_{uuid.uuid4().hex[:6]}"
    
    # Extract key information from questionnaire answers
    qa = questionnaire_answers
    
    deal_note = {
        "run_id": run_id,
        "company": company_name,
        "sector": "vr",
        "brief": {
            "brief_1_2_sentences": f"{company_name} is a VR/AR technology company specializing in immersive experiences and enterprise solutions, with strong traction in the growing VR market."
        },
        "facts": {
            "founders": [
                {
                    "name": "VR/AR Technology Team",
                    "education": "Technical backgrounds in VR/AR development",
                    "prior_companies": "Experience in tech industry",
                    "notable_achievements": "Built successful VR/AR platform"
                }
            ],
            "traction": [
                {
                    "metric": "Enterprise Clients",
                    "value": "50+",
                    "period": "Current",
                    "evidence_excerpt": qa.get("q2", "")
                },
                {
                    "metric": "ARR",
                    "value": "$2M",
                    "period": "Current",
                    "evidence_excerpt": qa.get("q3", "")
                },
                {
                    "metric": "Growth Rate",
                    "value": "40% MoM",
                    "period": "Current",
                    "evidence_excerpt": qa.get("q3", "")
                }
            ],
            "unit_economics": [
                {
                    "metric": "Revenue Model",
                    "value": "SaaS + Services",
                    "formula": "Subscription + Custom Development",
                    "evidence_excerpt": qa.get("q3", "")
                }
            ],
            "market": [
                {
                    "metric": "Target Market",
                    "value": "Enterprise VR/AR",
                    "geo": "Global",
                    "source_citation": "Company website and pitch deck"
                }
            ],
            "product": [
                {
                    "feature": "VR/AR Platform",
                    "price": "SaaS Subscription",
                    "plan": "Enterprise Focus",
                    "notes": qa.get("q1", "")
                }
            ],
            "legal": []
        },
        "claims": [
            "Ctruth has 50+ enterprise clients in VR/AR space",
            "Company has $2M ARR with 40% month-over-month growth",
            "VR/AR market is growing at 30% CAGR",
            "Company differentiates through enterprise focus and AI-powered content",
            "Expansion plans include European markets in Q2 2024"
        ],
        "verification": {
            "checks": [
                {
                    "claim": "Ctruth has 50+ enterprise clients in VR/AR space",
                    "status": "supported",
                    "rationale": "Company website and questionnaire answers confirm enterprise client base",
                    "evidence": [
                        {
                            "url": company_website,
                            "quote": "VR/AR technology solutions for enterprise clients"
                        }
                    ]
                },
                {
                    "claim": "Company has $2M ARR with 40% month-over-month growth",
                    "status": "supported",
                    "rationale": "Questionnaire answers provide specific financial metrics",
                    "evidence": [
                        {
                            "url": None,
                            "quote": qa.get("q3", "")
                        }
                    ]
                }
            ]
        },
        "score": {
            "breakdown": {
                "founders": 75,
                "traction": 85,
                "unit_econ": 80,
                "market": 90
            },
            "total": 82.5,
            "bullets": [
                "Strong traction with 50+ enterprise clients and $2M ARR",
                "High growth rate of 40% MoM indicates strong market demand",
                "Clear differentiation in enterprise VR/AR focus",
                "Experienced team with technical expertise",
                "Large and growing VR/AR market opportunity"
            ]
        },
        "benchmarks": {
            "peers": [
                {
                    "name": "Meta (Oculus)",
                    "brief_reason": "Leading VR platform provider",
                    "url": "https://www.meta.com/",
                    "stage": "Public",
                    "revenue_or_arr": 10000000000,
                    "ev": 500000000000,
                    "notes": "Market leader in consumer VR"
                },
                {
                    "name": "Microsoft HoloLens",
                    "brief_reason": "Enterprise AR/VR solutions",
                    "url": "https://www.microsoft.com/",
                    "stage": "Enterprise",
                    "revenue_or_arr": 1000000000,
                    "ev": 2000000000000,
                    "notes": "Enterprise-focused AR/VR platform"
                }
            ],
            "insights": [
                "Ctruth is well-positioned in the growing VR/AR enterprise market",
                "Strong traction metrics compare favorably to early-stage VR companies",
                "Enterprise focus provides differentiation from consumer-focused competitors",
                "Growth rate indicates strong product-market fit"
            ]
        },
        "narrative": {
            "scalability": "VR/AR platform can scale globally with SaaS model",
            "fundraising": "Seeking Series A funding for expansion",
            "funding_ask": "$5M Series A round",
            "key_problem": "Enterprise VR/AR solutions are fragmented and complex",
            "why_now": "VR/AR adoption accelerating in enterprise markets"
        },
        "finance": {
            "revenue": "$2M ARR",
            "growth": "40% MoM",
            "runway": "18 months",
            "funding_ask": "$5M Series A",
            "use_of_funds": {
                "product_development": "40%",
                "sales_marketing": "35%",
                "team_expansion": "25%"
            }
        },
        "founder_research": {
            "founders": [
                {
                    "name": "VR/AR Technology Team",
                    "background": "Technical expertise in VR/AR development",
                    "experience": "Proven track record in tech industry"
                }
            ]
        },
        "market_validation": {
            "market_size": "$50B+ VR/AR market",
            "growth_rate": "30% CAGR",
            "target_segments": ["Enterprise", "Healthcare", "Education"],
            "competitive_landscape": "Fragmented with opportunity for consolidation"
        },
        "competitive_positioning": {
            "table": [
                {
                    "company": "Ctruth",
                    "focus": "Enterprise VR/AR",
                    "strength": "Specialized platform",
                    "weakness": "Early stage"
                },
                {
                    "company": "Meta",
                    "focus": "Consumer VR",
                    "strength": "Market leader",
                    "weakness": "Limited enterprise focus"
                }
            ],
            "positioning_bullets": [
                "Enterprise-first approach vs consumer-focused competitors",
                "AI-powered content generation as key differentiator",
                "Superior user experience for business applications"
            ]
        },
        "customer_sentiment": {
            "overall_sentiment": "Positive",
            "key_themes": ["Innovation", "User Experience", "Enterprise Focus"],
            "feedback": "Strong customer satisfaction with platform capabilities"
        },
        "legal_compliance": {
            "compliance_status": "Compliant",
            "key_areas": ["Data Privacy", "Enterprise Security", "IP Protection"],
            "risks": "Low - standard tech company compliance requirements"
        },
        "risks": [
            {
                "code": "market_adoption",
                "severity": "medium",
                "message": "VR/AR market adoption slower than expected",
                "evidence_excerpt": "Market still in early stages of enterprise adoption"
            },
            {
                "code": "competition",
                "severity": "high",
                "message": "Competition from large tech companies",
                "evidence_excerpt": "Meta, Microsoft, and other large players entering enterprise VR/AR"
            }
        ],
        "term_sheet": {
            "pre_money_valuation": "$25M",
            "raise_amount": "$5M",
            "esop_refresh": "10%",
            "key_terms": "Standard Series A terms with investor protections"
        },
        "sector_insights": {
            "market_trends": [
                "Enterprise VR/AR adoption accelerating",
                "AI integration becoming standard",
                "Remote work driving demand for immersive solutions"
            ],
            "investment_activity": "High - significant VC interest in VR/AR",
            "regulatory_environment": "Favorable - minimal regulatory barriers"
        },
        "sources": [
            company_website,
            "Company questionnaire responses",
            "Industry reports and market data"
        ]
    }
    
    return deal_note

def main():
    """Main function to generate mock deal note for Ctruth"""
    
    # Ctruth company data
    company_name = "Ctruth Technologies"
    company_website = "https://www.ctruh.com/"
    
    # Mock questionnaire answers (based on our setup)
    questionnaire_answers = {
        "q1": "Ctruth Technologies specializes in VR/AR technology solutions. We develop immersive experiences using cutting-edge virtual and augmented reality platforms, focusing on enterprise applications and consumer entertainment.",
        "q2": "We currently have 50+ enterprise clients in the VR/AR space, including major tech companies and educational institutions. Our user base has grown 300% year-over-year with strong retention rates.",
        "q3": "Our revenue model is based on SaaS subscriptions for our VR/AR platform, custom development services, and licensing deals. We're currently at $2M ARR with 40% month-over-month growth.",
        "q4": "We plan to expand to European markets in Q2 2024, focusing on healthcare and education sectors. We're also exploring partnerships with major VR hardware manufacturers.",
        "q5": "Our main competitors are Meta (Oculus), Microsoft HoloLens, and Magic Leap. We differentiate through our specialized enterprise focus, superior user experience, and proprietary AI-powered content generation."
    }
    
    print(f"🚀 Generating mock deal note for {company_name}")
    print(f"   Website: {company_website}")
    print(f"   Questionnaire answers: {len(questionnaire_answers)} responses")
    
    # Generate the deal note
    deal_note = generate_mock_deal_note(company_name, company_website, questionnaire_answers)
    
    # Save to file
    with open('ctruth_mock_deal_note.json', 'w') as f:
        json.dump(deal_note, f, indent=2, default=str)
    
    print(f"✅ Mock deal note generated successfully!")
    print(f"   Company: {deal_note['company']}")
    print(f"   Score: {deal_note['score']['total']}")
    print(f"   Sector: {deal_note['sector']}")
    print(f"   Run ID: {deal_note['run_id']}")
    print(f"💾 Saved to: ctruth_mock_deal_note.json")
    
    return deal_note

if __name__ == "__main__":
    main()
