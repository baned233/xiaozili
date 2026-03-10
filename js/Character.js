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
        
        const actualDamage = target.takeDamage(damage);
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
                                const damage = this.calculateSkillDamage(skill.power);
                                const result = enemy.takeDamage(damage);
                                totalDamage += result;
                            }
                        });
                        return { damage: totalDamage, killedCount: killedCount, type: 'attack' };
                    } else {
                        enemies.forEach(enemy => {
                            const damage = this.calculateSkillDamage(skill.power);
                            const result = enemy.takeDamage(damage);
                            totalDamage += result;
                        });
                        return { damage: totalDamage, type: 'attack' };
                    }
                } else {
                    let damage = this.calculateSkillDamage(skill.power);
                    
                    if (skill.effect === 'pierce') {
                        damage = Math.floor(damage * 1.5);
                    }
                    if (skill.effect === 'doubleStrike') {
                        damage = Math.floor(damage * 0.7);
                        const result1 = target.takeDamage(damage);
                        const result2 = target.takeDamage(damage);
                        return { damage: result1 + result2, type: 'attack', doubleStrike: true };
                    }
                    
                    const result = target.takeDamage(damage);
                    
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
                    
                    return { damage: result, type: 'attack' };
                }
            
            case 'heal':
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
                    const summonDmg = skill.power;
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
                    const damage = skill.power;
                    const result = target.takeDamage(damage);
                    return { type: 'debuff', effect: 'stealBuff', damage: result };
                } else if (skill.effect?.type === 'silence') {
                    target.silenced = true;
                    const damage = skill.power;
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
                } else {
                    const damage = skill.power;
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
        
        const existingBuff = this.buffs.find(b => b.name === buffName);
        if (existingBuff) {
            if (buffName === '滑稽') {
                existingBuff.stacks = 1;
            } else {
                existingBuff.stacks += stacks;
            }
        } else {
            this.buffs.push({
                name: buffName,
                stacks: stacks,
                type: BUFF_DATA[buffName].type,
                icon: BUFF_DATA[buffName].icon,
                description: BUFF_DATA[buffName].description
            });
        }
        this.applyBuffEffect(buffName);
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

    applyBuffEffect(buffName) {
        const buff = BUFF_DATA[buffName];
        if (!buff || !buff.effect) return;

        const effect = buff.effect(this, this.getBuffStacks(buffName));
        
        if (effect.atk) this.atk += effect.atk;
        if (effect.def) this.def += effect.def;
        if (effect.spd) this.spd += effect.spd;
    }

    getBuffStacks(buffName) {
        const buff = this.buffs.find(b => b.name === buffName);
        return buff ? buff.stacks : 0;
    }

    hasBuff(buffName) {
        return this.buffs.some(b => b.name === buffName);
    }

    reapplyBuffs() {
        this.atk = this.baseAtk || this.atk;
        this.def = this.baseDef || this.def;
        this.spd = this.baseSpd || this.spd;
        
        this.baseAtk = this.baseAtk || this.atk;
        this.baseDef = this.baseDef || this.def;
        this.baseSpd = this.baseSpd || this.spd;

        this.buffs.forEach(buff => {
            const buffData = BUFF_DATA[buff.name];
            if (buffData && buffData.effect) {
                const effect = buffData.effect(this, buff.stacks);
                if (effect.atk) this.atk += effect.atk;
                if (effect.def) this.def += effect.def;
                if (effect.spd) this.spd += effect.spd;
            }
        });
    }

    endRoundBuffs() {
        const buffsToRemove = [];
        
        this.buffs.forEach(buff => {
            const buffData = BUFF_DATA[buff.name];
            if (buffData && buffData.type === 'negative') {
                if (buff.name === '虚弱' || buff.name === '肌无力' || buff.name === '凝滞') {
                    buffsToRemove.push(buff.name);
                }
            }
        });

        buffsToRemove.forEach(buffName => {
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
