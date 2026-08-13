import { useState, useCallback } from 'react';
import { CircuitComponent, Wire } from '../types';

export interface CircuitHistoryState {
  components: CircuitComponent[];
  wires: Wire[];
}

export function useCircuitHistory(initialState: CircuitHistoryState) {
  const [history, setHistory] = useState<CircuitHistoryState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pushHistory = useCallback((state: CircuitHistoryState) => {
    setHistory((prev) => {
      // If we're not at the end of the history, slice off the future states
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({
        // Deep clone to prevent reference mutation bugs
        components: JSON.parse(JSON.stringify(state.components)),
        wires: JSON.parse(JSON.stringify(state.wires))
      });
      // Limit history to 50 items to prevent memory leaks
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory; // length is 50
      }
      return newHistory;
    });
    // Set to previous + 1, or max 49 (since index is length - 1)
    setCurrentIndex((prev) => (prev >= 49 ? 49 : prev + 1));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const resetHistory = useCallback((state: CircuitHistoryState) => {
    setHistory([{
      components: JSON.parse(JSON.stringify(state.components)),
      wires: JSON.parse(JSON.stringify(state.wires))
    }]);
    setCurrentIndex(0);
  }, []);

  return {
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory
  };
}
