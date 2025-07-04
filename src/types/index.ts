export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Keys {
  left: boolean;
  right: boolean;
  space: boolean;
}

export interface Enemy extends Entity {
  state: 'spawning' | 'normal' | 'hit';
  /** current animation frame index */
  frame: number;
  /** sprite sheet row used for current animation */
  row: number;
  /** timestamp when the next frame should be shown */
  nextFrameTime: number;
  /** opacity used when fading out */
  opacity: number;
}
