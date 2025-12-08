import React, { useEffect } from 'react';

interface TermsOfServiceProps {
  onNavigate?: (page: string) => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onNavigate }) => {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Terms of Service - Note Calc",
      "description": "Terms of service and conditions for using Note Calc calculator and note-taking app.",
      "url": "https://notecalc.app/terms-of-service",
      "mainEntity": {
        "@type": "TermsOfService",
        "name": "Note Calc Terms of Service",
        "description": "Legal terms and conditions governing the use of Note Calc application",
        "url": "https://notecalc.app/terms-of-service"
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
            "name": "Terms of Service",
            "item": "https://notecalc.app/terms-of-service"
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
          <h1 className="text-4xl font-bold mb-4 text-cyan-400">Terms of Service</h1>
          <p className="text-xl text-gray-300">
            Terms and conditions for using Note Calc
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
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Agreement to Terms</h2>
              <p className="text-gray-300 mb-4">
                By accessing and using Note Calc ("the App," "our App," or "Service"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p className="text-gray-300">
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Description of Service</h2>
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <p className="text-gray-300 mb-4">
                  Note Calc is a free, Progressive Web Application (PWA) that provides:
                </p>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Multiple calculator types (Basic, Scientific, Programmer)</li>
                  <li>Rich-text note-taking capabilities</li>
                  <li>Auto-insert calculation results into notes</li>
                  <li>Export functionality (PDF, Word, Text)</li>
                  <li>Offline-ready functionality</li>
                  <li>Local data storage</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Acceptable Use</h2>
              
              <h3 className="text-xl font-medium mb-4 text-white">Permitted Uses</h3>
              <ul className="list-disc pl-6 text-gray-300 mb-6 space-y-2">
                <li>Personal calculations and note-taking</li>
                <li>Educational purposes and homework assistance</li>
                <li>Professional and business calculations</li>
                <li>Research and academic work</li>
                <li>Installing as a PWA on your devices</li>
              </ul>

              <h3 className="text-xl font-medium mb-4 text-white">Prohibited Uses</h3>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Attempting to reverse engineer or modify the app</li>
                <li>Using the app for illegal activities</li>
                <li>Attempting to circumvent security measures</li>
                <li>Redistributing or reselling the app without permission</li>
                <li>Using the app in ways that could harm our infrastructure</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">User Data and Privacy</h2>
              <div className="space-y-4 text-gray-300">
                <p><strong className="text-white">Local Storage:</strong> Your calculations and notes are stored locally on your device and are not transmitted to our servers.</p>
                <p><strong className="text-white">Data Ownership:</strong> You retain full ownership of all content you create in the app.</p>
                <p><strong className="text-white">Data Export:</strong> You can export your data at any time using the built-in export features.</p>
                <p><strong className="text-white">Data Security:</strong> You are responsible for backing up your data and keeping your device secure.</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Intellectual Property</h2>
              <div className="space-y-4 text-gray-300">
                <p><strong className="text-white">App Ownership:</strong> Note Calc is developed and owned by KwikWeb and Kean Allen Imam.</p>
                <p><strong className="text-white">User Content:</strong> You retain ownership of any content you create using the app.</p>
                <p><strong className="text-white">Third-Party Libraries:</strong> The app uses open-source libraries under their respective licenses.</p>
                <p><strong className="text-white">Trademarks:</strong> "Note Calc" and related marks are trademarks of the developers.</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Disclaimers and Limitations</h2>
              
              <h3 className="text-xl font-medium mb-4 text-white">Accuracy Disclaimer</h3>
              <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-6 mb-6">
                <p className="text-yellow-200">
                  <strong>Important:</strong> While we strive for accuracy, Note Calc is provided "as is" without warranties. Always verify critical calculations independently. We are not liable for any errors or decisions made based on calculations performed in the app.
                </p>
              </div>

              <h3 className="text-xl font-medium mb-4 text-white">Limitations of Liability</h3>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>We provide the app free of charge and without warranties</li>
                <li>We are not liable for data loss, calculation errors, or system failures</li>
                <li>Users are responsible for backing up their own data</li>
                <li>We do not guarantee uninterrupted service availability</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Educational and Professional Use</h2>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-medium mb-4 text-white">For Students</h3>
                <ul className="list-disc pl-6 text-gray-300 mb-6 space-y-2">
                  <li>The app is suitable for homework and study assistance</li>
                  <li>Always follow your institution's policies on calculator use during exams</li>
                  <li>Verify important calculations with teachers or textbooks</li>
                </ul>

                <h3 className="text-xl font-medium mb-4 text-white">For Professionals</h3>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Suitable for quick calculations and documentation</li>
                  <li>Not a replacement for certified professional calculation tools</li>
                  <li>Always verify critical business calculations independently</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Third-Party Services</h2>
              <p className="text-gray-300 mb-4">Note Calc integrates with the following third-party services:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong className="text-white">Quill.js:</strong> Rich-text editing (MIT License)</li>
                <li><strong className="text-white">jsPDF:</strong> PDF generation (MIT License)</li>
                <li><strong className="text-white">docx:</strong> Word document generation (MIT License)</li>
                <li><strong className="text-white">Google AdSense:</strong> Advertising service (Google's Terms Apply)</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Updates and Changes</h2>
              <div className="space-y-4 text-gray-300">
                <p><strong className="text-white">App Updates:</strong> We may update the app to fix bugs, improve performance, or add features.</p>
                <p><strong className="text-white">Terms Updates:</strong> These terms may be updated from time to time. Continued use constitutes acceptance of updated terms.</p>
                <p><strong className="text-white">Notification:</strong> We will update the "Last updated" date when changes are made.</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Termination</h2>
              <div className="space-y-4 text-gray-300">
                <p><strong className="text-white">Your Rights:</strong> You may stop using the app at any time by simply not accessing it.</p>
                <p><strong className="text-white">Our Rights:</strong> We reserve the right to discontinue the service, though we will provide reasonable notice when possible.</p>
                <p><strong className="text-white">Data Retention:</strong> Your local data remains on your device even after termination.</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Governing Law</h2>
              <p className="text-gray-300">
                These terms are governed by the laws of the jurisdiction in which the service is provided. Any disputes will be resolved through appropriate legal channels in that jurisdiction.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Contact Information</h2>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-300 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
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
              <h2 className="text-3xl font-bold mb-8 text-white">Ready to Start?</h2>
              <p className="text-xl text-gray-300 mb-8">By using Note Calc, you agree to these terms</p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {onNavigate ? (
                  <button
                    onClick={() => onNavigate('home')}
                    className="px-8 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
                    aria-label="Go to Note Calc calculator"
                  >
                    I Agree - Start Using Note Calc
                  </button>
                ) : (
                  <a
                    href="/"
                    className="px-8 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors inline-block"
                    aria-label="Go to Note Calc calculator"
                  >
                    I Agree - Start Using Note Calc
                  </a>
                )}
                {onNavigate ? (
                  <button
                    onClick={() => onNavigate('privacy-policy')}
                    className="px-8 py-3 border border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    aria-label="Read Privacy Policy"
                  >
                    Privacy Policy
                  </button>
                ) : (
                  <a
                    href="/privacy-policy"
                    className="px-8 py-3 border border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 transition-colors inline-block"
                    aria-label="Read Privacy Policy"
                  >
                    Privacy Policy
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

export default TermsOfService;
