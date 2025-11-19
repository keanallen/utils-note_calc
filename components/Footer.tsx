import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-700 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400 space-y-2 sm:space-y-0">
          <div className="text-center sm:text-left">
            <p>
              For suggestions or bugs, email us at{' '}
              <a 
                href="mailto:support@notecalc.app" 
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                support@notecalc.app
              </a>
            </p>
          </div>
          <div className="text-center sm:text-right">
            <p>&copy; {new Date().getFullYear()} Note Calc. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
