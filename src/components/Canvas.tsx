import React from 'react';

interface CanvasProps {
  width: number;
  height: number;
}

// ✅ forward the ref directly to the <canvas>
export const Canvas = React.forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ width, height }, ref) => (
    <canvas ref={ref} width={width} height={height} />
  )
);

Canvas.displayName = 'Canvas';
