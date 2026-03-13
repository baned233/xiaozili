/**
 * ==================== 游戏主逻辑类 ====================
 * 这是游戏的核心类，负责管理整个游戏的流程
 * 包括：开始游戏、层数推进、战斗管理、商店、事件、奖励等
 * 就像游戏的大脑，控制着所有的游戏逻辑
 */

class Game {
    // 构造函数 - 初始化游戏的基本数据
    constructor() {
        this.currentFloor = 1;         // 当前层数，从第1层开始
        this.gold = 0;                // 玩家拥有的金币
        this.playerTeam = [];         // 玩家队伍（目前只有主角一个人）
        this.battle = null;           // 当前战斗对象
        this.ui = null;               // UI界面控制器
        this.state = 'menu';          // 游戏状态：menu(菜单)、map(地图)、battle(战斗)、shop(商店)、rest(安全屋)、event(事件)
        this.shopItems = [];          // 商店里卖的东西
        this.currentPaths = [];       // 当前层的路径选择
        this.karma = 0;               // 善缘值（做好事积累）
        this.pendingRewards = [];      // 待领取的奖励
        this.obtainedSkillIds = [];    // 已经获得的技能ID列表
        this.obtainedRelicIds = [];    // 已经获得的遗物ID列表
        this.potions = [];             // 背包里的药水
        this.maxPotions = 3;           // 药水栏最多放3个
        this.usedEventIds = [];        // 已经触发过的事件ID
        this.betelNutCount = 0;        // 槟榔上瘾后没吃槟榔的层数计数
        this._memoryStorage = {};     // 内存存储（备用）
        this._storageAvailable = false; // 是否可以使用localStorage
    }

