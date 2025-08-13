import { Container } from './engine/container';
import { Game } from './engine/game';
import { Mouse } from './engine/mouse';
import { randomCell } from './engine/random';
import { TextEntity } from './engine/text';
import { ZERO } from './engine/vector';
import { WobblyText } from './engine/wobbly';
import { WIDTH } from './index';
import { Tile } from './tile';

export const GRID_SIZE = 7;

export class Scene extends Container {
    private tiles: Tile[];
    private picks: Tile[] = [];
    private target: number;
    private level: number = 0;
    private locked: boolean;
    private targetLabel: TextEntity;
    private sumLabel: TextEntity;
    
    constructor(game: Game) {
        super(game);

        this.tiles = Array.from(Array(GRID_SIZE * GRID_SIZE)).map((_, i) => new Tile(game, i));

        this.targetLabel = new TextEntity(game, '', 50, 500, 220, -1, ZERO, { shadow: 5 });
        this.sumLabel = new WobblyText(game, '', 25, WIDTH * 0.5, 30, 0.5, 3, { shadow: 3 });
        
        this.add(...this.tiles, this.targetLabel, this.sumLabel);

        this.findTarget();
    }
    
    public update(tick: number, mouse: Mouse): void {
        super.update(tick, mouse);

        if (mouse.pressing && !this.locked) {
            const tile = this.tiles.find(t => t.hovered);
            if (tile && !tile.hidden && (this.picks.length === 0 || this.picks.some(t => t.isClose(tile)))) {
                tile.picked = !tile.picked;
                this.toggle(tile);

                const sum = this.picks.reduce((acc, t) => acc + t.value, 0);
                this.sumLabel.content = this.picks.length > 1 ? `${this.picks.map(t => t.value).join('+')}=${sum}` : '';

                if (sum >= this.target) {
                    console.log(`DONE, DIFF: ${sum - this.target}`);
                    setTimeout(() => {
                        this.tiles.filter(t => t.hidden && this.picks.some(p => p.isClose(t))).forEach(t => t.hidden = false);
                        this.picks.forEach(t => {
                            t.picked = false;
                            t.value++;
                        });
                        this.picks = [];
                        this.findTarget();
                        this.sumLabel.content = '';
                    }, 1000);
                }
            }
        }
    }

    private findTarget(): void {
        this.level++;
        this.target = this.generateTarget(this.level + 1);
        this.targetLabel.content = this.target.toString();
    }

    private generateTarget(count: number): number {
        const cells = [randomCell(this.tiles.filter(t => !t.hidden))];
        for (let i = 0; i < Math.min(count, Math.floor(this.tiles.filter(t => !t.hidden).length / 2)) - 1; i++) {
            cells.push(randomCell(this.tiles.filter(t => !t.hidden && !cells.includes(t) && cells.some(c => c.isClose(t)))));
        }
        // console.log(`FROM: ${cells.map(t => t.value).join(', ')}`);
        return cells.reduce((acc, t) => acc + t.value, 0);
    }

    private toggle(tile: Tile): void {
        if (this.picks.includes(tile)) {
            this.picks = this.picks.filter(t => t !== tile);
            return;
        }
        this.picks.push(tile);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        super.draw(ctx);
        ctx.restore();
    }
}