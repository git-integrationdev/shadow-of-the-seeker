
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

type Region = {
  id: string;
  name: string;
  description: string;
  position: {
    top: string;
    left: string;
  };
};

const regions: Region[] = [
  {
    id: 'crystal-vale',
    name: 'Crystal Vale',
    description: 'A serene valley where ancient crystals amplify magical energies and whispers of the past echo through luminous caverns.',
    position: { top: '30%', left: '20%' }
  },
  {
    id: 'forgotten-spires',
    name: 'The Forgotten Spires',
    description: 'Towering ruins of an advanced civilization, now overgrown and hiding technological secrets beyond comprehension.',
    position: { top: '25%', left: '65%' }
  },
  {
    id: 'ethereal-forest',
    name: 'Ethereal Forest',
    description: 'An enchanted woodland where time flows differently, populated by ancient spirits and trees that remember the first dawn.',
    position: { top: '60%', left: '40%' }
  },
  {
    id: 'abyssal-depths',
    name: 'The Abyssal Depths',
    description: 'A vast chasm where darkness reigns and the boundary between worlds grows thin, guarded by creatures of shadow.',
    position: { top: '70%', left: '75%' }
  },
];

const WorldMap: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  return (
    <section id="world" className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl mystical-title text-center mb-8">The World of Lumina</h2>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="relative mystical-bg rounded-xl aspect-[16/9] mystical-glow">
              {/* Map container */}
              <div className="absolute inset-0 z-10">
                {regions.map((region) => (
                  <button
                    key={region.id}
                    className={cn(
                      "absolute w-4 h-4 rounded-full transition-all transform -translate-x-1/2 -translate-y-1/2",
                      "hover:w-5 hover:h-5 hover:shadow-[0_0_10px_rgba(180,130,255,0.8)]",
                      selectedRegion?.id === region.id 
                        ? "bg-accent animate-pulse" 
                        : "bg-primary"
                    )}
                    style={{ top: region.position.top, left: region.position.left }}
                    onClick={() => setSelectedRegion(region)}
                    aria-label={`Select ${region.name}`}
                  />
                ))}
              </div>
              
              {/* Decorative map elements */}
              <div className="absolute inset-0 z-0 opacity-70">
                <div className="absolute top-[30%] left-[20%] w-20 h-20 rounded-full bg-primary/10 blur-xl" />
                <div className="absolute top-[25%] left-[65%] w-16 h-16 rounded-full bg-secondary/10 blur-xl" />
                <div className="absolute top-[60%] left-[40%] w-24 h-24 rounded-full bg-accent/10 blur-xl" />
                <div className="absolute top-[70%] left-[75%] w-20 h-20 rounded-full bg-destructive/10 blur-xl" />
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <div className="h-full mystical-bg rounded-xl p-6">
              {selectedRegion ? (
                <div className="space-y-4">
                  <h3 className="text-2xl text-accent font-semibold">{selectedRegion.name}</h3>
                  <p className="text-lg">{selectedRegion.description}</p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                  <p className="text-lg">Select a region to learn more about the mystical world of Lumina</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorldMap;
