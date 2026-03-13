/**
 * ==================== 宠物类 ====================
 * 定义游戏中的宠物
 * 宠物分为两种类型：
 * - 参战型(battle)：作为额外战斗单位自动战斗
 * - Buff型(buff)：提供被动加成，不直接参战
 * 还有特殊的参战型(special)，在战斗中可以释放特殊技能
 */

class Pet {
    // 构造函数 - 初始化宠物属性
    constructor(data) {
        this.id = data.id;                    // 宠物ID
        this.name = data.name;                // 宠物名称
        this.type = data.type;                // 宠物类型
        this.description = data.description;  // 宠物描述
        this.icon = data.icon;                 // 宠物图标
        this.rarity = data.rarity || 'rare';  // 稀有度
        
        // 属性加成
        this.stats = data.stats || { atk: 0, def: 0, hp: 0 };
        this.maxHp = data.stats?.hp || 200;   // 最大生命
        this.hp = this.maxHp;                 // 当前生命
        this.skill = data.skill || null;      // 战斗技能
        
        // 战斗类型：buff（加成）或 battle/special（参战）
        this.battleType = data.battleType || 'buff';
        this.specialAbility = data.specialAbility || null;  // 特殊能力
        
        // 状态
        this.isDead = false;                  // 是否死亡
        this.abilityUsedThisTurn = false;     // 本回合是否已使用特殊能力
    }

    // ==================== 创建宠物 ====================
    static createPet(petData, floor = 0) {
        const pet = new Pet(petData);
        pet.maxHp = (petData.maxHp || 200) + floor * 5;
        pet.hp = pet.maxHp;
        return pet;
    }

    // ==================== 获取特殊宠物 ====================
    // 特殊宠物是剧情/事件获得的强力宠物
    static getSpecialPet(type) {
        const specialPets = {
            'yueremu': {
                id: 100,
                name: '鱼儿木',
                type: 'plant_fish',
                description: '半鱼半植物的生物，每回合可以治愈角色当前层数点血',
                icon: 'assets/images/yuermu.png',
                rarity: 'legendary',
                stats: { atk: 5, def: 10, hp: 150 },
                maxHp: 150,
                hp: 150,
                battleType: 'special',
                specialAbility: {
                    type: 'heal',
                    useFloor: true,
                    description: '每回合治愈角色当前层数点血'
                }
            },
            'maoning': {
                id: 101,
                name: '猫宁',
                type: 'shadow_cat',
                description: '死里逃生的小猫，觉醒操纵阴影的能力，每回合为敌人添加2层破防',
                icon: 'assets/images/maoning1.png',
                rarity: 'legendary',
                stats: { atk: 8, def: 8, hp: 100 },
                maxHp: 100,
                hp: 100,
                battleType: 'special',
                specialAbility: {
                    type: 'breakDefense',
                    chance: 1.0,
                    stacks: 2,
                    description: '每回合为随机敌人添加2层破防'
                }
            },
            'humor': {
                id: 102,
                name: '滑稽',
                type: 'humor',
                description: '战斗开始时，给玩家提供一层滑稽',
                icon: '🤪',
                rarity: 'legendary',
                stats: { atk: 0, def: 20, hp: 50 },
                maxHp: 50,
                hp: 50,
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
                icon: 'assets/images/duya.png',
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

    takeDamage(damage, damageType = 'physical') {
        let actualDamage;
        if (damageType === 'true') {
            actualDamage = damage;
        } else {
            actualDamage = Math.max(1, damage - (this.stats.def || 0));
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

    applyBuff(character) {
        if (this.battleType === 'buff') {
            character.atk += this.stats.atk;
            character.def += this.stats.def;
            character.maxHp += this.stats.hp;
            character.hp += this.stats.hp;
            character.relicBonusAtk = (character.relicBonusAtk || 0) + this.stats.atk;
            character.relicBonusDef = (character.relicBonusDef || 0) + this.stats.def;
        }
    }

    executeSpecialAbility(battle) {
        if (!this.specialAbility || this.isDead) return;
        if (this.abilityUsedThisTurn) return;

        const ability = this.specialAbility;
        
        switch (ability.type) {
            case 'heal': {
                let healValue;
                if (ability.useFloor && battle.game && battle.game.currentFloor) {
                    healValue = battle.game.currentFloor;
                } else {
                    healValue = ability.value || 1;
                }
                
                // 治疗所有友方单位（包括玩家和宠物）
                const playerTeam = battle.getAlivePlayers();
                playerTeam.forEach(player => {
                    player.heal(healValue);
                });
                
                // 治疗所有存活的宠物
                const player = battle.playerTeam[0];
                if (player && player.pets) {
                    player.pets.forEach(pet => {
                        if (!pet.isDead) {
                            pet.heal(healValue);
                        }
                    });
                }
                
                battle.battleLog.push({
                    type: 'petAbility',
                    pet: this.name,
                    ability: 'heal',
                    value: healValue
                });
                break;
            }

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
                    const breakStacks = this.specialAbility?.stacks || 1;
                    breakTarget.addBuff('破防', breakStacks);
                    battle.battleLog.push({
                        type: 'petAbility',
                        pet: this.name,
                        ability: 'breakDefense',
                        target: breakTarget.name,
                        stacks: breakStacks
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

const SPECIAL_PETS = {
    'yueremu': { id: 100, name: '鱼儿木', icon: 'assets/images/yuermu.png', description: '半鱼半植物的生物，每回合可以治愈角色当前层数点血，攻击力5，防御力10，生命值150' },
    'maoning': { id: 101, name: '猫宁', icon: 'assets/images/maoning1.png', description: '死里逃生的小猫，觉醒操纵阴影的能力，每回合为敌人添加2层破防，攻击力8，防御力8，生命值100' },
    'humor': { id: 102, name: '滑稽', icon: '🤪', description: '一个巨大的漂浮的滑稽脸，敌人攻击时会优先以滑稽作为目标，攻击力0，防御力20，生命值200' },
    'raven': { id: 103, name: '渡鸦', icon: 'assets/images/duya.png', description: '每回合提升玩家2点速度，攻击力15，防御力5，生命值80' }
};
