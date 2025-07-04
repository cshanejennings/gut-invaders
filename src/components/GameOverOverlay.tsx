import React from 'react';

interface GameOverOverlayProps {
  score: number;
  onRestart: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ score, onRestart }) => (
  <div className="game-over">
    <h1>Game Over</h1>
    <p>Score: {score}</p>
    <button onClick={onRestart}>Restart</button>
  </div>
);
