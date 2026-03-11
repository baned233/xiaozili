class Pet {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.description = data.description;
        this.icon = data.icon;
        this.rarity = data.rarity || 'rare';
        this.stats = data.stats || { atk: 0, def: 0, hp: 0 };
        this.maxHp = data.stats?.hp || 200;
        this.hp = this.maxHp;
        this.skill = data.skill || null;
        this.battleType = data.battleType || 'buff';
        this.specialAbility = data.specialAbility || null;
        this.isDead = false;
        this.abilityUsedThisTurn = false;
    }

    static createPet(petData) {
        return new Pet(petData);
    }

    static getSpecialPet(type) {
        const specialPets = {
            'yueremu': {
                id: 100,
                name: '鱼儿木',
                type: 'plant_fish',
                description: '半鱼半植物的生物，每回合可以治愈角色10滴血',
                icon: '🌿🐟',
                rarity: 'legendary',
                stats: { atk: 5, def: 10, hp: 150 },
                maxHp: 150,
                hp: 150,
                battleType: 'special',
                specialAbility: {
                    type: 'heal',
                    value: 10,
                    description: '每回合治愈角色10滴血'
                }
            },
            'maoning': {
                id: 101,
                name: '猫宁',
                type: 'shadow_cat',
                description: '死里逃生的小猫，觉醒操纵阴影的能力，每回合为敌人添加1层破防',
                icon: '🐱‍👤',
                rarity: 'legendary',
                stats: { atk: 8, def: 8, hp: 100 },
                maxHp: 100,
                hp: 100,
                battleType: 'special',
                specialAbility: {
                    type: 'breakDefense',
                    chance: 1.0,
                    description: '每回合为随机敌人添加1层破防'
                }
            },
            'humor': {
                id: 102,
                name: '滑稽',
                type: 'humor',
                description: '战斗开始时，给玩家提供一层滑稽',
                icon: '🤪',
                rarity: 'legendary',
                stats: { atk: 0, def: 30, hp: 400 },
                maxHp: 400,
                hp: 400,
                battleType: 'special',
                specialAbility: {
                    type: 'giveHumorBuff',
                    chance: 1.0,
                    description: '战斗开始时，给玩家提供一层滑稽'
                }
            },
            'raven': {
                id: 103,
                name: '渡鸦',
                type: 'raven',
                description: '每回合提升玩家2点速度',
                icon: '🐦‍⬛',
                rarity: 'legendary',
                stats: { atk: 15, def: 5, hp: 80 },
                maxHp: 80,
                hp: 80,
                battleType: 'special',
                specialAbility: {
                    type: 'speedBoost',
                    value: 2,
                    description: '每回合提升玩家2点速度'
                }
            }
        };
        return specialPets[type] ? new Pet(specialPets[type]) : null;
    }

    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.stats.def);
        this.hp = Math.max(0, this.hp - actualDamage);
        if (this.hp <= 0) {
            this.isDead = true;
        }
        return actualDamage;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    applyBuff(character) {
        if (this.battleType === 'buff') {
            character.atk += this.stats.atk;
            character.def += this.stats.def;
            character.maxHp += this.stats.hp;
            character.hp += this.stats.hp;
        }
    }

    executeSpecialAbility(battle) {
        if (!this.specialAbility || this.isDead) return;
        if (this.abilityUsedThisTurn) return;

        const ability = this.specialAbility;
        
        switch (ability.type) {
            case 'heal':
                const player = battle.getAlivePlayers()[0];
                if (player) {
                    player.heal(ability.value);
                    battle.battleLog.push({
                        type: 'petAbility',
                        pet: this.name,
                        ability: 'heal',
                        value: ability.value
                    });
                }
                break;

            case 'bind':
                const enemies = battle.getAliveEnemies();
                if (enemies.length > 0) {
                    const target = enemies[Math.floor(Math.random() * enemies.length)];
                    target.binded = true;
                    battle.battleLog.push({
                        type: 'petAbility',
                        pet: this.name,
                        ability: 'bind',
                        target: target.name
                    });
                }
                break;

            case 'breakDefense':
                const breakEnemies = battle.getAliveEnemies();
                if (breakEnemies.length > 0) {
                    const breakTarget = breakEnemies[Math.floor(Math.random() * breakEnemies.length)];
                    breakTarget.addBuff('破防', 1);
                    battle.battleLog.push({
                        type: 'petAbility',
                        pet: this.name,
                        ability: 'breakDefense',
                        target: breakTarget.name,
                        stacks: 1
                    });
                }
                break;

            case 'taunt':
                break;

            case 'giveHumorBuff':
                const playerForHumor = battle.getAlivePlayers()[0];
                if (playerForHumor) {
                    playerForHumor.addBuff('滑稽', 1);
                    battle.battleLog.push({
                        type: 'petAbility',
                        pet: this.name,
                        ability: 'giveHumorBuff',
                        message: '滑稽给玩家添加了滑稽buff！'
                    });
                }
                break;

            case 'speedBoost':
                const playerForSpeed = battle.getAlivePlayers()[0];
                if (playerForSpeed) {
                    playerForSpeed.spd += ability.value;
                    battle.battleLog.push({
                        type: 'petAbility',
                        pet: this.name,
                        ability: 'speedBoost',
                        value: ability.value
                    });
                }
                break;

            case 'mimic':
                if (!this.mimickedSkill) {
                    const playerChar = battle.getPlayerCharacter();
                    if (playerChar && playerChar.skills && playerChar.skills.length > 0) {
                        const randomSkill = playerChar.skills[Math.floor(Math.random() * playerChar.skills.length)];
                        this.mimickedSkill = randomSkill;
                        battle.battleLog.push({
                            type: 'petAbility',
                            pet: this.name,
                            ability: 'mimic',
                            skill: randomSkill.name
                        });
                    }
                }
                if (this.mimickedSkill) {
                    const aliveEnemies = battle.getAliveEnemies();
                    if (aliveEnemies.length > 0) {
                        const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                        const skillResult = this.mimickedSkill.use(this, target, battle.playerTeam);
                        battle.battleLog.push({
                            type: 'petAbility',
                            pet: this.name,
                            ability: 'mimicAttack',
                            skill: this.mimickedSkill.name,
                            target: target.name,
                            result: skillResult
                        });
                    }
                }
                break;

            case 'steal':
                const aliveEnemies = battle.getAliveEnemies();
                if (aliveEnemies.length > 0) {
                    const targetEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                    if (targetEnemy.skills && targetEnemy.skills.length > 0) {
                        const stolenSkill = targetEnemy.skills[Math.floor(Math.random() * targetEnemy.skills.length)];
                        const players = battle.getAlivePlayers();
                        if (players.length > 0) {
                            const targetPlayer = players[Math.floor(Math.random() * players.length)];
                            const damage = stolenSkill.power || 10;
                            const actualDamage = targetPlayer.takeDamage(damage);
                            battle.battleLog.push({
                                type: 'petAbility',
                                pet: this.name,
                                ability: 'steal',
                                skill: stolenSkill.name,
                                target: targetPlayer.name,
                                damage: actualDamage
                            });
                        }
                    }
                }
                break;
        }
        
        this.abilityUsedThisTurn = true;
    }
}

