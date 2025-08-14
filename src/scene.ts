import { Cat, catPathLandscape, catPathPortrait } from './cat';
import { Container } from './engine/container';
import { Game } from './engine/game';
import { LineParticle } from './engine/line';
import { Mouse } from './engine/mouse';
import { random, randomCell } from './engine/random';
import { TextEntity } from './engine/text';
import { offset, ZERO } from './engine/vector';
import { WobblyText } from './engine/wobbly';
import { TextPop } from './pop';
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
    private cats: Cat[] = [];
    private catPath = catPathLandscape;
    
    constructor(game: Game) {
        super(game);

        this.tiles = Array.from(Array(GRID_SIZE * GRID_SIZE)).map((_, i) => new Tile(game, i));

        this.targetLabel = new TextEntity(game, '', 50, 500, 220, -1, ZERO, { shadow: 5 });
        this.sumLabel = new WobblyText(game, '', 25, 400, 30, 0.5, 3, { shadow: 3 });
    
        this.add(...this.tiles, this.targetLabel, this.sumLabel);

        this.findTarget();
        // this.addCat();

        // const cat = new Cat(this.game, 50, 50);
        // setTimeout(() => cat.sleep(true), 500);
        // this.add(cat);
    }
    
    public update(tick: number, mouse: Mouse): void {
        super.update(tick, mouse);

        this.game.canvas.style.cursor = this.tiles.some(t => !t.hidden && t.hovered) ? 'pointer' : 'default';

        if (mouse.pressing && !this.locked) {
            const tile = this.tiles.find(t => t.hovered);
            if (tile && !tile.hidden && (this.picks.length === 0 || this.picks.some(t => t.isClose(tile)))) {
                tile.picked = !tile.picked;
                this.toggle(tile);

                const sum = this.picks.reduce((acc, t) => acc + t.value, 0);
                // const knownSum = this.picks.reduce((acc, t) => acc + (t.cat ? 0 : t.value), 0);
                const shownSum = this.picks.some(t => t.cat) ? '???' : `${sum}`;
                this.sumLabel.content = this.picks.length > 1 ? `${this.picks.map(t => t.getVisibleValue()).join('+')}=${shownSum}` : '';

                if (sum >= this.target) {
                    this.scoreRound(sum);
                    mouse.x = -9999;
                }
            }
        }
    }
    
    public ratioChanged(portrait: boolean): void {
        this.tiles.forEach((t, i) => t.moveTo(i, portrait ? 40 : 50, portrait ? 400 : 45));
        this.targetLabel.p = portrait ? { x: 200, y: 320 } : { x: 500, y: 220 };
        this.sumLabel.p = { x: portrait ? 200 : 400, y: 40 };
        this.catPath = portrait ? catPathPortrait : catPathLandscape;
    }

    private scoreRound(sum: number): void {
        this.game.audio.done();
        this.locked = true;
        this.sumLabel.content = this.picks.length > 1 ? `${this.picks.map(t => t.value).join('+')}=${sum}` : '';
        console.log(`DONE, DIFF: ${sum - this.target}`);
        this.picks.reverse();
        this.cats.forEach(c => c.moved = false);
        this.picks.forEach((t, i) => {
            setTimeout(() => {
                this.game.audio.score(i);
                if (i > 0) {
                    this.add(new LineParticle(this.game, this.picks[i - 1].getCenter(), t.getCenter(), 1, 5, 'yellow', random(0, 10)));
                }
                t.picked = false;
                t.pulse(0.6);
                const amount = t.value * this.picks.length * (t.cat ? 2 : 1);
                this.add(new TextPop(this.game, amount.toString(), t.p, !!t.cat));
                if (t.cat) {
                    this.hopCat(t.cat);
                    t.cat = null;
                }
            }, i * 120 + 300);
        });
        setTimeout(() => {
            this.tiles.filter(t => t.hidden && this.picks.some(p => p.isClose(t))).forEach(t => t.appear());
            this.picks.forEach(t => t.increment());
            this.picks = [];
            this.findTarget();
            this.sumLabel.content = '';
            this.addCat();
            this.locked = false;
            this.cats.filter(c => !c.moved).forEach(c => c.sleep(true));
        }, 800 + this.picks.length * 120);
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
        this.game.audio.pick();
        tile.pulse(1);
        if (this.picks.includes(tile)) {
            this.picks = this.picks.filter(t => t !== tile);
            return;
        }
        this.picks.push(tile);
    }
    
    private addCat(): void {
        if (!this.tiles.some(t => !t.hidden && !t.cat)) return;
        const cat = new Cat(this.game, this.catPath[0].x, this.catPath[0].y);
        this.cats.push(cat);
        this.add(cat);
        cat.hop({ x: this.catPath[1].x, y: this.catPath[1].y });
        setTimeout(() => cat.hop({ x: this.catPath[2].x, y: this.catPath[2].y }), 1000);
        setTimeout(() => cat.hop({ x: this.catPath[3].x, y: this.catPath[3].y }), 1700);
        setTimeout(() => this.hopCat(cat), 2600);
    }

    private hopCat(cat: Cat): void {
        const tile = randomCell(this.tiles.filter(t => !t.hidden && !t.cat));
        if (!tile) return;
        tile.cat = cat;
        cat.hop(offset(tile.getCenter(), 0, 5));
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.fillStyle = '#453A49';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        super.draw(ctx);
        ctx.restore();
    }
}