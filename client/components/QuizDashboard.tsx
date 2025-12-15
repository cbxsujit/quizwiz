import React, { useEffect, useState } from 'react';
import { Quiz } from '../types';
import { Plus, Play, Trash2, LayoutGrid, Trophy } from 'lucide-react';

interface QuizDashboardProps {
  onPlay: (quiz: Quiz) => void;
  onCreate: () => void;
  onBack: () => void;
}

const DEFAULT_QUIZ: Quiz = {
  id: 'demo-business-1',
  title: 'Demo Business Quiz',
  createdAt: Date.now(),
  questions: [
    {
      id: 1,
      text: "Which company is known as 'Big Blue'?",
      options: [
        { id: 'opt1', color: 'red', text: 'Microsoft' },
        { id: 'opt2', color: 'blue', text: 'IBM' },
        { id: 'opt3', color: 'green', text: 'Facebook' },
        { id: 'opt4', color: 'yellow', text: 'Amazon' }
      ],
      correctOptionId: 'opt2'
    },
    {
      id: 2,
      text: "Who is the CEO of Tesla?",
      options: [
        { id: 'opt1', color: 'red', text: 'Jeff Bezos' },
        { id: 'opt2', color: 'blue', text: 'Tim Cook' },
        { id: 'opt3', color: 'green', text: 'Elon Musk' },
        { id: 'opt4', color: 'yellow', text: 'Satya Nadella' }
      ],
      correctOptionId: 'opt3'
    },
    {
      id: 3,
      text: "What does 'IPO' stand for?",
      options: [
        { id: 'opt1', color: 'red', text: 'Initial Public Offering' },
        { id: 'opt2', color: 'blue', text: 'International Payment Org' },
        { id: 'opt3', color: 'green', text: 'Internal Profit Output' },
        { id: 'opt4', color: 'yellow', text: 'Internet Protocol Office' }
      ],
      correctOptionId: 'opt1'
    }
  ]
};

const QuizDashboard: React.FC<QuizDashboardProps> = ({ onPlay, onCreate, onBack }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('quizwiz_quizzes');
    if (saved) {
      setQuizzes(JSON.parse(saved));
    } else {
      // Seed data
      const initial = [DEFAULT_QUIZ];
      localStorage.setItem('quizwiz_quizzes', JSON.stringify(initial));
      setQuizzes(initial);
    }
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this quiz?')) {
      const updated = quizzes.filter(q => q.id !== id);
      setQuizzes(updated);
      localStorage.setItem('quizwiz_quizzes', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
           <button onClick={onBack} className="text-slate-400 hover:text-white mb-2 transition-colors">
            &larr; Back to Landing
          </button>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <LayoutGrid className="text-indigo-500 w-10 h-10" /> Quiz Studio
          </h1>
          <p className="text-slate-400 mt-1">Manage your quiz library</p>
        </div>
        <button 
          onClick={onCreate}
          className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/50 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Create New Quiz
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div 
            key={quiz.id}
            className="group relative bg-slate-800 border-2 border-slate-700 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
          >
            {/* Card Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-700/50 rounded-lg text-indigo-400 group-hover:text-white group-hover:bg-indigo-600 transition-colors">
                  <Trophy className="w-6 h-6" />
                </div>
                <button 
                  onClick={(e) => handleDelete(quiz.id, e)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-1" title={quiz.title}>
                {quiz.title}
              </h3>
              
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                <span className="bg-slate-700/50 px-2 py-1 rounded-md">
                  {quiz.questions.length} Questions
                </span>
                <span>•</span>
                <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
              </div>

              <button 
                onClick={() => onPlay(quiz)}
                className="w-full py-3 bg-slate-700 group-hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Play Now
              </button>
            </div>
          </div>
        ))}

        {quizzes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl">
            <p>No quizzes found. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDashboard;