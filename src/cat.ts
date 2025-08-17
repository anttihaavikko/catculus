import { drawEllipse } from './engine/drawing';
import { quadEaseIn, quadEaseInOut } from './engine/easings';
import { Entity } from './engine/entity';
import { Face } from './engine/face';
import { Game } from './engine/game';
import { clamp01 } from './engine/math';
import { Mouse } from './engine/mouse';
import { random } from './engine/random';
import { Vector } from './engine/vector';

export const catPathLandscape: Vector[] = [
    { x: 900, y: 320 },
    { x: 700, y: 320 },
    { x: 500, y: 300 },
    { x: 400, y: 220 }
];

export const catPathPortrait: Vector[] = [
    { x: 500, y: 200 },
    { x: 350, y: 250 },
    { x: 300, y: 300 },
    { x: 200, y: 380 }
];

export class Cat extends Entity {
    public moved: boolean;
    private sleeping: boolean;
    private face: Face;
    private rise: number = 1;
    
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
        this.rise = clamp01(this.rise + (this.sleeping ? -1 : 1) * this.delta * 0.01);
        if (!this.sleeping) this.face.update(tick, mouse);
    }

    public sleep(state: boolean = true): void {
        // if (state) this.game.audio.sleep();
        this.sleeping = state;
        this.face.sleeping = state;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.p.x, this.p.y);
        drawEllipse(ctx, { x: 0, y: 1 }, 17, 5, '#00000055');
        ctx.strokeStyle = '#000';
        ctx.lineCap = 'round';

        const sway = this.sleeping ? 0 : this.animationPhase;
        const breath = this.sleeping ? this.animationPhase : 0;

        ctx.scale(1 - breath * 0.1, 1 + breath * 0.1);

        const air = quadEaseIn(Math.sin(this.tween.time * Math.PI));

        ctx.translate(0, air * -40);
        
        const drawLeg = (pos: number, len: number) => {
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pos, -3 - this.animationPhaseAbs * 6);
            ctx.quadraticCurveTo((pos) * 1.4, -2 - this.animationPhaseAbs * 3, pos, 1 + len);
            ctx.stroke();
        };

        if (!this.sleeping) {
            drawLeg(10, 0);
            drawLeg(-10, 0);
            drawLeg(6, 1);
            drawLeg(-6, 1);
        }
        
        // body
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.translate(0, -7 - Math.abs(sway) * 3 - air * 5 - this.rise * 3);
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.stroke();

        ctx.translate(sway * 2, 0);

        // tail
        ctx.lineWidth = 5;
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-this.animationPhase * 25, -5, -sway * 12, -20 - this.animationPhaseAbs * 5);
        if (!this.sleeping) ctx.stroke();
        
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

        ctx.translate(0, -2 - sway - air * 3 - breath * 2);
        ctx.scale(0.13, 0.13);
        this.face.draw(ctx, false);
        
        ctx.restore();
    }

    public hop(to: Vector): void {
        if (this.sleeping) this.game.audio.meow();
        this.sleep(false);
        this.moved = true;
        this.tween.move(to, 0.4);
        this.game.audio.jump();
        setTimeout(() => this.game.audio.land(), 400);
    }

    public isAwake(): boolean {
        return !this.sleeping;
    }
}