const PET_POOL = [
    { id: 1, name: '小灰猫', type: 'cat', description: '可爱的小猫', icon: '🐱', rarity: 'common', stats: { atk: 2, def: 1, hp: 10 }, battleType: 'buff' },
    { id: 2, name: '小黑猫', type: 'cat', description: '神秘的黑猫', icon: '🐈‍⬛', rarity: 'common', stats: { atk: 3, def: 0, hp: 8 }, battleType: 'buff' },
    { id: 3, name: '小白猫', type: 'cat', description: '神圣的白猫', icon: '🐈', rarity: 'rare', stats: { atk: 2, def: 2, hp: 15 }, battleType: 'buff' },
    { id: 4, name: '火焰猫', type: 'cat', description: '操控火焰的猫', icon: '😺', rarity: 'epic', stats: { atk: 8, def: 2, hp: 20 }, battleType: 'buff' },
    { id: 5, name: '雷电猫', type: 'cat', description: '操控雷电的猫', icon: '😸', rarity: 'epic', stats: { atk: 10, def: 0, hp: 15 }, battleType: 'buff' },
    { id: 6, name: '冰霜猫', type: 'cat', description: '操控冰霜的猫', icon: '😻', rarity: 'rare', stats: { atk: 5, def: 5, hp: 25 }, battleType: 'buff' },
    { id: 7, name: '战斗猫', type: 'cat', description: '擅长战斗的猫', icon: '😼', rarity: 'rare', stats: { atk: 7, def: 3, hp: 20 }, battleType: 'buff' },
    { id: 8, name: '真灵猫姬', type: 'cat', description: '觉醒的真灵猫姬', icon: '🐱', rarity: 'legendary', stats: { atk: 15, def: 10, hp: 50 }, battleType: 'battle', skill: { name: '灵猫冲击', power: 30 } },
    { id: 9, name: '小骨猫', type: 'undead', description: '骷髅猫', icon: '💀', rarity: 'rare', stats: { atk: 6, def: 4, hp: 25 }, battleType: 'buff' },
    { id: 10, name: '幽灵猫', type: 'spirit', description: '幽灵状态的猫', icon: '👻', rarity: 'epic', stats: { atk: 12, def: 0, hp: 10 }, battleType: 'buff' },
    { id: 11, name: '龙之子', type: 'dragon', description: '拥有龙之血脉', icon: '🐲', rarity: 'legendary', stats: { atk: 20, def: 15, hp: 80 }, battleType: 'battle', skill: { name: '龙息', power: 50 } },
    { id: 12, name: '天使猫', type: 'angel', description: '神圣的天使猫', icon: '😇', rarity: 'legendary', stats: { atk: 10, def: 20, hp: 100 }, battleType: 'buff' }
];

const SPECIAL_PETS = {
    'yueremu': { id: 100, name: '鱼儿木', icon: '🌿🐟', description: '半鱼半植物的生物，每回合可以治愈角色10滴血，攻击力5，防御力10，生命值150' },
    'maoning': { id: 101, name: '猫宁', icon: '🐱‍👤', description: '死里逃生的小猫，觉醒操纵阴影的能力，每回合为敌人添加1层破防，攻击力8，防御力8，生命值100' },
    'humor': { id: 102, name: '滑稽', icon: '🤪', description: '一个巨大的漂浮的滑稽脸，敌人攻击时会优先以滑稽作为目标，攻击力0，防御力30，生命值400' },
    'raven': { id: 103, name: '渡鸦', icon: '🐦‍⬛', description: '每回合提升玩家2点速度，攻击力15，防御力5，生命值80' }
};
