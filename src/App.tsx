// App.tsx
import React, { useRef, useEffect, useState } from "react";
import "./App.css";

import { Canvas } from "./components/Canvas";
import { GameOverOverlay } from "./components/GameOverOverlay";
import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { generateEnemies } from "./utils/enemyFormation";
import { isColliding } from "./utils/collision";
import { Entity } from "./types";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 40;
const ENEMY_SIZE = 75;
const BULLET_SIZE = 5;
const BULLET_SPEED = 7;
const PLAYER_SPEED = 5;
const ENEMY_SPEED = 2;

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = useKeyboardControls();

  const [gameOver, setGameOver] = useState(false);
  const [visibleScore, setVisibleScore] = useState(0);

  const bullets = useRef<Entity[]>([]);
  const enemies = useRef<Entity[]>(
    generateEnemies(5, 10, 60, 50, 50, 50, ENEMY_SIZE)
  );
  const direction = useRef<1 | -1>(1);

  const score = useRef(0);

  const player = useRef<Entity>({
    x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
    y: CANVAS_HEIGHT - 60,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const invaderImage = new Image();
    invaderImage.src = "/assets/invader1.svg";
    let imageLoaded = false;
    invaderImage.onload = () => {
      imageLoaded = true;
    };

    let frameId: number;

    const gameLoop = () => {
      const p = player.current;

      // Movement
      if (keys.current.left && p.x > 0) p.x -= PLAYER_SPEED;
      if (keys.current.right && p.x < CANVAS_WIDTH - p.width)
        p.x += PLAYER_SPEED;

      // Shoot
      if (keys.current.space) {
        bullets.current.push({
          x: p.x + p.width / 2 - BULLET_SIZE / 2,
          y: p.y,
          width: BULLET_SIZE,
          height: BULLET_SIZE,
        });
        keys.current.space = false;
      }

      // Update bullets
      bullets.current = bullets.current
        .map((b) => ({ ...b, y: b.y - BULLET_SPEED }))
        .filter((b) => b.y > 0);

      // Update enemies
      let moveDown = false;
      for (const e of enemies.current) {
        const nextX = e.x + ENEMY_SPEED * direction.current;
        if (nextX + ENEMY_SIZE > CANVAS_WIDTH || nextX < 0) {
          moveDown = true;
          break;
        }
      }

      if (moveDown) {
        direction.current *= -1;
        enemies.current = enemies.current.map((e) => ({
          ...e,
          y: e.y + 20,
        }));
      } else {
        enemies.current = enemies.current.map((e) => ({
          ...e,
          x: e.x + ENEMY_SPEED * direction.current,
        }));
      }

      // Collision detection
      const remainingEnemies: Entity[] = [];
      for (const enemy of enemies.current) {
        let hit = false;
        bullets.current = bullets.current.filter((b) => {
          if (!hit && isColliding(b, enemy)) {
            score.current += 10;
            setVisibleScore(score.current);
            hit = true;
            return false;
          }
          return true;
        });
        if (!hit) remainingEnemies.push(enemy);
      }
      enemies.current = remainingEnemies;

      // Game over check
      if (enemies.current.some((e) => e.y + e.height > p.y)) {
        setGameOver(true);
        return;
      }

      // Draw
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Player
      ctx.fillStyle = "blue";
      ctx.fillRect(p.x, p.y, p.width, p.height);

      // Enemies (use image or fallback)
      enemies.current.forEach((e) => {
        if (imageLoaded) {
          // ctx.drawImage(invaderImage, e.x, e.y, e.width, e.height);
          const scale = ENEMY_SIZE / invaderImage.width;
          ctx.drawImage(invaderImage, e.x, e.y, ENEMY_SIZE * scale, ENEMY_SIZE * scale);
        } else {
          ctx.fillStyle = "red";
          ctx.fillRect(e.x, e.y, e.width, e.height);
        }
      });

      // Bullets
      ctx.fillStyle = "white";
      bullets.current.forEach((b) =>
        ctx.fillRect(b.x, b.y, b.width, b.height)
      );

      // Score
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText(`Score: ${score.current}`, 10, 20);

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(frameId);
  }, [keys]);

  const handleRestart = () => {
    setGameOver(false);
    bullets.current = [];
    enemies.current = generateEnemies(
      5,
      10,
      60,
      50,
      50,
      50,
      ENEMY_SIZE
    );
    score.current = 0;
    setVisibleScore(0);
    player.current.x = CANVAS_WIDTH / 2 - PLAYER_SIZE / 2;
  };

  return (
    <div className="game-container">
      <Canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      {gameOver && (
        <GameOverOverlay score={score.current} onRestart={handleRestart} />
      )}
    </div>
  );
};

export default App;
