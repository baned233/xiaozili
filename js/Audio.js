/**
 * ==================== 音频管理器 ====================
 * 负责游戏中所有声音的播放
 * 包括：背景音乐、战斗音效、UI点击声、胜利/失败音乐等
 * 使用Web Audio API来播放声音
 */

class AudioManager {
    // 构造函数 - 初始化音频相关变量
    constructor() {
        this.audioContext = null;        // Web Audio API的上下文
        this.bgMusicNode = null;        // 背景音乐节点
        this.bgMusicGain = null;        // 背景音乐音量控制
        this.isMusicPlaying = false;    // 背景音乐是否正在播放
        this.musicVolume = 0.3;         // 背景音乐音量（0-1）
        this.sfxVolume = 0.5;           // 音效音量（0-1）
        this.currentBgSource = null;    // 当前背景音乐
        this.bossBgSource = null;      // BOSS战背景音乐
        this.isBossBattle = false;      // 是否正在播放BOSS音乐
        this.bgmAudio = null;           // 普通背景音乐Audio对象
        this.bossBgmAudio = null;       // BOSS背景音乐Audio对象
    }

    // ==================== 初始化音频系统 ====================
    init() {
        try {
            // 创建AudioContext（浏览器兼容处理）
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
        
        // 创建背景音乐Audio对象
        this.bgmAudio = new Audio('assets/sounds/BGM.mp3');
        this.bgmAudio.loop = true;      // 循环播放
        this.bgmAudio.volume = this.musicVolume;
        
        // 创建BOSS战音乐Audio对象
        this.bossBgmAudio = new Audio('assets/sounds/BOSS.mp3');
        this.bossBgmAudio.loop = true;
        this.bossBgmAudio.volume = this.musicVolume;
    }

    // 恢复AudioContext（浏览器可能会暂停它）
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // ==================== 开始播放背景音乐 ====================
    startBgMusic() {
        if (this.isMusicPlaying) return;
        this.resumeContext();
        this.isMusicPlaying = true;

        if (this.isBossBattle) {
            this.bossBgmAudio.play().catch(e => {
                console.log('BOSS BGM play failed, using fallback');
                this.playBgLoop();
            });
        } else {
            this.bgmAudio.play().catch(e => {
                console.log('BGM play failed, using fallback');
                this.playBgLoop();
            });
        }
    }

    playBossMusic() {
        this.isBossBattle = true;
        if (this.isMusicPlaying) {
            this.bgmAudio.pause();
            this.bossBgmAudio.play().catch(e => {
                console.log('BOSS BGM play failed');
                this.playBgLoop();
            });
        }
    }

    stopBossMusic() {
        this.isBossBattle = false;
        if (this.isMusicPlaying) {
            this.bossBgmAudio.pause();
            this.bgmAudio.play().catch(e => {
                console.log('BGM play failed');
                this.playBgLoop();
            });
        }
    }

    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.audioContext) return;
        this.resumeContext();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(volume * this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playAttack() {
        this.playTone(200, 0.1, 'sawtooth', 0.4);
        setTimeout(() => this.playTone(150, 0.05, 'square', 0.3), 50);
    }

    // ==================== 播放音效文件 ====================
    playSoundFile(filename) {
        const audio = new Audio(`assets/sounds/${filename}`);
        audio.volume = this.sfxVolume;
        audio.play().catch(e => {
            console.log(`Sound ${filename} play failed`);
        });
    }

    playHit() {
        this.playSoundFile('hit.mp3');
    }

    playCrit() {
        this.playTone(400, 0.1, 'square', 0.4);
        setTimeout(() => this.playTone(600, 0.1, 'square', 0.3), 50);
        setTimeout(() => this.playTone(800, 0.15, 'sine', 0.2), 100);
    }

    playMonsterAttack() {
        const audio = new Audio('assets/sounds/monster1.mp3');
        audio.volume = Math.min(this.sfxVolume * 1.5, 1);
        audio.play().catch(e => {
            console.log('Sound monster1.mp3 play failed');
        });
    }

    playHeal() {
        this.playTone(523, 0.15, 'sine', 0.3);
        setTimeout(() => this.playTone(659, 0.15, 'sine', 0.3), 100);
        setTimeout(() => this.playTone(784, 0.2, 'sine', 0.25), 200);
    }

    playBuff() {
        this.playTone(440, 0.1, 'triangle', 0.3);
        setTimeout(() => this.playTone(554, 0.1, 'triangle', 0.3), 80);
        setTimeout(() => this.playTone(659, 0.15, 'triangle', 0.25), 160);
    }

    playMagic() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.playTone(300 + i * 100, 0.1, 'sine', 0.2);
            }, i * 50);
        }
    }

    playDefense() {
        this.playTone(300, 0.1, 'triangle', 0.4);
        setTimeout(() => this.playTone(400, 0.15, 'triangle', 0.3), 100);
    }

    playVictory() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'sine', 0.4), i * 150);
        });
    }

    playDefeat() {
        const notes = [400, 350, 300, 250];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.4, 'sine', 0.3), i * 200);
        });
    }

    playClick() {
        this.playTone(800, 0.05, 'sine', 0.2);
    }

    playSkillSelect() {
        this.playTone(600, 0.08, 'triangle', 0.25);
    }

    playSlash() {
        this.playSoundFile('sword1.mp3');
    }

    playMagicAttack() {
        this.playSoundFile('magic1.mp3');
    }

    playHealSkill() {
        this.playTone(523, 0.12, 'sine', 0.3);
        setTimeout(() => this.playTone(659, 0.12, 'sine', 0.3), 80);
        setTimeout(() => this.playTone(784, 0.15, 'sine', 0.25), 160);
        setTimeout(() => this.playTone(1047, 0.2, 'sine', 0.2), 240);
    }

    playBuffSkill() {
        this.playTone(330, 0.08, 'triangle', 0.3);
        setTimeout(() => this.playTone(415, 0.08, 'triangle', 0.3), 60);
        setTimeout(() => this.playTone(523, 0.12, 'triangle', 0.25), 120);
    }

    playDefenseSkill() {
        this.playTone(200, 0.1, 'triangle', 0.35);
        setTimeout(() => this.playTone(300, 0.15, 'triangle', 0.3), 80);
    }

    playSummon() {
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.playTone(300 + i * 50, 0.1, 'sine', 0.15);
            }, i * 60);
        }
    }

    playDebuff() {
        this.playTone(150, 0.1, 'sawtooth', 0.3);
        setTimeout(() => this.playTone(100, 0.15, 'square', 0.25), 80);
    }

    stopBgMusic() {
        this.isMusicPlaying = false;
        if (this.bgmAudio) {
            this.bgmAudio.pause();
        }
        if (this.bossBgmAudio) {
            this.bossBgmAudio.pause();
        }
    }

    toggleBgMusic() {
        if (this.isMusicPlaying) {
            this.stopBgMusic();
        } else {
            this.startBgMusic();
        }
        return this.isMusicPlaying;
    }

    setMusicVolume(vol) {
        this.musicVolume = Math.max(0, Math.min(1, vol));
        if (this.bgmAudio) {
            this.bgmAudio.volume = this.musicVolume;
        }
        if (this.bossBgmAudio) {
            this.bossBgmAudio.volume = this.musicVolume;
        }
    }

    setSfxVolume(vol) {
        this.sfxVolume = Math.max(0, Math.min(1, vol));
    }
}

const audioManager = new AudioManager();
