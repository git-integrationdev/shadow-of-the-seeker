
import React from 'react';
import { cn } from '@/lib/utils';

interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  skills: string[];
  personality: string[];
  imagePosition: string;
}

interface CharacterProfileProps {
  character: Character;
  index: number;
}

const characters: Character[] = [
  {
    id: 'aria',
    name: 'Aria Nightwhisper',
    role: 'The Reluctant Seeker',
    description: 'A young scholar whose dormant abilities to perceive ancient energies awaken after a fragment of a mystical artifact appears in her village. Though initially reluctant to leave her studies, the calling to restore balance cannot be ignored.',
    skills: ['Energy sensing', 'Ancient languages', 'Puzzle-solving'],
    personality: ['Curious', 'Thoughtful', 'Determined'],
    imagePosition: 'bg-[25%_center]'
  },
  {
    id: 'kaelon',
    name: 'Kaelon Thorn',
    role: 'Exiled Guardian',
    description: 'Once part of an ancient order sworn to protect the secrets of Lumina, Kaelon was exiled for questioning their isolationist ways. His knowledge of forgotten paths and combat training make him an invaluable ally.',
    skills: ['Swordsmanship', 'Protective magic', 'Tracking'],
    personality: ['Stoic', 'Honorable', 'Conflicted'],
    imagePosition: 'bg-[30%_center]'
  },
  {
    id: 'mira',
    name: 'Mira Wavecrafter',
    role: 'Elemental Artificer',
    description: 'A spirited inventor who combines elemental magic with ancient technology. Mira joins the quest hoping to discover lost knowledge that could help her dying homeland recover from a mysterious blight.',
    skills: ['Elemental crafting', 'Device repair', 'Improvisation'],
    personality: ['Enthusiastic', 'Witty', 'Resourceful'],
    imagePosition: 'bg-[35%_center]'
  }
];

const CharacterProfile: React.FC<CharacterProfileProps> = ({ character, index }) => {
  const isEven = index % 2 === 0;
  
  return (
    <div className={cn(
      "flex flex-col lg:flex-row gap-6 mb-12 items-center",
      !isEven && "lg:flex-row-reverse"
    )}>
      <div className="lg:w-1/3">
        <div className="mystical-glow rounded-xl overflow-hidden h-80">
          <div 
            className={cn(
              "w-full h-full bg-gradient-to-b from-transparent to-background/90",
              "bg-cover bg-no-repeat",
              character.imagePosition
            )} 
            style={{ 
              backgroundImage: `url(https://source.unsplash.com/600x900/?fantasy,${character.id})` 
            }}
          />
        </div>
      </div>
      
      <div className="lg:w-2/3">
        <h3 className="text-2xl md:text-3xl text-primary font-bold mb-2">{character.name}</h3>
        <h4 className="text-xl text-accent mb-4">{character.role}</h4>
        
        <p className="text-lg mb-4">{character.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <h5 className="text-muted-foreground font-semibold mb-2">Skills</h5>
            <ul className="space-y-1">
              {character.skills.map((skill, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  {skill}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="text-muted-foreground font-semibold mb-2">Personality</h5>
            <ul className="space-y-1">
              {character.personality.map((trait, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>
                  {trait}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const CharacterProfiles: React.FC = () => {
  return (
    <section id="characters" className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl mystical-title text-center mb-12">Characters</h2>
        
        {characters.map((character, index) => (
          <CharacterProfile key={character.id} character={character} index={index} />
        ))}
      </div>
    </section>
  );
};

export default CharacterProfiles;
