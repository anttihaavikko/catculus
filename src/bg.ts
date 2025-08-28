import { Entity } from './engine/entity';
import { Game } from './engine/game';

export class SkillBg extends Entity {
    public visible: boolean;

    constructor(game: Game) {
        super(game, -50, 290, 900, 370);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) return;
        ctx.fillStyle = '#00000088';
        ctx.fillRect(this.p.x, this.p.y, this.s.x, this.s.y);
    }
}