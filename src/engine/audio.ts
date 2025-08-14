/* eslint-disable no-sparse-arrays */
import { song } from '../song';
import { CPlayer } from './audio-player';
import { callTauri, callTauriWith, isTauri } from './tauri';
import { zzfx } from './zzfx';

export class AudioManager {
    private started = false;
    private audio: HTMLAudioElement;
    private loaded: boolean;
    private muted: boolean;
    private music: boolean;
    private sounds: boolean;
    private musicVolume: number = 1;
    private soundVolume: number = 1;
    private musicDimmed: boolean;

    constructor(muted: boolean, music: boolean, sounds: boolean) {
        this.audio = document.createElement('audio');
        if (muted) this.toggleMute();
        if (music) this.toggleMusic();
        if (sounds) this.toggleSounds();
        document.body.appendChild(this.audio);
        this.updateVolumes();
    }

    public updateVolumes(): void {
        this.musicVolume = parseFloat(localStorage.getItem('CoupAhooMusicVol') ?? '0.5');
        this.soundVolume = parseFloat(localStorage.getItem('CoupAhooSoundVol') ?? '0.5');
        this.setVolume();
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
                this.setVolume();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (this.audio as any).preservesPitch = false;
                clearInterval(timer);
            }
        }, 5);
    }

    public setVolume(): void {
        this.audio.volume = this.getBaseMusicVolume() * (this.musicDimmed ? 0.5 : 1) * this.musicVolume;
    }

    public getPitch(): number {
        return this.audio.playbackRate;
    }

    public setPitch(target: number): void {
        if (isTauri()) {
            callTauriWith('set_pitch', { pitch: target });
            return;
        }
        if (target < 0.1) {
            this.audio.volume = 0;
            return;
        }
        this.audio.playbackRate = target;
    }

    public isMuted(): boolean {
        return this.muted;
    }

    public toggleMuteTo(state: boolean): void {
        this.muted = state;
        if (this.muted) {
            localStorage.setItem('CoupAhooMute', '1');
            this.audio.pause();
            return;
        }
        localStorage.removeItem('CoupAhooMute');
        if (!this.music) this.audio.play();
    }

    public toggleMusicTo(state: boolean): void {
        this.music = state;
        if (this.music) {
            localStorage.setItem('CoupAhooMusic', '1');
            this.audio.pause();
            return;
        }
        localStorage.removeItem('CoupAhooMusic');
        if (!this.muted) this.audio.play();
    }

    public toggleSoundsTo(state: boolean): void {
        this.sounds = state;
        if (this.sounds) {
            localStorage.setItem('CoupAhooSounds', '1');
            return;
        }
        localStorage.removeItem('CoupAhooSounds');
    }

    public toggleMute(): void {
        this.toggleMuteTo(!this.muted);
        if (isTauri()) {
            this.setTauriVolume();
            return;
        }
        this.setVolume();
    }

    public toggleMusic(): void {
        this.toggleMusicTo(!this.music);
        if (isTauri()) {
            this.setTauriVolume();
            return;
        }
        this.setVolume();
    }

    public getEitherMute(): boolean {
        return this.sounds && this.music;
    }

    public toggleSounds(): void {
        this.toggleSoundsTo(!this.sounds);
    }

    public setTauriVolume(): void {
        if (isTauri()) {
            callTauriWith('set_volume', { volume: this.getBaseMusicVolume() * this.musicVolume });
        }
    }

    private getBaseMusicVolume(): number {
        return !this.muted && !this.music ? 0.7 : 0;
    }

    public dimMusic(state: boolean): void {
        if (this.muted || this.music) return;
        this.setPitch(state ? 0.95 : 1);
        this.musicDimmed = state;
        if (isTauri()) {
            this.setTauriVolume();
            return;
        }
        this.setVolume();
    }

    public startMusic(): void {
        if (isTauri()) {
            callTauri('play_music');
            this.setTauriVolume();
            return;
        }

        const timer = setInterval(() => {
            if (!this.loaded) return;
            if (!this.muted && !this.music) this.audio.play();
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

    public play(values: number[], name: string = 'button', volume: number = 1): void {
        if (this.muted || this.sounds) return;
        if (isTauri()){
            callTauriWith('play_sound', { 'effect': name, volume: 0.6 * volume * this.soundVolume });
            return;
        } 
        zzfx(...values.map((v, i) => i === 0 ? (v ?? 1) * 0.6 * this.soundVolume : v));
    }

    public button(): void {
        // this.play([2.5,,321,.01,,.02,,.7,-62,-30,116,.15,,.6,35,,.04,.51,.03,,99]);
        this.play([1,,9,.01,.01,.01,,2.6,-17,,214,.01,,,,,,.72,.01,,-1386]);
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
}