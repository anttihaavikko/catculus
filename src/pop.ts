import { Game } from './engine/game';
import { Mouse } from './engine/mouse';
import { random } from './engine/random';
import { TextEntity } from './engine/text';
import { Vector } from './engine/vector';
import { TILE_SIZE } from './tile';

export class TextPop extends TextEntity {
    constructor(game: Game, text: string, pos: Vector) {
        super(game, text, 30, pos.x + TILE_SIZE * 0.5, pos.y + TILE_SIZE * 0.25, random(0.7, 0.9), { x: 0, y: random(-0.5, -0.7) }, { shadow: 3, scales: true });
    }

    public update(tick: number, mouse: Mouse): void {
        super.update(tick, mouse);
        this.ratio = Math.sin(this.ratio / 2 * Math.PI);
    }
}