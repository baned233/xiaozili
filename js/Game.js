class Game {
    constructor() {
        this.currentFloor = 1;
        this.gold = 0;
        this.playerTeam = [];
        this.battle = null;
        this.ui = null;
        this.state = 'menu';
        this.shopItems = [];
        this.currentPaths = [];
        this.karma = 0;
        this.pendingRewards = [];
        this.obtainedSkillIds = [];
        this.obtainedRelicIds = [];
        this.potions = [];
        this.maxPotions = 3;
        this.usedEventIds = [];
    }

    init() {
        audioManager.init();
        this.ui = new UI(this);
        this.showMainMenu();
    }

    start() {
        this.currentFloor = 1;
        this.gold = 100;
        this.karma = 0;
        this.playerTeam = [Character.createJiaXuan()];
        this.obtainedSkillIds = [11];
        this.obtainedRelicIds = [];
        this.potions = [];
        this.usedEventIds = [];
        this.state = 'map';
        
        this.clearSave();
        
        this.ui.showGameScreen();
        this.ui.updatePlayerPortrait(this.playerTeam[0]);
        this.ui.updatePotionBar(this.potions);
        this.showMapSelection();
        
        audioManager.startBgMusic();
        this.saveGame();
    }

    restart() {
        this.ui.hideGameOver();
        this.ui.hideVictory();
        this.start();
    }

    showMapSelection() {
        this.state = 'map';
        this.ui.updateFloor(this.currentFloor);
        this.ui.updateGold(this.gold);
        this.ui.setBackgroundClass(this.currentFloor);
        this.ui.updatePlayerResources(this.playerTeam[0]);
        
        this.currentPaths = this.generatePaths();
        this.ui.showMapPanel(this.currentPaths, this.currentFloor);
    }

    generatePaths() {
        const paths = [];
        
        if (this.currentFloor % 15 === 0) {
            const bossPath = PATH_TYPES['boss'];
            return [{ type: 'boss', name: 'BOSS战', icon: bossPath.icon, desc: FLOOR_DATA[this.currentFloor].bossName }];
        }
        
        const usedTypes = new Set();
        
        for (let i = 0; i < 3; i++) {
            let pathType;
            const roll = Math.random();
            
            if (roll < 0.35 && !usedTypes.has('battle')) {
                pathType = 'battle';
            } else if (roll < 0.45 && !usedTypes.has('elite') && this.currentFloor % 5 === 0) {
                pathType = 'elite';
            } else if (roll < 0.50 && !usedTypes.has('shop')) {
                pathType = 'shop';
            } else if (roll < 0.65 && !usedTypes.has('rest')) {
                pathType = 'rest';
            } else if (roll < 0.90 && !usedTypes.has('event')) {
                pathType = 'event';
            } else {
                pathType = 'battle';
            }
            
            usedTypes.add(pathType);
            
            const pathInfo = PATH_TYPES[pathType];
            paths.push({
                type: pathType,
                name: pathInfo.name,
                icon: pathInfo.icon,
                desc: pathInfo.desc
            });
        }
        
        return paths;
    }

    selectPath(index) {
        const path = this.currentPaths[index];
        if (!path) {
            return;
        }
        
        audioManager.playClick();
        this.ui.hideMapPanel();
        
        switch (path.type) {
            case 'battle':
            case 'elite':
                this.startBattle(path.type === 'elite');
                break;
            case 'boss':
                this.startBattle(false, true);
                break;
            case 'shop':
                this.openShop();
                break;
            case 'rest':
                this.openRest();
                break;
            case 'event':
                this.triggerEvent();
                break;
        }
    }

    startBattle(isElite = false, isBoss = false) {
        this.state = 'battle';
        this.battle = new Battle(this);
        
        const player = this.playerTeam[0];
        if (player) {
            player.baseSpd = player.baseSpd || player.spd;
        }
        
        const battleResult = this.battle.startBattle(this.playerTeam, this.currentFloor, isElite, isBoss);
        
        this.ui.setBackgroundClass(this.currentFloor);
        this.ui.showBattleArea();
        this.ui.showBattleLog();
        
        if (isBoss || FLOOR_DATA[this.currentFloor].isBoss) {
            audioManager.playBossMusic();
            const bossData = BOSS_DIALOGS[this.currentFloor];
            if (bossData) {
                this.ui.showDialog(`${bossData.name}: "${bossData.enter}"`, () => {
                    this.enterBattle();
                });
                return;
            }
        }
        
        this.enterBattle();
    }

    enterBattle() {
        this.updateBattleUI();
        
        if (this.battle.isPlayerTurn()) {
            this.updateSkillPanel();
        } else {
            setTimeout(() => this.processEnemyTurn(), 500);
        }
    }

    updateBattleUI() {
        this.ui.hideCancelTargetSelect();
        this.ui.updateBattleArea(this.battle);
        this.ui.updateBattleLog(this.battle.battleLog);
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
                    this.ui.showDamageEffect(target, skillResult, isPlayerSide, this.battle.selectedSkill);
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
    
    handleBattleEnd(battleEnd) {
        this.ui.hideSkillPanel();
        this.ui.hideBattleArea();
        this.ui.hideBattleLog();
        this.ui.hideCancelTargetSelect();
        
        const player = this.playerTeam[0];
        if (player) {
            if (player.baseSpd !== undefined) {
                player.spd = player.baseSpd;
            }
            if (player.skills) {
                player.skills.forEach(skill => {
                    if (skill.name === '开导') {
                        player.skillUseCount = player.skillUseCount || {};
                        player.skillUseCount['开导'] = 0;
                    }
                });
            }
        }
        
        if (battleEnd.isBoss || (this.battle && this.battle.isBoss)) {
            audioManager.stopBossMusic();
        }
        
        if (battleEnd.result === 'win') {
            if (player) {
                player.restoreStamina(10);
                player.restoreMana(10);
                player.removeBuff('勇气', player.getBuffStacks('勇气'));
                player.removeBuff('士气', player.getBuffStacks('士气'));
                this.ui.updatePlayerResources(player);
            }
            this.playerTeam = this.playerTeam.filter(char => !char.isSummoned);
            audioManager.playVictory();
            this.handleVictory(battleEnd.rewards || [], battleEnd.isElite, battleEnd.isBoss);
        } else if (battleEnd.result === 'lose') {
            audioManager.playDefeat();
            this.ui.showGameOver();
        }
    }

    handleVictory(rewards, isElite = false, isBoss = false) {
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
            if (player.addRelic(rewardData.item)) {
                this.obtainedRelicIds.push(rewardData.item.id);
                this.ui.updatePlayerResources(player);
                this.ui.hideRewards();
                this.ui.showDialog(`获得圣人遗物: ${rewardData.item.name}！`, () => {
                    this.nextFloor();
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

    nextFloor() {
        this.currentFloor++;
        
        this.playerTeam.forEach(char => {
            if (!char.isDead) {
                char.hp = Math.min(char.hp + Math.floor(char.maxHp * 0.1), char.maxHp);
            }
        });
        
        if (this.currentFloor > 60) {
            audioManager.playVictory();
            this.ui.showVictory();
            this.clearSave();
            return;
        }
        
        this.showMapSelection();
        this.saveGame();
    }

    openShop() {
        this.state = 'shop';
        this.shopItems = this.generateShopItems();
        this.ui.showShop(this.shopItems, this.gold);
    }

    generateShopItems() {
        const items = [];
        const itemCount = 4 + Math.floor(this.currentFloor / 10);
        const usedItems = new Set();
        
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
                if (relic && player.addRelic(relic)) {
                    this.obtainedRelicIds.push(relic.id);
                    audioManager.playMagic();
                    this.ui.showDialog(`获得遗物: ${relic.name}！`, () => {
                        this.ui.updateGold(this.gold);
                        this.ui.showShop(this.shopItems, this.gold);
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
                if (relic && player && typeof player.addRelic === 'function' && player.addRelic(relic)) {
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
                    
                    if (player && typeof player.addRelic === 'function' && player.addRelic(relic)) {
                        this.obtainedRelicIds.push(relic.id);
                        const relicText = resultText ? ` ${resultText}` : `获得圣人遗物——${relic.name}！`;
                        resultText = relicText;
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
        
        if (['cliff', 'rescue', 'crossroad'].includes(event.id)) {
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
        });
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
        localStorage.setItem('dungeon_save', JSON.stringify(saveData));
    }

    loadGame() {
        const saveData = localStorage.getItem('dungeon_save');
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
        const saveData = localStorage.getItem('dungeon_save');
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
        localStorage.removeItem('dungeon_save');
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
                this.ui.showDialog(`获得技能: ${skill.name}！`, () => {});
            } else {
                this.pendingSkillToLearn = skill;
                this.ui.showSkillReplacePanel(player.skills, skill);
            }
        } else if (type === 'relics') {
            const relic = new Relic(item);
            if (player.addRelic(relic)) {
                this.obtainedRelicIds.push(relic.id);
                this.ui.showDialog(`获得遗物: ${relic.name}！`, () => {});
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
                this.ui.showDialog(`获得宠物: ${pet.name}！`, () => {});
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
