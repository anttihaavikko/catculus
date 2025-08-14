import { COLORS } from './colors';

export const drawBg = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(-100, -100, ctx.canvas.width + 200, ctx.canvas.height + 200);
};