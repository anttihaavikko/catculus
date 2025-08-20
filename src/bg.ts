import { Entity } from './engine/entity';
import { Game } from './engine/game';

export class SkillBg extends Entity {
    public visible: boolean;

    constructor(game: Game) {
        super(game, 0, 300, 800, 310);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) return;
        ctx.fillStyle = '#00000099';
        ctx.fillRect(this.p.x, this.p.y, this.s.x, this.s.y);
    }
}