import React, { useState } from 'react';
import { Challenge, CircuitComponent, Wire } from '../types';
import { PRACTICE_CHALLENGES } from '../data/challenges';
import { generateCircuitTruthTable } from '../utils/logicEngine';
import { Trophy, CheckCircle2, XCircle, Lightbulb, ArrowRight, Play, Sparkles } from 'lucide-react';

interface ChallengePanelProps {
  components: CircuitComponent[];
  wires: Wire[];
  onLoadChallengeCircuit: (challenge: Challenge) => void;
  onSwitchToBuilder: () => void;
}

export const ChallengePanel: React.FC<ChallengePanelProps> = ({
  components,
  wires,
  onLoadChallengeCircuit,
  onSwitchToBuilder,
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(PRACTICE_CHALLENGES[0]);
  const [showHint, setShowHint] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    passed: boolean;
    totalCases: number;
    passedCases: number;
    details: string;
  } | null>(null);

  // Test live circuit against challenge requirements
  const testCircuit = () => {
    const currentTable = generateCircuitTruthTable(components, wires);

    if (currentTable.rows.length === 0) {
      setVerificationResult({
        passed: false,
        totalCases: selectedChallenge.targetTruthTable.length,
        passedCases: 0,
        details: 'Circuit incomplete. Make sure you have connected input switches and output LEDs on the canvas.',
      });
      return;
    }

    let passedCases = 0;
    const totalCases = selectedChallenge.targetTruthTable.length;

    selectedChallenge.targetTruthTable.forEach((targetRow) => {
      // Find matching input row in generated truth table
      const matchRow = currentTable.rows.find((row) => {
        return Object.keys(targetRow).every((key) => {
          if (key in row.inputs) {
            return row.inputs[key] === targetRow[key];
          }
          return true;
        });
      });

      if (matchRow) {
        // Check if output values match expected
        const outputsMatch = selectedChallenge.outputs.every((out) => {
          return matchRow.outputs[out.name] === targetRow[out.name];
        });
        if (outputsMatch) passedCases++;
      }
    });

    const passed = passedCases === totalCases;
    setVerificationResult({
      passed,
      totalCases,
      passedCases,
      details: passed
        ? 'Congratulations! Your logic circuit correctly implements the required truth table functionality!'
        : `Verification failed (${passedCases}/${totalCases} cases passed). Check your wiring and gate selections.`,
    });
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-3 sm:p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Banner Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[10px] sm:text-xs tracking-wider uppercase">
              <Trophy className="w-3.5 h-3.5" />
              Logic Design Guided Labs & Practice
            </div>
            <h2 className="text-base sm:text-2xl font-extrabold text-white">Digital Logic Engineering Challenges</h2>
            <p className="text-[10px] sm:text-xs text-slate-400 max-w-2xl">
              Construct specific logic functions on the canvas and click verify to evaluate your design against automated test cases.
            </p>
          </div>
        </div>

        {/* Challenge Selection & Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* List Sidebar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 shadow-xl">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 py-0.5">
              Select Challenge
            </h3>
            <div className="space-y-1">
              {PRACTICE_CHALLENGES.map((ch) => {
                const isSelected = selectedChallenge.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setSelectedChallenge(ch);
                      setVerificationResult(null);
                      setShowHint(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg border text-[10px] sm:text-xs transition ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="font-bold mb-0.5">{ch.title}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{ch.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Challenge Details & Auto-Tester */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-6 space-y-4 sm:space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                  {selectedChallenge.category} Level
                </span>
                <h3 className="text-sm sm:text-xl font-bold text-white mt-1.5">{selectedChallenge.title}</h3>
              </div>

              <button
                onClick={() => {
                  onLoadChallengeCircuit(selectedChallenge);
                  onSwitchToBuilder();
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[10px] sm:text-xs transition shadow-md whitespace-nowrap"
              >
                <span>Start on Canvas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Task Requirements</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{selectedChallenge.description}</p>
            </div>

            {/* Hint Box */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Design Hint
                </span>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-[10px] text-amber-400 hover:underline"
                >
                  {showHint ? 'Hide Hint' : 'Reveal Hint'}
                </button>
              </div>

              {showHint && (
                <p className="text-[11px] text-amber-200/90 leading-relaxed animate-in fade-in duration-150">
                  {selectedChallenge.hint}
                </p>
              )}
            </div>

            {/* Test Verification Button */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200">Circuit Verification Engine</h4>
                  <p className="text-[10px] text-slate-400">
                    Verify if your canvas circuit passes all required truth table states.
                  </p>
                </div>

                <button
                  onClick={testCircuit}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10px] sm:text-xs transition shadow-lg"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  Verify Canvas Circuit
                </button>
              </div>

              {/* Verification Result Feedback Card */}
              {verificationResult && (
                <div
                  className={`p-3 rounded-lg border flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200 ${
                    verificationResult.passed
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {verificationResult.passed ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs">
                      {verificationResult.passed ? 'Challenge Complete!' : 'Verification Failed'}
                    </div>
                    <div className="text-[11px] leading-relaxed">{verificationResult.details}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
