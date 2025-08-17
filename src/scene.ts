import { Cat, catPathLandscape, catPathPortrait } from './cat';
import { COLORS } from './colors';
import { drawBg } from './common';
import { ButtonEntity } from './engine/button';
import { font } from './engine/constants';
import { Container } from './engine/container';
import { Game } from './engine/game';
import { LineParticle } from './engine/line';
import { asScore } from './engine/math';
import { Mouse } from './engine/mouse';
import { random, randomCell } from './engine/random';
import { TextEntity } from './engine/text';
import { offset, Vector, ZERO } from './engine/vector';
import { WobblyText } from './engine/wobbly';
import { Life } from './life';
import { Multiplier } from './multiplier';
import { TextPop } from './pop';
import { Target } from './target';
import { Tile } from './tile';

export const GRID_SIZE = 7;

const helpTexts = [
    ['Select |adjacent tiles', 'that |add up| to...'],
    ['Too many |mistakes', '|means| you\'ll |lose|...'],
    ['Tiles with |cats| on them', 'will |score| for |more|!'],
    ['Playing |faster| will also', 'earn you |bigger points|!']
];

export class Scene extends Container {
    private tiles: Tile[];
    private picks: Tile[] = [];
    private level: number = 0;
    private maxMulti: number = 1;
    private locked: boolean;
    private sumLabel: TextEntity;
    private cats: Cat[] = [];
    private catPath = catPathLandscape;
    private scoreLabel: TextEntity;
    private score: number = 0;
    private helpTexts: WobblyText[];
    private target: Target;
    private multi: Multiplier;
    private prev: Tile;
    private life: Life;
    private sumLimit: number;
    private button: ButtonEntity;
    
    constructor(game: Game) {
        super(game);

        this.tiles = Array.from(Array(GRID_SIZE * GRID_SIZE)).map((_, i) => new Tile(game, i));

        this.sumLabel = new WobblyText(game, '', 25, 400, 30, 0.25, 2.5, { shadow: 3 });
        this.scoreLabel = new TextEntity(game, '0', 40, 790, 40, -1, ZERO, { shadow: 3, align: 'right' });
        this.helpTexts = [
            new WobblyText(game, '', 30, 500, 50, 0.25, 2.5, { shadow: 3, scales: true }),
            new WobblyText(game, '', 30, 500, 80, 0.25, 2.5, { shadow: 3, scales: true }),
        ];
        this.target = new Target(game, 500, 220);
        this.multi = new Multiplier(game, 765, 73);
        this.life = new Life(game, 10, 10, 200, 20);
        this.button = new ButtonEntity(game, 'TRY AGAIN?', 400, 500, 260, 70, () => {
            this.game.audio.setPitch(1);
            this.game.changeScene(new Scene(game));
        }, this.game.audio, 25);
        this.button.d = 500;
        this.button.visible = false;

        this.helpTexts.forEach(ht => ht.d = 500);
        this.life.d = this.multi.d = this.scoreLabel.d = 400;

        this.add(
            ...this.tiles,
            this.sumLabel,
            this.scoreLabel,
            ...this.helpTexts,
            this.target,
            this.multi,
            this.life,
            this.button
        );

        this.findTarget();
    }

    public getButtons(): ButtonEntity[] {
        return [this.button];
    }
    
    public update(tick: number, mouse: Mouse): void {
        super.update(tick, mouse);

        this.game.canvas.style.cursor = this.tiles.some(t => !t.hidden && t.hovered) ? 'pointer' : 'default';

        if ((mouse.pressing || mouse.holding) && !this.locked) {
            const tile = this.tiles.find(t => t.hovered);
            const drag = !mouse.pressing && mouse.holding;
            if (drag && this?.prev === tile) return;
            // if (!mouse.pressing && mouse.holding && this.picks.length > 0 && tile?.picked !== this.holdMask) return;
            if (tile && !tile.hidden && (this.picks.length === 0 || this.picks.some(t => t.isClose(tile)))) {
                if (tile?.cat?.isAwake()) tile.cat.hop(tile.getCenter());
                tile.picked = !tile.picked;
                this.toggle(tile);

                const sum = this.picks.reduce((acc, t) => acc + t.value, 0);
                const knownSum = this.picks.reduce((acc, t) => acc + (t.cat ? 0 : t.value), 0);
                const shownSum = this.picks.some(t => t.cat) ? `${knownSum}?` : `${sum}`;
                this.showSum(this.picks.length > 1 ? `|${this.picks.map(t => t.getVisibleValue()).join('|+|')}|=|${shownSum}` : '');

                if (sum >= this.target.value) {
                    mouse.holding = false;
                    this.scoreRound(sum);
                } else {
                    this.add(new TextPop(this.game, shownSum, tile.getCenter(), '#fff', 35));
                }
            }

            this.prev = tile;
            return;
        }
        this.prev = null;
    }

    private showSum(sum: string): void {
        const ctx = this.game.canvas.getContext('2d');
        const parts = sum.split('+');
        if (parts.length > 3) {
            for (let i = 0; i < parts.length - 1; i++) {
                const cur = [...parts.slice(0, i), parts[parts.length - 1]];
                ctx.font = `25px ${font}`;
                if (ctx.measureText(cur.join('+')).width > this.sumLimit) {
                    const half = Math.floor(cur.length / 2);
                    this.sumLabel.content = [...cur.slice(0, half), '...', ...cur.slice(half)].join('+');
                    return;
                }
            }
        }
        this.sumLabel.content = sum;
    }

    private showHelp(): void {
        this.helpTexts.forEach((ht, i) => {
            ht.toggle(helpTexts[this.level]?.[i] ?? '');
        });
    }

