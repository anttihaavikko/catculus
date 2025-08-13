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

    public dig(): void {
        this.play([1.5,,633,.01,.01,.04,4,4.2,,,141,,,,12,,.01,.84,.01,.15]);
        // [.8,,498,.02,.04,.24,4,.7,,,,,.01,.6,,.5,,.69,.02,.06,1399]
    }

    public land(vol: number): void {
        this.play([vol * 0.1,,33,.01,.03,.01,4,3.6,-34,2,,,,,,,.43,.53,.03,.06,171]);
    }

    public miss(): void {
        this.play([1.6,,472,.01,.02,.22,2,2.2,,,,,.03,.8,1.8,,.16,.47,,.32,-1767]);
    }

    public loosen(): void {
        this.play([.9,,409,,.04,.06,,.9,,2,210,.08,.02,,,.1,,.5,.02,,-1495]);
    }

    public gem(): void {
        this.play([1.3,,615,.01,.07,.09,,1.1,,,273,.05,,,,,.05,.98,.02]);
    }

    public build(): void {
        this.play([3.5,,913,,.01,.03,1,4.2,-22,23,-43,.01,,,2.5,.4,.2,.6,.02,,375]);
    }

    public fail(): void {
        this.play([1.3,,449,.02,.05,.16,1,1.7,,,352,.07,.08,,30,.1,.04,.85,.02,,-1498]);
    }

    public step(left: boolean): void {
        if (left) {
            this.play([0.2,,210,.02,.04,.04,3,2.3,21,,,,.17,.4,,.1,.33,.61,.02,.4,-1437]);
            return;
        }
        this.play([.2,,217,,.01,.02,,1.8,-37,,-93,,,,,,,.56,.03,,103]);
    }

    public teleport(): void {
        this.play([.9,,514,.07,.28,.44,1,2.8,,37,,,.09,.5,,,,.93,.14,.04,-1331]);
    }

    public die(): void {
        this.play([,,95,.02,.24,.34,1,3.5,-9,,,,,.1,41,.2,,.35,.15,.47,-3344]);
        this.play([2.2,,48,,.01,.56,4,3.1,7,,,,.1,.6,,.9,.43,.49,.18,.05]);
    }

    public enter(): void {
        this.play([.5,,189,,.27,.26,,.9,3,2,,,.07,.4,,,,.77,.16,.19,112]);
    }

    public station(): void {
        this.play([1.4,,113,.03,.29,.14,1,.8,,,124,.08,.02,,,,.14,.92,.11,.17]);
    }

    public shutDown(): void {
        // this.play([2.1,,298,,.1,.12,1,1.5,-7,2,,,.04,,4.3,,,.58,.24,.4,352]);
        this.play([0.5,,585,.07,.14,.06,1,3.5,,,-55,.09,.05,,,.1,,.52,.15,.46]);
    }

    public craft(): void {
        this.play([2.1,,577,.03,.26,.07,,3.3,,-191,232,.08,.09,,,,.19,.5,.28,.41]);
    }

    public noMaterials(): void {
        this.play([0.8,,387,.1,.13,.06,,3.1,,,-142,.08,.03,.4,,,,.53,.14]);
    }

    public jetpack(): void {
        this.play([3,,264,.02,.17,.09,1,1.3,-12,-15,,,.09,,,.1,.17,.54,.16,.28]);
    }

    public prompt(): void {
        this.play([.2,,22,.02,.01,.04,,.7,-28,-56,,,,,,.1,,.63,.03,,-1010]);
    }

    public detatch(): void {
        this.play([0.6,,571,.02,.09,.08,,1.2,5,,,,,.3,,,,.53,.03]);
    }

    public switch(): void {
        this.play([0.6,,146,,,.03,,1.6,,,-2,.11,,.1,,,,.83,.02]);
    }
    
    public talk(): void {
        this.play([7,,59,.02,.01,.03,3,4.4,1,-73,-2,.03,.01,.3,118,,,.61,.03,.28,-534]);
        this.play([.9,,164,.04,.07,.14,1,1.7,,18,,,,.1,,.1,,.88,.05,,-767]);
    }
}