import React from 'react';
import { Play, Users, Sparkles } from 'lucide-react';

interface LandingProps {
  onHost: () => void;
  onJoin: () => void;
}

const Landing: React.FC<LandingProps> = ({ onHost, onJoin }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-full mb-4 shadow-lg shadow-indigo-500/30">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          QuizWiz
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          The real-time multiplayer quiz platform. Host a game or join your friends instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <button
          onClick={onHost}
          className="group relative flex flex-col items-center p-8 bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1"
        >
          <div className="p-4 bg-indigo-500/10 rounded-full mb-4 group-hover:bg-indigo-500/20 transition-colors">
            <Play className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Host a Game</h2>
          <p className="text-slate-400">Create a room and invite others</p>
        </button>

        <button
          onClick={onJoin}
          className="group relative flex flex-col items-center p-8 bg-slate-800 border-2 border-slate-700 hover:border-emerald-500 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1"
        >
          <div className="p-4 bg-emerald-500/10 rounded-full mb-4 group-hover:bg-emerald-500/20 transition-colors">
            <Users className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Join a Game</h2>
          <p className="text-slate-400">Enter code to join a lobby</p>
        </button>
      </div>
    </div>
  );
};

export default Landing;
