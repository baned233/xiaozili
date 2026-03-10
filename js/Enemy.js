class EnemySkill {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.type = data.type;
        this.power = data.power || 0;
        this.heal = data.heal || 0;
        this.defense = data.defense || 0;
        this.icon = data.icon || '✨';
        this.effect = data.effect || null;
        this.isMagic = data.isMagic || false;
        this.level = data.level || 1;
    }

    needsTarget() {
        return this.type === 'attack' || this.type === 'debuff';
    }

    canUse(enemy) {
        if (this.type === 'heal') {
            return enemy.hp < enemy.maxHp * 0.8;
        }
        return true;
    }

    use(enemy, target, playerCharacters) {
        switch(this.type) {
            case 'attack': {
                let damage = enemy.atk + this.power;
                if (this.effect === 'lifesteal') {
                    const lifestealAmount = Math.floor(damage * 0.3);
                    enemy.hp = Math.min(enemy.maxHp, enemy.hp + lifestealAmount);
                }
                const result = target.takeDamage(damage);
                return { damage: result, type: 'attack', skillName: this.name, isMagic: this.isMagic };
            }
            
            case 'heal': {
                const healAmount = this.heal;
                enemy.heal(healAmount);
                return { heal: healAmount, type: 'heal', skillName: this.name };
            }
            
            case 'defense':
                enemy.def += this.defense;
                enemy.defending = true;
                return { defense: this.defense, type: 'defense', skillName: this.name };
            
            case 'buff':
                enemy.atk += this.power;
                return { buff: this.power, type: 'buff', skillName: this.name };
            
            case 'debuff': {
                const debuffDamage = this.power;
                const debuffResult = target.takeDamage(debuffDamage);
                return { damage: debuffResult, type: 'debuff', skillName: this.name };
            }
            
            default:
                return { type: 'none' };
        }
    }
}

