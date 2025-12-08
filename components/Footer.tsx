import React from 'react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleLegalClick = (page: string, event: React.MouseEvent) => {
    if (onNavigate) {
      event.preventDefault();
      onNavigate(page);
    }
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-700 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4">
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
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs text-gray-500">
            <a 
              href="/privacy-policy"
              onClick={(e) => handleLegalClick('privacy-policy', e)}
              className="hover:text-cyan-400 transition-colors"
            >
              Privacy Policy
            </a>
            <span className="hidden sm:inline">•</span>
            <a 
              href="/terms-of-service"
              onClick={(e) => handleLegalClick('terms-of-service', e)}
              className="hover:text-cyan-400 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
