class Battle {
    constructor(game) {
        this.game = game;
        this.playerTeam = [];
        this.enemies = [];
        this.turnOrder = [];
        this.currentTurnIndex = 0;
        this.round = 1;
        this.currentActor = null;
        this.currentActorType = null;
        this.battleState = 'playerSelect';
        this.selectedSkill = null;
        this.selectedTarget = null;
        this.battleLog = [];
        this.rewards = [];
        this.isElite = false;
        this.isBoss = false;
        this.skipEnemyTurn = false;
        this.lastPlayerDamage = 0;
    }

    startBattle(playerTeam, floor, isElite = false, isBoss = false) {
        this.playerTeam = playerTeam;
        this.enemies = [];
        this.isElite = isElite;
        this.isBoss = isBoss || FLOOR_DATA[floor].isBoss;
        
        const player = playerTeam[0];
        if (player.pets && player.pets.length > 0) {
            player.pets.forEach(pet => {
                if (!pet.isDead && pet.battleType === 'special') {
                    const alreadyInTeam = this.playerTeam.some(p => p.id === pet.id);
                    if (!alreadyInTeam) {
                        pet.isSummoned = true;
                        this.playerTeam.push(pet);
                        if (pet.specialAbility && pet.specialAbility.type === 'mimic') {
                            pet.mimickedSkill = null;
                            if (player.skills && player.skills.length > 0) {
                                const randomSkill = player.skills[Math.floor(Math.random() * player.skills.length)];
                                pet.mimickedSkill = randomSkill;
                                this.battleLog.push({
                                    type: 'petAbility',
                                    pet: pet.name,
                                    ability: 'mimic',
                                    skill: randomSkill.name
                                });
                            }
                        }
                    }
                }
            });
        }
        
        if (player.relics && player.relics.some(r => r.name === '霸王之卵')) {
            player.霸王之卵免疫一次 = true;
            player.霸王之卵复活 = true;
        }
        
        if (player.skills) {
            player.skills.forEach(skill => {
                if (skill.name === '开导') {
                    player.skillUseCount = player.skillUseCount || {};
                    player.skillUseCount['开导'] = 0;
                }
            });
        }
        
        let enemyCount;
        if (this.isBoss) {
            enemyCount = 1;
        } else if (isElite) {
            enemyCount = 1;
        } else {
            enemyCount = Math.min(1 + Math.floor(floor / 5), 3);
        }
        
        for (let i = 0; i < enemyCount; i++) {
            this.enemies.push(Enemy.createEnemy(floor, isElite, this.isBoss));
        }

        this.calculateTurnOrder();
        this.round = 1;
        this.currentTurnIndex = 0;
        this.battleLog = [];
        this.rewards = [];
        this.battleState = 'playerSelect';
        
        this.updateCurrentActor();
        
        if (this.isBoss) {
            const bossData = BOSS_DIALOGS[floor];
            if (bossData) {
                return { type: 'boss', bossName: bossData.name, dialog: bossData.enter };
            }
        }
        
        return { type: 'normal' };
    }

    calculateTurnOrder() {
        const allEntities = [];
        
        this.playerTeam.forEach((char) => {
            if (!char.isDead && !char.banished && !char.isSummoned) {
                allEntities.push({ type: 'player', entity: char });
            }
        });
        
        this.enemies.forEach((enemy) => {
            if (!enemy.isDead && !enemy.banished) {
                allEntities.push({ type: 'enemy', entity: enemy });
            }
        });

        allEntities.sort((a, b) => {
            if (b.entity.spd !== a.entity.spd) {
                return b.entity.spd - a.entity.spd;
            }
            return Math.random() - 0.5;
        });

        this.turnOrder = allEntities;
    }

