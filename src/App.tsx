// App.tsx
import React, { useRef, useEffect, useState } from 'react';
import './App.css';

interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Keys {
  left: boolean;
  right: boolean;
  space: boolean;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 40;
const ENEMY_SIZE = 10;
const BULLET_SIZE = 5;
const BULLET_SPEED = 7;
const PLAYER_SPEED = 5;
const ENEMY_SPEED = 2;

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const keys = useRef<Keys>({ left: false, right: false, space: false });

  // Game state
  const player = useRef<Entity>({
    x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
    y: CANVAS_HEIGHT - 60,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
  });

  const [bullets, setBullets] = useState<Entity[]>([]);
  const [enemies, setEnemies] = useState<Entity[]>(
    Array.from({ length: 5 }, (_, i) =>
      Array.from({ length: 10 }, (_, j) => ({
        x: 50 + j * 60,
        y: 50 + i * 50,
        width: ENEMY_SIZE,
        height: ENEMY_SIZE,
      }))
    ).flat()
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keys.current.left = true;
      if (e.key === 'ArrowRight') keys.current.right = true;
      if (e.key === ' ') keys.current.space = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keys.current.left = false;
      if (e.key === 'ArrowRight') keys.current.right = false;
      if (e.key === ' ') keys.current.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      if (gameOver) return;

      const p = player.current;

      // Update player position
      if (keys.current.left && p.x > 0) p.x -= PLAYER_SPEED;
      if (keys.current.right && p.x < CANVAS_WIDTH - PLAYER_SIZE) p.x += PLAYER_SPEED;

      // Shoot bullets
      if (keys.current.space) {
        setBullets(prev => [
          ...prev,
          {
            x: p.x + PLAYER_SIZE / 2 - BULLET_SIZE / 2,
            y: p.y,
            width: BULLET_SIZE,
            height: BULLET_SIZE,
          },
        ]);
        keys.current.space = false;
      }

      // Update bullets
      setBullets(prev =>
        prev
          .map(bullet => ({ ...bullet, y: bullet.y - BULLET_SPEED }))
          .filter(bullet => bullet.y > 0)
      );

      // Update enemies
      setEnemies(prev => {
        let moveDown = false;
        const updatedEnemies = prev.map(enemy => {
          const newX = enemy.x + ENEMY_SPEED;
          if (newX + ENEMY_SIZE > CANVAS_WIDTH || newX < 0) moveDown = true;
          return { ...enemy, x: newX };
        });

        if (moveDown) {
          return updatedEnemies.map(enemy => ({
            ...enemy,
            y: enemy.y + 20,
            x: enemy.x - ENEMY_SPEED * 2,
          }));
        }

        return updatedEnemies;
      });

      // Collision detection
      setEnemies(prevEnemies => {
        const newEnemies = [...prevEnemies];
        setBullets(prevBullets => {
          const newBullets = [...prevBullets];
          for (let b = 0; b < prevBullets.length; b++) {
            for (let e = 0; e < prevEnemies.length; e++) {
              const bullet = prevBullets[b];
              const enemy = prevEnemies[e];
              if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
              ) {
                newEnemies.splice(e, 1);
                newBullets.splice(b, 1);
                setScore(prev => prev + 10);
                break;
              }
            }
          }
          return newBullets;
        });
        return newEnemies;
      });

      // Check for game over
      enemies.forEach(enemy => {
        if (enemy.y + enemy.height > p.y) {
          setGameOver(true);
        }
      });

      // Draw everything
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw player
      ctx.fillStyle = 'blue';
      ctx.fillRect(p.x, p.y, p.width, p.height);

      // Draw enemies
      ctx.fillStyle = 'red';
      enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x + ENEMY_SIZE / 2, enemy.y + ENEMY_SIZE / 2, ENEMY_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw bullets
      ctx.fillStyle = 'white';
      bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      });

      // Draw score
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 10, 20);

      requestAnimationFrame(gameLoop);
    };

    const animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameOver, enemies, bullets, score]);

  const handleRestart = () => {
    setGameOver(false);
    setScore(0);
    setEnemies(
      Array.from({ length: 5 }, (_, i) =>
        Array.from({ length: 10 }, (_, j) => ({
          x: 50 + j * 60,
          y: 50 + i * 50,
          width: ENEMY_SIZE,
          height: ENEMY_SIZE,
        }))
      ).flat()
    );
    setBullets([]);
    player.current.x = CANVAS_WIDTH / 2 - PLAYER_SIZE / 2;
  };

  return (
    <div className="game-container">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      {gameOver && (
        <div className="game-over">
          <h1>Game Over</h1>
          <p>Score: {score}</p>
          <button onClick={handleRestart}>Restart</button>
        </div>
      )}
    </div>
  );
};

export default App;
