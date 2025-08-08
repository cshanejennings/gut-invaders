import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Enemy, Entity } from '../types';
import { generateEnemies, levelOneFormation } from '../utils/enemyFormation';
import { isColliding } from '../utils/collision';

export interface InvadersHandles {
  update: (bullets: React.MutableRefObject<Entity[]>, canvasWidth: number) => void;
  draw: (ctx: CanvasRenderingContext2D, image: HTMLImageElement) => void;
  reset: () => void;
  enemies: React.MutableRefObject<Enemy[]>;
  score: React.MutableRefObject<number>;
}

const ENEMY_SIZE = 48;
const ENEMY_SPEED_INITIAL = 2;
const ENEMY_SPEED_INCREMENT = 0.5;
const SPAWN_FRAME_DURATION = 100;
const NORMAL_FRAME_DURATION = 200;
const HIT_FRAME_DURATION = 60;
const SPRITE_SIZE = 48;

export const Invaders = forwardRef<InvadersHandles>((_, ref) => {
  const enemies = useRef<Enemy[]>(
    generateEnemies(levelOneFormation, 10, 60, 50, 50, 50, ENEMY_SIZE),
  );
  const direction = useRef<1 | -1>(1);
  const enemySpeed = useRef(ENEMY_SPEED_INITIAL);
  const score = useRef(0);

  useImperativeHandle(ref, () => ({
    update(bullets: React.MutableRefObject<Entity[]>, canvasWidth: number) {
      let moveDown = false;
      for (const e of enemies.current) {
        const nextX = e.x + enemySpeed.current * direction.current;
        if (nextX + ENEMY_SIZE > canvasWidth || nextX < 0) {
          moveDown = true;
          break;
        }
      }

      if (moveDown) {
        direction.current *= -1;
        enemies.current = enemies.current.map((e) => ({ ...e, y: e.y + 20 }));
      } else {
        enemies.current = enemies.current.map((e) => ({
          ...e,
          x: e.x + enemySpeed.current * direction.current,
        }));
      }

      const remaining: Enemy[] = [];
      const now = performance.now();

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
              continue;
            }
            enemy.nextFrameTime = now + HIT_FRAME_DURATION;
          }
        }

        remaining.push(enemy);
      }
      enemies.current = remaining;

      if (enemies.current.length === 0) {
        enemySpeed.current += ENEMY_SPEED_INCREMENT;
        enemies.current = generateEnemies(
          levelOneFormation,
          10,
          60,
          50,
          50,
          50,
          ENEMY_SIZE,
        );
        bullets.current = [];
        direction.current = 1;
      }
    },
    draw(ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
      enemies.current.forEach((e) => {
        if (image.complete) {
          const sx = e.frame * SPRITE_SIZE;
          const sy = e.row * SPRITE_SIZE;
          ctx.save();
          ctx.globalAlpha = e.opacity;
          ctx.drawImage(
            image,
            sx,
            sy,
            SPRITE_SIZE,
            SPRITE_SIZE,
            e.x,
            e.y,
            ENEMY_SIZE,
            ENEMY_SIZE,
          );
          ctx.restore();
        } else {
          ctx.fillStyle = 'red';
          ctx.fillRect(e.x, e.y, e.width, e.height);
        }
      });
    },
    reset() {
      enemies.current = generateEnemies(
        levelOneFormation,
        10,
        60,
        50,
        50,
        50,
        ENEMY_SIZE,
      );
      enemySpeed.current = ENEMY_SPEED_INITIAL;
      direction.current = 1;
      score.current = 0;
    },
    enemies,
    score,
  }));

  return null;
});

Invaders.displayName = 'Invaders';
