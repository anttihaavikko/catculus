
import { Container } from './engine/container';
import { Game } from './engine/game';
import { clamp01 } from './engine/math';
import { Mouse } from './engine/mouse';
import { Pulser } from './engine/pulser';
import { TextEntity } from './engine/text';
import { ZERO } from './engine/vector';

export class Multiplier extends Container {
    public value: number;
    public paused: boolean;
    
    private text: TextEntity;
    private ratio: number = 0;
    private pulser = new Pulser();

    constructor(game: Game, x: number, y: number) {
        super(game, x, y);
        this.animationSpeed = 0.002;
        this.text = new TextEntity(game, 'foo', 40, 25, 13, -1, ZERO, { shadow: 3, align: 'right' });
        this.add(this.text);
    }
    
    public reset(val: number): void {
        this.ratio = 0;
        this.value = val;
        this.text.content = `x${this.value}`;
        this.pulser.pulse();
    }

    public update(tick: number, mouse: Mouse): void {
        super.update(tick, mouse);
        this.pulser.update(this.delta * 0.0075);

        if (this.paused) return;

        this.ratio = clamp01(this.ratio + this.delta * 0.00025);

        if (this.ratio > 0.99 && this.value > 1) {
            this.reset(this.value - 1);
            this.ratio = 0;
            this.game.audio.multi();
            this.pulser.pulse();
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.p.x, this.p.y);
        ctx.scale(1 + this.pulser.ratio * 0.2, 1 + this.pulser.ratio * 0.2);

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