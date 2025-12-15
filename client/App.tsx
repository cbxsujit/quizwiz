import React, { useState } from 'react';
import Landing from './components/Landing';
import HostView from './components/HostView';
import PlayerView from './components/PlayerView';
import HostAuth from './components/HostAuth';
import QuizDashboard from './components/QuizDashboard';
import QuizCreator from './components/QuizCreator';
import { AppState, Quiz } from './types';

const App: React.FC = () => {
  // Check for join code in URL to bypass landing and go straight to player join
  const [appState, setAppState] = useState<AppState>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('join') ? 'PLAYER_JOIN' : 'LANDING';
  });
  
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const renderContent = () => {
    switch (appState) {
      // --- PLAYER FLOW ---
      case 'PLAYER_JOIN':
        return <PlayerView onBack={() => {
           // Clear the URL param if they go back so they aren't stuck in the loop
           const url = new URL(window.location.href);
           url.searchParams.delete('join');
           window.history.replaceState({}, '', url);
           setAppState('LANDING');
        }} />;
      
      // --- HOST FLOW: AUTH ---
      case 'HOST_AUTH':
        return (
          <HostAuth 
            onSuccess={() => setAppState('HOST_DASHBOARD')} 
            onBack={() => setAppState('LANDING')} 
          />
        );

      // --- HOST FLOW: DASHBOARD ---
      case 'HOST_DASHBOARD':
        return (
          <QuizDashboard 
            onPlay={(quiz) => {
              setSelectedQuiz(quiz);
              setAppState('HOST_LOBBY');
            }}
            onCreate={() => setAppState('HOST_CREATE')}
            onBack={() => setAppState('LANDING')}
          />
        );

      // --- HOST FLOW: CREATE QUIZ ---
      case 'HOST_CREATE':
        return (
          <QuizCreator 
            onSave={() => setAppState('HOST_DASHBOARD')}
            onCancel={() => setAppState('HOST_DASHBOARD')}
          />
        );

      // --- HOST FLOW: GAME LOBBY & PLAY ---
      case 'HOST_LOBBY':
        if (!selectedQuiz) return <div>Error: No quiz selected</div>;
        return (
          <HostView 
            quiz={selectedQuiz} 
            onBack={() => setAppState('HOST_DASHBOARD')} 
          />
        );

      // --- DEFAULT ---
      case 'LANDING':
      default:
        return (
          <Landing 
            onHost={() => setAppState('HOST_AUTH')}
            onJoin={() => setAppState('PLAYER_JOIN')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen text-white selection:bg-indigo-500 selection:text-white">
      {renderContent()}
    </div>
  );
};

export default App;