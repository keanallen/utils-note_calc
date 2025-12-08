import React, { useEffect } from 'react';

interface PrivacyPolicyProps {
  onNavigate?: (page: string) => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Privacy Policy - Note Calc",
      "description": "Privacy policy for Note Calc, explaining how we handle your data in our calculator and note-taking app.",
      "url": "https://notecalc.app/privacy-policy",
      "mainEntity": {
        "@type": "PrivacyPolicy",
        "name": "Note Calc Privacy Policy",
        "description": "Comprehensive privacy policy detailing data collection, usage, and protection practices for Note Calc app",
        "url": "https://notecalc.app/privacy-policy"
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
            "name": "Privacy Policy",
            "item": "https://notecalc.app/privacy-policy"
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
      <header className="bg-gradient-to-b from-gray-800 to-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4 text-cyan-400">Privacy Policy</h1>
          <p className="text-xl text-gray-300">
            How Note Calc protects and handles your personal information
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Last updated: December 8, 2025
          </p>
        </div>
      </header>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <article className="prose prose-invert prose-cyan max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Overview</h2>
              <p className="text-gray-300 mb-4">
                Note Calc ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our calculator and note-taking application.
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Key Point:</strong> Note Calc is designed to work offline and stores your data locally on your device. We do not collect or transmit your personal calculations or notes to our servers.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Information We Collect</h2>
              
              <h3 className="text-xl font-medium mb-4 text-white">Data Stored Locally</h3>
              <ul className="list-disc pl-6 text-gray-300 mb-6 space-y-2">
                <li><strong>Calculator History:</strong> Your calculation history is stored locally in your browser</li>
                <li><strong>Notes Content:</strong> All notes and rich-text content remain on your device</li>
                <li><strong>App Settings:</strong> Preferences and configurations are saved locally</li>
                <li><strong>Auto-Insert Preferences:</strong> Your toggle settings and calculator preferences</li>
              </ul>

              <h3 className="text-xl font-medium mb-4 text-white">Analytics Data (Anonymous)</h3>
              <p className="text-gray-300 mb-4">
                We may collect anonymous, aggregated usage data to improve our app, including:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>General app usage patterns (which features are used most)</li>
                <li>Device type and browser information</li>
                <li>Error reports for debugging purposes</li>
                <li>Performance metrics to optimize the app</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">How We Use Your Information</h2>
              <div className="space-y-4 text-gray-300">
                <p><strong className="text-white">Local Data:</strong> Your calculations and notes are used solely for the app's functionality and remain on your device.</p>
                <p><strong className="text-white">Analytics:</strong> Anonymous data helps us improve app performance, fix bugs, and develop new features.</p>
                <p><strong className="text-white">No Personal Tracking:</strong> We do not track individual users or create personal profiles.</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Data Storage and Security</h2>
              
              <h3 className="text-xl font-medium mb-4 text-white">Local Storage</h3>
              <ul className="list-disc pl-6 text-gray-300 mb-6 space-y-2">
                <li>All your personal data is stored locally using browser LocalStorage</li>
                <li>Data never leaves your device unless you explicitly export it</li>
                <li>You can clear all data by clearing your browser's storage</li>
              </ul>

              <h3 className="text-xl font-medium mb-4 text-white">Security Measures</h3>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>HTTPS encryption for all app communications</li>
                <li>Content Security Policy to prevent malicious scripts</li>
                <li>Regular security updates and monitoring</li>
                <li>No server-side storage of personal data</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Third-Party Services</h2>
              <div className="space-y-4 text-gray-300">
                <p><strong className="text-white">Quill.js:</strong> Rich-text editor library (client-side only)</p>
                <p><strong className="text-white">Export Libraries:</strong> PDF and document generation (client-side only)</p>
                <p><strong className="text-white">CDN Services:</strong> For serving JavaScript libraries (no data collection)</p>
                <p><strong className="text-white">Google AdSense:</strong> May collect data for advertising purposes according to Google's Privacy Policy</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Your Rights and Choices</h2>
              <div className="bg-gray-800 rounded-lg p-6">
                <ul className="list-disc pl-6 text-gray-300 space-y-3">
                  <li><strong className="text-white">Data Access:</strong> You can view all your data directly in the app</li>
                  <li><strong className="text-white">Data Export:</strong> Export your notes as PDF, Word, or text files</li>
                  <li><strong className="text-white">Data Deletion:</strong> Clear all data through browser settings or app reset</li>
                  <li><strong className="text-white">Opt-out:</strong> Disable analytics by using ad blockers or privacy-focused browsers</li>
                  <li><strong className="text-white">Offline Use:</strong> Use the app completely offline without any data transmission</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Cookies and Local Storage</h2>
              <p className="text-gray-300 mb-4">
                Note Calc uses browser LocalStorage (not cookies) to save your data locally. This includes:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Calculator history and settings</li>
                <li>Notes content and formatting</li>
                <li>App preferences and configurations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Children's Privacy</h2>
              <p className="text-gray-300">
                Note Calc is suitable for users of all ages, including students. We do not knowingly collect personal information from children under 13. Since all data is stored locally, parents can supervise and control their children's use of the app.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Changes to This Privacy Policy</h2>
              <p className="text-gray-300">
                We may update this Privacy Policy from time to time. We will notify users of any material changes by updating the "Last updated" date at the top of this policy. Continued use of Note Calc after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Contact Us</h2>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-300 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li><strong className="text-white">Developer:</strong> Kean Allen Imam</li>
                  <li><strong className="text-white">Organization:</strong> KwikWeb</li>
                  <li><strong className="text-white">Website:</strong> https://kwikweb.ph</li>
                  <li><strong className="text-white">App URL:</strong> https://notecalc.app</li>
                </ul>
              </div>
            </section>
          </article>

          {/* Call to Action - Internal Links */}
          <section className="py-16 bg-gray-800 rounded-lg mt-12">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold mb-8 text-white">Ready to Use Note Calc?</h2>
              <p className="text-xl text-gray-300 mb-8">Start calculating and taking notes with confidence</p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {onNavigate ? (
                  <button
                    onClick={() => onNavigate('home')}
                    className="px-8 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
                    aria-label="Go to Note Calc calculator"
                  >
                    Start Using Note Calc
                  </button>
                ) : (
                  <a
                    href="/"
                    className="px-8 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors inline-block"
                    aria-label="Go to Note Calc calculator"
                  >
                    Start Using Note Calc
                  </a>
                )}
                {onNavigate ? (
                  <button
                    onClick={() => onNavigate('terms-of-service')}
                    className="px-8 py-3 border border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    aria-label="Read Terms of Service"
                  >
                    Terms of Service
                  </button>
                ) : (
                  <a
                    href="/terms-of-service"
                    className="px-8 py-3 border border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 transition-colors inline-block"
                    aria-label="Read Terms of Service"
                  >
                    Terms of Service
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