class Enemy {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.level = data.level || 1;
        this.maxHp = data.maxHp || 50;
        this.hp = this.maxHp;
        this.atk = data.atk || 8;
        this.def = data.def || 3;
        this.spd = data.spd || 8;
        this.crit = data.crit || 5;
        this.critDmg = data.critDmg || 150;
        this.exp = data.exp || 10;
        this.gold = data.gold || 5;
        this.icon = data.icon || '👾';
        this.type = data.type || 'common';
        this.isDead = false;
        this.actions = data.actions || ['attack'];
        this.dropTable = data.dropTable || [];
        this.skills = data.skills || [];
        this.baseAtk = this.atk;
        this.baseDef = this.def;
        this.baseSpd = this.spd;
        this.buffs = [];
        this.feared = false;
        this.binded = false;
        this.marked = false;
        this.markTarget = null;
        this.sleeping = false;
        this.silenced = false;
        this.defending = false;
        this.banished = false;
        this.banishTurns = 0;
    }

    getHpPercent() {
        return Math.floor((this.hp / this.maxHp) * 100);
    }

    static createEnemy(floor, isElite = false, isBoss = false) {
        const floorData = FLOOR_DATA[floor];
        const level = floorData.enemyLevel;
        
        let name, icon, hp, atk, def, spd, type, exp, gold, crit;
        
        if (isBoss || floorData.isBoss) {
            const bossData = BOSS_DIALOGS[floor];
            name = bossData?.name || '未知BOSS';
            type = 'boss';
            hp = Math.floor(level * 80 + 200);
            atk = Math.floor(level * 6 + 10);
            def = Math.floor(level * 4 + 5);
            spd = Math.floor(level * 2 + 5);
            crit = 15;
            exp = Math.floor(level * 50 * 0.9);
            gold = Math.floor(level * 40 * 0.9);
            icon = this.generateBossIcon(floor);
        } else if (isElite) {
            const eliteNames = ENEMY_NAMES.elite;
            name = eliteNames[Math.floor(Math.random() * eliteNames.length)];
            type = 'elite';
            hp = Math.floor(level * 40 + 50);
            atk = Math.floor(level * 5 + 5);
            def = Math.floor(level * 3 + 3);
            spd = Math.floor(level * 2 + 3);
            crit = 10;
            exp = Math.floor(level * 30);
            gold = Math.floor(level * 20);
            icon = this.generateEliteIcon();
        } else {
            const commonNames = ENEMY_NAMES.common;
            name = commonNames[Math.floor(Math.random() * commonNames.length)];
            type = 'common';
            hp = Math.floor(level * 20 + 30);
            atk = Math.floor(level * 3 + 5);
            def = Math.floor(level * 2 + 2);
            spd = Math.floor(level * 2 + 3);
            crit = 5;
            exp = Math.floor(level * 10);
            gold = Math.floor(level * 5);
            icon = this.generateIcon();
        }
        
        const skills = [];
        if (type !== 'common' || Math.random() < 0.3) {
            const basicAttack = ENEMY_SKILL_POOL.find(s => s.id === 101);
            if (basicAttack) {
                skills.push(new EnemySkill(basicAttack));
            }
        }
        
        if ((type === 'elite' || type === 'boss') && Math.random() < 0.7) {
            const eliteSkills = ENEMY_SKILL_POOL.filter(s => s.id >= 102 && s.id <= 110);
            if (eliteSkills.length > 0) {
                const randomSkill = eliteSkills[Math.floor(Math.random() * eliteSkills.length)];
                skills.push(new EnemySkill(randomSkill));
            }
        }
        
        if (isBoss) {
            const bossSkills = ENEMY_SKILL_POOL.filter(s => s.id >= 111);
            if (bossSkills.length > 0) {
                const randomSkill = bossSkills[Math.floor(Math.random() * bossSkills.length)];
                skills.push(new EnemySkill(randomSkill));
            }
        }
        
        const data = {
            id: Date.now() + Math.random(),
            name,
            level,
            maxHp: hp,
            hp,
            atk,
            def,
            spd,
            crit,
            critDmg: 150,
            exp,
            gold,
            icon,
            type,
            skills
        };
        
        return new Enemy(data);
    }

    static generateIcon() {
        const icons = ['🐀', '🪲', '💀', '🧟', '🦇', '👤', '👻', '😈', '🗿', '🦂'];
        return icons[Math.floor(Math.random() * icons.length)];
    }

    static generateEliteIcon() {
        const icons = ['👹', '👺', '👽', '🤖', '🦖', '🧌', '🐉'];
        return icons[Math.floor(Math.random() * icons.length)];
    }

    static generateBossIcon(floor) {
        const bossIcons = {
            5: '👹',
            10: '🐉',
            15: '👺',
            20: '💀大王',
            25: '🦖',
            30: '😈',
            35: '🧛',
            40: '🧙',
            45: '👿',
            50: '🦑'
        };
        return bossIcons[floor] || '👹';
    }

    needsTarget() {
        return this.type === 'attack' || this.type === 'debuff';
    }

    canUse(enemy) {
        if (this.type === 'heal') {
            return enemy.hp < enemy.maxHp * 0.8;
        }
        return true;
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

    attack(target) {
        let damage = this.atk;
        let isCrit = Math.random() * 100 < this.crit;
        if (isCrit) {
            damage = Math.floor(damage * (this.critDmg / 100));
        }
        
        const actualDamage = target.takeDamage(damage);
        return { damage: actualDamage, isCrit };
    }

    getIcon() {
        return '👼';
    }

    use(enemy, target, playerCharacters) {
        switch(this.type) {
            case 'attack': {
                let damage = enemy.atk + this.power;
                if (this.effect === 'lifesteal') {
                    const lifestealAmount = Math.floor(damage * 0.3);
                    enemy.hp = Math.min(enemy.maxHp, enemy.hp + lifestealAmount);
                }
                const result = target.takeDamage(damage);
                return { damage: result, type: 'attack', skillName: this.name, isMagic: this.isMagic };
            }
            
            case 'heal': {
                const healAmount = this.heal;
                enemy.heal(healAmount);
                return { heal: healAmount, type: 'heal', skillName: this.name };
            }
            
            case 'defense':
                enemy.def += this.defense;
                enemy.defending = true;
                return { defense: this.defense, type: 'defense', skillName: this.name };
            
            case 'buff':
                enemy.atk += this.power;
                return { buff: this.power, type: 'buff', skillName: this.name };
            
            case 'debuff': {
                const debuffDamage = this.power;
                const debuffResult = target.takeDamage(debuffDamage);
                return { damage: debuffResult, type: 'debuff', skillName: this.name };
            }
            
            default:
                return { type: 'none' };
        }
    }

    addBuff(buffName, stacks = 1) {
        if (!BUFF_DATA[buffName]) return false;
        
        const existingBuff = this.buffs.find(b => b.name === buffName);
        if (existingBuff) {
            existingBuff.stacks += stacks;
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
