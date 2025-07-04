// App.tsx
import React, { useRef, useEffect, useState } from "react";
import "./App.css";

import { Canvas } from "./components/Canvas";
import { GameOverOverlay } from "./components/GameOverOverlay";
import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { generateEnemies } from "./utils/enemyFormation";
import { isColliding } from "./utils/collision";
import { Entity, Enemy, Player } from "./types";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 64;
// Each alien sprite frame is 48x48, so draw and collide at the same size
const ENEMY_SIZE = 48;
const BULLET_SIZE = 5;
const BULLET_SPEED = 7;
const PLAYER_SPEED = 5;
const ENEMY_SPEED_INITIAL = 2;
const ENEMY_SPEED_INCREMENT = 0.5;

const SPRITE_SIZE = 48;
const PLAYER_SPRITE_SIZE = 64;
const PLAYER_FIRE_FRAME_DURATION = 50; // 250ms over 5 frames
const SPAWN_FRAME_DURATION = 100; // 500ms over 5 frames
const NORMAL_FRAME_DURATION = 200; // 5 fps
const HIT_FRAME_DURATION = 60; // 300ms over 5 frames

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = useKeyboardControls();

  const [gameOver, setGameOver] = useState(false);

  const bullets = useRef<Entity[]>([]);
  const enemies = useRef<Enemy[]>(
    generateEnemies(5, 10, 60, 50, 50, 50, ENEMY_SIZE)
  );
  const direction = useRef<1 | -1>(1);
  const enemySpeed = useRef(ENEMY_SPEED_INITIAL);

  const score = useRef(0);

  const player = useRef<Player>({
    x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
    y: CANVAS_HEIGHT - 60,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    frame: 0,
    row: 0,
    nextFrameTime: 0,
    firing: false,
    firingStep: 0,
  });

  useEffect(() => {
    if (gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const invaderImage = new Image();
    invaderImage.src = "/assets/alien-sprite.png";

    const playerImage = new Image();
    playerImage.src = "/assets/capsule-sprite.png";

    let imageLoaded = false;
    let loaded = 0;
    const handleLoad = () => {
      loaded += 1;
      if (loaded === 2) imageLoaded = true;
    };
    invaderImage.onload = handleLoad;
    playerImage.onload = handleLoad;

    let frameId: number;

    const gameLoop = () => {
      const p = player.current;
      const now = performance.now();

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
        if (!p.firing) {
          p.firing = true;
          p.row = 1;
          p.frame = 0;
          p.firingStep = 0;
          p.nextFrameTime = now + PLAYER_FIRE_FRAME_DURATION;
        }
        keys.current.space = false;
      }

      // Update bullets
      bullets.current = bullets.current
        .map((b) => ({ ...b, y: b.y - BULLET_SPEED }))
        .filter((b) => b.y > 0);

      // Update player firing animation
      if (p.firing && now >= p.nextFrameTime) {
        p.frame = (p.frame + 1) % 4;
        p.firingStep += 1;
        if (p.firingStep >= 4) {
          p.firing = false;
          p.row = 0;
          p.frame = 0;
        } else {
          p.nextFrameTime = now + PLAYER_FIRE_FRAME_DURATION;
        }
      }

      // Update enemies
      let moveDown = false;
      for (const e of enemies.current) {
        const nextX = e.x + enemySpeed.current * direction.current;
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
          x: e.x + enemySpeed.current * direction.current,
        }));
      }

      // Update enemy state and handle collisions/animation
      const remainingEnemies: Enemy[] = [];
      for (const enemy of enemies.current) {
        if (enemy.state !== 'hit') {
          bullets.current = bullets.current.filter((b) => {
            if (isColliding(b, enemy)) {
              score.current += 10;
              enemy.state = 'hit';
              enemy.row = 1;
              enemy.frame = 0;
              enemy.opacity = 1;
              enemy.nextFrameTime = now + HIT_FRAME_DURATION;
              return false;
            }
            return true;
          });
        }

        if (now >= enemy.nextFrameTime) {
          if (enemy.state === 'spawning') {
            enemy.frame += 1;
            if (enemy.frame >= 5) {
              enemy.state = 'normal';
              enemy.row = 0;
              enemy.frame = Math.floor(Math.random() * 5);
              enemy.nextFrameTime = now + NORMAL_FRAME_DURATION;
            } else {
              enemy.nextFrameTime = now + SPAWN_FRAME_DURATION;
            }
          } else if (enemy.state === 'normal') {
            enemy.frame = (enemy.frame + 1) % 5;
            enemy.nextFrameTime = now + NORMAL_FRAME_DURATION;
          } else if (enemy.state === 'hit') {
            enemy.frame += 1;
            enemy.opacity = 1 - enemy.frame / 5;
            if (enemy.frame >= 5) {
              continue; // remove enemy
            }
            enemy.nextFrameTime = now + HIT_FRAME_DURATION;
          }
        }

        remainingEnemies.push(enemy);
      }
      enemies.current = remainingEnemies;

      if (enemies.current.length === 0) {
        enemySpeed.current += ENEMY_SPEED_INCREMENT;
        enemies.current = generateEnemies(
          5,
          10,
          60,
          50,
          50,
          50,
          ENEMY_SIZE
        );
        bullets.current = [];
        direction.current = 1;
      }

      // Game over check
      if (enemies.current.some((e) => e.y + e.height > p.y)) {
        setGameOver(true);
        return;
      }

      // Draw
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Player
      if (imageLoaded) {
        const sx = p.frame * PLAYER_SPRITE_SIZE;
        const sy = p.row * PLAYER_SPRITE_SIZE;
        ctx.drawImage(
          playerImage,
          sx,
          sy,
          PLAYER_SPRITE_SIZE,
          PLAYER_SPRITE_SIZE,
          p.x,
          p.y,
          PLAYER_SIZE,
          PLAYER_SIZE
        );
      } else {
        ctx.fillStyle = "blue";
        ctx.fillRect(p.x, p.y, p.width, p.height);
      }

      // Enemies (use image or fallback)
      enemies.current.forEach((e) => {
        if (imageLoaded) {
          const sx = e.frame * SPRITE_SIZE;
          const sy = e.row * SPRITE_SIZE;
          ctx.save();
          ctx.globalAlpha = e.opacity;
          ctx.drawImage(
            invaderImage,
            sx,
            sy,
            SPRITE_SIZE,
            SPRITE_SIZE,
            e.x,
            e.y,
            ENEMY_SIZE,
            ENEMY_SIZE
          );
          ctx.restore();
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
  }, [keys, gameOver]);

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
    enemySpeed.current = ENEMY_SPEED_INITIAL;
    direction.current = 1;
    score.current = 0;
    player.current.x = CANVAS_WIDTH / 2 - PLAYER_SIZE / 2;
    player.current.y = CANVAS_HEIGHT - 60;
    player.current.frame = 0;
    player.current.row = 0;
    player.current.firing = false;
    player.current.firingStep = 0;
    player.current.nextFrameTime = 0;
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
