
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="relative z-10 py-6 mb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mystical-title text-primary">
              Shadow of the Seeker
            </h1>
            <p className="text-lg md:text-xl text-primary/80 mt-2">
              A mystical journey of discovery and destiny
            </p>
          </div>
          
          <nav className="flex space-x-6">
            <a href="#world" className="text-lg hover:text-primary transition-colors">World</a>
            <a href="#characters" className="text-lg hover:text-primary transition-colors">Characters</a>
            <a href="#quests" className="text-lg hover:text-primary transition-colors">Quests</a>
            <a href="#antagonist" className="text-lg hover:text-primary transition-colors">Antagonist</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
