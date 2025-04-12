
import React from 'react';
import Header from '../components/Header';
import WorldMap from '../components/WorldMap';
import CharacterProfiles from '../components/CharacterProfile';
import QuestCards from '../components/QuestCard';
import AntagonistReveal from '../components/AntagonistReveal';
import Footer from '../components/Footer';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-purple-900/20 to-transparent z-0" />
      
      <Header />
      
      <main className="flex-1">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block p-2 px-4 rounded-full bg-primary/10 text-primary mb-4">
                Mystical Adventure Concept
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl mystical-title mb-6">
                Shadow of the Seeker
              </h1>
              <p className="text-xl md:text-2xl mb-8">
                A mystical journey where ancient powers, forgotten technologies, 
                and uncertain alliances converge in a world on the edge of transformation.
              </p>
              
              <div className="relative mystical-glow rounded-xl overflow-hidden aspect-video max-w-2xl mx-auto">
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: 'url(https://source.unsplash.com/random/1200x800/?fantasy,mystical)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-left">
                  <p className="text-lg font-medium">
                    "When the crystal shattered, Aria's ordinary life ended. 
                    What began in fragments would either save Lumina... or consume it entirely."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <div className="floating overflow-hidden">
          <div className="absolute -left-40 top-1/3 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -right-40 top-2/3 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
        </div>
        
        <WorldMap />
        
        <div className="py-12 mystical-bg relative overflow-hidden my-12">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl mystical-title mb-6">
                Gameplay Mechanics
              </h2>
              <p className="text-lg mb-8">
                Shadow of the Seeker combines narrative adventure with unique gameplay elements
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card/30 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Energy Attunement</h3>
                  <p>Sense and manipulate mystical energies to solve environmental puzzles and reveal hidden pathways.</p>
                </div>
                
                <div className="bg-card/30 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Companion Synergy</h3>
                  <p>Combine the unique abilities of your companions to overcome challenges that no single character could face alone.</p>
                </div>
                
                <div className="bg-card/30 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Moral Choices</h3>
                  <p>Navigate complex moral dilemmas that shape the story and ultimately determine the fate of Lumina and its inhabitants.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <CharacterProfiles />
        <QuestCards />
        <AntagonistReveal />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