    updateCurrentActor() {
        this.playerTeam.forEach(c => {
            if (c.banished && c.banishTurns > 0) {
                c.banishTurns--;
                if (c.banishTurns <= 0) {
                    c.banished = false;
                }
            }
        });
        
        if (this.banishedEnemies) {
            const remainingEnemies = this.banishedEnemies.filter(b => {
                if (b.returnTurns <= this.round) {
                    const alreadyExists = this.enemies.some(e => e.id === b.enemy.id);
                    if (!alreadyExists) {
                        b.enemy.banished = false;
                        b.enemy.isDead = false;
                        b.enemy.hp = b.enemy.originalHp || b.enemy.maxHp;
                        this.enemies.push(b.enemy);
                        this.battleLog.push({
                            type: 'banishReturn',
                            enemy: b.enemy.name
                        });
                    }
                    return false;
                }
                return true;
            });
            this.banishedEnemies = remainingEnemies;
        }
        
        while (this.currentTurnIndex < this.turnOrder.length) {
            const actor = this.turnOrder[this.currentTurnIndex];
            if (actor.entity.isDead) {
                this.currentTurnIndex++;
            } else if (actor.entity.sleeping) {
                this.battleLog.push({
                    type: 'sleepSkip',
                    entity: actor.entity.name
                });
                actor.entity.sleeping = false;
                this.currentTurnIndex++;
            } else {
                this.currentActor = actor.entity;
                this.currentActorType = actor.type;
                return;
            }
        }
        
        this.currentTurnIndex = 0;
        this.round++;
        this.playerTeam.forEach(c => {
            if (!c.isDead) {
                c.defending = false;
                if (c.restoreStamina && c.restoreMana) {
                    c.restoreStamina(5);
                    c.restoreMana(5);
                }
                
                if (c.relics) {
                    c.relics.forEach(relic => {
                        if (relic.effect?.type === 'manaPerTurn') {
                            c.restoreMana(relic.effect.value);
                            this.battleLog.push({
                                type: 'relicEffect',
                                message: `${relic.name} 恢复了 ${relic.effect.value} 点法力`
                            });
                        }
                        if (relic.effect?.type === 'staminaPerTurn') {
                            let staminaValue = relic.effect.value;
                            if (c.skills && c.skills.some(s => s.name === '开导')) {
                                staminaValue = 10;
                            }
                            c.restoreStamina(staminaValue);
                            this.battleLog.push({
                                type: 'relicEffect',
                                message: `${relic.name} 恢复了 ${staminaValue} 点体力`
                            });
                        }
                        if (relic.effect?.type === 'def' && relic.name === '猫宁的围巾') {
                            const maoningPet = this.playerTeam.find(p => (p.name === '猫宁' || p.type === 'maoning') && !p.isDead && p.isSummoned);
                            if (maoningPet) {
                                maoningPet.heal(10);
                                this.battleLog.push({
                                    type: 'relicEffect',
                                    message: `${relic.name} 恢复了猫宁 10 点生命值`
                                });
                            }
                        }
                    });
                }
                
                if (c.buffs && c.buffs.length > 0) {
                    c.buffs.forEach(buff => {
                        const buffData = BUFF_DATA[buff.name];
                        if (buffData && buffData.onTurnStart) {
                            buffData.onTurnStart(this, c, buff.stacks);
                        }
                    });
                }
            }
            if (c.specialAbility && typeof c.executeSpecialAbility === 'function') {
                c.abilityUsedThisTurn = false;
                c.executeSpecialAbility(this);
            }
        });
        this.enemies.forEach(e => {
            if (!e.isDead) {
                e.defending = false;
                if (e.buffs && e.buffs.length > 0) {
                    e.buffs.forEach(buff => {
                        const buffData = BUFF_DATA[buff.name];
                        if (buffData && buffData.onTurnStart) {
                            buffData.onTurnStart(this, e, buff.stacks);
                        }
                    });
                }
            }
        });
        this.playerTeam.forEach(c => {
            if (!c.isDead && c.endRoundBuffs) {
                c.endRoundBuffs();
            }
        });
        this.enemies.forEach(e => {
            if (!e.isDead && e.endRoundBuffs) {
                e.endRoundBuffs();
            }
        });
        this.calculateTurnOrder();
        this.updateCurrentActor();
    }

    isPlayerTurn() {
        return this.currentActorType === 'player' && !this.currentActor.isDead && this.currentActor === this.playerTeam[0];
    }

    selectSkill(skill) {
        if (!this.isPlayerTurn()) return { success: false, message: '不是你的回合' };
        
        this.selectedSkill = skill;
        
        if (skill.needsTarget && skill.needsTarget()) {
            this.battleState = 'selectTarget';
            return { success: true, state: 'selectTarget' };
        } else {
            this.selectedTarget = this.currentActor;
            return this.executePlayerAction();
        }
    }

    selectTarget(target) {
        if (!this.isPlayerTurn()) return { success: false };
        if (this.battleState !== 'selectTarget') return { success: false, message: '请先选择技能' };
        
        this.selectedTarget = target;
        return this.executePlayerAction();
    }

