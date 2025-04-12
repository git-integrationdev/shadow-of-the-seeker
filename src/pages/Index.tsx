
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CharacterProfile from "@/components/CharacterProfile";
import QuestCards from "@/components/QuestCard";
import WorldMap from "@/components/WorldMap";
import AntagonistReveal from "@/components/AntagonistReveal";

export default function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-center mb-12">
            <Link to="/cosmic-defender">
              <Button size="lg" className="gap-2 text-lg group">
                <Gamepad2 className="size-6 group-hover:animate-pulse" />
                Play Cosmic Defender
              </Button>
            </Link>
          </div>
          
          <CharacterProfile />
          <QuestCards />
          <WorldMap />
          <AntagonistReveal />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
