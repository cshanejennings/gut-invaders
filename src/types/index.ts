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

export interface Player extends Entity {
  /** current animation frame index */
  frame: number;
  /** sprite sheet row used for current animation */
  row: number;
  /** selected sprite sheet row set by game mode */
  mode: number;
  /** timestamp when the next frame should be shown */
  nextFrameTime: number;
  /** true if the firing animation is active */
  firing: boolean;
  /** how many animation steps have played in the current firing cycle */
  firingStep: number;
}
