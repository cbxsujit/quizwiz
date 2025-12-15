import React, { useState } from 'react';
import { Quiz, Question } from '../types';
import { Save, Plus, Trash2, X, AlertCircle } from 'lucide-react';

interface QuizCreatorProps {
  onSave: () => void;
  onCancel: () => void;
}

const QuizCreator: React.FC<QuizCreatorProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: Date.now(),
      text: '',
      correctOptionId: 'opt1', // Default
      options: [
        { id: 'opt1', color: 'red', text: '' },
        { id: 'opt2', color: 'blue', text: '' },
        { id: 'opt3', color: 'green', text: '' },
        { id: 'opt4', color: 'yellow', text: '' },
      ]
    }
  ]);
  const [error, setError] = useState<string | null>(null);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        text: '',
        correctOptionId: 'opt1',
        options: [
          { id: 'opt1', color: 'red', text: '' },
          { id: 'opt2', color: 'blue', text: '' },
          { id: 'opt3', color: 'green', text: '' },
          { id: 'opt4', color: 'yellow', text: '' },
        ]
      }
    ]);
  };

  const handleRemoveQuestion = (id: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestionText = (id: number, text: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const updateOptionText = (qId: number, optId: string, text: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: q.options.map(o => o.id === optId ? { ...o, text } : o)
        };
      }
      return q;
    }));
  };

  const updateCorrectOption = (qId: number, optId: string) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, correctOptionId: optId } : q));
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Please enter a quiz title.');
      return;
    }
    
    // Basic validation
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        setError(`Question ${i + 1} is missing text.`);
        return;
      }
      for (const opt of questions[i].options) {
        if (!opt.text.trim()) {
          setError(`Question ${i + 1} has empty options.`);
          return;
        }
      }
    }

    const newQuiz: Quiz = {
      id: crypto.randomUUID(),
      title: title.trim(),
      questions: questions,
      createdAt: Date.now()
    };

    const saved = localStorage.getItem('quizwiz_quizzes');
    const existing = saved ? JSON.parse(saved) : [];
    localStorage.setItem('quizwiz_quizzes', JSON.stringify([...existing, newQuiz]));
    
    onSave();
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur border-b border-slate-800 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Create New Quiz</h1>
          <div className="flex gap-3">
             <button onClick={onCancel} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" /> Save Quiz
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Quiz Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. 90s Music Trivia"
            className="w-full bg-slate-800 border-2 border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-xl text-white outline-none transition-colors placeholder-slate-600"
          />
        </div>

        {/* Questions List */}
        <div className="space-y-8">
           {questions.map((q, index) => (
             <div key={q.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 relative group animate-pop">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-indigo-400 font-bold">Question {index + 1}</h3>
                 {questions.length > 1 && (
                   <button 
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                 )}
               </div>

               {/* Question Text */}
               <input
                 type="text"
                 value={q.text}
                 onChange={(e) => updateQuestionText(q.id, e.target.value)}
                 placeholder="Type your question here..."
                 className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-lg px-4 py-3 text-lg text-white outline-none mb-6 transition-colors"
               />

               {/* Options Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {q.options.map((opt) => (
                   <div key={opt.id} className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                     {/* Color Indicator & Radio */}
                     <div 
                      className="relative shrink-0 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                      onClick={() => updateCorrectOption(q.id, opt.id)}
                     >
                       <div className={`absolute inset-0 rounded-full opacity-20 ${
                         opt.color === 'red' ? 'bg-red-500' :
                         opt.color === 'blue' ? 'bg-blue-500' :
                         opt.color === 'green' ? 'bg-emerald-500' : 'bg-yellow-400'
                       }`}></div>
                       <div className={`w-4 h-4 rounded-full border-2 ${
                         q.correctOptionId === opt.id 
                           ? 'border-white bg-white shadow-[0_0_10px_white]' 
                           : 'border-white/50 bg-transparent'
                       }`}></div>
                     </div>

                     {/* Option Text Input */}
                     <input
                       type="text"
                       value={opt.text}
                       onChange={(e) => updateOptionText(q.id, opt.id, e.target.value)}
                       placeholder={`Option ${opt.color.charAt(0).toUpperCase() + opt.color.slice(1)}`}
                       className={`w-full bg-transparent border-b-2 border-transparent focus:border-${opt.color === 'green' ? 'emerald' : opt.color}-500 px-2 py-1 text-white outline-none transition-colors placeholder-slate-600`}
                     />
                   </div>
                 ))}
               </div>
               
               <p className="mt-3 text-xs text-slate-500 text-center">Click the circle to mark the correct answer</p>
             </div>
           ))}
        </div>

        {/* Add Button */}
        <button 
          onClick={handleAddQuestion}
          className="w-full py-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-slate-800/50 text-slate-400 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" /> Add Question
        </button>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full shadow-2xl animate-pop">
           <AlertCircle className="w-5 h-5" />
           <span>{error}</span>
           <button onClick={() => setError(null)} className="ml-2 hover:bg-white/20 rounded-full p-1">
             <X className="w-4 h-4" />
           </button>
        </div>
      )}
    </div>
  );
};

export default QuizCreator;