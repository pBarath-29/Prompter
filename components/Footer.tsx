import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400 gap-4 sm:gap-0">
          <p className="text-center sm:text-left">&copy; {new Date().getFullYear()} Prompter. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link to="/terms" className="hover:text-primary-500">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-primary-500">Privacy Policy</Link>
            <Link to="/feedback" className="hover:text-primary-500">Feedback</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;