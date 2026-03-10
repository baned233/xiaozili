const game = new Game();

document.addEventListener('DOMContentLoaded', () => {
    game.init();
});

document.addEventListener('click', () => {
    if (audioManager.audioContext && audioManager.audioContext.state === 'suspended') {
        audioManager.audioContext.resume();
    }
}, { once: true });
