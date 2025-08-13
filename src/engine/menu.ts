import { ButtonEntity } from './button';
import { font } from './constants';
import { Entity } from './entity';
import { Game } from './game';
import { clamp } from './math';
import { PadButton } from './pad';
import { tauriShowMouse } from './tauri';

const BUTTON_HEIGHT = 50;
const TOP = BUTTON_HEIGHT + 5;
const HOVER_RISE = 4;

export class Menu extends Entity {
    private visible: boolean;
    private buttons: ButtonEntity[];
    private dirButtons: DirButtons[] = [];
    private current = -1;

    constructor(
        game: Game,
        x: number,
        y: number,
        private actions: MenuAction[],
        private valueGetter?: (key: string) => boolean | number,
        private valueSetter?: (key: string, value: boolean | number) => void
    ) {
        super(game, x, y, 0, 0);
        this.animationSpeed = 0.005;
        let gap = 0;
        this.buttons = actions.map((a, i) => {
            const w = a.width ?? 250;
            if (a.key || a.numeric) {
                this.dirButtons[i] = {
                    plus: new ButtonEntity(game, '+', this.p.x + (w * 0.5 + 35), gap + TOP * i + this.p.y - (actions.length - 1) * 0.5 * BUTTON_HEIGHT, BUTTON_HEIGHT, BUTTON_HEIGHT, () => this.changeDirValue(a, i, 1), game.audio, 30),
                    minus: new ButtonEntity(game, '-', this.p.x - (w * 0.5 + 35), gap + TOP * i + this.p.y - (actions.length - 1) * 0.5 * BUTTON_HEIGHT, BUTTON_HEIGHT, BUTTON_HEIGHT, () => this.changeDirValue(a, i, -1), game.audio, 30)
                };
                this.dirButtons[i].plus.setHoverRise(HOVER_RISE);
                this.dirButtons[i].minus.setHoverRise(HOVER_RISE);
            }
            const b =  new ButtonEntity(game, this.getLabel(a), this.p.x, gap + TOP * i + this.p.y - (actions.length - 1) * 0.5 * BUTTON_HEIGHT, w, BUTTON_HEIGHT, () => {
                a.action();
                if (this.valueSetter) this.valueSetter(a.setting, 0);
                this.buttons[i]?.setText(this.getLabel(a));
            }, game.audio, 25);
            if (a.gap) {
                gap += a.gap;
            }
            return b;
        });
        this.buttons.forEach(b => b.setHoverRise(HOVER_RISE));
    }

    private changeDirValue(action: MenuAction, index: number, dir: number): void {
        if (this.valueSetter) {
            this.valueSetter(action.setting, dir);
            this.buttons[index]?.setText(this.getLabel(action));  
            return;
        }
        const value = parseFloat(localStorage.getItem(action.amountKey) ?? '0.5');
        localStorage.setItem(action.amountKey, clamp(value + 0.1 * dir, 0, 1).toString());
        this.buttons[index]?.setText(this.getLabel(action));  
        this.game.audio.updateVolumes();  
    }

    public trigger(): void {
        this.buttons[this.current]?.trigger();
        this.buttons[this.current]?.setText(this.getLabel(this.actions[this.current]));
    }

    public isVisible(): boolean {
        return this.visible;
    }

    public moveSelection(dir: number): void {
        if (!this.visible) return;
        this.buttons[this.current]?.setButton(PadButton.NONE);
        this.current = (this.current + dir) % this.buttons.length;
        if (this.current < 0) this.current = this.buttons.length - 1;
        this.buttons[this.current]?.setButton(0);
        this.game.audio.select();
    }

    public changeValue(dir: number): void {
        if (!this.visible) return;
        if (this.dirButtons[this.current]) {
            if (dir > 0) this.dirButtons[this.current].plus.trigger();
            if (dir < 0) this.dirButtons[this.current].minus.trigger();
        }
    }

    public toggle(usingPad: boolean): void {
        if (!usingPad) {
            tauriShowMouse(true);
        }
        this.buttons[this.current]?.setButton(PadButton.NONE);
        this.current = -1;
        if (usingPad) {
            this.current = 0;
            this.buttons[this.current]?.setButton(PadButton.A);
        }
        this.visible = !this.visible;
        this.game.audio.dimMusic(this.visible);
    }

    public hide(): void {
        this.visible = false;
        this.game.audio.dimMusic(false);
    }

    public getButtons(): ButtonEntity[] {
        const dirs: ButtonEntity[] = [];
        this.dirButtons.filter(b => !!b).forEach(b => dirs.push(b.plus, b.minus));
        return this.visible ? [...this.buttons, ...dirs] : [];
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if (!this.visible) return;
        this.buttons.forEach(b => b.draw(ctx));
        this.dirButtons.forEach(d => {
            d.minus.draw(ctx);
            d.plus.draw(ctx);
        });
        if (this.current >= 0) {
            ctx.fillStyle = '#000';
            ctx.font =`25px ${font}`;
            const gap = this.actions.filter((a, i) => i < this.current).reduce((acc, a) => acc + (a.gap ?? 0), 0);
            const top = this.p.y - (this.buttons.length - 1) * 0.5 * BUTTON_HEIGHT + TOP * this.current + 8 + gap;
            const diff = this.animationPhaseAbs * 15;
            const w = ((this.actions[this.current].width ?? 250) + 70) * 0.5;
            const offset = this.actions[this.current].amountKey || this.actions[this.current].numeric ? 60 : 0;
            ctx.fillText('▶', this.p.x - w - 15 + 3 + diff - offset, top + 3);
            ctx.fillText('◀', this.p.x + w - 15 + 3 - diff + offset, top + 3);
            ctx.fillStyle = '#fff';
            ctx.fillText('▶', this.p.x - w - 15 + diff - offset, top);
            ctx.fillText('◀', this.p.x + w - 15 - diff + offset, top);
        }
    }

    private getLabel(action: MenuAction): string {
        if (action.setting && this.valueGetter) {
            const val = this.valueGetter(action.setting);
            return action.label.replace('[B]', val ? 'ON' : 'OFF').replace('[N]', val?.toString());
        }
        if (!action.key) return action.label;
        const value = localStorage.getItem(action.amountKey) ?? '0.5';
        const state = localStorage.getItem(action.key) ? 'OFF' : `${Math.round(parseFloat(value) * 100)}%`;
        return action.label.replace('[S]', state);
    }

    public updateLabels(): void {
        this.buttons.forEach((b, i) => b.setText(this.getLabel(this.actions[i])));
    }
}

interface DirButtons {
    plus: ButtonEntity;
    minus: ButtonEntity;
}

export interface MenuAction {
    label: string;
    action: () => void;
    key?: string;
    amountKey?: string;
    setting?: string;
    numeric?: boolean;
    gap?: number;
    width?: number;
}