    // ==================== 存档相关方法 ====================
    // 保存数据到浏览器本地存储
    _saveToStorage(key, value) {
        if (this._storageAvailable) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                console.warn('Storage blocked, using memory storage');
                this._memoryStorage[key] = value;
            }
        } else {
            this._memoryStorage[key] = value;
        }
    }

    // 从浏览器本地存储读取数据
    _loadFromStorage(key) {
        if (this._storageAvailable) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                return this._memoryStorage[key] || null;
            }
        }
        return this._memoryStorage[key] || null;
    }

    // 删除本地存储的数据
    _removeFromStorage(key) {
        if (this._storageAvailable) {
            try {
                localStorage.removeItem(key);
            } catch (e) {}
        }
        delete this._memoryStorage[key];
    }

    // ==================== 游戏初始化 ====================
    // 初始化游戏，创建UI控制器，显示主菜单
    init() {
        audioManager.init();                    // 初始化音频系统
        this.ui = new UI(this);                // 创建UI控制器
        this.showMainMenu();                   // 显示主菜单
    }

    // ==================== 开始新游戏 ====================
    // 从第1层重新开始游戏
    start() {
        this.currentFloor = 1;                 // 重置到第1层
        this.gold = 100;                      // 初始金币100
        this.karma = 0;                        // 重置善缘值
        this.playerTeam = [Character.createJiaXuan()];  // 创建主角
        this.obtainedSkillIds = [11];          // 初始技能ID
        this.obtainedRelicIds = [];            // 清空遗物
        this.potions = [];                     // 清空药水
        this.usedEventIds = [];                // 清空已用事件
        this.betelNutCount = 0;                // 重置槟榔计数
        this.state = 'map';                    // 设置状态为地图选择
        
        this.clearSave();                      // 清除存档
        
        this.ui.showGameScreen();              // 显示游戏画面
        this.ui.updatePlayerPortrait(this.playerTeam[0]);  // 更新主角头像
        this.ui.updatePotionBar(this.potions); // 更新药水栏
        this.showMapSelection();               // 显示地图选择
        
        audioManager.startBgMusic();           // 开始播放背景音乐
        this.saveGame();                       // 保存游戏
    }

    restart() {
        this.ui.hideGameOver();
        this.ui.hideVictory();
        this.start();
    }

    // ==================== 显示地图选择界面 ====================
    // 每一层开始时，让玩家选择下一步做什么
    showMapSelection() {
        this.state = 'map';                                // 设置游戏状态为地图
        this.ui.updateFloor(this.currentFloor);           // 更新显示当前层数
        this.ui.updateGold(this.gold);                     // 更新显示金币
        this.ui.setBackgroundClass(this.currentFloor);     // 根据层数设置背景
        this.ui.updatePlayerResources(this.playerTeam[0]); // 更新玩家资源（血量、体力等）
        
        // 生成3个可选路径
        this.currentPaths = this.generatePaths();
        // 显示地图面板
        this.ui.showMapPanel(this.currentPaths, this.currentFloor);
    }

    // ==================== 生成随机路径 ====================
    // 根据当前层数生成3个随机路径选项
    // 可能的路径：战斗、精英战、商店、安全屋、事件、BOSS
    generatePaths() {
        const paths = [];
        
        // 每15层是BOSS关卡
        if (this.currentFloor % 15 === 0) {
            const bossPath = PATH_TYPES['boss'];
            return [{ type: 'boss', name: 'BOSS战', icon: bossPath.icon, desc: FLOOR_DATA[this.currentFloor].bossName }];
        }
        
        const usedTypes = new Set();  // 记录已经选择了哪些类型的路径，避免重复
        
        // 随机生成3个路径
        for (let i = 0; i < 3; i++) {
            let pathType;
            const roll = Math.random();  // 0-1之间的随机数
            
            // 根据概率决定路径类型
            if (roll < 0.35 && !usedTypes.has('battle')) {
                pathType = 'battle';           // 35%概率普通战斗
            } else if (roll < 0.45 && !usedTypes.has('elite') && this.currentFloor % 5 === 0) {
                pathType = 'elite';            // 每5层可能出现精英战
            } else if (roll < 0.50 && !usedTypes.has('shop')) {
                pathType = 'shop';             // 10%概率商店
            } else if (roll < 0.65 && !usedTypes.has('rest')) {
                pathType = 'rest';             // 15%概率安全屋
            } else if (roll < 0.90 && !usedTypes.has('event')) {
                pathType = 'event';            // 25%概率随机事件
            } else {
                pathType = 'battle';           // 默认战斗
            }
            
            usedTypes.add(pathType);  // 记录已使用的类型
            
            const pathInfo = PATH_TYPES[pathType];  // 获取路径信息
            paths.push({
                type: pathType,
                name: pathInfo.name,           // 路径名称
                icon: pathInfo.icon,           // 路径图标
                desc: pathInfo.desc            // 路径描述
            });
        }
        
        return paths;
    }

    // ==================== 玩家选择路径后 ====================
    // 玩家点击某个路径后触发
    selectPath(index) {
        const path = this.currentPaths[index];
        if (!path) {
            return;
        }
        
        audioManager.playClick();       // 播放点击音效
        this.ui.hideMapPanel();         // 隐藏地图面板
        
        // 根据路径类型执行不同操作
        switch (path.type) {
            case 'battle':
            case 'elite':
                this.startBattle(path.type === 'elite');  // 开始战斗
                break;
            case 'boss':
                this.startBattle(false, true);             // BOSS战
                break;
            case 'shop':
                this.openShop();            // 打开商店
                break;
            case 'rest':
                this.openRest();            // 打开安全屋
                break;
            case 'event':
                this.triggerEvent();
                break;
        }
    }

    // ==================== 开始战斗 ====================
    // 玩家选择战斗路径后调用此方法
    // 参数：isElite是否为精英怪，isBoss是否为BOSS，customEnemy自定义敌人，winReward胜利奖励
    startBattle(isElite = false, isBoss = false, customEnemy = null, winReward = null) {
        this.state = 'battle';                // 设置游戏状态为战斗
        this.battle = new Battle(this);      // 创建新的战斗对象
        
        const player = this.playerTeam[0];
        if (player) {
            player.baseSpd = player.baseSpd || player.spd;  // 保存基础速度
        }
        
        // 初始化战斗，返回战斗结果
        const battleResult = this.battle.startBattle(this.playerTeam, this.currentFloor, isElite, isBoss, customEnemy, winReward);
        
        this.ui.setBackgroundClass(this.currentFloor);  // 设置战斗背景
        this.ui.showBattleArea();                // 显示战斗区域
        this.ui.showBattleLog();                  // 显示战斗日志
        
        // 如果是BOSS战，播放BOSS音乐并显示BOSS对话
        if (isBoss || FLOOR_DATA[this.currentFloor].isBoss) {
            audioManager.playBossMusic();         // 播放BOSS战音乐
            const bossData = BOSS_DIALOGS[this.currentFloor];  // 获取BOSS对话
            if (bossData) {
                // 显示BOSS登场对话
                this.ui.showDialog(`${bossData.name}: "${bossData.enter}"`, () => {
                    this.enterBattle();           // 对话结束后开始战斗
                });
                return;
            }
        }
        
        this.enterBattle();                      // 直接开始战斗
    }

    // ==================== 进入战斗流程 ====================
    enterBattle() {
        this.updateBattleUI();                    // 更新战斗界面
        
        // 根据是谁的回合显示不同内容
        if (this.battle.isPlayerTurn()) {
            this.updateSkillPanel();               // 显示技能面板
        } else {
            // 敌人回合，稍后执行
            setTimeout(() => this.processEnemyTurn(), 500);
        }
    }

    // ==================== 更新战斗界面 ====================
    updateBattleUI() {
        this.ui.hideCancelTargetSelect();         // 隐藏取消按钮
        this.ui.updateBattleArea(this.battle);    // 更新战斗区域显示
        this.ui.updateBattleLog(this.battle.battleLog);  // 更新战斗日志
        this.ui.updatePlayerResources(this.playerTeam[0]);  // 更新玩家资源（HP、护盾等）
    }

    updateSkillPanel() {
        this.ui.hideCancelTargetSelect();
        this.ui.showSkillPanel();
    }

    selectSkill(skillIndex) {
        if (!this.battle.isPlayerTurn()) return;
        
        const skills = this.battle.getCurrentSkills();
        const skill = skills[skillIndex];
        
        if (!skill) return;

        const character = this.battle.getPlayerCharacter();
        if (!skill.canUse(character)) {
            const costType = skill.getCostType();
            const cost = skill.getCost();
            audioManager.playHit();
            this.ui.showDialog(costType === 'mana' ? `法力不足，需要${cost}点法力！` : `体力不足，需要${cost}点体力！`, () => {});
            return;
        }
        
        audioManager.playSkillSelect();
        const result = this.battle.selectSkill(skill);
        
        if (result.success) {
            if (result.message) {
                this.ui.showDialog(result.message, () => {
                    this.updateSkillPanel();
                });
            } else if (result.state === 'selectTarget') {
                this.ui.showTargetSelect();
            } else {
                this.handleSkillResult(result);
            }
        }
    }

    selectTarget(enemy) {
        if (!this.battle.isPlayerTurn()) return;
        
        const result = this.battle.selectTarget(enemy);
        
        if (result.success) {
            this.handleSkillResult(result);
        }
    }
    
    cancelTargetSelect() {
        if (!this.battle) return;
        
        this.battle.selectedSkill = null;
        this.battle.selectedTarget = null;
        this.battle.battleState = 'playerSelect';
        
        this.ui.hideCancelTargetSelect();
        this.updateSkillPanel();
    }

    handleSkillResult(result) {
        const skillResult = result.result;
        
        if (skillResult) {
            const skill = this.battle.selectedSkill;
            
            if (skillResult.type === 'attack') {
                if (skill && skill.isMagic) {
                    audioManager.playMagicAttack();
                } else {
                    audioManager.playSlash();
                }
                if (skillResult.isCrit || skillResult.doubleStrike) {
                    audioManager.playCrit();
                }
            } else if (skillResult.type === 'summon') {
                audioManager.playSummon();
            } else if (skillResult.type === 'heal') {
                audioManager.playHealSkill();
            } else if (skillResult.type === 'buff') {
                audioManager.playBuffSkill();
            } else if (skillResult.type === 'defense') {
                audioManager.playDefenseSkill();
            } else if (skillResult.type === 'debuff') {
                audioManager.playDebuff();
            }
        }
        
        this.ui.updatePlayerResources(this.playerTeam[0]);
        this.updateBattleUI();
        
        if (skillResult) {
            if (skillResult.type === 'heal' && skillResult.heal) {
                this.ui.showDamageEffect(this.playerTeam[0], skillResult, false, null, true);
            } else if (skillResult.damage !== undefined) {
                const target = result.target;
                if (target) {
                    const isPlayerSide = target === this.playerTeam[0];
                    if (skillResult.multiStrike && skillResult.strikeResults) {
                        skillResult.strikeResults.forEach((strike, index) => {
                            setTimeout(() => {
                                const strikeResult = { damage: strike.damage, isCrit: strike.isCrit };
                                this.ui.showDamageEffect(target, strikeResult, isPlayerSide, this.battle.selectedSkill);
                            }, index * 200);
                        });
                    } else {
                        this.ui.showDamageEffect(target, skillResult, isPlayerSide, this.battle.selectedSkill);
                    }
                }
            }
        }
        
        if (result.battleEnd) {
            setTimeout(() => this.handleBattleEnd(result.battleEnd), 300);
            return;
        }
        
        if (result.state === 'enemyTurn') {
            if (this.battle.currentActor && this.battle.currentActor.sleeping) {
                this.battle.currentActor.sleeping = false;
                this.battle.currentTurnIndex++;
                this.battle.updateCurrentActor();
                if (this.battle.currentActorType === 'enemy') {
                    setTimeout(() => this.processEnemyTurn(), 300);
                } else {
                    this.updateSkillPanel();
                }
            } else {
                setTimeout(() => this.processEnemyTurn(), 300);
            }
            return;
        }
        
        if (result.state === 'playerSelect') {
            this.updateBattleUI();
            this.updateSkillPanel();
            return;
        }
        
        this.updateBattleUI();
        
        if (skillResult && (skillResult.type === 'buff' || skillResult.type === 'debuff')) {
            this.updateBattleUI();
        }
        
        setTimeout(() => {
            this.updateBattleUI();
            this.processNextActorTurn();
        }, 300);
    }
    
    processNextActorTurn() {
        const battle = this.battle;
        if (!battle) return;
        
        const nextActor = battle.currentActor;
        if (!nextActor) {
            const battleEnd = battle.checkBattleEnd();
            if (battleEnd.ended) {
                setTimeout(() => this.handleBattleEnd(battleEnd), 300);
            }
            return;
        }
        
        if (battle.currentActorType === 'player' && nextActor && nextActor !== this.playerTeam[0]) {
            battle.currentTurnIndex++;
            battle.updateCurrentActor();
            
            const battleEnd = battle.checkBattleEnd();
            if (battleEnd.ended) {
                setTimeout(() => this.handleBattleEnd(battleEnd), 300);
                return;
            }
            
            if (battle.currentActorType === 'enemy') {
                setTimeout(() => this.processEnemyTurn(), 300);
            } else if (battle.currentActor === this.playerTeam[0]) {
                this.updateSkillPanel();
            } else if (battle.currentActor && battle.currentActor !== nextActor) {
                setTimeout(() => this.processNextActorTurn(), 100);
            }
        } else if (battle.currentActor === this.playerTeam[0]) {
            this.updateSkillPanel();
        } else if (battle.currentActorType === 'enemy') {
            setTimeout(() => this.processEnemyTurn(), 300);
        } else {
            battle.currentTurnIndex++;
            battle.updateCurrentActor();
            
            const battleEnd = battle.checkBattleEnd();
            if (battleEnd.ended) {
                setTimeout(() => this.handleBattleEnd(battleEnd), 300);
                return;
            }
            
            if (battle.currentActorType === 'enemy') {
                setTimeout(() => this.processEnemyTurn(), 300);
            } else if (battle.currentActor === this.playerTeam[0]) {
                this.updateSkillPanel();
            } else if (battle.currentActor && battle.currentActor !== nextActor) {
                setTimeout(() => this.processNextActorTurn(), 100);
            }
        }
    }

    processEnemyTurn() {
        if (!this.battle) {
            return;
        }
        
        if (this.battle.skipEnemyTurn) {
            this.battle.skipEnemyTurn = false;
            this.battle.currentTurnIndex++;
            this.battle.updateCurrentActor();
            
            this.battle.battleLog.push({
                type: 'skillSkip',
                message: '敌方回合被跳过'
            });
            
            this.updateBattleUI();
            
            if (this.battle.currentActorType === 'enemy') {
                setTimeout(() => this.processEnemyTurn(), 300);
            } else {
                this.updateSkillPanel();
            }
            return;
        }
        
        this.updateBattleUI();
        this.ui.updatePlayerResources(this.playerTeam[0]);
        
        const result = this.battle.executeEnemyAction();
        
        if (result && result.damage) {
            audioManager.playHit();
            const isPlayerTarget = result.target && (result.target.isSummoned || !result.target.isSummoned);
            this.ui.showDamageEffect(result.target, result, true);
        }
        
        setTimeout(() => {
            this.updateBattleUI();
            this.ui.updatePlayerResources(this.playerTeam[0]);
            
            if (result && result.battleEnd) {
                this.handleBattleEnd(result.battleEnd);
            } else if (!this.battle) {
                return;
            } else if (this.battle.currentActorType === 'enemy') {
                setTimeout(() => this.processEnemyTurn(), 300);
            } else {
                this.updateSkillPanel();
            }
        }, 300);
    }
    
    // ==================== 战斗结束处理 ====================
    // 战斗结束后调用，处理胜负逻辑和奖励
    handleBattleEnd(battleEnd) {
        this.ui.hideSkillPanel();           // 隐藏技能面板
        this.ui.hideBattleArea();           // 隐藏战斗区域
        this.ui.hideBattleLog();            // 隐藏战斗日志
        this.ui.hideCancelTargetSelect();   // 隐藏取消按钮
        
        const player = this.playerTeam[0];
        if (player) {
            // 清除战斗中获得的护盾值
            player.shield = 0;
            
            // 重新应用永久增益
            if (player.reapplyBuffs) {
                player.reapplyBuffs();
            }
            // 重置某些技能的 사용计数
            if (player.skills) {
                player.skills.forEach(skill => {
                    if (skill.name === '开导') {
                        player.skillUseCount = player.skillUseCount || {};
                        player.skillUseCount['开导'] = 0;
                    }
                });
            }
            
            // 移除死亡的宠物
            if (player.pets && player.pets.length > 0) {
                const deadPets = player.pets.filter(pet => pet.isDead);
                if (deadPets.length > 0) {
                    player.pets = player.pets.filter(pet => !pet.isDead);
                }
            }
        }
        
        // 如果是BOSS战，停止BOSS音乐
        if (battleEnd.isBoss || (this.battle && this.battle.isBoss)) {
            audioManager.stopBossMusic();
        }
        
        // 根据战斗结果处理
        if (battleEnd.result === 'win') {
            // 战斗胜利
            if (player) {
                // 恢复少量体力和法力
                player.restoreStamina(10);
                player.restoreMana(10);
                // 移除临时增益buff
                player.removeBuff('勇气', player.getBuffStacks('勇气'));
                player.removeBuff('士气', player.getBuffStacks('士气'));
                player.removeBuff('肌无力', player.getBuffStacks('肌无力'));
                this.ui.updatePlayerResources(player);
            }
            // 清除召唤物（它们在战斗结束后消失）
            this.playerTeam = this.playerTeam.filter(char => !char.isSummoned);
            audioManager.playVictory();  // 播放胜利音效
            // 处理胜利奖励
            this.handleVictory(battleEnd.rewards || [], battleEnd.isElite, battleEnd.isBoss);
        } else if (battleEnd.result === 'lose') {
            // 战斗失败
            audioManager.playDefeat();   // 播放失败音效
            this.ui.showGameOver();       // 显示游戏结束界面
        }
    }

    // ==================== 处理战斗胜利 ====================
    // 计算并发放战斗奖励
    handleVictory(rewards, isElite = false, isBoss = false) {
        // 检查是否有自定义战斗胜利奖励（阻止卖槟榔事件）
        if (this.battle && this.battle.winReward && this.battle.winReward.relic) {
            const relicData = this.battle.winReward.relic;
            const relic = new Relic(relicData);
            const player = this.playerTeam[0];
            if (player.addRelic(relic, this)) {
                this.obtainedRelicIds.push(relic.id);
                this.ui.showDialog(`战斗胜利！额外获得遗物——${relic.name}！`, () => {
                    this.handleVictoryContinue(rewards, isElite, isBoss);
                }, {
                    icon: relic.icon,
                    name: relic.name,
                    description: relic.description
                });
                return;
            }
        }
        
        this.handleVictoryContinue(rewards, isElite, isBoss);
    }
    
    handleVictoryContinue(rewards, isElite = false, isBoss = false) {
        // 金币奖励：基础15 + 层数×3，精英×2，BOSS×3
        let goldGain = 15 + this.currentFloor * 3;
        if (isElite) goldGain *= 2;
        if (isBoss) goldGain *= 3;
        
        this.gold += goldGain;
        this.ui.updateGold(this.gold);
        
        const choiceRewards = [];
        
        const randomRelic = Relic.getRandomRelic(this.obtainedRelicIds);
        if (randomRelic && !this.obtainedRelicIds.includes(randomRelic.id)) {
            choiceRewards.push({ type: 'relic', item: randomRelic });
        } else {
            choiceRewards.push({ type: 'attribute', item: { 
                name: '属性提升', 
                icon: '⬆️', 
                description: '随机提升一项属性',
                effect: this.getRandomAttributeBoost()
            }});
        }
        
        let randomSkill;
        if (isBoss) {
            randomSkill = this.getBossSkill();
        } else if (isElite) {
            randomSkill = this.getEliteSkill();
        } else {
            randomSkill = Skill.getRandomSkill(this.currentFloor, this.obtainedSkillIds);
        }
        
        if (randomSkill) {
            choiceRewards.push({ type: 'skill', item: randomSkill });
        } else {
            choiceRewards.push({ type: 'attribute', item: { 
                name: '属性提升', 
                icon: '⬆️', 
                description: '随机提升一项属性',
                effect: this.getRandomAttributeBoost()
            }});
        }
        
        this.pendingRewards = choiceRewards;
        this.ui.showRewards(choiceRewards, goldGain);
    }

    getSkillByRarity(rarities, rarityWeights) {
        let targetRarity;
        const random = Math.random() * 100;
        let cumulative = 0;
        for (const [rarity, weight] of Object.entries(rarityWeights)) {
            cumulative += weight;
            if (random < cumulative) {
                targetRarity = rarity;
                break;
            }
        }
        targetRarity = targetRarity || Object.keys(rarityWeights)[0];
        
        const pool = SKILL_POOL.filter(s => !this.obtainedSkillIds.includes(s.id) && s.rarity === targetRarity);
        if (pool.length === 0) {
            for (const r of rarities) {
                const fallbackPool = SKILL_POOL.filter(s => !this.obtainedSkillIds.includes(s.id) && s.rarity === r);
                if (fallbackPool.length > 0) {
                    return new Skill(fallbackPool[Math.floor(Math.random() * fallbackPool.length)]);
                }
            }
            return Skill.getRandomSkill(this.currentFloor, this.obtainedSkillIds);
        }
        return new Skill(pool[Math.floor(Math.random() * pool.length)]);
    }

    getEliteSkill() {
        return this.getSkillByRarity(['epic', 'legendary', 'mythic'], {
            'epic': 70, 'legendary': 25, 'mythic': 5
        });
    }

    getBossSkill() {
        return this.getSkillByRarity(['legendary', 'mythic'], {
            'legendary': 80, 'mythic': 20
        });
    }

    getRandomAttributeBoost() {
        const boosts = [
            { stat: 'atk', value: 2, name: '攻击力' },
            { stat: 'def', value: 2, name: '防御力' },
            { stat: 'maxHp', value: 15, name: '最大生命' },
            { stat: 'crit', value: 3, name: '暴击率' }
        ];
        return boosts[Math.floor(Math.random() * boosts.length)];
    }

    selectReward(rewardData) {
        const player = this.playerTeam[0];
        
        if (rewardData.type === 'skill') {
            if (player.addSkill(rewardData.item)) {
                this.obtainedSkillIds.push(rewardData.item.id);
                this.ui.hideRewards();
                this.ui.showDialog(`学会了新技能: ${rewardData.item.name}！`, () => {
                    this.nextFloor();
                });
            } else {
                this.pendingSkillToLearn = rewardData.item;
                this.ui.hideRewards();
                this.ui.showSkillReplacePanel(player.skills, rewardData.item);
            }
        } else if (rewardData.type === 'relic') {
            if (player.addRelic(rewardData.item, this)) {
                this.obtainedRelicIds.push(rewardData.item.id);
                this.ui.updatePlayerResources(player);
                this.ui.hideRewards();
                this.ui.showDialog(`获得圣人遗物: ${rewardData.item.name}！`, () => {
                    this.nextFloor();
                }, {
                    icon: rewardData.item.icon,
                    name: rewardData.item.name,
                    description: rewardData.item.description
                });
            }
        } else if (rewardData.type === 'attribute') {
            const boost = rewardData.item.effect;
            player[boost.stat] += boost.value;
            if (boost.stat === 'maxHp') {
                player.hp += boost.value;
            }
            audioManager.playBuff();
            this.ui.updatePlayerResources(player);
            this.ui.hideRewards();
            this.ui.showDialog(`${boost.name} +${boost.value}！`, () => {
                this.nextFloor();
            });
        }
    }

    skipReward() {
        this.gold += 10;
        this.ui.updateGold(this.gold);
        this.ui.hideRewards();
        this.nextFloor();
    }

    // ==================== 进入下一层 ====================
    // 完成任务后进入下一层
    nextFloor() {
        this.currentFloor++;  // 层数+1
        
        // 战斗结束后，每个存活的角色恢复10%最大生命值
        this.playerTeam.forEach(char => {
            if (!char.isDead) {
                char.hp = Math.min(char.hp + Math.floor(char.maxHp * 0.1), char.maxHp);
            }
        });
        
        // 检查槟榔上瘾相关逻辑
        const player = this.playerTeam[0];
        if (player) {
            const hasBetelNutAddiction = player.buffs && player.buffs.some(b => b.name === '槟榔上瘾');
            if (hasBetelNutAddiction) {
                this.betelNutCount++;
                // 连续5层没吃槟榔，获得戒断反应BUFF
                if (this.betelNutCount >= 5) {
                    player.addBuff('戒断反应', 1);
                    audioManager.playDebuff();
                }
            }
            
            // 检查是否有戒断反应BUFF
            const hasWithdrawal = player.buffs && player.buffs.some(b => b.name === '戒断反应');
            // 移除戒断反应BUFF（如果买了槟榔会在购买逻辑中处理）
        }
        
        // 检查是否通关（60层）
        if (this.currentFloor > 60) {
            audioManager.playVictory();    // 播放胜利音乐
            this.ui.showVictory();         // 显示胜利界面
            this.clearSave();              // 清除存档
            return;
        }
        
        // 显示下一层的地图选择
        this.showMapSelection();
        this.saveGame();                   // 保存进度
    }

    // ==================== 打开商店 ====================
    openShop() {
        this.state = 'shop';
        this.shopItems = this.generateShopItems();  // 生成商店商品
        this.ui.showShop(this.shopItems, this.gold);  // 显示商店界面
    }

    // ==================== 生成商店商品 ====================
    generateShopItems() {
        const items = [];
        const itemCount = 4 + Math.floor(this.currentFloor / 10);  // 层数越高商品越多
        const usedItems = new Set();
        
        // 检查玩家是否有槟榔上瘾BUFF，如果有则固定添加槟榔
        const player = this.playerTeam[0];
        const hasBetelNutAddiction = player && player.buffs && player.buffs.some(b => b.name === '槟榔上瘾');
        
        if (hasBetelNutAddiction) {
            const betelNutItem = SHOP_ITEMS.find(item => item.id === 'betel_nut');
            if (betelNutItem) {
                const priceMultiplier = 1 + (this.currentFloor - 1) * 0.05;
                items.push({
                    ...betelNutItem,
                    price: Math.floor(betelNutItem.price * priceMultiplier),
                    sold: false
                });
                usedItems.add('betel_nut');
            }
        }
        
        while (items.length < itemCount) {
            const item = SHOP_ITEMS[Math.floor(Math.random() * SHOP_ITEMS.length)];
            if (!usedItems.has(item.id)) {
                usedItems.add(item.id);
                const priceMultiplier = 1 + (this.currentFloor - 1) * 0.05;
                items.push({
                    ...item,
                    price: Math.floor(item.price * priceMultiplier),
                    sold: false
                });
            }
        }
        
        return items;
    }

    buyItem(index) {
        const item = this.shopItems[index];
        if (!item || item.sold || this.gold < item.price) {
            this.ui.showDialog('金币不足！', () => {});
            return;
        }
        
        this.gold -= item.price;
        item.sold = true;
        audioManager.playClick();
        
        const player = this.playerTeam[0];
        
        // 检查是否是槟榔，如果是则重置计数并移除戒断反应
        if (item.id === 'betel_nut') {
            this.betelNutCount = 0;  // 重置槟榔计数
            // 移除戒断反应BUFF
            if (player.buffs && player.buffs.some(b => b.name === '戒断反应')) {
                player.removeBuff('戒断反应', 999);  // 移除所有层数
            }
            // 槟榔直接使用，不存入药水栏
            player.heal(item.effect.value);
            audioManager.playHeal();
            this.ui.updatePlayerResources(player);
            this.ui.showDialog(`嚼了口槟榔，恢复了 ${item.effect.value} 点生命！`, () => {
                this.ui.updateGold(this.gold);
                this.ui.showShop(this.shopItems, this.gold);
            });
            return;
        }
        
        switch (item.effect.type) {
            case 'heal':
                if (this.potions.length < this.maxPotions && this.addPotion('heal')) {
                    this.ui.updatePlayerResources(player);
                    this.ui.showDialog(`获得了治疗药水，已存入药水栏！`, () => {
                        this.ui.updateGold(this.gold);
                        this.ui.updatePotionBar(this.potions);
                        this.ui.showShop(this.shopItems, this.gold);
                    });
                } else if (this.potions.length >= this.maxPotions) {
                    player.heal(item.effect.value);
                    audioManager.playHeal();
                    this.ui.updatePlayerResources(player);
                    this.ui.showDialog(`药水栏已满，直接恢复了 ${item.effect.value} 点生命！`, () => {
                        this.ui.updateGold(this.gold);
                        this.ui.showShop(this.shopItems, this.gold);
                    });
                } else {
                    player.heal(item.effect.value);
                    audioManager.playHeal();
                    this.ui.updatePlayerResources(player);
                    this.ui.showDialog(`恢复了 ${item.effect.value} 点生命！`, () => {
                        this.ui.updateGold(this.gold);
                        this.ui.showShop(this.shopItems, this.gold);
                    });
                }
                break;
            case 'stamina':
                if (this.potions.length < this.maxPotions && this.addPotion('stamina')) {
                    this.ui.updatePlayerResources(player);
                    this.ui.showDialog(`获得了体力药水，已存入药水栏！`, () => {
                        this.ui.updateGold(this.gold);
                        this.ui.updatePotionBar(this.potions);
                        this.ui.showShop(this.shopItems, this.gold);
                    });
                } else if (this.potions.length >= this.maxPotions) {
                    player.restoreStamina(item.effect.value);
                    audioManager.playHeal();
                    this.ui.updatePlayerResources(player);
                    this.ui.showDialog(`药水栏已满，直接恢复了 ${item.effect.value} 点体力！`, () => {
                        this.ui.updateGold(this.gold);
                        this.ui.showShop(this.shopItems, this.gold);
                    });
                } else {
                    player.restoreStamina(item.effect.value);
                    audioManager.playHeal();
                    this.ui.updatePlayerResources(player);
                    this.ui.showDialog(`恢复了 ${item.effect.value} 点体力！`, () => {
                        this.ui.updateGold(this.gold);
                        this.ui.showShop(this.shopItems, this.gold);
                    });
                }
                break;
            case 'mana':
                if (this.potions.length < this.maxPotions && this.addPotion('mana')) {
                    this.ui.updatePlayerResources(player);
                    this.ui.showDialog(`获得了法力药水，已存入药水栏！`, () => {
                        this.ui.updateGold(this.gold);
                        this.ui.updatePotionBar(this.potions);
                        this.ui.showShop(this.shopItems, this.gold);
                    });
                } else if (this.potions.length >= this.maxPotions) {
                    player.restoreMana(item.effect.value);
                    audioManager.playHeal();
                    this.ui.updatePlayerResources(player);
                    this.ui.showDialog(`药水栏已满，直接恢复了 ${item.effect.value} 点法力！`, () => {
                        this.ui.updateGold(this.gold);
                        this.ui.showShop(this.shopItems, this.gold);
                    });
                } else {
                    player.restoreMana(item.effect.value);
                    audioManager.playHeal();
                    this.ui.updatePlayerResources(player);
                    this.ui.showDialog(`恢复了 ${item.effect.value} 点法力！`, () => {
                        this.ui.updateGold(this.gold);
                        this.ui.showShop(this.shopItems, this.gold);
                    });
                }
                break;
            case 'atk':
                player.atk += item.effect.value;
                player.relicBonusAtk = (player.relicBonusAtk || 0) + item.effect.value;
                audioManager.playBuff();
                this.ui.showDialog(`攻击力 +${item.effect.value}！`, () => {
                    this.ui.updateGold(this.gold);
                    this.ui.showShop(this.shopItems, this.gold);
                });
                break;
            case 'def':
                player.def += item.effect.value;
                player.relicBonusDef = (player.relicBonusDef || 0) + item.effect.value;
                audioManager.playDefense();
                this.ui.showDialog(`防御力 +${item.effect.value}！`, () => {
                    this.ui.updateGold(this.gold);
                    this.ui.showShop(this.shopItems, this.gold);
                });
                break;
            case 'maxHp':
                player.maxHp += item.effect.value;
                player.hp += item.effect.value;
                audioManager.playBuff();
                this.ui.updatePlayerResources(player);
                this.ui.showDialog(`最大生命 +${item.effect.value}！`, () => {
                    this.ui.updateGold(this.gold);
                    this.ui.showShop(this.shopItems, this.gold);
                });
                break;
            case 'maxStamina':
                player.maxStamina += item.effect.value;
                player.stamina += item.effect.value;
                audioManager.playBuff();
                this.ui.updatePlayerResources(player);
                this.ui.showDialog(`最大体力 +${item.effect.value}！`, () => {
                    this.ui.updateGold(this.gold);
                    this.ui.showShop(this.shopItems, this.gold);
                });
                break;
            case 'maxMana':
                player.maxMana += item.effect.value;
                player.mana += item.effect.value;
                audioManager.playBuff();
                this.ui.updatePlayerResources(player);
                this.ui.showDialog(`最大法力 +${item.effect.value}！`, () => {
                    this.ui.updateGold(this.gold);
                    this.ui.showShop(this.shopItems, this.gold);
                });
                break;
            case 'crit':
                player.crit += item.effect.value;
                audioManager.playBuff();
                this.ui.showDialog(`暴击率 +${item.effect.value}%！`, () => {
                    this.ui.updateGold(this.gold);
                    this.ui.showShop(this.shopItems, this.gold);
                });
                break;
            case 'skill':
                const skill = Skill.getRandomSkill(this.currentFloor, this.obtainedSkillIds);
                if (skill && player.addSkill(skill)) {
                    this.obtainedSkillIds.push(skill.id);
                    audioManager.playMagic();
                    this.ui.showDialog(`学会技能: ${skill.name}！`, () => {
                        this.ui.updateGold(this.gold);
                        this.ui.showShop(this.shopItems, this.gold);
                    });
                } else {
                    this.gold += Math.floor(item.price * 0.5);
                    this.ui.showDialog('技能栏已满或无新技能，返还一半金币！', () => {
                        this.ui.updateGold(this.gold);
                        this.ui.showShop(this.shopItems, this.gold);
                    });
                }
                break;
            case 'relic':
                const relic = Relic.getRandomRelic(this.obtainedRelicIds);
                if (relic && player.addRelic(relic, this)) {
                    this.obtainedRelicIds.push(relic.id);
                    audioManager.playMagic();
                    this.ui.showDialog(`获得遗物: ${relic.name}！`, () => {
                        this.ui.updateGold(this.gold);
                        this.ui.showShop(this.shopItems, this.gold);
                    }, {
                        icon: relic.icon,
                        name: relic.name,
                        description: relic.description
                    });
                } else if (!relic) {
                    this.gold += Math.floor(item.price * 0.5);
                    this.ui.showDialog('无新遗物，返还一半金币！', () => {
                        this.ui.updateGold(this.gold);
                        this.ui.showShop(this.shopItems, this.gold);
                    });
                }
                break;
        }
        
        this.ui.updateGold(this.gold);
    }

    leaveShop() {
        this.ui.hideShop();
        this.nextFloor();
    }

    openRest() {
        this.state = 'rest';
        this.ui.showRest();
    }

    rest() {
        const player = this.playerTeam[0];
        const healAmount = Math.floor(player.maxHp * 0.3);
        const staminaAmount = Math.floor(player.maxStamina * 0.5);
        const manaAmount = Math.floor(player.maxMana * 0.5);
        player.heal(healAmount);
        player.restoreStamina(staminaAmount);
        player.restoreMana(manaAmount);
        audioManager.playHeal();
        this.ui.updatePlayerResources(player);
        this.ui.showDialog(`恢复了 ${healAmount} 点生命、${staminaAmount} 点体力、${manaAmount} 点法力！`, () => {
            this.ui.hideRest();
            this.nextFloor();
        });
    }

    enhance() {
        const player = this.playerTeam[0];
        const enhancement = this.getRandomAttributeBoost();
        player[enhancement.stat] += enhancement.value;
        if (enhancement.stat === 'maxHp') {
            player.hp += enhancement.value;
        }
        audioManager.playBuff();
        this.ui.updatePlayerResources(player);
        this.ui.showDialog(`${enhancement.name} +${enhancement.value}！`, () => {
            this.ui.hideRest();
            this.nextFloor();
        });
    }

    leaveRest() {
        this.ui.hideRest();
        this.showMapSelection();
    }

    triggerEvent() {
        this.state = 'event';
        let availableEvents = [...RANDOM_EVENTS];
        
        availableEvents = availableEvents.filter(e => !this.usedEventIds.includes(e.id));
        
        const player = this.playerTeam[0];
        if (!player.pets || player.pets.length === 0) {
            availableEvents = availableEvents.filter(e => e.id !== 'sacrifice');
        }
        
        const weightedEvents = [];
        availableEvents.forEach(event => {
            weightedEvents.push(event);
        });
        
        const event = weightedEvents[Math.floor(Math.random() * weightedEvents.length)];
        this.currentEvent = event;
        this.ui.showEvent(event);
    }

    selectEventOption(optionIndex) {
        const event = this.currentEvent;
        const option = event.options[optionIndex];
        const player = this.playerTeam[0];
        
        audioManager.playClick();
        
        let resultText = '';
        let rewardInfo = null;
        
        // 处理夺食事件的自定义检查
        if (option.effect.customCheck) {
            const checkResult = option.effect.check(this);
            resultText = checkResult.message;
            if (checkResult.relic) {
                rewardInfo = {
                    icon: checkResult.relic.icon,
                    name: checkResult.relic.name,
                    description: checkResult.relic.description
                };
            }
        }
        
        // 处理槟榔上瘾buff
        if (option.effect.customBuff) {
            player.addBuff(option.effect.buff, 1);
            this.betelNutCount = 0;  // 初始化槟榔计数
            resultText = option.effect.message;
            audioManager.playBuff();
        }
        
        // 处理阻止卖槟榔事件（触发战斗）
        if (option.effect.customBattle) {
            resultText = option.effect.message;
            this.ui.hideEvent();
            this.startBattle(false, false, option.effect.enemy, option.effect.winReward);
            return;
        }
        
        if (option.effect.cost && this.gold < option.effect.cost) {
            this.ui.hideEvent();
            this.ui.showDialog('金币不足！', () => {
                this.showMapSelection();
            });
            return;
        }
        
        if (option.effect.cost) {
            this.gold -= option.effect.cost;
        }
        
        if (option.effect.damage) {
            player.takeDamage(option.effect.damage);
            audioManager.playHit();
            resultText = `受到了 ${option.effect.damage} 点伤害！`;
        }
        
        if (option.effect.heal) {
            player.heal(option.effect.heal);
            audioManager.playHeal();
            resultText = `恢复了 ${option.effect.heal} 点生命！`;
        }
        
        if (option.effect.stamina) {
            player.restoreStamina(option.effect.stamina);
            audioManager.playHeal();
            resultText = resultText ? resultText + ` 恢复了${option.effect.stamina}点体力！` : `恢复了 ${option.effect.stamina} 点体力！`;
        }
        
        if (option.effect.mana) {
            player.restoreMana(option.effect.mana);
            audioManager.playHeal();
            resultText = resultText ? resultText + ` 恢复了${option.effect.mana}点法力！` : `恢复了 ${option.effect.mana} 点法力！`;
        }
        
        if (option.effect.gold) {
            const goldGain = Array.isArray(option.effect.gold) 
                ? option.effect.gold[0] + Math.floor(Math.random() * (option.effect.gold[1] - option.effect.gold[0]))
                : option.effect.gold;
            this.gold += goldGain;
            resultText = `获得了 ${goldGain} 金币！`;
        }
        
        if (option.effect.buff) {
            player.atk += option.effect.buff.atk || 0;
            player.def += option.effect.buff.def || 0;
            player.relicBonusAtk = (player.relicBonusAtk || 0) + (option.effect.buff.atk || 0);
            player.relicBonusDef = (player.relicBonusDef || 0) + (option.effect.buff.def || 0);
            audioManager.playBuff();
            resultText = '获得了增益效果！';
        }
        
        if (option.effect.randomItem) {
            const items = ['heal_potion', 'atk_boost', 'def_boost', 'stamina_potion', 'mana_potion'];
            const itemId = items[Math.floor(Math.random() * items.length)];
            const baseItem = SHOP_ITEMS.find(i => i.id === itemId);
            if (baseItem) {
                switch (baseItem.effect.type) {
                    case 'heal': player.heal(baseItem.effect.value); audioManager.playHeal(); break;
                    case 'stamina': player.restoreStamina(baseItem.effect.value); audioManager.playHeal(); break;
                    case 'mana': player.restoreMana(baseItem.effect.value); audioManager.playHeal(); break;
                    case 'atk': 
                        player.atk += baseItem.effect.value; 
                        player.relicBonusAtk = (player.relicBonusAtk || 0) + baseItem.effect.value;
                        audioManager.playBuff(); 
                        break;
                    case 'def': 
                        player.def += baseItem.effect.value; 
                        player.relicBonusDef = (player.relicBonusDef || 0) + baseItem.effect.value;
                        audioManager.playDefense(); 
                        break;
                }
                resultText = `获得了 ${baseItem.name}！`;
            }
        }
        
        if (option.effect.karma) {
            this.karma++;
            resultText = '你的善举被记录了...';
        }
        
        if (option.effect.item) {
            const baseItem = SHOP_ITEMS.find(i => i.id === option.effect.item);
            if (baseItem) {
                if (baseItem.effect.type === 'heal') {
                    if (this.addPotion('heal')) {
                        this.ui.updatePotionBar(this.potions);
                        resultText = `获得了 ${baseItem.name}，已存入药水栏！`;
                    } else {
                        player.heal(30);
                        resultText = `药水栏已满，直接使用了 ${baseItem.name}恢复了30点生命！`;
                    }
                } else if (baseItem.effect.type === 'stamina') {
                    if (this.addPotion('stamina')) {
                        this.ui.updatePotionBar(this.potions);
                        resultText = `获得了 ${baseItem.name}，已存入药水栏！`;
                    } else {
                        player.restoreStamina(30);
                        resultText = `药水栏已满，直接使用了 ${baseItem.name}恢复了30点体力！`;
                    }
                } else if (baseItem.effect.type === 'mana') {
                    if (this.addPotion('mana')) {
                        this.ui.updatePotionBar(this.potions);
                        resultText = `获得了 ${baseItem.name}，已存入药水栏！`;
                    } else {
                        player.restoreMana(20);
                        resultText = `药水栏已满，直接使用了 ${baseItem.name}恢复了20点法力！`;
                    }
                }
                audioManager.playHeal();
            }
        }
        
        if (option.effect.escape) {
            resultText = option.effect.message || '成功逃生了！';
            audioManager.playClick();
        }
        
        if (option.effect.pet) {
            const petInfo = option.effect.pet.split(',');
            const petType = petInfo[0];
            const petDesc = petInfo[1] || '';
            
            if (player.pets && player.pets.length >= 2) {
                resultText = '宠物栏已满，无法再获得新宠物！';
            } else {
                const pet = Pet.createPet(Pet.getSpecialPet(petType));
                if (pet) {
                    if (!player.pets) {
                        player.pets = [];
                    }
                    player.pets.push(pet);
                    resultText = option.effect.message || `获得了奇遇宠物——${pet.name}！`;
                    rewardInfo = {
                        icon: pet.icon,
                        name: pet.name,
                        description: pet.description
                    };
                    audioManager.playMagic();
                }
            }
        }
        
        if (option.effect.trapDamage !== undefined) {
            const hasDiscipleSkill = player.skills && player.skills.some(s => s.name === '啊！徒弟！');
            
            if (hasDiscipleSkill) {
                resultText = '徒弟在危机时刻将你从陷阱中带出！没有受到伤害！';
                audioManager.playBuff();
            } else {
                const trapTypes = ['地刺', '落石', '毒雾'];
                const trapType = trapTypes[Math.floor(Math.random() * trapTypes.length)];
                const damage = Math.floor(player.hp * option.effect.trapDamage);
                player.takeDamage(damage);
                audioManager.playHit();
                resultText = `触发了${trapType}陷阱！受到了 ${damage} 点伤害（当前生命的20%）！`;
            }
        }
        
        if (option.effect.extraReward) {
            const rewardTypes = ['relic', 'skill', 'potion', 'gold'];
            const rewardType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
            
            if (rewardType === 'relic') {
                const relic = Relic.getRandomRelic(this.obtainedRelicIds);
                if (relic && player && typeof player.addRelic === 'function' && player.addRelic(relic, this)) {
                    this.obtainedRelicIds.push(relic.id);
                    resultText += ` 额外获得了遗物——${relic.name}！`;
                }
            } else if (rewardType === 'skill') {
                const skill = Skill.getRandomSkill(this.currentFloor, this.obtainedSkillIds);
                if (skill && player.addSkill(skill)) {
                    this.obtainedSkillIds.push(skill.id);
                    resultText += ` 额外获得了技能——${skill.name}！`;
                }
            } else if (rewardType === 'potion') {
                if (this.addPotion('heal')) {
                    resultText += ` 额外获得了治疗药水！`;
                } else {
                    player.heal(30);
                    resultText += ` 额外恢复了30点生命！`;
                }
            } else if (rewardType === 'gold') {
                const extraGold = 10 + Math.floor(Math.random() * 20);
                this.gold += extraGold;
                resultText += ` 额外获得了${extraGold}金币！`;
            }
        }
        
        if (option.effect.relic) {
            const relicIdMap = {
                'two_surname_servant': 21,
                'world_line': 22,
                'bloody_soap': 23,
                'coward': 24
            };
            
            let relicId = relicIdMap[option.effect.relic];
            if (!relicId && typeof option.effect.relic === 'number') {
                relicId = option.effect.relic;
            }
            
            if (relicId) {
                const relicPoolItem = RELIC_POOL.find(r => r.id === relicId);
                if (relicPoolItem) {
                    const relic = new Relic(relicPoolItem);
                    if (option.effect.relic === 'two_surname_servant') {
                        player.maxHp -= 10;
                        player.hp = Math.min(player.hp, player.maxHp);
                        resultText = '被503中的成员邀请加入！最大生命值降低10点，';
                    } else if (option.effect.relic === 'world_line') {
                        this.currentFloor = Math.max(1, this.currentFloor + 3);
                        resultText = '获得了变动的世界线！角色上升3层！';
                    } else if (option.effect.relic === 'bloody_soap') {
                        resultText = '在黑暗中摸索半天，摸到了一个东西！';
                    } else if (option.effect.relic === 'coward') {
                        resultText = '你的勇气受到了大帝的鄙夷！';
                    } else if (typeof option.effect.relic === 'number') {
                        resultText = option.effect.message || '';
                    }
                    
                    if (player && typeof player.addRelic === 'function' && player.addRelic(relic, this)) {
                        this.obtainedRelicIds.push(relic.id);
                        const relicText = resultText ? ` ${resultText}` : `获得圣人遗物——${relic.name}！`;
                        resultText = relicText;
                        rewardInfo = {
                            icon: relic.icon,
                            name: relic.name,
                            description: relic.description
                        };
                        audioManager.playMagic();
                    }
                }
            }
        }
        
        if (option.effect.maxHpChange) {
            player.maxHp += option.effect.maxHpChange;
            player.hp = Math.min(player.hp, player.maxHp);
            resultText = option.effect.message || `最大生命值变化了 ${option.effect.maxHpChange} 点！`;
        }
        
        if (option.effect.sacrifice && player.pets && player.pets.length > 0) {
            const sacrificedPet = player.pets[0];
            const petName = sacrificedPet ? sacrificedPet.name : '宠物';
            player.pets = [];
            this.playerTeam[0].pets = [];
            this.playerTeam = this.playerTeam.filter(p => p.id === player.id);
            this.saveGame();
            resultText = `你献祭了你的伙伴${petName}！`;
        }
        
        this.ui.updateGold(this.gold);
        this.ui.updatePlayerResources(player);
        
        // 这些事件触发后不能重复出现
        if (['cliff', 'rescue', 'crossroad', 'food_steal', 'betel_nut_seller'].includes(event.id)) {
            this.usedEventIds.push(event.id);
        }
        
        if (player.isDead) {
            audioManager.playDefeat();
            this.ui.hideEvent();
            this.ui.showGameOver();
            return;
        }
        
        this.ui.hideEvent();
        this.ui.showDialog(resultText || '什么也没发生...', () => {
            this.nextFloor();
        }, rewardInfo);
    }

    showMainMenu() {
        this.state = 'menu';
        this.ui.showMainMenu();
    }

    saveGame() {
        const saveData = {
            currentFloor: this.currentFloor,
            gold: this.gold,
            karma: this.karma,
            playerTeam: this.playerTeam,
            obtainedSkillIds: this.obtainedSkillIds,
            obtainedRelicIds: this.obtainedRelicIds,
            potions: this.potions,
            state: this.state,
            timestamp: Date.now()
        };
        this._saveToStorage('dungeon_save', JSON.stringify(saveData));
    }

    loadGame() {
        const saveData = this._loadFromStorage('dungeon_save');
        if (!saveData) return false;
        
        try {
            const data = JSON.parse(saveData);
            this.currentFloor = data.currentFloor || 1;
            this.gold = data.gold || 0;
            this.karma = data.karma || 0;
            this.playerTeam = data.playerTeam || [];
            this.obtainedSkillIds = data.obtainedSkillIds || [];
            this.obtainedRelicIds = data.obtainedRelicIds || [];
            this.potions = data.potions || [];
            this.state = data.state || 'map';
            
            if (this.playerTeam.length > 0) {
                const player = this.playerTeam[0];
                if (player.maxStamina === undefined) {
                    player.maxStamina = 80;
                    player.stamina = 80;
                }
                if (player.maxMana === undefined) {
                    player.maxMana = 120;
                    player.mana = 120;
                }
                if (player.baseAtk === undefined) {
                    player.baseAtk = player.atk;
                    player.baseDef = player.def;
                    player.baseSpd = player.spd;
                    player.relicBonusAtk = 0;
                    player.relicBonusDef = 0;
                    player.relicBonusSpd = 0;
                }
                player.getHpPercent = function() {
                    return Math.floor((this.hp / this.maxHp) * 100);
                };
                player.getStaminaPercent = function() {
                    return Math.floor((this.stamina / this.maxStamina) * 100);
                };
                player.getManaPercent = function() {
                    return Math.floor((this.mana / this.maxMana) * 100);
                };
                player.hasStamina = function(cost) {
                    return this.stamina >= cost;
                };
                player.hasMana = function(cost) {
                    return this.mana >= cost;
                };
                player.consumeStamina = function(cost) {
                    if (this.stamina >= cost) {
                        this.stamina -= cost;
                        return true;
                    }
                    return false;
                };
                player.consumeMana = function(cost) {
                    if (this.mana >= cost) {
                        this.mana -= cost;
                        return true;
                    }
                    return false;
                };
                player.restoreStamina = function(amount) {
                    this.stamina = Math.min(this.maxStamina, this.stamina + amount);
                };
                player.restoreMana = function(amount) {
                    this.mana = Math.min(this.maxMana, this.mana + amount);
                };
                
                if (player.skills && player.skills.length > 0) {
                    player.skills = player.skills.map(skillData => {
                        const skillPoolItem = SKILL_POOL.find(s => s.id === skillData.id);
                        if (skillPoolItem) {
                            return new Skill(skillPoolItem);
                        }
                        return new Skill(skillData);
                    });
                }
                
                if (player.relics && player.relics.length > 0) {
                    player.relics = player.relics.map(relicData => {
                        const relicPoolItem = RELIC_POOL.find(r => r.id === relicData.id);
                        if (relicPoolItem) {
                            return new Relic(relicPoolItem);
                        }
                        return new Relic(relicData);
                    });
                }
                
                if (player.pets && player.pets.length > 0) {
                    player.pets = player.pets.map(petData => {
                        const specialPet = Pet.getSpecialPet(petData.type);
                        if (specialPet) {
                            return new Pet(specialPet);
                        }
                        return new Pet(petData);
                    });
                }
                
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    hasSave() {
        const saveData = this._loadFromStorage('dungeon_save');
        if (!saveData) return false;
        try {
            const data = JSON.parse(saveData);
            return data.playerTeam && data.playerTeam.length > 0;
        } catch (e) {
            return false;
        }
    }

    continue() {
        if (this.loadGame()) {
            this.ui.showGameScreen();
            this.ui.updatePlayerPortrait(this.playerTeam[0]);
            audioManager.startBgMusic();
            
            this.battle = null;
            
            if (this.state === 'map') {
                this.showMapSelection();
            } else if (this.state === 'battle') {
                this.battle = new Battle(this);
                this.battle.startBattle(this.playerTeam, this.currentFloor, false, FLOOR_DATA[this.currentFloor]?.isBoss || false);
                this.ui.showBattleArea();
                this.enterBattle();
            } else if (this.state === 'shop') {
                this.openShop();
            } else if (this.state === 'rest') {
                this.ui.showRest();
            } else if (this.state === 'event') {
                this.triggerEvent();
            }
        }
    }

    clearSave() {
        this._removeFromStorage('dungeon_save');
    }

    addPotion(potionType) {
        if (this.potions.length < this.maxPotions) {
            this.potions.push(potionType);
            this.ui.updatePotionBar(this.potions);
            this.saveGame();
            return true;
        }
        return false;
    }

    usePotion(index) {
        if (index < 0 || index >= this.potions.length) return;
        
        const potionType = this.potions[index];
        const player = this.playerTeam[0];
        
        let healAmount = 0;
        switch(potionType) {
            case 'heal':
                healAmount = 50;
                player.heal(healAmount);
                audioManager.playHeal();
                this.ui.showDialog(`使用了治疗药水恢复了 ${healAmount} 点生命！`, () => {
                    this.potions.splice(index, 1);
                    this.ui.updatePotionBar(this.potions);
                    this.ui.updatePlayerResources(player);
                    this.saveGame();
                });
                break;
            case 'stamina':
                const staminaAmount = 50;
                player.restoreStamina(staminaAmount);
                audioManager.playHeal();
                this.ui.showDialog(`使用了体力药水恢复了 ${staminaAmount} 点体力！`, () => {
                    this.potions.splice(index, 1);
                    this.ui.updatePotionBar(this.potions);
                    this.ui.updatePlayerResources(player);
                    this.saveGame();
                });
                break;
            case 'mana':
                const manaAmount = 30;
                player.restoreMana(manaAmount);
                audioManager.playHeal();
                this.ui.showDialog(`使用了法力药水恢复了 ${manaAmount} 点法力！`, () => {
                    this.potions.splice(index, 1);
                    this.ui.updatePotionBar(this.potions);
                    this.ui.updatePlayerResources(player);
                    this.saveGame();
                });
                break;
        }
    }

    replaceSkill(oldSkillIndex) {
        const player = this.playerTeam[0];
        const newSkill = this.pendingSkillToLearn;
        
        if (!newSkill || oldSkillIndex < 0 || oldSkillIndex >= player.skills.length) {
            this.ui.hideSkillReplacePanel();
            this.ui.showDialog('替换取消', () => {
                this.nextFloor();
            });
            return;
        }
        
        const oldSkill = player.skills[oldSkillIndex];
        const oldSkillIdIndex = this.obtainedSkillIds.indexOf(oldSkill.id);
        
        player.skills.splice(oldSkillIndex, 1);
        player.skills.push(newSkill);
        
        if (oldSkillIdIndex !== -1) {
            this.obtainedSkillIds[oldSkillIdIndex] = newSkill.id;
        } else {
            this.obtainedSkillIds.push(newSkill.id);
        }
        
        this.pendingSkillToLearn = null;
        
        this.ui.hideSkillReplacePanel();
        this.ui.showDialog(`学会了新技能: ${newSkill.name}！替换了 ${oldSkill.name}`, () => {
            this.nextFloor();
        });
    }

    cancelSkillReplace() {
        this.gold += 20;
        this.ui.updateGold(this.gold);
        this.ui.hideSkillReplacePanel();
        this.ui.showDialog('技能栏已满，获得20金币！', () => {
            this.nextFloor();
        });
    }

    obtainDebugItem(type, item) {
        const player = this.playerTeam[0];
        if (!player) return;

        if (type === 'skills') {
            const skill = new Skill(item);
            if (player.skills.length < 6) {
                player.skills.push(skill);
                this.obtainedSkillIds.push(skill.id);
                this.ui.showDialog(`获得技能: ${skill.name}！`, () => {}, {
                    icon: skill.icon,
                    name: skill.name,
                    description: skill.description
                });
            } else {
                this.pendingSkillToLearn = skill;
                this.ui.showSkillReplacePanel(player.skills, skill);
            }
        } else if (type === 'relics') {
            const relic = new Relic(item);
            if (player.addRelic(relic, this)) {
                this.obtainedRelicIds.push(relic.id);
                this.ui.showDialog(`获得遗物: ${relic.name}！`, () => {}, {
                    icon: relic.icon,
                    name: relic.name,
                    description: relic.description
                });
            } else {
                this.ui.showDialog('遗物栏已满！', () => {});
            }
        } else if (type === 'pets') {
            const pet = Pet.getSpecialPet(item.type);
            if (pet) {
                if (!player.pets) {
                    player.pets = [];
                }
                if (player.pets.length >= 2) {
                    this.ui.showDialog('宠物栏已满！', () => {});
                    return;
                }
                player.pets.push(pet);
                this.ui.showDialog(`获得宠物: ${pet.name}！`, () => {}, {
                    icon: pet.icon,
                    name: pet.name,
                    description: pet.description
                });
            }
        }
        this.saveGame();
    }

    triggerDebugEvent(event) {
        this.state = 'event';
        this.currentEvent = event;
        this.ui.showEvent(event);
    }
}