    private clearHelp(): void {
        this.helpTexts.forEach(ht => ht.toggle(''));
    }
    
    public ratioChanged(portrait: boolean): void {
        this.tiles.forEach((t, i) => t.moveTo(i, portrait ? 45 : 50, portrait ? 400 : 45));
        this.target.p = portrait ? { x: 200, y: 320 } : { x: 550, y: 270 };
        this.sumLabel.p = { x: portrait ? 200 : 400, y: portrait ? 150 : 380 };
        this.catPath = portrait ? catPathPortrait : catPathLandscape;
        this.scoreLabel.p = portrait ? { x: 390, y: 40 } : { x: 790, y: 40 };
        this.multi.p = portrait ? { x: 365, y: 75 } : { x: 765, y: 73 };
        this.helpTexts.forEach((ht, i) => ht.p = portrait ? { x: 200, y: 200 + i * 35 } : { x: 550, y: 160 + i * 35});
        this.life.p = portrait ? { x: 10, y: 765 } : { x: 10, y: 10 };
        this.life.changeSize(portrait);
        this.sumLimit = portrait ? 250 : 700;
        this.button.p = offset(this.target.p, -130, -35);
        // document.body.style.background = portrait ? COLORS.bg : '#000';
        // this.scoreLabel.setOptions({ align: portrait ? 'center' : 'right'});
    }

    private randomOffset(p: Vector): Vector {
        return offset(p, random(-10, 10), random(-10, 10));
    }

    private scoreRound(sum: number): void {
        this.multi.paused = true;
        this.clearHelp();
        this.locked = true;
        this.showSum(this.picks.length > 1 ? `|${this.picks.map(t => t.value).join('|+|')}|=|${sum}` : '');
        const diff = sum - this.target.value;
        const perfect = diff === 0;
        const pp = offset(this.picks[this.picks.length - 1].getCenter(), 0, -2);
        const winText = randomCell([
            'PURRFECT!',
            'PAWFECT!',
            'PAWLESS!',
            'MEOWRVELOUS!',
            'FURFECT!',
            'CATEMPLARY!',
            'FELICCIMO!',
            'RADICLAW!'
        ]);
        const badText = randomCell([
            'MEOWSTAKE!',
            'PURROR!',
            'MEOWSCALCULATION!',
            'MEOWSSTEP!',
            'FURROR!',
            'CATASTROPHE!',
            'MEOWSERABLE!'
        ]);
        this.add(new TextPop(this.game, perfect ? winText : badText, this.randomOffset(pp), perfect ? COLORS.mark : COLORS.red, 20));
        if (perfect) {
            this.game.audio.done();
            this.maxMulti++;
        } else {
            this.game.camera.shake(5, 0.1);
            this.game.audio.bad();
            setTimeout(() => {
                this.game.audio.bad();
                this.add(new TextPop(this.game, `${this.target.value - sum}`, this.randomOffset(pp), COLORS.red, 60));
                this.game.camera.shake(5, 0.15);
            }, 300);
        }
        this.picks.reverse();
        this.cats.forEach(c => c.moved = false);
        this.life.change(-diff);
        this.picks.forEach((t, i) => {
            setTimeout(() => {
                this.game.audio.score(i);
                t.pulse(0.6);
                t.sunk = true;
                t.extraDepth = -i;
                this.game.camera.shake(2, 0.05);
                if (i > 0) {
                    this.add(new LineParticle(this.game, this.picks[i - 1].getCenter(), t.getCenter(), 1, 5, COLORS.mark, random(0, 10)));
                }
                if (i < this.picks.length - 1) t.nudge(this.picks[i + 1].p);
                t.picked = false;
                const amount = t.value * (i + 1) * (t.cat ? 5 : 1) * this.multi.value * (perfect ? 5 : 1);
                this.score += amount;
                this.scoreLabel.content = asScore(this.score);
                this.add(new TextPop(this.game, asScore(amount), t.getCenter(), t.cat ? COLORS.mark: '#fff'));
                if (t.cat) {
                    this.hopCat(t.cat, t);
                }
            }, i * 120 + 300 + (perfect ? 0 : 500));
        });
        setTimeout(() => {
            if (this.life.isDead()) {
                setTimeout(() => {
                    this.game.camera.shake(5, 0.2);
                    this.helpTexts[0].toggle('|GAME OVER|!');
                    this.helpTexts[1].toggle(`Final score: |${asScore(this.score)}`);
                    this.cats.forEach(c => c.sleep(true));
                    this.game.audio.lose();
                    this.game.audio.setPitch(0.7);
                    this.button.visible = true;
                }, 500);
                return;
            }

            const appearing = this.tiles.filter(t => t.hidden && this.picks.some(p => p.isClose(t)));
            if (appearing.length > 0) this.game.audio.appear();
            appearing.forEach(t => t.appear());
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
        this.showHelp();
        this.level++;
        this.multi.paused = false;
        this.multi.reset(Math.min(13, this.maxMulti));
        this.target.set(this.generateTarget(this.level + 1));
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

    private hopCat(cat: Cat, prev: Tile = null): void {
        const tile = randomCell(this.tiles.filter(t => !t.hidden && !t.cat));
        if (!tile) return;
        tile.cat = cat;
        if (prev) prev.cat = null;
        cat.hop(offset(tile.getCenter(), 0, 5));
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        drawBg(ctx); 
        super.draw(ctx);
        // ctx.lineWidth = 5;
        // drawCircle(ctx, this.game.getMouse(), 10, 'transparent', '#000');
    }
}