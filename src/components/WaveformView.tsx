import React from 'react';
import { WaveformPoint } from '../types';
import { TimingDiagram, SignalInfo } from './TimingDiagram';

interface WaveformViewProps {
  waveformHistory: WaveformPoint[];
  signals: SignalInfo[];
  onClearHistory: () => void;
}

export const WaveformView: React.FC<WaveformViewProps> = ({
  waveformHistory,
  signals,
  onClearHistory,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden select-none animate-in fade-in duration-200">
      <TimingDiagram
        waveformHistory={waveformHistory}
        signals={signals}
        onClearHistory={onClearHistory}
        onClose={() => {}}
      />
    </div>
  );
};
