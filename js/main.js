/**
 * ==================== 游戏入口文件 ====================
 * 这个文件是游戏的起点，负责初始化游戏
 * 当网页加载完成后，会创建一个Game实例并启动游戏
 */

// 创建一个全局的Game实例 - 这是游戏的主控制器
const game = new Game();

// 当网页的所有内容都加载完成后...
document.addEventListener('DOMContentLoaded', () => {
    // 初始化游戏
    game.init();
});

// 点击页面任意位置时，确保音频可以播放
// 这是因为浏览器策略：用户必须与页面交互后才能播放声音
document.addEventListener('click', () => {
    // 如果音频上下文被暂停了（浏览器限制），就恢复它
    if (audioManager.audioContext && audioManager.audioContext.state === 'suspended') {
        audioManager.audioContext.resume();
    }
}, { once: true });  // 这个监听器只触发一次
