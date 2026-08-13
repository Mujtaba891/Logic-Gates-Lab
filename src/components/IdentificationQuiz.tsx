import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import quizData from '../data/quiz.json';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const IdentificationQuiz: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  const totalQuestions = 5;

  useEffect(() => {
    startNewQuiz();
  }, []);

  const startNewQuiz = () => {
    // Shuffle and pick 5 random questions
    const shuffled = [...quizData].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, totalQuestions));
    
    setCurrentIdx(0);
    setSelectedOptionIdx(null);
    setScore(0);
    setShowExplanation(false);
    setIsFinished(false);
  };

  const handleSelectOption = (idx: number) => {
    if (showExplanation || questions.length === 0) return;
    const question = questions[currentIdx];
    
    setSelectedOptionIdx(idx);
    setShowExplanation(true);
    
    if (question.options[idx] === question.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < totalQuestions) {
      setCurrentIdx((i) => i + 1);
      setSelectedOptionIdx(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  if (questions.length === 0) return null;
  const question = questions[currentIdx];

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-3 sm:p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Banner Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-6 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-xl font-extrabold text-white flex items-center gap-1.5">
                Digital Logic Challenge
                <span className="bg-indigo-500/20 text-indigo-400 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-indigo-500/30 uppercase tracking-widest">Quiz</span>
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400">Randomized questions to test your digital logic engineering.</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase font-mono block">Score</span>
            <span className="text-sm sm:text-lg font-extrabold text-amber-400 font-mono">
              {score} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Quiz Body */}
        {!isFinished ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-6 space-y-4 sm:space-y-6 shadow-xl relative min-h-[320px]">
            {/* Progress */}
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
              <span>
                Question {currentIdx + 1} of {totalQuestions}
              </span>
              <span className="font-mono text-amber-400 font-bold">
                {Math.round(((currentIdx + 1) / totalQuestions) * 100)}% Complete
              </span>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <h3 className="text-xs sm:text-base font-bold text-white leading-relaxed">{question.question}</h3>
            </div>

            {/* Options List */}
            <div className="space-y-2">
              {question.options.map((optionText, idx) => {
                let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:bg-slate-800';
                const isCorrect = optionText === question.correctAnswer;
                
                if (showExplanation) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
                  } else if (idx === selectedOptionIdx) {
                    btnStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold';
                  }
                }
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-2.5 sm:p-3.5 rounded-lg border text-xs sm:text-sm font-medium transition flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{optionText}</span>
                    {showExplanation && isCorrect && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    {showExplanation && idx === selectedOptionIdx && !isCorrect && (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next */}
            {showExplanation && (
              <div className="pt-3 border-t border-slate-800 space-y-3 animate-in fade-in duration-200">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed shadow-inner">
                  <strong className="text-amber-400 block mb-1 text-[10px] uppercase tracking-widest flex items-center gap-1"><Sparkles className="w-3 h-3"/> Explanation</strong>
                  {question.explanation}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] sm:text-xs transition shadow-lg"
                  >
                    {currentIdx + 1 < totalQuestions ? 'Next Question' : 'Finish Quiz'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Finished Card */
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Trophy className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-2xl font-extrabold text-white">Quiz Completed!</h3>
              <p className="text-[10px] text-slate-400">Your Logic Challenge Score</p>
            </div>
            <div className="text-2xl sm:text-4xl font-extrabold text-amber-400 font-mono">
              {score} / {totalQuestions}
            </div>
            <p className="text-[11px] text-slate-300 max-w-md mx-auto leading-relaxed">
              {score === totalQuestions
                ? 'Outstanding performance! You mastered this set of challenges.'
                : 'Great effort! Keep practicing to master digital logic!'}
            </p>
            <button
              onClick={startNewQuiz}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition shadow-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
