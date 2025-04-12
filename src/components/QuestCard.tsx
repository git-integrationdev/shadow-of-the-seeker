
import React from 'react';
import { cn } from '@/lib/utils';

interface Quest {
  id: string;
  title: string;
  description: string;
  objective: string;
  challenge: string;
  region: string;
  icon: string;
}

const quests: Quest[] = [
  {
    id: 'awakening',
    title: 'The Awakening Crystals',
    description: 'Deep within the Crystal Vale lie three ancient awakening crystals, their energies dormant for millennia. These artifacts are said to be keys that can restore the balance of elemental forces in Lumina.',
    objective: 'Locate and attune to all three awakening crystals scattered throughout the Crystal Vale.',
    challenge: 'The crystals are guarded by echo spirits that reflect the seeker's own doubts and fears.',
    region: 'Crystal Vale',
    icon: '✧'
  },
  {
    id: 'codex',
    title: 'The Forgotten Codex',
    description: 'Ancient texts speak of a codex containing knowledge from the civilization that first harnessed Lumina\'s mystical energies. It was divided and hidden when darkness threatened to consume its power.',
    objective: 'Recover the scattered pages of the codex from within the treacherous Forgotten Spires.',
    challenge: 'The spires shift and change, with pathways that exist in multiple realities simultaneously.',
    region: 'The Forgotten Spires',
    icon: '⌘'
  },
  {
    id: 'seal',
    title: 'The Abyssal Seal',
    description: 'As shadows grow longer across Lumina, the ancient seal containing an entity of pure void grows weaker. Only by performing the Ritual of Binding at the nexus of power can the threat be contained once more.',
    objective: 'Gather the four elements needed for the ritual and reach the heart of the Abyssal Depths.',
    challenge: 'The closer one gets to the seal, the more reality itself begins to unravel, creating illusions and distorting perceptions.',
    region: 'The Abyssal Depths',
    icon: '◉'
  }
];

interface QuestCardProps {
  quest: Quest;
  index: number;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, index }) => {
  return (
    <div className="mystical-bg rounded-xl overflow-hidden mystical-glow">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl text-accent">{quest.icon}</span>
          <h3 className="text-2xl font-bold text-primary">{quest.title}</h3>
        </div>
        
        <p className="mb-6 text-lg">{quest.description}</p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-accent mb-1">Objective</h4>
            <p>{quest.objective}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-accent mb-1">Challenge</h4>
            <p>{quest.challenge}</p>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-muted">
            <span className="text-sm text-muted-foreground">Location</span>
            <span className="text-sm font-medium">{quest.region}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestCards: React.FC = () => {
  return (
    <section id="quests" className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl mystical-title text-center mb-12">Quests</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quests.map((quest, index) => (
            <QuestCard key={quest.id} quest={quest} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuestCards;
