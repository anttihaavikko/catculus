import { drawEllipse } from './engine/drawing';
import { Entity } from './engine/entity';
import { Face } from './engine/face';
import { Game } from './engine/game';
import { Mouse } from './engine/mouse';
import { Vector } from './engine/vector';

export class Cat extends Entity {
    private face: Face;
    
    constructor(game: Game, x: number, y: number) {
        super(game, x, y, 0, 0);
        this.animationSpeed = 0.003;
        this.face = new Face(game, { width: 0.8, animal: true });
        this.d = 100;
    }

    public update(tick: number, mouse: Mouse): void {
        super.update(tick, mouse);
        this.face.update(tick, mouse);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.p.x, this.p.y);
        drawEllipse(ctx, { x: 0, y: 0 }, 15, 7, '#00000033');
        ctx.strokeStyle = '#000';
        ctx.lineCap = 'round';
        
        const drawLeg = (pos: number) => {
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pos, -10 - this.animationPhaseAbs * 6);
            ctx.quadraticCurveTo(pos * 1.3, -1, pos, 1);
            ctx.stroke();
        };

        drawLeg(10);
        drawLeg(-10);
        drawLeg(7);
        drawLeg(-7);
        
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.translate(0, -10 - this.animationPhaseAbs * 3);
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.stroke();

        ctx.translate(this.animationPhase * 2, 0);

        // tail
        ctx.lineWidth = 5;
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-this.animationPhase * 25, -5, -this.animationPhase * 12, -20);
        ctx.stroke();
        
        const drawEar = (dir: number) => {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(dir * 7, -15);
            ctx.lineTo(dir * 5 - 5, 0);
            ctx.lineTo(dir * 5 + 5, 0);
            ctx.fill();
        };

        drawEar(-1);
        drawEar(1);

        ctx.translate(0, -2 - this.animationPhaseAbs);
        ctx.scale(0.13, 0.13);
        this.face.draw(ctx, false);
        
        ctx.restore();
    }

    public hop(to: Vector): void {
        this.tween.move(to, 0.3);
    }
}