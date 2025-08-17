/* eslint-disable no-sparse-arrays */
import { song } from '../song';
import { CPlayer } from './audio-player';
import { isTauri } from './tauri';
import { zzfx } from './zzfx';

export class AudioManager {
    private started = false;
    private audio: HTMLAudioElement;
    private loaded: boolean;
    private soundVolume: number = 0.5;
    private musicVolume: number = 0.5;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor() {
        this.audio = document.createElement('audio');
        document.body.appendChild(this.audio);
    }

    public prepare(): void {
        if (this.started || isTauri()) return;
        
        this.started = true;

        if (!song) return;

        const player = new CPlayer();
        player.init(song);
        player.generate();
        this.loaded = false;

        const timer = setInterval(() => {
            if (this.loaded) return;
            this.loaded = player.generate() >= 1;
            if (this.loaded) {
                const wave = player.createWave();
                this.audio.src = URL.createObjectURL(new Blob([wave], { type: 'audio/wav' }));
                this.audio.loop = true;
                this.audio.volume = this.musicVolume;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (this.audio as any).preservesPitch = false;
                clearInterval(timer);
            }
        }, 5);
    }

    public getPitch(): number {
        return this.audio.playbackRate;
    }

    public setPitch(target: number): void {
        // if (isTauri()) {
        //     callTauriWith('set_pitch', { pitch: target });
        //     return;
        // }
        if (target < 0.1) {
            this.audio.volume = 0;
            return;
        }
        this.audio.playbackRate = target;
    }

    public startMusic(): void {
        const timer = setInterval(() => {
            if (!this.loaded) return;
            this.audio.play();
            clearInterval(timer);
        }, 5);
        
        // restart early for better looping
        // this.audio.addEventListener('timeupdate', () => {
        //     if(this.audio.currentTime > this.audio.duration - 0.21) {
        //         this.audio.currentTime = 0;
        //         this.audio.play();
        //     }
        // });
    }

    public play(values: number[]): void {
        zzfx(...values.map((v, i) => i === 0 ? (v ?? 1) * 0.6 * this.soundVolume: v));
    }

    public button(): void {
        // this.play([2.5,,321,.01,,.02,,.7,-62,-30,116,.15,,.6,35,,.04,.51,.03,,99]);
        this.play([2,,372,.02,.01,.002,2,4.8,-42,-11,8,.6,,.9,,,.03,.76,.02,.24,-1500]);
    }

    public buttonHover(): void {
    }

    public select(): void {

    }

    public jump(): void {
        this.play([1.3,,298,.02,.03,.05,,2.3,8,-29,,,,,,,.01,.83,.07]);
        this.play([.5,,678,,.01,.17,,2.1,-1,,,,,.1,40,,,.78,.03,,387]);
    }
    
    public pick(): void {
        this.play([1.5,,54,,.03,.01,3,.8,,-42,,,,,,,,.71,.02,,-951]);
        this.play([.6,,170,.01,.03,.04,2,4.5,,,,,,,,,,.95,.03,,-1443]);
    }

    public score(i: number): void {
        const octave = Math.ceil(i / 7);
        const notes = [220, 246.9417, 261.6256, 293.6648, 329.6276, 349.2282, 391.9954];
        this.play([,,notes[i % 7] * octave,.02,.01,.07,1,.4,,,368,.05,,.3,,,,.7,.02]);
    }

    public done(): void {
        this.play([2,,650,.01,.28,.4,1,3.9,,,209,.07,.08,,,,,.73,.24,.48,-520]);
        this.play([,,380,.04,.21,.12,,3.5,,,,,.02,,4.6,,,.72,.19,.48]);
    }
    
    public bad(): void {
        this.play([3,,498,.04,.24,.32,,2.9,,8,-76,.06,.1,,3.3,,,.88,.14,.43]);
        this.play([5,,48,.05,.09,.69,1,2.7,6,,,,.19,1.2,47,.6,.43,.46,.18,.34]);
    }

    public appear(): void {
        this.play([.9,,443,.1,.18,.29,1,1.7,,,,,.09,,3.3,.1,,.72,.18,,172]);
    }
    
    public multi(): void {
        this.play([0.8,,347,.09,.13,.14,,3.9,-1,,-154,.1,.06,,,,,.66,.2,.35,-1312]);
        this.play([0.8,,431,.01,.03,.04,1,1.4,61,,,,.03,,,,,.59,.03,.28,-1229]);
    }
    
    public lose(): void {
        this.play([,,614,.01,.24,.21,1,.4,,,-132,.08,.08,,,.2,,.55,.11]);
        this.play([2,,52,.04,.29,.46,4,3.2,1,,,,,1.6,11,.3,,.38,.17,,1135]);
    }

    public meow(): void {
        this.play([0.3,,390,.03,.2,.11,,.1,50,-91,410,.11,.07,.1,.8]);
        this.play([5,,311,,,.006,1,.6,,,,,.05,,1.1,,.47,.55,.38,.08,728]);
    }
}