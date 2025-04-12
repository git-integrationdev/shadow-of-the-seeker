
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 border-t border-border mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl mystical-title text-primary">Shadow of the Seeker</h2>
            <p className="text-sm text-muted-foreground">A mystical journey of discovery and destiny</p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Game concept © 2025</p>
            <p>All rights reserved</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            "In the shadows between worlds, truth awaits the seeker who dares to look beyond."
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
