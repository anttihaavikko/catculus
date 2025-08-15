import { COLORS } from './colors';
import { Container } from './engine/container';
import { drawCircle } from './engine/drawing';
import { quadEaseInOut } from './engine/easings';
import { Game } from './engine/game';
import { clamp01, lerp } from './engine/math';
import { Mouse } from './engine/mouse';
import { random } from './engine/random';
import { TextEntity } from './engine/text';
import { ZERO } from './engine/vector';

export class Target extends Container {
    public value: number = 0;
    
    private text: TextEntity;
    private angle = 0;
    private targetAngle = Math.random() * Math.PI;
    private phase: number = 0;

    constructor(game: Game, x: number, y: number) {
        super(game, x, y);
        this.animationSpeed = 0.002;
        this.text = new TextEntity(game, '', 40, 0, 13, -1, ZERO, { shadow: 3, align: 'center' });
        this.add(this.text);
    }
    
    public set(val: number): void {
        this.value = val;
        this.text.content = this.value.toString();
        this.angle = this.targetAngle;
        this.targetAngle += random(-1.5, 1.5);
        this.phase = 0;
    }

    public update(tick: number, mouse: Mouse): void {
        super.update(tick, mouse);
        this.phase = clamp01(this.phase + this.delta * 0.001);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        const a = lerp(this.angle, this.targetAngle, quadEaseInOut(this.phase));
        ctx.save();
        ctx.translate(this.p.x, this.p.y);
        ctx.rotate(a);
        ctx.scale(1 + this.animationPhaseAbs * 0.05, 1 + this.animationPhaseAbs * 0.05);
        ctx.lineWidth = 10;
        const col = COLORS.dark;
        drawCircle(ctx, { x: 0, y: 0 }, 50, 'transparent', col);

        const max = 70;
        const min = 35;

        ctx.beginPath();
        ctx.moveTo(min, 0);
        ctx.lineTo(max, 0);
        ctx.moveTo(-min, 0);
        ctx.lineTo(-max, 0);
        ctx.moveTo(0, min);
        ctx.lineTo(0, max);
        ctx.moveTo(0, -min);
        ctx.lineTo(0, -max);
        ctx.lineWidth = 25;
        ctx.strokeStyle = COLORS.bg;
        ctx.stroke();
        ctx.lineWidth = 10;
        ctx.strokeStyle = col;
        ctx.stroke();

        ctx.rotate(-a);

        super.draw(ctx);
        ctx.restore();
    }
}