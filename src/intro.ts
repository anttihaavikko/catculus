import { Cat } from './cat';
import { drawBg } from './common';
import { ButtonEntity } from './engine/button';
import { Container } from './engine/container';
import { Game } from './engine/game';
import { Mouse } from './engine/mouse';
import { randomCell, randomInt } from './engine/random';
import { WobblyText } from './engine/wobbly';
import { Scene } from './scene';
import { Tile, TILE_GAP, TILE_SIZE } from './tile';

export class Intro extends Container {
    private tiles: Tile[];
    private button: ButtonEntity;
    private cats: Cat[] = [];
    private logoX: number;
    private logoY: number;
    private logoScale: number;
    private ended: boolean;

    constructor(game: Game) {
        super(game);
        // document.body.style.backgroundColor = COLORS.bg;
        this.tiles = 'CATCULUS'.split('').map((c, i) => {
            const tile = new Tile(game, i, true, c);
            tile.p = { x: i * (TILE_SIZE + TILE_GAP) + 220, y: 120 };
            return tile;
        });
        this.button = new ButtonEntity(game, '⏵ PLAY ', 400, 320, 260, 70, () => {
            game.changeScene(new Scene(game));
        }, this.game.audio, 35);
        
        this.addCat(this.tiles[0], -TILE_SIZE - TILE_GAP);
        this.addCat(this.tiles[this.tiles.length - 1], TILE_SIZE + TILE_GAP);
        this.addCat(this.tiles[2], 0);

        this.cats[0].sleep(true);
        this.cats[1].sleep(true);
        
        this.add(
            new WobblyText(game, '|Antti Haavikko| presents', 18, 400, 105, 0.25, 1.5, { shadow : 2 }),
            new WobblyText(game, 'Made for |js13k| 2025', 12, 400, 182, 0.2, 1.5, { shadow : 1.5 }),
            ...this.tiles,
            // this.button, 
            ...this.cats,
        );
        
        setTimeout(() => this.changeTile(), 3000);
    }

    public end(): void {
        this.ended = true;
    }

    private changeTile(): void {
        if (this.ended) return;
        this.cats[2].hop(randomCell(this.tiles).getCenter());
        setTimeout(() => this.changeTile(), randomInt(1000, 8000));
    }
    
    public getButtons(): ButtonEntity[] {
        return [this.button];
    }

    public update(tick: number, mouse: Mouse): void {
        super.update(tick, mouse);
        this.button.update(tick, mouse);
    }
    
    private addCat(tile: Tile, offset: number): void {
        const p = tile.getCenter();
        this.cats.push(new Cat(this.game, p.x + offset, p.y));
    }

    public ratioChanged(portrait: boolean): void {
        this.button.p = portrait ? { x: 70, y: 420 } : { x: 260, y: 280 };
        this.logoX = portrait ? -140 : -200;
        this.logoY = portrait ? 220 : -50;
        this.logoScale = portrait ? 0.85 : 1.5;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        drawBg(ctx);
        ctx.translate(this.logoX, this.logoY);
        ctx.scale(this.logoScale, this.logoScale);
        super.draw(ctx);
        ctx.restore();
        this.button.draw(ctx);
    }
}