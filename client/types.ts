// Data structure for a connected player
export interface Player {
  id: string; // The peer ID of the player
  name: string; // The display name
  joinedAt: number;
}

// Application View States (Global)
export type AppState = 
  | 'LANDING' 
  | 'HOST_AUTH' 
  | 'HOST_DASHBOARD' 
  | 'HOST_CREATE' 
  | 'HOST_LOBBY' 
  | 'PLAYER_JOIN' 
  | 'PLAYER_WAITING';

// Host Game States
export type HostGameState = 'LOBBY' | 'PLAYING' | 'REVEAL';

// Player Game States
export type PlayerGameState = 'LOBBY' | 'ANSWERING' | 'SUBMITTED' | 'RESULT';

// Quiz Data Structures
export interface Option {
  id: string;
  color: 'red' | 'blue' | 'green' | 'yellow';
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
  correctOptionId: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  createdAt: number;
}

// Message Protocol for PeerJS communication
export type PeerMessage = 
  | { type: 'JOIN'; name: string }
  | { type: 'WELCOME'; gameId: string }
  | { type: 'GAME_START' }
  | { type: 'VOTE'; optionId: string }
  | { type: 'RESULT'; correctOptionId: string }
  | { type: 'GAME_OVER' };