class Character {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.job = data.job || '小资历';
        this.level = data.level || 1;
        this.maxHp = data.maxHp || 100;
        this.hp = this.maxHp;
        this.maxStamina = data.maxStamina || 100;
        this.stamina = this.maxStamina;
        this.maxMana = data.maxMana || 50;
        this.mana = this.maxMana;
        this.atk = data.atk || 10;
        this.def = data.def || 5;
        this.spd = data.spd || 10;
        this.crit = data.crit || 5;
        this.critDmg = data.critDmg || 150;
        this.skills = data.skills || [];
        this.pets = data.pets || [];
        this.relics = data.relics || [];
        this.weapon = data.weapon || null;
        this.icon = data.icon || '👤';
        this.image = data.image || null;
        this.isDead = false;
        this.defending = false;
        this.buffs = [];
        this.baseAtk = this.atk;
        this.baseDef = this.def;
        this.baseSpd = this.spd;
        this.relicBonusAtk = 0;
        this.relicBonusDef = 0;
        this.relicBonusSpd = 0;
        this.霸王之卵免疫一次 = false;
        this.霸王之卵复活 = false;
    }

    static createJiaXuan() {
        const char = new Character({
            id: 1,
            name: '陈佳轩',
            job: '小资历',
            level: 1,
            maxHp: 120,
            maxStamina: 80,
            maxMana: 120,
            hp: 120,
            stamina: 80,
            mana: 120,
            atk: 15,
            def: 8,
            spd: 12,
            crit: 8,
            icon: '🎨',
            image: 'assets/images/chenjiaxuan.png',
            skills: [
                new Skill(SKILL_POOL[0])
            ]
        });
        return char;
    }

    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.def);
        this.hp = Math.max(0, this.hp - actualDamage);
        if (this.hp <= 0) {
            this.isDead = true;
        }
        return actualDamage;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    restoreStamina(amount) {
        this.stamina = Math.min(this.maxStamina, this.stamina + amount);
    }

    restoreMana(amount) {
        this.mana = Math.min(this.maxMana, this.mana + amount);
    }

    hasStamina(cost) {
        return this.stamina >= cost;
    }

    hasMana(cost) {
        return this.mana >= cost;
    }

    consumeStamina(cost) {
        if (this.hasStamina(cost)) {
            this.stamina -= cost;
            return true;
        }
        return false;
    }

    consumeMana(cost) {
        if (this.hasMana(cost)) {
            this.mana -= cost;
            return true;
        }
        return false;
    }

    attack(target, weapon = null) {
        let damage = this.atk;
        if (weapon) {
            damage += weapon.atkBonus || 0;
        }
        
        let isCrit = Math.random() * 100 < this.crit;
        if (isCrit) {
            damage = Math.floor(damage * (this.critDmg / 100));
        }
        
        const damageReduction = target.getDamageReduction();
        if (damageReduction > 0) {
            damage = Math.floor(damage * (1 - damageReduction));
        }
        
        const actualDamage = target.takeDamage(damage);
        
        if (this.skills) {
            this.skills.forEach(skill => {
                if (skill.passive && skill.effect) {
                    if (skill.effect.type === 'bleedOnHit') {
                        const stacks = skill.stacks || 1;
                        target.addBuff('流血', stacks);
                    }
                    if (skill.effect.type === 'lifesteal' && actualDamage > 0) {
                        const lifestealAmount = Math.floor(actualDamage * skill.effect.percent);
                        this.heal(lifestealAmount);
                    }
                }
            });
        }
        
        return { damage: actualDamage, isCrit };
    }

    calculateSkillDamage(power) {
        if (typeof power === 'string') {
            const atk = this.atk;
            if (power.includes('+')) {
                const parts = power.split('+');
                const base = parseInt(parts[0]);
                const multiplierStr = parts[1].replace('*atk', '').replace('*攻击力', '');
                const multiplier = parseFloat(multiplierStr);
                return base + Math.floor(multiplier * atk);
            } else if (power.includes('*atk') || power.includes('*攻击力')) {
                const multiplierStr = power.replace('*atk', '').replace('*攻击力', '');
                return Math.floor(parseFloat(multiplierStr) * atk);
            }
            return parseInt(power) || 0;
        }
        return power || 0;
    }

    useSkill(skill, target, battle) {
        switch(skill.type) {
            case 'attack':
                if (skill.targetAll) {
                    const enemies = battle.getAliveEnemies();
                    let totalDamage = 0;
                    let killedCount = 0;
                    
                    if (skill.effect?.type === 'execute') {
                        enemies.forEach(enemy => {
                            if (enemy.hp < skill.effect.threshold) {
                                enemy.isDead = true;
                                enemy.hp = 0;
                                killedCount++;
                            } else {
                                let damage = this.calculateSkillDamage(skill.power);
                                const damageReduction = enemy.getDamageReduction ? enemy.getDamageReduction() : 0;
                                if (damageReduction > 0) {
                                    damage = Math.floor(damage * (1 - damageReduction));
                                }
                                const result = enemy.takeDamage(damage);
                                totalDamage += result;
                            }
                        });
                        return { damage: totalDamage, killedCount: killedCount, type: 'attack' };
                    } else {
                        enemies.forEach(enemy => {
                            let damage = this.calculateSkillDamage(skill.power);
                            const damageReduction = enemy.getDamageReduction ? enemy.getDamageReduction() : 0;
                            if (damageReduction > 0) {
                                damage = Math.floor(damage * (1 - damageReduction));
                            }
                            const result = enemy.takeDamage(damage);
                            totalDamage += result;
                        });
                        return { damage: totalDamage, type: 'attack' };
                    }
                } else {
                    if (skill.effect?.type === 'currentHpDamage') {
                        const enemies = battle.getAliveEnemies();
                        if (enemies.length > 0) {
                            const randomTarget = enemies[Math.floor(Math.random() * enemies.length)];
                            let percentDamage = Math.floor(randomTarget.hp * skill.effect.percent);
                            const damageReduction = randomTarget.getDamageReduction ? randomTarget.getDamageReduction() : 0;
                            if (damageReduction > 0) {
                                percentDamage = Math.floor(percentDamage * (1 - damageReduction));
                            }
                            const actualDamage = randomTarget.takeDamage(percentDamage);
                            return { damage: actualDamage, type: 'attack', target: randomTarget.name, percentDamage: true };
                        }
                    }
                    
                    let damage = this.calculateSkillDamage(skill.power);
                    
                    if (skill.effect?.type === 'escalatingDamage') {
                        this.skillUseCount = this.skillUseCount || {};
                        this.skillUseCount[skill.name] = (this.skillUseCount[skill.name] || 0) + 1;
                        const useCount = this.skillUseCount[skill.name];
                        damage = skill.effect.baseDamage + (useCount - 1) * skill.effect.damageIncrease;
                    }
                    
                    if (skill.effect?.type === 'sacrificeDamage') {
                        const sacrificeCost = Math.floor(this.maxHp * skill.effect.costPercent);
                        this.hp -= sacrificeCost;
                        let percentDamage = Math.floor(target.maxHp * skill.effect.percent);
                        const damageReduction = target.getDamageReduction ? target.getDamageReduction() : 0;
                        if (damageReduction > 0) {
                            percentDamage = Math.floor(percentDamage * (1 - damageReduction));
                        }
                        const result = target.takeDamage(percentDamage);
                        return { 
                            damage: result, 
                            type: 'attack', 
                            sacrifice: sacrificeCost,
                            effect: 'sacrificeDamage' 
                        };
                    }
                    
                    if (skill.effect?.type === 'counter') {
                        damage = battle.lastPlayerDamage || 1;
                    }
                    
                    if (skill.effect === 'pierce') {
                        damage = Math.floor(damage * 1.5);
                    }
                    if (skill.effect === 'doubleStrike') {
                        damage = Math.floor(damage * 0.7);
                        const damageReduction1 = target.getDamageReduction ? target.getDamageReduction() : 0;
                        const d1 = damageReduction1 > 0 ? Math.floor(damage * (1 - damageReduction1)) : damage;
                        const result1 = target.takeDamage(d1);
                        const damageReduction2 = target.getDamageReduction ? target.getDamageReduction() : 0;
                        const d2 = damageReduction2 > 0 ? Math.floor(damage * (1 - damageReduction2)) : damage;
                        const result2 = target.takeDamage(d2);
                        return { damage: result1 + result2, type: 'attack', doubleStrike: true };
                    }
                    
                    const damageReduction = target.getDamageReduction ? target.getDamageReduction() : 0;
                    if (damageReduction > 0) {
                        damage = Math.floor(damage * (1 - damageReduction));
                    }
                    const result = target.takeDamage(damage);
                    
                    if (this.skills) {
                        this.skills.forEach(skill => {
                            if (skill.passive && skill.effect) {
                                if (skill.effect.type === 'bleedOnHit') {
                                    const stacks = skill.stacks || 1;
                                    target.addBuff('流血', stacks);
                                }
                                if (skill.effect.type === 'lifesteal' && result > 0) {
                                    const lifestealAmount = Math.floor(result * skill.effect.percent);
                                    this.heal(lifestealAmount);
                                }
                            }
                        });
                    }
                    
                    if (skill.effect?.type === 'bleedOnHit') {
                        target.addBuff('流血', 1);
                    }
                    
                    if (skill.effect?.type === 'lifesteal' && result > 0) {
                        const lifestealAmount = Math.floor(result * skill.effect.percent);
                        this.heal(lifestealAmount);
                    }
                    
                    if (skill.effect?.type === 'gainBuff') {
                        this.addBuff(skill.effect.buffName, skill.effect.stacks);
                    }
                    
                    if (skill.effect?.type === 'enrage') {
                        const enemies = battle.getAliveEnemies();
                        enemies.forEach(enemy => {
                            enemy.atk += skill.effect.value;
                        });
                        return { damage: result, type: 'attack', enrage: skill.effect.value };
                    }
                    
                    if (skill.effect?.type === 'drain' && target.isDead && skill.effect.hpBonus) {
                        this.maxHp += skill.effect.hpBonus;
                        this.hp += skill.effect.hpBonus;
                        return { damage: result, type: 'attack', drain: skill.effect.hpBonus };
                    }
                    
                    if (skill.effect?.type === 'drainExecute') {
                        const threshold = target.maxHp * skill.effect.threshold;
                        if (target.hp <= threshold) {
                            target.isDead = true;
                            target.hp = 0;
                            this.maxHp += skill.effect.hpBonus;
                            this.hp += skill.effect.hpBonus;
                            return { damage: result, type: 'attack', executed: true, drain: skill.effect.hpBonus };
                        }
                    }
                    
                    return { damage: result, type: 'attack' };
                }
            
            case 'heal':
                if (skill.effect?.type === 'shield') {
                    const lostHp = this.maxHp - this.hp;
                    const shieldValue = Math.floor(skill.effect.base + lostHp * skill.effect.multiplier);
                    this.shield = (this.shield || 0) + shieldValue;
                    return { shield: shieldValue, type: 'heal', effect: 'shield' };
                } else if (skill.effect?.type === 'lifeShare') {
                    const totalHp = this.hp + target.hp;
                    const sharedHp = Math.floor(totalHp / 2);
                    const oldSelfHp = this.hp;
                    const oldTargetHp = target.hp;
                    this.hp = sharedHp;
                    target.hp = sharedHp;
                    return { 
                        type: 'heal', 
                        effect: 'lifeShare', 
                        selfChange: sharedHp - oldSelfHp,
                        targetChange: sharedHp - oldTargetHp,
                        target: target.name
                    };
                } else if (skill.effect?.type === 'healIfAllyExists') {
                    const aliveAllies = battle.playerTeam.filter(c => !c.isDead && c !== this);
                    if (aliveAllies.length > 0) {
                        const healAmount = Math.floor(this.maxHp * skill.effect.percent);
                        this.heal(healAmount);
                        return { heal: healAmount, type: 'heal', effect: 'healIfAllyExists' };
                    }
                    return { type: 'heal', effect: 'noAlly', failed: true };
                }
                if (target && target !== this) {
                    target.heal(skill.heal);
                    return { heal: skill.heal, target: target.name, type: 'heal' };
                }
                this.heal(skill.heal);
                return { heal: skill.heal, type: 'heal' };
            
            case 'defense':
                this.def += skill.defense;
                this.defending = true;
                return { defense: skill.defense, type: 'defense' };
            
            case 'buff':
                if (skill.effect?.type === 'addBuffs') {
                    if (target && target !== this) {
                        target.addBuff(skill.effect.targetBuff, skill.effect.targetStacks);
                    }
                    this.addBuff(skill.effect.selfBuff, skill.effect.stacks);
                    return { 
                        buff: skill.effect.selfBuff, 
                        selfStacks: skill.effect.stacks,
                        targetBuff: skill.effect.targetBuff,
                        targetStacks: skill.effect.targetStacks,
                        type: 'buff' 
                    };
                } else if (skill.effect?.type === 'addBuff') {
                    if (skill.targetAll) {
                        const enemies = battle.getAliveEnemies();
                        enemies.forEach(enemy => {
                            enemy.addBuff(skill.effect.buffName, 1);
                        });
                        this.addBuff(skill.effect.buffName, 1);
                        return { buff: skill.effect.buffName, target: 'all', type: 'buff' };
                    }
                    this.addBuff(skill.effect.buffName, 1);
                    return { buff: skill.effect.buffName, type: 'buff' };
                } else {
                    this.atk += skill.power;
                    this.buffs.push({ type: 'atk', value: skill.power, turns: 3 });
                    return { buff: skill.power, type: 'buff' };
                }
            
            case 'summon':
                if (skill.effect?.type === 'summon') {
                    const summonData = {
                        name: skill.effect.name,
                        maxHp: skill.effect.hp,
                        hp: skill.effect.hp,
                        atk: 0,
                        def: 5,
                        spd: 5,
                        isDead: false,
                        isSummoned: true,
                        priority: skill.effect.priority || false,
                        icon: '🧑‍🎓'
                    };
                    battle.playerTeam.push(summonData);
                    return { summonName: skill.effect.name, type: 'summon' };
                } else {
                    let summonDmg = skill.power;
                    const damageReduction = target.getDamageReduction ? target.getDamageReduction() : 0;
                    if (damageReduction > 0) {
                        summonDmg = Math.floor(summonDmg * (1 - damageReduction));
                    }
                    const summonResult = target.takeDamage(summonDmg);
                    return { damage: summonResult, type: 'summon', summonName: skill.name };
                }
            
            case 'fear':
                const enemies = battle.getAliveEnemies();
                let fearCount = 0;
                enemies.forEach(enemy => {
                    if (Math.random() < skill.effect.chance) {
                        enemy.feared = true;
                        fearCount++;
                    }
                });
                return { fearCount: fearCount, type: 'fear' };
            
            case 'mark':
                const markTarget = target;
                const allEnemies = battle.getAliveEnemies();
                let transformedCount = 0;
                allEnemies.forEach(enemy => {
                    if (enemy !== markTarget) {
                        if (skill.effect?.eliteImmune && (enemy.type === 'elite' || enemy.type === 'boss')) {
                            return;
                        }
                        enemy.marked = true;
                        enemy.markTarget = markTarget;
                        enemy.name = markTarget.name;
                        enemy.atk = markTarget.atk;
                        enemy.def = markTarget.def;
                        enemy.hp = Math.floor(enemy.hp * 0.5);
                        enemy.maxHp = Math.floor(markTarget.maxHp * 0.5);
                        enemy.icon = markTarget.icon;
                        transformedCount++;
                    }
                });
                return { markedTarget: markTarget.name, transformedCount: transformedCount, type: 'mark' };
            
            case 'banish':
                if (target.type === 'elite' || target.type === 'boss') {
                    return { failed: true, message: '该技能对精英怪和BOSS无效！', type: 'banish' };
                }
                target.banished = true;
                target.banishTurns = skill.effect?.duration || 2;
                target.originalHp = target.hp;
                target.hp = 0;
                target.isDead = true;
                battle.banishedEnemies = battle.banishedEnemies || [];
                battle.banishedEnemies.push({
                    enemy: target,
                    returnTurns: battle.round + target.banishTurns
                });
                return { target: target.name, type: 'banish', duration: target.banishTurns };
            
            case 'debuff':
                if (skill.effect?.type === 'removePositiveBuffs') {
                    const enemies = battle.getAliveEnemies();
                    enemies.forEach(enemy => {
                        enemy.buffs = enemy.buffs.filter(b => b.type === 'negative');
                    });
                    return { type: 'debuff', effect: 'removeBuffs' };
                } else if (skill.effect?.type === 'enrage') {
                    if (skill.targetAll) {
                        const enemies = battle.getAliveEnemies();
                        enemies.forEach(enemy => {
                            enemy.atk += skill.effect.value;
                        });
                        return { type: 'debuff', effect: 'enrage', value: skill.effect.value, target: 'all' };
                    }
                    target.atk += skill.effect.value;
                    return { type: 'debuff', effect: 'enrage', value: skill.effect.value, target: target.name };
                } else if (skill.effect?.type === 'tauntDebuff') {
                    target.atk += skill.effect.atkBoost;
                    target.def -= skill.effect.defReduce;
                    return { type: 'debuff', effect: 'tauntDebuff', atkBoost: skill.effect.atkBoost, defReduce: skill.effect.defReduce, target: target.name };
                } else if (skill.effect?.type === 'fearAndBuff') {
                    const enemies = battle.getAliveEnemies();
                    enemies.forEach(enemy => {
                        enemy.silenced = true;
                        enemy.atk += skill.effect.buffAtk;
                    });
                    return { type: 'debuff', effect: 'fearAndBuff', silenced: true, buffAtk: skill.effect.buffAtk };
                } else if (skill.effect?.type === 'stealBuff') {
                    if (target.buffs && target.buffs.length > 0) {
                        const positiveBuffs = target.buffs.filter(b => b.type === 'positive');
                        if (positiveBuffs.length > 0) {
                            const stolenBuff = positiveBuffs[0];
                            this.addBuff(stolenBuff.name, stolenBuff.stacks);
                            target.removeBuff(stolenBuff.name);
                        }
                    }
                    let damage = skill.power;
                    const damageReduction = target.getDamageReduction ? target.getDamageReduction() : 0;
                    if (damageReduction > 0) {
                        damage = Math.floor(damage * (1 - damageReduction));
                    }
                    const result = target.takeDamage(damage);
                    return { type: 'debuff', effect: 'stealBuff', damage: result };
                } else if (skill.effect?.type === 'silence') {
                    target.silenced = true;
                    let damage = skill.power;
                    const damageReduction = target.getDamageReduction ? target.getDamageReduction() : 0;
                    if (damageReduction > 0) {
                        damage = Math.floor(damage * (1 - damageReduction));
                    }
                    const result = target.takeDamage(damage);
                    return { type: 'debuff', effect: 'silence', damage: result };
                } else if (skill.effect?.type === 'sleep') {
                    target.sleeping = true;
                    battle.skipEnemyTurn = true;
                    target.heal(skill.heal);
                    return { type: 'debuff', effect: 'sleep', heal: skill.heal };
                } else if (skill.effect?.type === 'weakness') {
                    if (skill.targetAll) {
                        const enemies = battle.getAliveEnemies();
                        enemies.forEach(enemy => {
                            if (enemy.hp < skill.effect.threshold) {
                                enemy.addBuff('虚弱', skill.effect.stacks);
                            }
                        });
                        return { type: 'debuff', effect: 'weakness', target: 'all' };
                    }
                    target.addBuff('虚弱', skill.effect.stacks || 1);
                    return { type: 'debuff', effect: 'weakness', target: target.name };
                } else if (skill.effect?.type === 'addDebuff') {
                    let stacks = skill.effect.defaultStacks;
                    if (skill.effect.requiresSkill) {
                        const hasRequiredSkill = this.skills.some(s => s.name === skill.effect.requiresSkill);
                        if (hasRequiredSkill) {
                            stacks = skill.effect.bonusStacks;
                        }
                    }
                    target.addBuff(skill.effect.buffName, stacks);
                    return { type: 'debuff', effect: 'addDebuff', buffName: skill.effect.buffName, stacks: stacks, target: target.name };
                } else if (skill.effect?.type === 'gainBuff') {
                    this.addBuff(skill.effect.buffName, skill.effect.stacks);
                    return { type: 'debuff', effect: 'gainBuff', buffName: skill.effect.buffName, stacks: skill.effect.stacks };
                } else {
                    let damage = skill.power;
                    const damageReduction = target.getDamageReduction ? target.getDamageReduction() : 0;
                    if (damageReduction > 0) {
                        damage = Math.floor(damage * (1 - damageReduction));
                    }
                    const result = target.takeDamage(damage);
                    return { damage: result, type: 'debuff' };
                }
            
            case 'passive':
                return { type: 'passive', effect: skill.effect };
            
            default:
                return { type: 'none' };
        }
    }

    summonWeapon(weaponType) {
        const weapon = WEAPONS[weaponType];
        if (weapon) {
            this.weapon = { type: weaponType, ...weapon };
            this.atk += weapon.atkBonus || 0;
            this.def += weapon.defBonus || 0;
            this.crit += weapon.critBonus || 0;
            this.relicBonusAtk = (this.relicBonusAtk || 0) + (weapon.atkBonus || 0);
            this.relicBonusDef = (this.relicBonusDef || 0) + (weapon.defBonus || 0);
        }
        return this.weapon;
    }

    addSkill(skill) {
        if (this.skills.length < 6) {
            this.skills.push(skill);
            return true;
        }
        return false;
    }

    addPet(pet) {
        if (this.pets && this.pets.length >= 2) {
            return false;
        }
        pet.applyBuff(this);
        this.pets.push(pet);
        return true;
    }

    addRelic(relic) {
        relic.applyEffect(this);
        this.relics.push(relic);
        return true;
    }

    getHpPercent() {
        return Math.floor((this.hp / this.maxHp) * 100);
    }

    getStaminaPercent() {
        return Math.floor((this.stamina / this.maxStamina) * 100);
    }

    getManaPercent() {
        return Math.floor((this.mana / this.maxMana) * 100);
    }

    addBuff(buffName, stacks = 1) {
        if (!BUFF_DATA[buffName]) return false;
        
        if (buffName === '滑稽') {
            stacks = 1;
        }
        
        let isNewBuff = false;
        const existingBuff = this.buffs.find(b => b.name === buffName);
        if (existingBuff) {
            if (buffName === '滑稽') {
                existingBuff.stacks = 1;
            } else {
                existingBuff.stacks += stacks;
            }
        } else {
            isNewBuff = true;
            this.buffs.push({
                name: buffName,
                stacks: stacks,
                type: BUFF_DATA[buffName].type,
                icon: BUFF_DATA[buffName].icon,
                description: BUFF_DATA[buffName].description
            });
        }
        
        if (isNewBuff) {
            this.applyBuffEffect(buffName, this.getBuffStacks(buffName));
        } else {
            this.applyBuffEffect(buffName, stacks);
        }
        return true;
    }

    removeBuff(buffName, stacks = 1) {
        const buffIndex = this.buffs.findIndex(b => b.name === buffName);
        if (buffIndex === -1) return false;

        const buff = this.buffs[buffIndex];
        if (buff.stacks > stacks) {
            buff.stacks -= stacks;
        } else {
            this.buffs.splice(buffIndex, 1);
        }
        this.reapplyBuffs();
        return true;
    }

    applyBuffEffect(buffName, stacks = null) {
        const buff = BUFF_DATA[buffName];
        if (!buff || !buff.effect) return;

        const actualStacks = stacks !== null ? stacks : this.getBuffStacks(buffName);
        
        for (let i = 0; i < actualStacks; i++) {
            const effect = buff.effect(this, 1);
            if (effect.atk) this.atk += effect.atk;
            if (effect.def) this.def += effect.def;
            if (effect.spd) this.spd += effect.spd;
        }
    }

    getBuffStacks(buffName) {
        const buff = this.buffs.find(b => b.name === buffName);
        return buff ? buff.stacks : 0;
    }

    hasBuff(buffName) {
        return this.buffs.some(b => b.name === buffName);
    }

    reapplyBuffs() {
        const savedBaseAtk = this.baseAtk;
        const savedBaseDef = this.baseDef;
        const savedBaseSpd = this.baseSpd;
        
        this.atk = (savedBaseAtk !== undefined ? savedBaseAtk : this.atk) + (this.relicBonusAtk || 0);
        this.def = (savedBaseDef !== undefined ? savedBaseDef : this.def) + (this.relicBonusDef || 0);
        this.spd = (savedBaseSpd !== undefined ? savedBaseSpd : this.spd) + (this.relicBonusSpd || 0);
        
        this.baseAtk = savedBaseAtk;
        this.baseDef = savedBaseDef;
        this.baseSpd = savedBaseSpd;

        this.buffs.forEach(buff => {
            const buffData = BUFF_DATA[buff.name];
            if (buffData && buffData.effect) {
                for (let i = 0; i < buff.stacks; i++) {
                    const effect = buffData.effect(this, 1);
                    if (effect.atk) this.atk += effect.atk;
                    if (effect.def) this.def += effect.def;
                    if (effect.spd) this.spd += effect.spd;
                }
            }
        });
    }

    endRoundBuffs() {
        const buffsToRemove = [];
        let needsReapply = false;
        
        this.buffs.forEach(buff => {
            const buffData = BUFF_DATA[buff.name];
            if (buffData && buffData.type === 'positive') {
                if (buff.name === '勇气') {
                    buff.stacks--;
                    needsReapply = true;
                    if (buff.stacks <= 0) {
                        buffsToRemove.push(buff.name);
                    }
                }
            }
            if (buffData && buffData.type === 'negative') {
                if (buff.name === '虚弱' || buff.name === '凝滞') {
                    buffsToRemove.push(buff.name);
                } else if (buff.name === '肌无力' || buff.name === '束缚') {
                    buff.stacks--;
                    needsReapply = true;
                    if (buff.stacks <= 0) {
                        buffsToRemove.push(buff.name);
                    }
                }
            }
        });

        if (needsReapply) {
            this.reapplyBuffs();
        }
        
        buffsToRemove.forEach(buffName => {
            this.removeBuff(buffName);
        });
    }

    clearDebuffsOnBattleEnd() {
        const debuffsToRemove = ['肌无力', '束缚'];
        debuffsToRemove.forEach(buffName => {
            this.removeBuff(buffName);
        });
    }

    getDamageReduction() {
        let reduction = 0;
        this.buffs.forEach(buff => {
            if (buff.name === '肌无力' && buff.stacks > 0) {
                reduction = Math.max(reduction, 0.5);
            }
        });
        return reduction;
    }
}
