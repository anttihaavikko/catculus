
import { Container } from './engine/container';
import { Game } from './engine/game';
import { clamp01 } from './engine/math';
import { Mouse } from './engine/mouse';
import { TextEntity } from './engine/text';
import { ZERO } from './engine/vector';

export class Multiplier extends Container {
    public value: number;
    public paused: boolean;
    
    private text: TextEntity;
    private ratio: number = 0;

    constructor(game: Game, x: number, y: number) {
        super(game, x, y);
        this.animationSpeed = 0.002;
        this.text = new TextEntity(game, 'foo', 40, 25, 13, -1, ZERO, { shadow: 3, align: 'right' });
        this.add(this.text);
    }
    
    public reset(val: number): void {
        this.value = val;
        this.text.content = `x${this.value}`;
    }

    public update(tick: number, mouse: Mouse): void {
        super.update(tick, mouse);

        if (this.paused) return;

        this.ratio = clamp01(this.ratio + this.delta * 0.00025);

        if (this.ratio > 0.99 && this.value > 1) {
            this.reset(this.value - 1);
            this.ratio = 0;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.p.x, this.p.y);

        if (this.value > 1) {
            ctx.beginPath();
            ctx.fillStyle = '#000';
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, 28, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * this.ratio, true);
            ctx.closePath();
            ctx.fill();
        }

        super.draw(ctx);
        ctx.restore();
    }
}