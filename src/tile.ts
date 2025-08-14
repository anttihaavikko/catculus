import { Cat } from './cat';
import { font } from './engine/constants';
import { Entity } from './engine/entity';
import { Game } from './engine/game';
import { Mouse } from './engine/mouse';
import { distance } from './engine/vector';
import { GRID_SIZE } from './scene';

export const TILE_SIZE = 40;
export const TILE_GAP = 6;

export class Tile extends Entity {
    public value: number;
    public hovered: boolean;
    public picked: boolean;
    public hidden: boolean;
    public cat: Cat;

    public constructor(game: Game, i: number) {
        const size = TILE_SIZE + TILE_GAP;
        const x = i % GRID_SIZE;
        const y = Math.floor(i / GRID_SIZE);
        super(game, 50 + x * size, 45 + y * size, TILE_SIZE, TILE_SIZE);
        this.value = x - 1 + (y - 2) * 3;
        if (x < 2 || x > 4 || y < 2 || y > 4) {
            this.value = 1;
            this.hidden = true;
        }
    }

    public getVisibleValue(): string {
        return this.cat ? '?' : `${this.value}`;
    }

    public appear(): void {
        this.hidden = false;
        this.scale = { x: 0, y: 0 };
        this.tween.scale({ x: 1, y: 1 }, 0.3);
    }

    public isClose(other: Tile): boolean {
        return distance(this.p, other.p) < TILE_SIZE * 1.5;
    }

    public update(tick: number, mouse: Mouse): void {
        this.hovered = this.isInside(mouse, 1);
        super.update(tick, mouse);
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
        ctx.translate(this.p.x, this.p.y);
        ctx.translate(this.s.x * 0.5, this.s.y * 0.5);
        ctx.scale(this.scale.x, this.scale.y);
        ctx.translate(-this.s.x * 0.5, -this.s.y * 0.5);
        ctx.rect(0, 0, this.s.x, this.s.y);
        ctx.stroke();
        ctx.fill();
        ctx.fillStyle = outline;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `20px ${font}`;
        ctx.fillText(this.value.toString(), this.s.x / 2, this.s.y / 2);
        ctx.restore();
    }
}