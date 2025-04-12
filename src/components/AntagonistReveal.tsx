
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

const AntagonistReveal: React.FC = () => {
  const [isRevealed, setIsRevealed] = useState(false);
  
  return (
    <section id="antagonist" className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl mystical-title text-center mb-12">The Antagonist</h2>
        
        <div className="max-w-4xl mx-auto">
          <div className={cn(
            "mystical-bg rounded-xl p-8 transition-all duration-1000",
            isRevealed ? "bg-gradient-to-br from-gray-900 to-red-900/40" : ""
          )}>
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-2">
                {isRevealed ? "The Void Shepherd" : "A Mysterious Presence"}
              </h3>
              <p className="text-xl text-muted-foreground">
                {isRevealed ? "Guardian turned Destroyer" : "Shadows move with purpose across Lumina..."}
              </p>
            </div>
            
            <div className="relative">
              <div className={cn(
                "transition-all duration-1000 overflow-hidden",
                isRevealed ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="space-y-6 pt-4">
                  <p className="text-lg">
                    Once the most revered of the ancient guardians, Eldrath was tasked with maintaining the 
                    balance between void and form. For millennia, he served as protector of the Abyssal 
                    Seal, until a catastrophic event centuries ago forced him to absorb a portion of 
                    the void to prevent it from consuming Lumina entirely.
                  </p>
                  
                  <p className="text-lg">
                    This sacrifice fractured his essence. Now, he exists as both guardian and destroyer, 
                    believing that the only way to truly save Lumina is to resettle the balance by allowing 
                    controlled destruction. He seeks the Awakening Crystals and Forgotten Codex not to unleash 
                    chaos, but to harness their power for what he perceives as ultimate salvation.
                  </p>
                  
                  <div className="bg-black/20 rounded-lg p-6 mt-8">
                    <h4 className="text-xl font-semibold mb-4 text-accent">The Twist</h4>
                    <p className="text-lg">
                      Halfway through the journey, the Seeker will discover that Eldrath is not simply a 
                      villain, but a tragic figure whose mind has been corrupted by the void he contains. 
                      More disturbingly, it's revealed that the Order that exiled Kaelon knew of 
                      Eldrath's sacrifice and abandoned him to his fate, choosing to hide the truth 
                      rather than risk their own power.
                    </p>
                    
                    <p className="text-lg mt-4">
                      The true challenge becomes not simply defeating Eldrath, but finding a way to 
                      separate him from the void corruption while confronting the moral complexities 
                      of a world where those sworn to protect have made devastating compromises.
                    </p>
                  </div>
                </div>
              </div>
              
              <button 
                className={cn(
                  "w-full py-4 rounded-lg text-center transition-all duration-300",
                  "border border-primary/30 hover:border-primary/60",
                  isRevealed ? "mt-8" : "mt-0"
                )}
                onClick={() => setIsRevealed(!isRevealed)}
              >
                {isRevealed ? "Conceal the Truth" : "Reveal the Antagonist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AntagonistReveal;
