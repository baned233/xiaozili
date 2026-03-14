/**
 * ==================== 敌人技能类 ====================
 * 定义敌人的技能，与玩家技能类似但更简单
 */

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
        this.summonType = data.summonType || null;
    }

    needsTarget() {
        return this.type === 'attack' || this.type === 'debuff';
    }

    canUse(enemy) {
        if (this.type === 'heal') {
            return enemy.hp < enemy.maxHp * 0.8;
        }
        if (this.type === 'summon') {
            return true;
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
                const damageReduction = target.getDamageReduction ? target.getDamageReduction() : 0;
                if (damageReduction > 0) {
                    damage = Math.floor(damage * (1 - damageReduction));
                }
                if (!target.takeDamage) {
                    target.takeDamage = function(dmg, damageType = 'physical') {
                        let actualDmg;
                        if (damageType === 'true') {
                            actualDmg = dmg;
                        } else {
                            actualDmg = Math.max(1, dmg - (this.def || 0));
                        }
                        this.hp = Math.max(0, this.hp - actualDmg);
                        if (this.hp <= 0) {
                            this.isDead = true;
                        }
                        return actualDmg;
                    };
                }
                const result = target.takeDamage(damage);
                return { damage: result, type: 'attack', skillName: this.name, isMagic: this.isMagic, target };
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
                if (this.buffName) {
                    if (target.addBuff) {
                        target.addBuff(this.buffName, 1);
                    }
                    return { type: 'debuff', skillName: this.name, target, buffName: this.buffName };
                }
                let debuffDamage = this.power;
                const damageReduction = target.getDamageReduction ? target.getDamageReduction() : 0;
                if (damageReduction > 0) {
                    debuffDamage = Math.floor(debuffDamage * (1 - damageReduction));
                }
                const debuffResult = target.takeDamage(debuffDamage);
                return { damage: debuffResult, type: 'debuff', skillName: this.name, target };
            }
            
            case 'summon': {
                const floor = enemy.floor || enemy.level;
                const summonedEnemy = Enemy.createSummonedEnemy(this.summonType, floor);
                if (summonedEnemy) {
                    return { type: 'summon', skillName: this.name, summoned: summonedEnemy };
                }
                return { type: 'summon', skillName: this.name, summoned: null };
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
        this.floor = data.floor || data.level || 1;  // 保存实际层数
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
        
        let name, icon, hp, atk, def, spd, type, exp, gold, crit, skills;
        
        if (isBoss || floorData.isBoss) {
            const bossData = BOSS_DIALOGS[floor];
            name = bossData?.name || '宿管';
            type = 'boss';
            hp = Math.floor(300 + floor * 10);
            atk = Math.floor(25 + floor * 1);
            def = Math.floor(15 + floor * 0.8);
            spd = Math.floor(10 + floor * 0.8);
            crit = 15;
            exp = Math.floor(level * 50 * 0.9);
            gold = Math.floor(level * 40 * 0.9);
            icon = 'assets/images/suguan.png';
            skills = [new EnemySkill({
                id: 201,
                name: '召唤',
                description: '召唤一只噬影虫加入战斗',
                type: 'summon',
                summonType: 'shiyichong'
            })];
        } else if (isElite) {
            name = '骨翼魔';
            type = 'elite';
            hp = Math.floor(100 + level * 8);
            atk = Math.floor(12 + floor * 0.8);
            def = Math.floor(8 + floor * 0.8);
            spd = Math.floor(8 + floor * 0.5);
            crit = 10;
            exp = Math.floor(level * 30);
            gold = Math.floor(level * 20);
            icon = 'assets/images/fu.png';
            skills = [];
        } else {
            const enemyTypes = ['噬影虫', '变异的学生', '变异的老师', '守卫'];
            name = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            type = 'common';
            
            if (name === '噬影虫') {
                hp = Math.floor(30 + floor * 5);
                atk = Math.floor(6 + floor * 0.6);
                def = Math.floor(4 + floor * 0.5);
                spd = Math.floor(5 + floor * 0.4);
                icon = 'assets/images/chong.png';
                skills = [new EnemySkill({
                    id: 202,
                    name: '麻痹病毒',
                    description: '攻击时对目标施加一层肌无力',
                    type: 'debuff',
                    power: 0,
                    buffName: '肌无力',
                    level: 1,
                    icon: '🦠'
                })];
            } else if (name === '变异的学生') {
                hp = Math.floor(50 + floor * 5.5);
                atk = Math.floor(10 + floor * 0.8);
                def = Math.floor(6 + floor * 0.6);
                spd = Math.floor(7 + floor * 0.5);
                icon = 'assets/images/xuesheng.png';
                skills = [];
            } else if (name === '变异的老师') {
                hp = Math.floor(60 + floor * 6);
                atk = Math.floor(8 + floor * 0.7);
                def = Math.floor(6 + floor * 0.8);
                spd = Math.floor(6 + floor * 0.45);
                icon = 'assets/images/laoshi.png';
                skills = [];
            } else {
                hp = Math.floor(80 + floor * 7);
                atk = Math.floor(8 + floor * 0.8);
                def = Math.floor(6 + floor * 0.8);
                spd = Math.floor(6 + floor * 0.4);
                icon = 'assets/images/shouwei.png';
                skills = [];
            }
            crit = 5;
            exp = Math.floor(level * 10);
            gold = Math.floor(level * 5);
        }
        
        const data = {
            id: Date.now() + Math.random(),
            name,
            level,
            floor,  // 保存实际层数
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

    static generateIcon(name) {
        const icons = ['🐀', '🪲', '💀', '🧟', '🦇', '👤', '👻', '😈', '🗿', '🦂'];
        const index = name.charCodeAt(0) % icons.length;
        return icons[index];
    }

    static generateEliteIcon(name) {
        const icons = ['👹', '👺', '👽', '🤖', '🦖', '🧌', '🐉'];
        const index = name.charCodeAt(0) % icons.length;
        return icons[index];
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

    static createSummonedEnemy(summonType, floor) {
        if (summonType === 'shiyichong') {
            const hp = Math.floor(30 + floor * 5);
            const atk = Math.floor(6 + floor * 0.6);
            const def = Math.floor(4 + floor * 0.5);
            const spd = Math.floor(5 + floor * 0.4);
            
            return new Enemy({
                id: Date.now() + Math.random(),
                name: '噬影虫',
                level: floor,
                maxHp: hp,
                hp: hp,
                atk: atk,
                def: def,
                spd: spd,
                crit: 5,
                critDmg: 150,
                exp: 0,
                gold: 0,
                icon: 'assets/images/chong.png',
                type: 'common',
                isSummoned: true,
                skills: []
            });
        }
        return null;
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

    takeDamage(damage, damageType = 'physical') {
        let actualDamage;
        if (damageType === 'true') {
            actualDamage = damage;
        } else {
            actualDamage = Math.max(1, damage - this.def);
        }
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
        const speedDiff = target.spd - this.spd;
        let dodged = false;
        if (speedDiff > 0 && Math.random() * 100 < speedDiff) {
            dodged = true;
        }
        
        if (dodged) {
            return { damage: 0, isCrit: false, target, dodged: true };
        }
        
        let damage = this.atk;
        let isCrit = Math.random() * 100 < this.crit;
        if (isCrit) {
            damage = Math.floor(damage * (this.critDmg / 100));
        }
        
        const damageReduction = this.getDamageReduction ? this.getDamageReduction() : 0;
        if (damageReduction > 0) {
            damage = Math.floor(damage * (1 - damageReduction));
        }
        
        if (!target.takeDamage) {
            target.takeDamage = function(dmg) {
                const actualDmg = Math.max(1, dmg - (this.def || 0));
                this.hp = Math.max(0, this.hp - actualDmg);
                if (this.hp <= 0) {
                    this.isDead = true;
                }
                return actualDmg;
            };
        }
        
        const actualDamage = target.takeDamage(damage);
        
        // 攻击时触发debuff技能（如噬影虫的麻痹病毒）
        if (this.skills) {
            this.skills.forEach(skill => {
                if (skill.type === 'debuff' && skill.buffName && Math.random() < 0.5) {
                    target.addBuff(skill.buffName, 1);
                }
            });
        }
        
        return { damage: actualDamage, isCrit, target };
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
                const damageReduction = target.getDamageReduction ? target.getDamageReduction() : 0;
                if (damageReduction > 0) {
                    damage = Math.floor(damage * (1 - damageReduction));
                }
                if (!target.takeDamage) {
                    target.takeDamage = function(dmg, damageType = 'physical') {
                        let actualDmg;
                        if (damageType === 'true') {
                            actualDmg = dmg;
                        } else {
                            actualDmg = Math.max(1, dmg - (this.def || 0));
                        }
                        this.hp = Math.max(0, this.hp - actualDmg);
                        if (this.hp <= 0) {
                            this.isDead = true;
                        }
                        return actualDmg;
                    };
                }
                const result = target.takeDamage(damage);
                return { damage: result, type: 'attack', skillName: this.name, isMagic: this.isMagic, target };
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
                let debuffDamage = this.power;
                const damageReduction = target.getDamageReduction ? target.getDamageReduction() : 0;
                if (damageReduction > 0) {
                    debuffDamage = Math.floor(debuffDamage * (1 - damageReduction));
                }
                const debuffResult = target.takeDamage(debuffDamage);
                return { damage: debuffResult, type: 'debuff', skillName: this.name, target };
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
        this.reapplyBuffs();
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
        const savedBaseAtk = this.baseAtk;
        const savedBaseDef = this.baseDef;
        const savedBaseSpd = this.baseSpd;
        
        this.atk = (savedBaseAtk !== undefined ? savedBaseAtk : this.atk);
        this.def = (savedBaseDef !== undefined ? savedBaseDef : this.def);
        this.spd = (savedBaseSpd !== undefined ? savedBaseSpd : this.spd);
        
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
                    if (effect.atkReduction) {
                        this.atk = Math.floor(this.atk * (1 - effect.atkReduction));
                    }
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
            if (buff.name === '护盾' && buff.stacks > 0) {
                reduction = Math.max(reduction, buff.stacks / this.maxHp);
            }
        });
        return reduction;
    }
}
