import { Container } from './engine/container';
import { Mouse } from './engine/mouse';

export class Scene extends Container {
    public update(tick: number, mouse: Mouse): void {
        super.update(tick, mouse);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
        super.draw(ctx);
    }
}