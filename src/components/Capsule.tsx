import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Entity, Keys, Player } from '../types';

export interface CapsuleHandles {
  update: (keys: React.MutableRefObject<Keys>, canvasWidth: number) => void;
  draw: (ctx: CanvasRenderingContext2D, image: HTMLImageElement) => void;
  reset: (x: number, y: number) => void;
  bullets: React.MutableRefObject<Entity[]>;
  player: React.MutableRefObject<Player>;
}

const PLAYER_SIZE = 64;
const BULLET_SIZE = 5;
const BULLET_SPEED = 7;
const PLAYER_SPEED = 5;
const PLAYER_FIRE_FRAME_DURATION = 250 / 4;
const PLAYER_SPRITE_SIZE = 64;
const FIRING_SEQUENCE = [1, 2, 3, 0];

export const Capsule = forwardRef<CapsuleHandles>((_, ref) => {
  const player = useRef<Player>({
    x: 0,
    y: 0,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    frame: 0,
    row: 0,
    mode: 0,
    nextFrameTime: 0,
    firing: false,
    firingStep: 0,
  });

  const bullets = useRef<Entity[]>([]);

  useImperativeHandle(ref, () => ({
    update(keys: React.MutableRefObject<Keys>, canvasWidth: number) {
      const p = player.current;
      const now = performance.now();
      p.row = p.mode;
      if (keys.current.left && p.x > 0) p.x -= PLAYER_SPEED;
      if (keys.current.right && p.x < canvasWidth - p.width) p.x += PLAYER_SPEED;

      if (keys.current.space) {
        bullets.current.push({
          x: p.x + p.width / 2 - BULLET_SIZE / 2,
          y: p.y,
          width: BULLET_SIZE,
          height: BULLET_SIZE,
        });
        if (!p.firing) {
          p.firing = true;
          p.row = p.mode;
          p.frame = FIRING_SEQUENCE[0];
          p.firingStep = 0;
          p.nextFrameTime = now + PLAYER_FIRE_FRAME_DURATION;
        }
        keys.current.space = false;
      }

      bullets.current = bullets.current
        .map((b) => ({ ...b, y: b.y - BULLET_SPEED }))
        .filter((b) => b.y > 0);

      if (p.firing && now >= p.nextFrameTime) {
        p.firingStep += 1;
        if (p.firingStep >= FIRING_SEQUENCE.length) {
          p.firing = false;
          p.frame = 0;
        } else {
          p.frame = FIRING_SEQUENCE[p.firingStep];
          p.nextFrameTime = now + PLAYER_FIRE_FRAME_DURATION;
        }
      }
    },
    draw(ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
      const p = player.current;
      if (image.complete) {
        const sx = p.frame * PLAYER_SPRITE_SIZE;
        const sy = p.row * PLAYER_SPRITE_SIZE;
        ctx.drawImage(
          image,
          sx,
          sy,
          PLAYER_SPRITE_SIZE,
          PLAYER_SPRITE_SIZE,
          p.x,
          p.y,
          PLAYER_SIZE,
          PLAYER_SIZE,
        );
      } else {
        ctx.fillStyle = 'blue';
        ctx.fillRect(p.x, p.y, p.width, p.height);
      }

      ctx.fillStyle = 'white';
      bullets.current.forEach((b) => ctx.fillRect(b.x, b.y, b.width, b.height));
    },
    reset(x: number, y: number) {
      bullets.current = [];
      player.current.x = x;
      player.current.y = y;
      player.current.frame = 0;
      player.current.row = 0;
      player.current.mode = 0;
      player.current.firing = false;
      player.current.firingStep = 0;
      player.current.nextFrameTime = 0;
    },
    bullets,
    player,
  }));

  return null;
});

Capsule.displayName = 'Capsule';
