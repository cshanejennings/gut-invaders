import React, { useRef, useEffect, useState } from 'react';
import './App.css';

import { Canvas } from './components/Canvas';
import { GameOverOverlay } from './components/GameOverOverlay';
import { Capsule, CapsuleHandles } from './components/Capsule';
import { Invaders, InvadersHandles } from './components/Invaders';
import { useKeyboardControls } from './hooks/useKeyboardControls';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const capsuleRef = useRef<CapsuleHandles>(null);
  const invadersRef = useRef<InvadersHandles>(null);
  const keys = useKeyboardControls();

  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas || !capsuleRef.current || !invadersRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const invaderImage = new Image();
    invaderImage.src = '/assets/alien-sprite.png';

    const playerImage = new Image();
    playerImage.src = '/assets/capsule-sprite.png';

    let frameId: number;

    const gameLoop = () => {
      capsuleRef.current!.update(keys, CANVAS_WIDTH);
      invadersRef.current!.update(capsuleRef.current!.bullets, CANVAS_WIDTH);

      const playerY = capsuleRef.current!.player.current.y;
      if (
        invadersRef.current!.enemies.current.some(
          (e) => e.y + e.height > playerY,
        )
      ) {
        setGameOver(true);
        return;
      }

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      capsuleRef.current!.draw(ctx, playerImage);
      invadersRef.current!.draw(ctx, invaderImage);

      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${invadersRef.current!.score.current}`, 10, 20);

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(frameId);
  }, [keys, gameOver]);

  const handleRestart = () => {
    setGameOver(false);
    capsuleRef.current?.reset(CANVAS_WIDTH / 2 - 64 / 2, CANVAS_HEIGHT - 60);
    invadersRef.current?.reset();
  };

  return (
    <div className="game-container">
      <Canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      <Capsule ref={capsuleRef} />
      <Invaders ref={invadersRef} />
      {gameOver && (
        <GameOverOverlay
          score={invadersRef.current?.score.current ?? 0}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default App;
