import { font } from './engine/constants';
import { Entity } from './engine/entity';
import { Game } from './engine/game';
import { TextEntity } from './engine/text';
import { ZERO } from './engine/vector';

export class Life extends Entity {
    private amount: number = 9;
    private text: TextEntity;

    constructor(game: Game, x: number, y: number, w: number, h: number) {
        super(game, x, y, w, h);
        this.text = new TextEntity(game, 'LIVES:', 15, 0, 15, -1, ZERO, { shadow: 3, align: 'left' });
    }

    public change(amount: number): void {
        this.amount += amount;
    }

    public isDead(): boolean {
        return this.amount <= 0;
    }

    public changeSize(portrait: boolean): void {
        this.s = portrait ? { x: 380 - 65, y: 20 } : { x: 200, y: 20 };
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.lineWidth = 2;
        ctx.translate(this.p.x, this.p.y);
        
        this.text.draw(ctx);

        ctx.translate(65, 0);

        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#fff';
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