    executePlayerAction() {
        if (!this.currentActor || !this.selectedSkill) {
            return { success: false };
        }

        const skill = this.selectedSkill;
        const playerChar = this.getPlayerCharacter();

        if (!skill.canUse(playerChar)) {
            const costType = skill.getCostType();
            const cost = skill.getCost();
            return { success: false, message: costType === 'mana' ? `法力不足，需要${cost}点` : `体力不足，需要${cost}点` };
        }

        skill.consume(playerChar);

        let target = this.selectedTarget;
        if (!target && this.selectedSkill.targetAll) {
            target = this.getAliveEnemies()[0] || this.currentActor;
        } else if (!target) {
            target = this.currentActor;
        }
        const result = playerChar.useSkill(this.selectedSkill, target, this);
        
        if (result.type === 'summon') {
            this.calculateTurnOrder();
        }
        
        this.battleLog.push({
            type: 'skill',
            character: playerChar.name,
            skill: this.selectedSkill.name,
            target: target.name,
            result
        });

        if (this.selectedTarget && this.selectedTarget.isDead) {
            this.battleLog.push({ type: 'death', target: this.selectedTarget.name });
            this.handleEnemyDeath(this.selectedTarget);
        }

        const targetInfo = this.selectedTarget;
        const skillUsed = this.selectedSkill;
        const noEndTurn = skillUsed && (skillUsed.noEndTurn || skillUsed.name === '开导');
        
        this.selectedSkill = null;
        this.selectedTarget = null;
        
        if (noEndTurn) {
            this.battleState = 'playerSelect';
            const battleEnd = this.checkBattleEnd();
            if (battleEnd.ended) {
                return { success: true, battleEnd, result, target: targetInfo };
            }
            return { success: true, state: 'playerSelect', nextActor: this.currentActor, result, target: targetInfo };
        }
        
        this.battleState = 'playerSelect';
        
        const battleEnd = this.checkBattleEnd();
        if (battleEnd.ended) {
            return { success: true, battleEnd, result, target: targetInfo };
        }
        
        if (result.type === 'summon') {
            this.currentTurnIndex++;
            this.updateCurrentActor();
            return { success: true, state: 'enemyTurn', nextActor: null, result, target: targetInfo };
        }
        
        this.currentTurnIndex++;
        this.updateCurrentActor();
        
        const battleEndAfter = this.checkBattleEnd();
        if (battleEndAfter.ended) {
            return { success: true, battleEnd: battleEndAfter, result, target: targetInfo };
        }

        if (this.currentActorType === 'enemy') {
            return { success: true, state: 'enemyTurn', nextActor: this.currentActor, result, target: targetInfo };
        }

        return { success: true, state: 'playerSelect', nextActor: this.currentActor, result, target: targetInfo };
    }

    executeEnemyAction() {
        if (this.currentActorType !== 'enemy') return;
        
        const alivePlayers = this.getAlivePlayers();
        if (alivePlayers.length === 0) {
            return { battleEnd: { ended: true, result: 'lose' } };
        }

        const enemy = this.currentActor;
        
        let target = null;
        
        const playerCharacters = this.playerTeam.filter(c => !c.isDead && !c.banished && !c.isSummoned);
        const pets = this.playerTeam.filter(c => !c.isDead && !c.banished && c.isSummoned);
        
        const humorPet = pets.find(p => p.name === '滑稽' || p.type === 'humor');
        if (humorPet) {
            target = humorPet;
        } else if (this.marked && this.markTarget && !this.markTarget.isDead) {
            target = this.markTarget;
        } else {
            const priorityTarget = playerCharacters.find(c => c.isSummoned && c.priority);
            if (priorityTarget) {
                target = priorityTarget;
            } else if (pets.length > 0) {
                if (Math.random() < 0.7 && playerCharacters.length > 0) {
                    target = playerCharacters[Math.floor(Math.random() * playerCharacters.length)];
                } else if (pets.length > 0) {
                    target = pets[Math.floor(Math.random() * pets.length)];
                }
            } else if (playerCharacters.length > 0) {
                target = playerCharacters[Math.floor(Math.random() * playerCharacters.length)];
            }
            
            if (!target) {
                target = this.playerTeam.find(c => !c.isDead && !c.banished);
            }
            
            if (!target) return null;
        }
        
        let result;
        const useSkillChance = enemy.skills && enemy.skills.length > 0 ? 0.4 : 0;
        
        if (target.霸王之卵免疫一次 && !target.isSummoned) {
            target.霸王之卵免疫一次 = false;
            this.battleLog.push({
                type: 'buff免疫',
                message: `${target.name}的霸王之卵免疫了敌方单位的攻击！`
            });
            result = { damage: 0,免疫: true };
        } else if (Math.random() < useSkillChance) {
            const usableSkills = enemy.skills.filter(skill => skill.canUse(enemy));
            if (usableSkills.length > 0) {
                const skill = usableSkills[Math.floor(Math.random() * usableSkills.length)];
                result = skill.use(enemy, target, alivePlayers);
                
                this.battleLog.push({
                    type: 'enemySkill',
                    enemy: enemy.name,
                    skill: skill.name,
                    target: target.name,
                    result
                });
            } else {
                result = enemy.attack(target);
                this.battleLog.push({
                    type: 'enemyAttack',
                    enemy: enemy.name,
                    target: target.name,
                    damage: result.damage,
                    isCrit: result.isCrit
                });
            }
        } else {
            result = enemy.attack(target);
            
            this.battleLog.push({
                type: 'enemyAttack',
                enemy: enemy.name,
                target: target.name,
                damage: result.damage,
                isCrit: result.isCrit
            });
        }

        if (!target.isSummoned) {
            this.lastPlayerDamage = result.damage;
        }

        if (target.isDead && target.霸王之卵复活 && !target.isSummoned) {
            target.isDead = false;
            target.hp = Math.floor(target.maxHp * 0.5);
            target.霸王之卵复活 = false;
            this.battleLog.push({
                type: '复活',
                target: target.name,
                message: `${target.name}的霸王之卵发挥了作用，复活了！`
            });
        } else if (target.isDead) {
            this.battleLog.push({ type: 'death', target: target.name });
            if (target.isSummoned) {
                this.handleAllyDeath(target);
            }
        }

        this.currentTurnIndex++;
        this.updateCurrentActor();
        
        const battleEnd = this.checkBattleEnd();
        if (battleEnd.ended) {
            return { battleEnd, result, target };
        }

        if (this.currentActorType === 'player') {
            return { state: 'playerSelect', nextActor: this.currentActor, result, target };
        }

        return { state: 'enemyTurn', nextActor: this.currentActor, result, target };
    }

