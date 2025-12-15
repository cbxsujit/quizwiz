import React, { useEffect, useState, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { generateGameId } from '../utils';
import { Player, PeerMessage, HostGameState, Quiz } from '../types';
import { Copy, Users, Wifi, Loader2, Play, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HostViewProps {
  onBack: () => void;
  quiz: Quiz;
}

const HostView: React.FC<HostViewProps> = ({ onBack, quiz }) => {
  const [gameId, setGameId] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isPeerReady, setIsPeerReady] = useState(false);
  
  // Game State
  const [gameState, setGameState] = useState<HostGameState>('LOBBY');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, number>>({});
  
  // Refs
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());

  // Use quiz questions from props
  const QUESTIONS = quiz.questions;

  useEffect(() => {
    const newGameId = generateGameId();
    setGameId(newGameId);

    const peer = new Peer(newGameId);
    peerRef.current = peer;

    peer.on('open', (id) => {
      console.log('Host Peer ID:', id);
      setIsPeerReady(true);
    });

    peer.on('connection', (conn: DataConnection) => {
      console.log('Incoming connection from:', conn.peer);
      
      // Store connection
      connectionsRef.current.set(conn.peer, conn);

      conn.on('data', (data: unknown) => {
        const message = data as PeerMessage;
        
        if (message.type === 'JOIN') {
          handlePlayerJoin(conn.peer, message.name);
          conn.send({ type: 'WELCOME', gameId: newGameId });
        } else if (message.type === 'VOTE') {
          handleVote(message.optionId);
        }
      });
      
      conn.on('close', () => {
         setPlayers(prev => prev.filter(p => p.id !== conn.peer));
         connectionsRef.current.delete(conn.peer);
      });
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
    });

    return () => {
      peer.destroy();
    };
  }, []);

  const handlePlayerJoin = (peerId: string, name: string) => {
    setPlayers((prev) => {
      if (prev.some(p => p.id === peerId)) return prev;
      return [...prev, { id: peerId, name, joinedAt: Date.now() }];
    });
  };

  const handleVote = (optionId: string) => {
    setVotes(prev => ({
      ...prev,
      [optionId]: (prev[optionId] || 0) + 1
    }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gameId);
  };

  const startGame = () => {
    // Broadcast START to all players
    connectionsRef.current.forEach(conn => {
      conn.send({ type: 'GAME_START' });
    });
    setGameState('PLAYING');
    setVotes({}); // Reset votes
    setCurrentQuestionIndex(0);
  };

  const revealAnswer = () => {
    setGameState('REVEAL');
    const correctId = QUESTIONS[currentQuestionIndex].correctOptionId;
    connectionsRef.current.forEach(conn => {
      conn.send({ type: 'RESULT', correctOptionId: correctId });
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setVotes({});
      setGameState('PLAYING');
      connectionsRef.current.forEach(conn => {
        conn.send({ type: 'GAME_START' });
      });
    } else {
      // Game Over Logic - Return to Lobby
      setGameState('LOBBY');
      setVotes({});
      setCurrentQuestionIndex(0);
      connectionsRef.current.forEach(conn => {
        conn.send({ type: 'GAME_OVER' });
      });
    }
  };

  // Helper to map color names to Tailwind classes
  const getBarColor = (color: string, isRevealed: boolean, isCorrect: boolean) => {
    if (isRevealed) {
      if (isCorrect) return 'bg-green-500 shadow-[0_0_30px_#22c55e]'; // Neon Green
      return 'bg-slate-500 opacity-20'; // Dimmed
    }

    // Default colors
    switch(color) {
      case 'red': return 'bg-red-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-emerald-500';
      case 'yellow': return 'bg-yellow-400';
      default: return 'bg-slate-500';
    }
  };

  // Helper for label dots
  const getDotColor = (color: string) => {
    switch(color) {
      case 'red': return 'bg-red-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-emerald-500';
      case 'yellow': return 'bg-yellow-400';
      default: return 'bg-slate-500';
    }
  };

  // --- RENDER: LOBBY ---
  if (gameState === 'LOBBY') {
    const qrUrl = isPeerReady 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}?join=${gameId}`)}`
      : '';

    return (
      <div className="min-h-screen p-6 flex flex-col items-center">
        {/* Header */}
        <div className="w-full max-w-6xl flex justify-between items-center mb-8">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
            &larr; Quit Lobby
          </button>
          <div className="flex items-center gap-2 text-indigo-400">
            <Wifi className={`w-5 h-5 ${isPeerReady ? 'text-green-400' : 'text-yellow-400 animate-pulse'}`} />
            <span className="text-sm font-medium">{isPeerReady ? 'Online' : 'Connecting...'}</span>
          </div>
        </div>

        {/* Game ID & QR Section */}
        <div className="text-center space-y-4 mb-16 flex flex-col items-center">
          <p className="text-slate-400 uppercase tracking-widest text-sm font-semibold">Join Code</p>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* ID Card */}
            <div 
              onClick={copyToClipboard}
              className="relative group cursor-pointer inline-flex items-center justify-center gap-4 bg-slate-800 border-2 border-indigo-500/50 hover:border-indigo-500 rounded-3xl px-12 py-8 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]"
            >
              {isPeerReady ? (
                <>
                  <h1 className="text-6xl md:text-8xl font-black tracking-widest text-white font-mono">
                    {gameId}
                  </h1>
                  <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-indigo-400">
                    <Copy className="w-6 h-6" />
                  </div>
                </>
              ) : (
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
              )}
            </div>

            {/* QR Code */}
            {isPeerReady && (
              <div className="flex flex-col items-center animate-pop">
                <div className="p-2 bg-white rounded-lg shadow-lg">
                  <img src={qrUrl} alt="Join QR" className="w-32 h-32" />
                </div>
                <p className="text-slate-400 text-xs mt-2 font-medium">Scan to Join instantly</p>
              </div>
            )}
          </div>
          
          <div className="text-slate-400 font-medium pt-4">Playing: <span className="text-white">{quiz.title}</span></div>
        </div>

        {/* Players List */}
        <div className="w-full max-w-4xl mb-24">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <Users className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">
              Players <span className="text-slate-500 text-lg ml-2">({players.length})</span>
            </h2>
          </div>

          {players.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-800/30">
              <p className="text-slate-500 animate-pulse">Waiting for players to join...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {players.map((player) => (
                <div 
                  key={player.id}
                  className="animate-pop bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center gap-2 shadow-lg"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-white truncate max-w-full">{player.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Start Button */}
        <div className="fixed bottom-8 w-full max-w-md px-6 z-10">
          <button 
            onClick={startGame}
            disabled={players.length === 0}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-500/50 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" /> Start Game
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: GAME (PROJECTOR VIEW) ---
  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const totalVotes = (Object.values(votes) as number[]).reduce((a, b) => a + b, 0);
  const isRevealed = gameState === 'REVEAL';

  return (
    <div className="min-h-screen flex flex-col p-6">
       {/* Top Bar */}
       <div className="flex justify-between items-center mb-8">
         <div className="px-4 py-2 bg-slate-800/50 backdrop-blur rounded-full text-slate-400 text-sm font-semibold border border-slate-700">
           Code: <span className="text-white font-mono">{gameId}</span>
         </div>
         <div className="px-4 py-2 bg-slate-800/50 backdrop-blur rounded-full text-indigo-400 font-bold border border-slate-700">
           {totalVotes} Votes
         </div>
       </div>

       {/* Question */}
       <div className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full relative">
         <h1 className="text-4xl md:text-6xl font-black text-center text-white mb-16 leading-tight drop-shadow-lg">
           {currentQuestion.text}
         </h1>

         {/* Chart Container */}
         <div className="w-full h-96 flex items-end justify-center gap-4 md:gap-8 px-4 mb-24">
           {currentQuestion.options.map((option) => {
             const voteCount = votes[option.id] || 0;
             const maxPossible = Math.max(players.length, 1); 
             const heightPercent = (voteCount / maxPossible) * 100;
             const isCorrect = option.id === currentQuestion.correctOptionId;

             return (
               <div key={option.id} className="flex flex-col items-center gap-4 w-full max-w-[150px] group">
                 {/* Bar */}
                 <div className="relative w-full h-64 flex items-end justify-center">
                    <div 
                      className={`w-full rounded-t-xl transition-all duration-500 ease-out relative ${getBarColor(option.color, isRevealed, isCorrect)}`}
                      style={{ height: `${Math.max(heightPercent, 2)}%` }} // Min 2% for visibility
                    >
                      {/* Vote Count Badge */}
                      <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 font-bold py-1 px-3 rounded-lg shadow-lg transition-opacity ${isRevealed || totalVotes > 0 ? 'opacity-100' : 'opacity-0'}`}>
                        {voteCount}
                      </div>
                    </div>
                 </div>
                 
                 {/* Label */}
                 <div className={`text-center transition-opacity duration-300 ${isRevealed && !isCorrect ? 'opacity-30' : 'opacity-100'}`}>
                   <div className={`inline-block w-4 h-4 rounded-full mb-2 ${getDotColor(option.color)}`}></div>
                   <p className="text-lg md:text-xl font-bold text-slate-300 leading-tight">
                     {option.text}
                   </p>
                 </div>
               </div>
             );
           })}
         </div>

         {/* Controls */}
         <div className="fixed bottom-8 right-8 flex gap-4">
            {!isRevealed ? (
              <button 
                onClick={revealAnswer}
                className="py-3 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/50 transition-all active:scale-95 flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> Show Answer
              </button>
            ) : (
              <button 
                onClick={nextQuestion}
                className="py-3 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/50 transition-all active:scale-95 flex items-center gap-2"
              >
                {currentQuestionIndex < QUESTIONS.length - 1 ? 'Next Question' : 'Finish Game'} <ArrowRight className="w-5 h-5" />
              </button>
            )}
         </div>
       </div>
    </div>
  );
};

export default HostView;