import { AudioManager } from './audio';
import { font } from './constants';
import { Entity } from './entity';
import { Game } from './game';
import { Mouse } from './mouse';
import { Vector } from './vector';

const BORDER_THICKNESS = 7;

export class ButtonEntity extends Entity {
    public visible = true;
    public onHover: () => void;

    private pressed: boolean;
    private hoverRise: number = 5;
    protected hovered: boolean;
    private clickOffset: Vector = { x: 0, y: 0 };
    private frameless: boolean;
    protected contentColor: string = '#000';
    protected strokeText: boolean;

    private borderThickness = BORDER_THICKNESS;

    constructor(game: Game, protected content: string, x: number, y: number, width: number, height: number, protected onClick: () => void, private audio: AudioManager, private fontSize = 30) {
        super(game, x - width * 0.5, y - height * 0.5, width, height);
        this.animationSpeed = 0.0025;
    }

    public isHovered(): boolean {
        return this.hovered;
    }

    public setClickOffset(offset: Vector): void {
        this.clickOffset = offset;
    }

    public setHoverRise(val: number): void {
        this.hoverRise = val;
    }

    public trigger(): void {
        this.audio.button();
        this.onClick();
    }

    public makeFrameless(): void {
        this.frameless = true;
    }

    public getText(): string {
        return this.content;
    }

    public getCenter(): Vector {
        return {
            x: this.p.x + this.s.x * 0.5 + this.clickOffset.x,
            y: this.p.y + this.s.y * 0.5 + this.clickOffset.y
        };
    }

    public update(tick: number, mouse: Mouse): void {
        if (!this.visible) return;

        const wasHovered = this.hovered;
        this.hovered = !mouse.dragging && this.isInside(mouse) && !this.game.usingPad;
        if (!wasHovered && this.hovered) this.hover();
        if (!mouse.pressing) {
            if (this.pressed && !mouse.dragging && this.hovered) {
                // this.onClick();
            }
            this.pressed = false;
        }

        super.update(tick, mouse);

        if (this.hovered && mouse.pressing && !this.pressed && !mouse.dragging) {
            this.pressed = true;
            return;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) return;
        ctx.save();
        ctx.translate(0, this.hovered ? -this.hoverRise : 0 + this.animationPhaseAbs * 3);

        if (!this.frameless) {
            ctx.fillStyle = '#000';
            ctx.fillRect(this.p.x, this.p.y, this.s.x, this.s.y);
            ctx.fillStyle = this.hovered ? '#FE6847' : '#fff';
            ctx.fillRect(this.p.x + this.borderThickness, this.p.y + this.borderThickness, this.s.x - this.borderThickness * 2, this.s.y - this.borderThickness * 2);
        }

        ctx.font =`${this.fontSize}px ${font}`;
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.frameless ? '#fff' : this.contentColor;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 6;
        if (this.strokeText) ctx.strokeText(this.content, this.p.x + this.s.x * 0.5, this.p.y + this.s.y * 0.5 + this.fontSize * 0.3);
        ctx.fillText(this.content, this.p.x + this.s.x * 0.5, this.p.y + this.s.y * 0.5 + this.fontSize * 0.3);

        ctx.restore();
    }

    private hover(): void {
        this.audio.buttonHover();
        if (this.onHover) this.onHover();
    }
}