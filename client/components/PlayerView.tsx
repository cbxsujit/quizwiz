import React, { useState, useEffect, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { ArrowRight, Loader2, Gamepad2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { PeerMessage, PlayerGameState } from '../types';

interface PlayerViewProps {
  onBack: () => void;
}

const PlayerView: React.FC<PlayerViewProps> = ({ onBack }) => {
  const [playerState, setPlayerState] = useState<PlayerGameState>('LOBBY');
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  // Game Logic State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctOption, setCorrectOption] = useState<string | null>(null);
  
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check for auto-join code in URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('join');
    if (code) {
      setJoinCode(code.toUpperCase());
      setIsLocked(true);
      // Slight delay to ensure render before focus
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }

    return () => {
      peerRef.current?.destroy();
    };
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || joinCode.length !== 4) {
      setError("Please enter a valid name and 4-letter code.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
      const hostId = joinCode.toUpperCase();
      console.log(`My ID: ${id}. Connecting to Host: ${hostId}`);

      const conn = peer.connect(hostId);
      connRef.current = conn;

      conn.on('open', () => {
        conn.send({ type: 'JOIN', name: name.trim() } as PeerMessage);
        setPlayerState('LOBBY');
        setIsConnecting(false);
      });

      conn.on('data', (data: unknown) => {
        const msg = data as PeerMessage;
        
        switch (msg.type) {
          case 'GAME_START':
            setPlayerState('ANSWERING');
            setSelectedOption(null);
            setCorrectOption(null);
            break;
          case 'RESULT':
            setCorrectOption(msg.correctOptionId);
            setPlayerState('RESULT');
            break;
          case 'GAME_OVER':
            setPlayerState('LOBBY');
            setSelectedOption(null);
            setCorrectOption(null);
            break;
        }
      });

      conn.on('error', (err) => {
        console.error("Connection error:", err);
        setError("Could not connect to host. Check the code.");
        setIsConnecting(false);
      });

      peer.on('error', (err) => {
          console.error("Peer error:", err);
          setError("Connection failed. Host might be offline or code is wrong.");
          setIsConnecting(false);
      });
    });
  };

  const handleVote = (optionId: string) => {
    if (connRef.current) {
      connRef.current.send({ type: 'VOTE', optionId } as PeerMessage);
      setSelectedOption(optionId);
      setPlayerState('SUBMITTED');
    }
  };

  // --- RENDER: CONTROLLER PAD (ANSWERING) ---
  if (playerState === 'ANSWERING') {
    return (
      <div className="h-screen w-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
        {/* Option 1: Red */}
        <button 
          onClick={() => handleVote('opt1')}
          className="bg-red-500 rounded-3xl active:scale-95 transition-all shadow-lg shadow-red-900/50 hover:bg-red-400 hover:shadow-red-500/30"
        ></button>
        {/* Option 2: Blue */}
        <button 
          onClick={() => handleVote('opt2')}
          className="bg-blue-500 rounded-3xl active:scale-95 transition-all shadow-lg shadow-blue-900/50 hover:bg-blue-400 hover:shadow-blue-500/30"
        ></button>
        {/* Option 3: Green */}
        <button 
          onClick={() => handleVote('opt3')}
          className="bg-emerald-500 rounded-3xl active:scale-95 transition-all shadow-lg shadow-emerald-900/50 hover:bg-emerald-400 hover:shadow-emerald-500/30"
        ></button>
        {/* Option 4: Yellow */}
        <button 
          onClick={() => handleVote('opt4')}
          className="bg-yellow-400 rounded-3xl active:scale-95 transition-all shadow-lg shadow-yellow-900/50 hover:bg-yellow-300 hover:shadow-yellow-500/30"
        ></button>
      </div>
    );
  }

  // --- RENDER: ANSWER SUBMITTED ---
  if (playerState === 'SUBMITTED') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-emerald-500/10 p-6 rounded-full mb-6 animate-bounce">
          <CheckCircle2 className="w-16 h-16 text-emerald-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Answer Sent!</h1>
        <p className="text-slate-400 text-lg">Waiting for results...</p>
      </div>
    );
  }

  // --- RENDER: RESULT FEEDBACK ---
  if (playerState === 'RESULT') {
    const isCorrect = selectedOption === correctOption;
    
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center transition-colors duration-500 ${isCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
        <div className="bg-white/20 p-8 rounded-full mb-8 shadow-2xl backdrop-blur-sm animate-pop">
          {isCorrect ? (
             <CheckCircle2 className="w-24 h-24 text-white" />
          ) : (
             <XCircle className="w-24 h-24 text-white" />
          )}
        </div>
        
        <h1 className="text-6xl font-black text-white mb-6 drop-shadow-md">
          {isCorrect ? 'Correct!' : 'Wrong!'}
        </h1>
        
        <p className="text-white/80 text-xl font-medium">
          Waiting for host...
        </p>
      </div>
    );
  }

  // --- RENDER: WAITING LOBBY ---
  if (playerState === 'LOBBY' && !isConnecting && connRef.current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
         <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
            <Gamepad2 className="w-24 h-24 text-indigo-400 relative z-10 mb-8" />
         </div>
         <h2 className="text-3xl font-bold text-white mb-4">You're In!</h2>
         <p className="text-slate-400 text-lg mb-8 max-w-sm">
           Waiting for {name} (Host) to start the game...
         </p>
         <div className="flex gap-2 justify-center">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
         </div>
      </div>
    );
  }

  // --- RENDER: LOGIN FORM ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="text-slate-400 hover:text-white mb-8 transition-colors">
          &larr; Back
        </button>

        <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Join Game</h1>
            <p className="text-slate-400">Enter your details to connect</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Display Name
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., QuizMaster99"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-white placeholder-slate-600 transition-all"
                maxLength={12}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Game Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => !isLocked && setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g., X9K2"
                maxLength={4}
                readOnly={isLocked}
                className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-white text-center font-mono text-xl tracking-widest placeholder-slate-600 uppercase transition-all ${isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isConnecting}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-500/50 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Enter Lobby <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlayerView;