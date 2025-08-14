import { Entity } from './engine/entity';

export class Life extends Entity {
    private amount: number = 9;

    public change(amount: number): void {
        this.amount += amount;
    }

    public isDead(): boolean {
        return this.amount <= 0;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.lineWidth = 2;
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#fff';
        ctx.translate(this.p.x, this.p.y);
        ctx.beginPath();
        ctx.rect(0, 0, this.s.x, this.s.y);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = '#fff';
        const inset = 6;
        ctx.translate(inset, inset);
        ctx.scale(Math.max(0, this.amount / 9), 1);
        ctx.rect(0, 0, this.s.x - inset * 2, this.s.y - inset * 2);
        ctx.fill();

        ctx.restore();
    }
}