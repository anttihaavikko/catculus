import { drawEllipse } from './engine/drawing';
import { quadEaseIn, quadEaseInOut } from './engine/easings';
import { Entity } from './engine/entity';
import { Face } from './engine/face';
import { Game } from './engine/game';
import { Mouse } from './engine/mouse';
import { random } from './engine/random';
import { Vector } from './engine/vector';

export class Cat extends Entity {
    private face: Face;
    
    constructor(game: Game, x: number, y: number) {
        super(game, x, y, 0, 0);
        this.animationSpeed = 0.003;
        this.face = new Face(game, { width: 0.8, animal: true });
        this.d = 100;
        this.tween.setEase(quadEaseInOut);
        this.animationSpeed *= random(0.8, 1.2);
    }

    public update(tick: number, mouse: Mouse): void {
        super.update(tick, mouse);
        this.face.update(tick, mouse);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.p.x, this.p.y);
        drawEllipse(ctx, { x: 0, y: 1 }, 17, 5, '#00000055');
        ctx.strokeStyle = '#000';
        ctx.lineCap = 'round';

        const air = quadEaseIn(Math.sin(this.tween.time * Math.PI));

        ctx.translate(0, air * -40);
        
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
        
        // body
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.translate(0, -10 - this.animationPhaseAbs * 3 - air * 5);
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.stroke();

        ctx.translate(this.animationPhase * 2, 0);

        // tail
        ctx.lineWidth = 5;
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-this.animationPhase * 25, -5, -this.animationPhase * 12, -20 - this.animationPhaseAbs * 5);
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

        ctx.translate(0, -2 - this.animationPhaseAbs  - air * 3);
        ctx.scale(0.13, 0.13);
        this.face.draw(ctx, false);
        
        ctx.restore();
    }

    public hop(to: Vector): void {
        this.tween.move(to, 0.4);
        this.game.audio.jump();
    }
}