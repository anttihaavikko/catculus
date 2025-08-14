import { Cat } from './cat';
import { font } from './engine/constants';
import { Entity } from './engine/entity';
import { Game } from './engine/game';
import { Mouse } from './engine/mouse';
import { Pulser } from './engine/pulser';
import { distance, normalize, Vector } from './engine/vector';
import { GRID_SIZE } from './scene';

export const TILE_SIZE = 40;
export const TILE_GAP = 6;

export class Tile extends Entity {
    public value: number;
    public hovered: boolean;
    public picked: boolean;
    public hidden: boolean;
    public cat: Cat;

    private pulser = new Pulser();
    private nudgeDir: Vector = { x: 0, y: 0 };

    public constructor(game: Game, i: number, demo: boolean = false, private demoLetter: string = null) {
        super(game, 0, 0, TILE_SIZE, TILE_SIZE);
        this.moveTo(i, 50, 45);
        const x = i % GRID_SIZE;
        const y = Math.floor(i / GRID_SIZE);
        if (demo) return;
        this.value = x - 1 + (y - 2) * 3;
        if (x < 2 || x > 4 || y < 2 || y > 4) {
            this.value = 1;
            this.hidden = true;
        }
        this.d = 0;
    }
    
    public moveTo(i: number, x: number, y: number): void {
        const xx = i % GRID_SIZE;
        const yy = Math.floor(i / GRID_SIZE);
        this.p = {
            x: x + xx * (TILE_SIZE + TILE_GAP),
            y: y + yy * (TILE_SIZE + TILE_GAP)
        };
        if (this.cat) this.cat.p = this.getCenter();
    }

    public getVisibleValue(): string {
        return this.cat ? '?' : `${this.value}`;
    }

    public appear(): void {
        this.hidden = false;
        this.scale = { x: 0, y: 0 };
        this.tween.scale({ x: 1, y: 1 }, 0.3);
        this.pulse(1);
    }

    public increment(): void {
        this.value++;
        this.pulse(1);
    }

    public pulse(speed: number): void {
        this.nudgeDir = { x: 0, y: 0 };
        this.pulser.pulse(speed * 0.6);
    }

    public nudge(target: Vector): void {
        this.nudgeDir = normalize({
            x: target.x - this.p.x,
            y: target.y - this.p.y
        });
    }

    public isClose(other: Tile): boolean {
        return distance(this.p, other.p) < TILE_SIZE * 1.5;
    }

    public update(tick: number, mouse: Mouse): void {
        this.hovered = !this.demoLetter && this.isInside(mouse, 1);
        this.d = this.hovered ? 1 : 0;
        super.update(tick, mouse);
        this.pulser.update(this.delta * 0.01);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (this.hidden) return;
        ctx.save();
        ctx.fillStyle = this.hovered ? 'yellow' : '#fff';
        if (this.picked) ctx.fillStyle = 'orange';
        const outline = this.hovered ? 'red' : '#191D32';
        ctx.strokeStyle = outline;
        ctx.beginPath();
        ctx.lineWidth = 7;
        const distance = -5;
        ctx.translate(this.p.x + this.nudgeDir.x * this.pulser.ratio * distance, this.p.y + this.nudgeDir.y * this.pulser.ratio * distance);
        ctx.translate(this.s.x * 0.5, this.s.y * 0.5);
        ctx.scale(this.scale.x + this.pulser.ratio * 0.12, this.scale.y + this.pulser.ratio * 0.12);
        ctx.translate(-this.s.x * 0.5, -this.s.y * 0.5);
        ctx.rect(0, 0, this.s.x, this.s.y);
        ctx.stroke();
        ctx.fill();
        ctx.fillStyle = outline;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `20px ${font}`;
        ctx.fillText(this.demoLetter ? this.demoLetter : this.value.toString(), this.s.x / 2, this.s.y / 2);
        ctx.restore();
    }
}