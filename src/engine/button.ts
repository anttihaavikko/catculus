import { PadButton } from './pad';
import { AudioManager } from './audio';
import { font } from './constants';
import { Entity } from './entity';
import { Game } from './game';
import { Mouse } from './mouse';
import { drawCircle, drawRect } from './drawing';
import { offset, Vector } from './vector';

const BORDER_THICKNESS = 5;

export class ButtonEntity extends Entity {
    public visible = true;

    private pressed: boolean;
    private button: PadButton = PadButton.NONE;
    private hoverRise: number = 5;
    protected hovered: boolean;
    private clickOffset: Vector = { x: 0, y: 0 };
    private frameless: boolean;
    protected contentColor: string = '#000';
    protected strokeText: boolean;

    private borderThickness = BORDER_THICKNESS;

    constructor(game: Game, protected content: string, x: number, y: number, width: number, height: number, protected onClick: (right: boolean) => void, private audio: AudioManager, private fontSize = 30) {
        super(game, x - width * 0.5, y - height * 0.5, width, height);
    }

    public setClickOffset(offset: Vector): void {
        this.clickOffset = offset;
    }

    public setHoverRise(val: number): void {
        this.hoverRise = val;
    }

    public trigger(right?: boolean): void {
        this.audio.button();
        this.onClick(right);
    }

    public makeFrameless(): void {
        this.frameless = true;
    }

    public setButton(button: PadButton): void {
        this.button = button;
    }

    public setBorderThickness(thickness: number): void {
        this.borderThickness = thickness;
    }

    public setText(text: string): void {
        this.content = text;
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
        
        if (this.hovered && mouse.pressing && !this.pressed && !mouse.dragging) {
            this.pressed = true;
            return;
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) return;
        ctx.save();
        ctx.translate(0, this.hovered ? -this.hoverRise : 0);

        if (!this.frameless) {
            ctx.fillStyle = '#000';
            ctx.fillRect(this.p.x, this.p.y, this.s.x, this.s.y);
            ctx.fillStyle = this.hovered ? '#f2e949' : '#fff';
            ctx.fillRect(this.p.x + this.borderThickness, this.p.y + this.borderThickness, this.s.x - this.borderThickness * 2, this.s.y - this.borderThickness * 2);
        }

        const showButton = this.button !== PadButton.NONE;

        ctx.font =`${this.fontSize}px ${font}`;
        // ctx.textBaseline = '';
        // console.log(ctx.textBaseline);
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.frameless ? '#fff' : this.contentColor;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 6;
        if (this.strokeText) ctx.strokeText(this.content, this.p.x + this.s.x * 0.5 + (showButton ? 10 : 0), this.p.y + this.s.y * 0.5 + this.fontSize * 0.3);
        ctx.fillText(this.content, this.p.x + this.s.x * 0.5 + (showButton ? 10 : 0), this.p.y + this.s.y * 0.5 + this.fontSize * 0.3);
        
        if (showButton) this.drawIcon(ctx);

        ctx.restore();
    }

    private drawIcon(ctx: CanvasRenderingContext2D): void {
        const w = ctx.measureText(this.content).width;

        const color = this.frameless ? '#fff' : '#000';

        if (this.button === PadButton.RT || this.button === PadButton.LT) {
            ctx.lineWidth = 2;
            const size = 13;
            const p = {
                x: this.p.x + this.s.x * 0.5 - w * 0.5 - 2 - size,
                y: this.p.y + this.s.y * 0.5 + 7 - 6 + 10
            };
            // drawRect(ctx, p, { x: size, y: size }, 'transparent', '#000' );
            ctx.strokeStyle= color;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.bezierCurveTo(
                p.x + size * 0.5 - size * 0.85, p.y - size * 2.25,
                p.x + size * 0.75 + size * 0.85, p.y - size * 2.25,
                p.x + size * 1.3, p.y
            );
            ctx.closePath();
            ctx.stroke();
            // drawCircle(ctx, { x: this.p.x + this.s.x * 0.5 - w * 0.5 - 7, y: this.p.y + this.s.y * 0.5 + 7 - 8 }, 10, 'transparent', '#000');

            const letter = this.button === PadButton.RT ? 'RT' : 'LT';
            ctx.font =`12px ${font}`;
            ctx.fillStyle = color;
            ctx.fillText(letter, this.p.x + this.s.x * 0.5 - w * 0.5 - 7, this.p.y + this.s.y * 0.5 + 7 - 1);

            return;
        }
        if (this.button === PadButton.START) {
            ctx.lineWidth = 2;
            const size = 9;
            const p = { x: this.p.x + this.s.x * 0.5 - w * 0.5 - 2, y: this.p.y + this.s.y * 0.5 + 7 - 6 };
            drawRect(ctx, p, { x: size, y: size }, 'transparent', color );
            drawRect(ctx, offset(p, -4, -4), { x: size, y: size }, 'transparent', color );
            // drawCircle(ctx, { x: this.p.x + this.s.x * 0.5 - w * 0.5 - 7, y: this.p.y + this.s.y * 0.5 + 7 - 8 }, 10, 'transparent', '#000');
            return;
        }
        ctx.lineWidth = 3;
        const buttonColor = ['#3c8a24', '#de3d28', '#3872c9', '#dbc337'][this.button];
        const letter = 'ABXY'[this.button];
        drawCircle(ctx, { x: this.p.x + this.s.x * 0.5 - w * 0.5 - 7, y: this.p.y + this.s.y * 0.5 + 7 - 8 }, 10, 'transparent', buttonColor);
        ctx.font =`15px ${font}`;
        ctx.fillStyle = buttonColor;
        ctx.fillText(letter, this.p.x + this.s.x * 0.5 - w * 0.5 - 7, this.p.y + this.s.y * 0.5 + 7 - 3);
    }

    private hover(): void {
        this.audio.buttonHover();
    }
}