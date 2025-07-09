import React from 'react';
import { Linkedin, Github, Mail } from 'lucide-react';

const Footer = () => {
  // Logo component using your provided image
  const Logo = () => (
    <div className="flex items-center mb-2">
      <img 
        src="/image copy.png" 
        alt="SalT Lab Logo" 
        className="w-6 h-6 mr-2 object-contain"
      />
      <h3 className="text-2xl font-bold text-white">SalT Lab</h3>
    </div>
  );

  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Logo />
            <p className="text-gray-400">Building tools for better planning</p>
          </div>

          <div className="flex space-x-6">
            <a
              href="#"
              className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <Linkedin size={24} />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
              aria-label="GitHub"
            >
              <Github size={24} />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
              aria-label="Email"
            >
              <Mail size={24} />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            © 2025 SalT Lab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;