    handleEnemyDeath(enemy) {
        const exp = enemy.exp;
        const gold = enemy.gold;
        
        this.battleLog.push({
            type: 'reward',
            exp,
            gold
        });

        let dropChance = 0.15;
        if (this.isElite) dropChance = 0.3;
        if (this.isBoss) dropChance = 0.5;

        if (Math.random() < dropChance) {
            const relic = Relic.getRandomRelic();
            this.rewards.push({ type: 'relic', item: relic });
            this.battleLog.push({ type: 'drop', item: relic.name });
        }
    }

    checkBattleEnd() {
        const alivePlayers = this.getAlivePlayers();
        const allPlayersDead = alivePlayers.length === 0;
        const aliveEnemies = this.getAliveEnemies();
        const allEnemiesDead = aliveEnemies.length === 0;
        
        const banishedCount = this.banishedEnemies ? this.banishedEnemies.length : 0;
        const allOthersDead = allEnemiesDead && banishedCount > 0;

        if (allPlayersDead) {
            return { ended: true, result: 'lose' };
        }
        
        if (allEnemiesDead || allOthersDead) {
            this.playerTeam.forEach(c => {
                if (c.clearDebuffsOnBattleEnd) {
                    c.clearDebuffsOnBattleEnd();
                }
            });
            this.enemies.forEach(e => {
                if (e.clearDebuffsOnBattleEnd) {
                    e.clearDebuffsOnBattleEnd();
                }
            });
            return { ended: true, result: 'win', rewards: this.rewards, isElite: this.isElite, isBoss: this.isBoss };
        }

        return { ended: false };
    }

    getAliveEnemies() {
        return this.enemies.filter(e => !e.isDead && !e.banished);
    }

    getAlivePlayers() {
        return this.playerTeam.filter(c => !c.isDead && !c.banished && !c.isSummoned);
    }

    getCurrentSkills() {
        if (this.currentActor && this.currentActorType === 'player') {
            if (this.currentActor.skills && this.currentActor.skills.length > 0) {
                return this.currentActor.skills;
            }
            return this.playerTeam[0].skills;
        }
        if (this.playerTeam.length > 0 && !this.playerTeam[0].isDead) {
            return this.playerTeam[0].skills;
        }
        return [];
    }

    getPlayerCharacter() {
        return this.playerTeam[0];
    }

    isCurrentActorAbleToAct() {
        if (!this.currentActor) return false;
        if (this.currentActor.isDead || this.currentActor.banished) return false;
        if (!this.currentActor.skills || this.currentActor.skills.length === 0) {
            return this.playerTeam[0].skills && this.playerTeam[0].skills.length > 0;
        }
        return true;
    }

    handleAllyDeath(deadAlly) {
        const player = this.getPlayerCharacter();
        if (!player || player.isDead) return;
        
        const resurrectSkill = player.skills?.find(s => s.effect?.type === 'resurrectAlly');
        if (!resurrectSkill) return;
        
        if (player.resurrectAllyUsed) return;
        
        player.resurrectAllyUsed = true;
        deadAlly.isDead = false;
        deadAlly.hp = Math.floor(deadAlly.maxHp * 0.5);
        
        const existingAlly = this.playerTeam.find(c => c.id === deadAlly.id);
        if (!existingAlly) {
            this.playerTeam.push(deadAlly);
        }
        
        this.battleLog.push({
            type: 'passiveTrigger',
            skill: resurrectSkill.name,
            target: deadAlly.name,
            message: `${player.name}的${resurrectSkill.name}触发了！${deadAlly.name}复活了！`
        });
    }
}
