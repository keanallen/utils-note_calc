import React, { useEffect } from 'react';

const UseCases: React.FC = () => {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Note Calc Use Cases - Calculator for Students, Engineers, Developers",
      "description": "Explore how Note Calc helps students, engineers, developers, finance professionals, and everyday users combine calculations with documentation efficiently.",
      "url": "https://notecalc.app/use-cases",
      "mainEntity": {
        "@type": "Article",
        "headline": "Note Calc Use Cases for Different Professions",
        "description": "Comprehensive guide to using Note Calc across various professions and scenarios",
        "author": {
          "@type": "Organization",
          "name": "KwikWeb",
          "url": "https://kwikweb.ph"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Note Calc",
          "url": "https://notecalc.app"
        },
        "articleSection": [
          {
            "@type": "CreativeWork",
            "name": "Student Use Cases",
            "description": "Mathematical homework, exam preparation, research calculations with documentation"
          },
          {
            "@type": "CreativeWork", 
            "name": "Engineering Use Cases",
            "description": "Technical calculations, design computations, measurement conversions with engineering notes"
          },
          {
            "@type": "CreativeWork",
            "name": "Developer Use Cases", 
            "description": "Algorithm calculations, debugging numeric issues, performance analysis documentation"
          },
          {
            "@type": "CreativeWork",
            "name": "Finance Use Cases",
            "description": "Budget planning, investment calculations, financial analysis with formatted reports"
          },
          {
            "@type": "CreativeWork",
            "name": "Everyday Use Cases",
            "description": "Daily calculations, planning, quick math with note-taking for personal productivity"
          }
        ]
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://notecalc.app"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Use Cases",
            "item": "https://notecalc.app/use-cases"
          }
        ]
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const useCases = [
    {
      title: "Students",
      subtitle: "Master Math & Science with Confidence",
      icon: "🎓",
      description: "From basic arithmetic to advanced calculus, Note Calc supports students at every level with powerful tools for learning and problem-solving.",
      scenarios: [
        {
          title: "Homework & Assignments",
          description: "Calculate complex equations while taking detailed notes about your problem-solving process.",
          features: ["Scientific functions for algebra, calculus, and physics", "Note-taking for step-by-step solutions", "Export work as PDF for submission"]
        },
        {
          title: "Study Sessions",
          description: "Organize your study materials with calculations and notes in one place.",
          features: ["Multiple calculator windows for comparing methods", "Rich text formatting for clear notes", "Memory functions for storing constants"]
        },
        {
          title: "Exam Preparation",
          description: "Practice problems while building a comprehensive study guide.",
          features: ["Offline access during study sessions", "Quick formula reference in notes", "Error checking with multiple calculation methods"]
        }
      ]
    },
    {
      title: "Engineers",
      subtitle: "Precision Tools for Technical Excellence",
      icon: "⚙️",
      description: "Engineering requires precision and documentation. Note Calc provides the computational power and documentation tools engineers need.",
      scenarios: [
        {
          title: "Design Calculations",
          description: "Perform complex engineering calculations with detailed documentation for peer review.",
          features: ["Scientific calculator with trigonometric functions", "Detailed note-taking for calculation methodology", "Export calculations and notes for project documentation"]
        },
        {
          title: "Project Planning",
          description: "Calculate material requirements, costs, and specifications while maintaining project notes.",
          features: ["Multiple calculator instances for different calculations", "Rich text notes for project requirements", "Easy sharing of calculations with team members"]
        },
        {
          title: "Quality Assurance",
          description: "Document testing procedures and calculations for compliance and validation.",
          features: ["Precise calculations with memory functions", "Formatted documentation for reports", "Offline access for field work"]
        }
      ]
    },
    {
      title: "Developers",
      subtitle: "Code, Calculate, and Document",
      icon: "💻",
      description: "Developers need quick calculations and clear documentation. Note Calc bridges the gap between coding and mathematical problem-solving.",
      scenarios: [
        {
          title: "Algorithm Development",
          description: "Calculate time complexity, optimize performance, and document your algorithmic thinking.",
          features: ["Programmer calculator with binary/hex operations", "Note-taking for algorithm documentation", "Easy switching between number bases"]
        },
        {
          title: "System Design",
          description: "Calculate server capacity, memory requirements, and performance metrics.",
          features: ["Multiple calculator windows for different metrics", "Rich text notes for system architecture", "Export specifications for technical documentation"]
        },
        {
          title: "Debugging & Testing",
          description: "Calculate expected values and document debugging processes and test cases.",
          features: ["Quick calculations for test data generation", "Detailed notes for bug reproduction steps", "Memory functions for storing test constants"]
        }
      ]
    },
    {
      title: "Finance & Budgeting",
      subtitle: "Smart Money Management Made Simple",
      icon: "💰",
      description: "Take control of your finances with precision calculations and detailed budget tracking in one convenient tool.",
      scenarios: [
        {
          title: "Personal Budgeting",
          description: "Track expenses, calculate savings goals, and plan your financial future with detailed notes.",
          features: ["Multiple calculators for different budget categories", "Rich text notes for expense tracking", "Memory functions for recurring amounts"]
        },
        {
          title: "Investment Planning",
          description: "Calculate returns, compare investment options, and document your financial strategy.",
          features: ["Scientific calculator for compound interest calculations", "Detailed documentation of investment strategies", "Export financial plans as PDF"]
        },
        {
          title: "Business Finance",
          description: "Calculate profit margins, analyze costs, and create detailed financial reports.",
          features: ["Professional calculation documentation", "Multiple currency and percentage calculations", "Share financial analyses with stakeholders"]
        }
      ]
    },
    {
      title: "Everyday Users",
      subtitle: "Simplify Daily Life Calculations",
      icon: "🏠",
      description: "From home projects to cooking recipes, Note Calc makes everyday calculations easier and more organized.",
      scenarios: [
        {
          title: "Home Improvement",
          description: "Calculate materials needed, costs, and measurements for DIY projects with project notes.",
          features: ["Basic calculator for measurements and costs", "Note-taking for project planning and materials list", "Offline access for use in hardware stores"]
        },
        {
          title: "Cooking & Recipes",
          description: "Scale recipes, convert measurements, and keep cooking notes all in one place.",
          features: ["Quick fraction and decimal conversions", "Recipe scaling calculations", "Notes for cooking tips and modifications"]
        },
        {
          title: "Travel Planning",
          description: "Calculate trip costs, currency conversions, and itinerary planning with travel notes.",
          features: ["Currency and distance calculations", "Detailed travel planning notes", "Offline access during travel"]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-cyan-400">
            Use Cases
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Discover how Note Calc empowers professionals, students, and everyday users to calculate smarter and document better.
          </p>
        </div>
      </div>

      {/* Use Cases */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {useCases.map((useCase, index) => (
            <div key={index} className={`mb-20 ${index % 2 === 1 ? 'bg-gray-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 rounded-none sm:rounded-2xl' : ''}`}>
              <div className="text-center mb-12">
                <div className="text-6xl mb-4">{useCase.icon}</div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-cyan-400">{useCase.title}</h2>
                <p className="text-xl text-gray-400 mb-4">{useCase.subtitle}</p>
                <p className="text-lg text-gray-300 max-w-4xl mx-auto">{useCase.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {useCase.scenarios.map((scenario, scenarioIndex) => (
                  <div key={scenarioIndex} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors">
                    <h3 className="text-xl font-semibold mb-3 text-white">{scenario.title}</h3>
                    <p className="text-gray-300 mb-4">{scenario.description}</p>
                    <ul className="space-y-2">
                      {scenario.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <span className="text-cyan-400 mr-2 mt-1">✓</span>
                          <span className="text-sm text-gray-400">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Stories Section */}
      <div className="bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-cyan-400">Why Users Love Note Calc</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2 text-white">Productivity Boost</h3>
              <p className="text-gray-400">"Having calculations and notes in one place saves me hours every week. Perfect for engineering projects!"</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2 text-white">Works Everywhere</h3>
              <p className="text-gray-400">"I love that it works offline on my phone, tablet, and laptop. Always available when I need it."</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2 text-white">Simple Yet Powerful</h3>
              <p className="text-gray-400">"Finally, a calculator that can handle both simple math and complex scientific calculations with ease."</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-cyan-400">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who have already discovered the power of integrated calculations and note-taking.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors">
              Try Note Calc Now
            </button>
            <button className="px-8 py-3 border border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UseCases;
