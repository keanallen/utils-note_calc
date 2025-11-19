import React, { useEffect } from 'react';

const Features: React.FC = () => {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Note Calc Features - Advanced Calculator with Note-Taking",
      "description": "Discover powerful features of Note Calc: multiple calculator types, rich text editor, export options, and offline functionality for seamless productivity.",
      "url": "https://notecalc.app/features",
      "mainEntity": {
        "@type": "SoftwareApplication",
        "name": "Note Calc",
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "Basic Calculator with standard arithmetic operations",
          "Scientific Calculator with advanced mathematical functions",
          "Programmer Calculator with binary, hexadecimal, and octal conversions",
          "Rich Text Editor with formatting and styling options",
          "Multiple Export Formats (PDF, Word, Plain Text)",
          "Offline Functionality with Progressive Web App technology",
          "Auto-save with Local Storage",
          "Keyboard Shortcuts for efficient operation",
          "Responsive Design for all devices"
        ],
        "browserRequirements": "Modern web browser with JavaScript enabled"
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
            "name": "Features",
            "item": "https://notecalc.app/features"
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

  const features = [
    {
      title: "Multi-Calculator Interface",
      description: "Open and manage multiple calculator windows simultaneously. Switch between basic, scientific, and programmer calculators based on your needs.",
      icon: "🧮",
      details: [
        "Basic calculator for everyday arithmetic",
        "Scientific calculator with trigonometric functions",
        "Programmer calculator with binary, hex, and bitwise operations",
        "Unlimited calculator windows",
        "Easy switching between calculator types"
      ]
    },
    {
      title: "Rich Text Note-Taking",
      description: "Take formatted notes alongside your calculations with our powerful rich text editor powered by Quill.js.",
      icon: "📝",
      details: [
        "Bold, italic, underline, and strikethrough formatting",
        "Multiple heading levels (H1, H2, H3)",
        "Bullet points and numbered lists",
        "Blockquotes for important information",
        "Link insertion and management"
      ]
    },
    {
      title: "Export & Share",
      description: "Export your notes in multiple formats and share your work across platforms with formatting preserved.",
      icon: "📤",
      details: [
        "PDF export with formatting preservation",
        "Microsoft Word (DOCX) export",
        "Plain text export for compatibility",
        "HTML export with styling",
        "Copy-to-clipboard with rich formatting for chat apps"
      ]
    },
    {
      title: "Progressive Web App (PWA)",
      description: "Install Note Calc on any device and use it offline. Works like a native app on desktop and mobile.",
      icon: "📱",
      details: [
        "Install on Windows, Mac, Linux, Android, iOS",
        "Offline functionality - works without internet",
        "Fast loading with service worker caching",
        "Native app-like experience",
        "Auto-updates when connected"
      ]
    },
    {
      title: "Auto-Save & Persistence",
      description: "Never lose your work. Notes are automatically saved to your device's local storage.",
      icon: "💾",
      details: [
        "Automatic saving as you type",
        "Local storage persistence",
        "No account required",
        "Privacy-focused - data stays on your device",
        "Instant restoration on app restart"
      ]
    },
    {
      title: "Responsive Design",
      description: "Optimized for all screen sizes from mobile phones to ultrawide monitors with adaptive layouts.",
      icon: "📐",
      details: [
        "Mobile-first responsive design",
        "Adaptive calculator grid layout",
        "Touch-friendly buttons and interface",
        "Optimized for tablets and desktops",
        "Dark theme for comfortable extended use"
      ]
    },
    {
      title: "Keyboard Shortcuts",
      description: "Work faster with comprehensive keyboard support for both calculations and note-taking.",
      icon: "⌨️",
      details: [
        "Standard calculator keyboard inputs (0-9, +, -, *, /, =)",
        "Clear and backspace functionality",
        "Enter key for calculations",
        "Escape key for clearing",
        "Arrow keys for navigation"
      ]
    },
    {
      title: "Memory Functions",
      description: "Store and recall values with advanced memory operations in scientific calculator mode.",
      icon: "🧠",
      details: [
        "Memory Store (MS) - save current value",
        "Memory Recall (MR) - retrieve stored value",
        "Memory Clear (MC) - clear stored value",
        "Memory Plus (M+) - add to stored value",
        "Memory Minus (M-) - subtract from stored value"
      ]
    },
    {
      title: "Advanced Mathematical Functions",
      description: "Scientific calculator with comprehensive mathematical operations for students and professionals.",
      icon: "🔬",
      details: [
        "Trigonometric functions (sin, cos, tan, asin, acos, atan)",
        "Logarithmic functions (log, ln, e^x, 10^x)",
        "Power functions (x², x³, x^y, √x)",
        "Factorial and random number generation",
        "Degree and radian angle modes"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-cyan-400">
            Powerful Features
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Note Calc combines advanced calculator functionality with rich text note-taking in a fast, installable Progressive Web App.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-750 transition-colors">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-cyan-400">{feature.title}</h3>
                <p className="text-gray-300 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start">
                      <span className="text-cyan-400 mr-2">•</span>
                      <span className="text-sm text-gray-400">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-cyan-400">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">3</div>
              <div className="text-cyan-400 font-semibold mb-1">Calculator Types</div>
              <div className="text-sm text-gray-400">Basic, Scientific, Programmer</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">5</div>
              <div className="text-cyan-400 font-semibold mb-1">Export Formats</div>
              <div className="text-sm text-gray-400">PDF, DOCX, TXT, HTML, Clipboard</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-cyan-400 font-semibold mb-1">Offline Capable</div>
              <div className="text-sm text-gray-400">Works without internet connection</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <div className="text-cyan-400 font-semibold mb-1">Account Required</div>
              <div className="text-sm text-gray-400">No registration or login needed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Browser Support */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8 text-cyan-400">Universal Compatibility</h2>
          <p className="text-xl text-gray-300 mb-8">Works on all modern browsers and devices</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="text-gray-400">
              <div className="text-lg font-semibold">Desktop</div>
              <div className="text-sm">Windows • macOS • Linux</div>
            </div>
            <div className="text-gray-400">
              <div className="text-lg font-semibold">Mobile</div>
              <div className="text-sm">iOS • Android</div>
            </div>
            <div className="text-gray-400">
              <div className="text-lg font-semibold">Browsers</div>
              <div className="text-sm">Chrome • Firefox • Safari • Edge</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
