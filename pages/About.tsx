import React, { useEffect } from 'react';

const About: React.FC = () => {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About Note Calc - Free Calculator and Note-Taking App",
      "description": "Learn about Note Calc's mission to revolutionize productivity by combining calculations with documentation in one unified Progressive Web App.",
      "url": "https://notecalc.app/about",
      "mainEntity": {
        "@type": "Organization",
        "name": "Note Calc",
        "description": "Progressive Web App combining calculator functionality with note-taking capabilities",
        "url": "https://notecalc.app",
        "foundingDate": "2024",
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "support@notecalc.app",
          "contactType": "customer support"
        },
        "knowsAbout": [
          "Calculator Applications",
          "Note-Taking Software", 
          "Progressive Web Apps",
          "Productivity Tools",
          "Mathematical Computing",
          "Text Formatting",
          "Offline-First Applications"
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
            "name": "About",
            "item": "https://notecalc.app/about"
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

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-b from-gray-800 to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-cyan-400">
            About Note Calc
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Revolutionizing how people combine calculations with documentation. Built for the modern digital workspace.
          </p>
        </div>
      </header>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-6 text-cyan-400">Our Mission</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Note Calc was born from a simple observation: people constantly switch between calculators and note-taking apps, 
              losing context and slowing down their workflow. We believe that calculations and documentation should exist 
              in harmony, not as separate tools fighting for your attention.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <article>
              <h3 className="text-2xl font-semibold mb-4 text-white">The Problem We Solve</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-red-400 mr-3 mt-1" aria-hidden="true">✗</span>
                  <span>Switching between multiple apps breaks focus</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-3 mt-1" aria-hidden="true">✗</span>
                  <span>Calculations lose context without proper documentation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-3 mt-1" aria-hidden="true">✗</span>
                  <span>Basic calculators lack advanced mathematical functions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-3 mt-1" aria-hidden="true">✗</span>
                  <span>Work is lost when apps close or devices restart</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-3 mt-1" aria-hidden="true">✗</span>
                  <span>No way to share calculations with formatting intact</span>
                </li>
              </ul>
            </article>
            <article>
              <h3 className="text-2xl font-semibold mb-4 text-white">Our Solution</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1" aria-hidden="true">✓</span>
                  <span>Unified interface for calculations and note-taking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1" aria-hidden="true">✓</span>
                  <span>Rich text formatting preserves calculation context</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1" aria-hidden="true">✓</span>
                  <span>Three calculator types: basic, scientific, and programmer</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1" aria-hidden="true">✓</span>
                  <span>Automatic saving with offline-first design</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1" aria-hidden="true">✓</span>
                  <span>Auto-insert calculation results directly into notes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1" aria-hidden="true">✓</span>
                  <span>Multiple export formats with formatting preservation</span>
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-cyan-400">The Story Behind Note Calc</h2>
          <article className="prose prose-lg prose-invert max-w-none">
            <p className="text-gray-300 mb-6">
              Note Calc was conceived during a late-night study session when our team, frustrated by constantly 
              switching between a calculator app and note-taking software, wondered: "Why can't these just be one thing?"
            </p>
            <p className="text-gray-300 mb-6">
              What started as a personal productivity tool quickly evolved into something much larger. We realized that 
              the problem wasn't unique to students—engineers documenting calculations, developers working with algorithms, 
              and everyday users managing finances all faced the same challenge.
            </p>
            <p className="text-gray-300 mb-6">
              Built as a Progressive Web App (PWA), Note Calc represents the future of productivity tools: fast, 
              accessible, and designed for the way people actually work. No downloads, no installations, no accounts 
              required—just open and start calculating.
            </p>
          </article>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-cyan-400">Built with Modern Technology</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
            <article className="text-center" role="listitem">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3 text-white">Progressive Web App</h3>
                <p className="text-gray-400">Native app experience in your browser, installable on any device</p>
              </div>
            </article>
            <article className="text-center" role="listitem">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3 text-white">Offline-First</h3>
                <p className="text-gray-400">Service worker technology ensures functionality without internet</p>
              </div>
            </article>
            <article className="text-center" role="listitem">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3 text-white">React & TypeScript</h3>
                <p className="text-gray-400">Modern, type-safe development for reliable performance</p>
              </div>
            </article>
            <article className="text-center" role="listitem">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3 text-white">Quill.js Editor</h3>
                <p className="text-gray-400">Industry-standard rich text editing with powerful formatting</p>
              </div>
            </article>
            <article className="text-center" role="listitem">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3 text-white">Local Storage</h3>
                <p className="text-gray-400">Privacy-focused data storage that keeps your work secure</p>
              </div>
            </article>
            <article className="text-center" role="listitem">
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3 text-white">Responsive Design</h3>
                <p className="text-gray-400">Optimized for phones, tablets, and desktop computers</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8 text-cyan-400">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
            <article role="listitem">
              <div className="text-4xl mb-4" aria-hidden="true">🔒</div>
              <h3 className="text-xl font-semibold mb-3 text-white">Privacy First</h3>
              <p className="text-gray-400">Your data stays on your device. No tracking, no analytics, no data collection.</p>
            </article>
            <article role="listitem">
              <div className="text-4xl mb-4" aria-hidden="true">⚡</div>
              <h3 className="text-xl font-semibold mb-3 text-white">Performance Focused</h3>
              <p className="text-gray-400">Optimized for speed and efficiency. Fast loading, smooth interactions, minimal footprint.</p>
            </article>
            <article role="listitem">
              <div className="text-4xl mb-4" aria-hidden="true">🌐</div>
              <h3 className="text-xl font-semibold mb-3 text-white">Accessible to All</h3>
              <p className="text-gray-400">Free, open, and works on any device with a modern browser. No barriers to productivity.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8 text-cyan-400">Get in Touch</h2>
          <p className="text-lg text-gray-300 mb-8">
            Have feedback, suggestions, or questions? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <article className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-white">Feedback & Support</h3>
              <p className="text-gray-400 text-sm">Help us make Note Calc even better</p>
            </article>
            <article className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-white">Feature Requests</h3>
              <p className="text-gray-400 text-sm">Suggest new features and improvements</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
