/**
 * ==================== 遗物类 ====================
 * 定义游戏中的圣人遗物（被动装备）
 * 遗物是一种被动加成装备，装备后持续生效
 * 分为：永久加成类、一次性使用类、特殊效果类
 */

class Relic {
    // 构造函数 - 初始化遗物属性
    constructor(data) {
        this.id = data.id;                    // 遗物ID
        this.name = data.name;                // 遗物名称
        this.description = data.description;  // 遗物描述
        this.note = data.note || '';          // 额外说明
        this.type = data.type;                // 遗物类型
        this.effect = data.effect;            // 遗物效果
        this.icon = data.icon || '📿';        // 遗物图标
        this.consumable = data.consumable || false;  // 是否是消耗品
    }

    // 独占遗物ID（某些特殊遗物只能获得一次）
    static EXCLUSIVE_RELIC_IDS = [21, 22, 23, 24, 25, 31];

    // ==================== 随机获取一个遗物 ====================
    static getRandomRelic(excludeIds = [], allowExclusive = false) {
        // 从遗物池中排除已拥有的
        let pool = RELIC_POOL.filter(r => !excludeIds.includes(r.id));
        
        // 如果不允许独占遗物，排除它们
        if (!allowExclusive) {
            pool = pool.filter(r => !this.EXCLUSIVE_RELIC_IDS.includes(r.id));
        }
        
        if (pool.length === 0) {
            return null;
        }
        
        // 随机选择一个
        const index = Math.floor(Math.random() * pool.length);
        return new Relic(pool[index]);
    }

    // ==================== 随机获取三个遗物 ====================
    static getThreeRandomRelics() {
        const relics = [];
        for (let i = 0; i < 3; i++) {
            relics.push(this.getRandomRelic());
        }
        return relics;
    }

    applyEffect(character) {
        if (this.effect) {
            switch(this.effect.type) {
                case 'atk':
                    character.atk += this.effect.value;
                    character.relicBonusAtk = (character.relicBonusAtk || 0) + this.effect.value;
                    break;
                case 'def':
                    character.def += this.effect.value;
                    character.relicBonusDef = (character.relicBonusDef || 0) + this.effect.value;
                    break;
                case 'hp':
                    character.maxHp += this.effect.value;
                    character.hp += this.effect.value;
                    break;
                case 'stamina':
                    character.maxStamina += this.effect.value;
                    character.stamina += this.effect.value;
                    if (this.effect.speed) {
                        character.spd += this.effect.speed;
                        character.relicBonusSpd = (character.relicBonusSpd || 0) + this.effect.speed;
                    }
                    if (this.effect.atk) {
                        character.atk += this.effect.atk;
                        character.relicBonusAtk = (character.relicBonusAtk || 0) + this.effect.atk;
                    }
                    break;
                case 'mana':
                    character.maxMana += this.effect.value;
                    character.mana += this.effect.value;
                    break;
                case 'crit':
                    character.crit += this.effect.value;
                    break;
                case 'magicPower':
                    character.magicPower = (character.magicPower || 10) + this.effect.value;
                    // 希沃白板之笔还有防御力加成
                    if (this.effect.def) {
                        character.def += this.effect.def;
                        character.relicBonusDef = (character.relicBonusDef || 0) + this.effect.def;
                    }
                    break;
                case 'speed':
                    character.spd += this.effect.value;
                    character.relicBonusSpd = (character.relicBonusSpd || 0) + this.effect.value;
                    break;
                case 'critDmg':
                    character.critDmg += this.effect.value;
                    break;
                case 'magicToPhysical':
                    character.maxStamina += character.maxMana;
                    character.stamina = Math.min(character.stamina, character.maxStamina);
                    character.maxMana = 0;
                    character.mana = 0;
                    break;
                case 'physicalToMagic':
                    character.maxMana += character.maxStamina;
                    character.mana = Math.min(character.mana, character.maxMana);
                    character.maxStamina = 0;
                    character.stamina = 0;
                    break;
            }
        }
    }
}

const RELIC_POOL = [
    { id: 1, name: '充满帕瓦椅子', description: '攻击力+12', type: 'passive', effect: { type: 'atk', value: 12 }, icon: '🛒' },
    { id: 2, name: '防御护符', description: '防御力+10', type: 'passive', effect: { type: 'def', value: 10 }, icon: '🧿' },
    { id: 3, name: '生命抄袭（伪）', description: '最大生命+60', type: 'passive', effect: { type: 'hp', value: 60 }, icon: '🩸' },
    { id: 4, name: '薛定谔的猫', description: '防御力+6', type: 'passive', effect: { type: 'def', value: 6 }, icon: '🐱' },
    { id: 5, name: '马眼', description: '暴击率+5%', type: 'passive', effect: { type: 'crit', value: 5 }, icon: '👁️' },
    { id: 6, name: '猫姬吊坠', description: '暴击伤害+20%', type: 'passive', effect: { type: 'critDmg', value: 20 }, icon: '🐅' },
    { id: 7, name: '你光的十字架', description: '法力强度+8', type: 'passive', effect: { type: 'magicPower', value: 8 }, icon: '✝️' },
    { id: 12, name: '血之恶魔的角', description: '攻击力+20', type: 'passive', effect: { type: 'atk', value: 20 }, icon: '😈' },
    { id: 13, name: '贪婪金币', description: '法力强度+5', type: 'passive', effect: { type: 'magicPower', value: 5 }, icon: '🪙' },
    { id: 14, name: '希沃白板之笔', description: '法力强度+12 防御力+5', type: 'passive', effect: { type: 'magicPower', value: 12, def: 5 }, icon: '🖊' },
    { id: 15, name: '超市里的马', description: '防御力+12 生命+20', type: 'passive', effect: { type: 'def', value: 12 }, icon: '🐎' },
    { id: 16, name: '红牛', description: '最大体力+25', type: 'passive', effect: { type: 'stamina', value: 25 }, icon: '🐂' },
    { id: 17, name: '鬼脑', description: '最大法力+20', type: 'passive', effect: { type: 'mana', value: 15 }, icon: '🧠' },
    { id: 18, name: '脉动', description: '最大体力+20 速度+3', type: 'passive', effect: { type: 'stamina', value: 20, speed: 3 }, icon: '🧃' },
    { id: 19, name: '好寺庙（模型）', description: '最大法力+20 暴击率+3%', type: 'passive', effect: { type: 'mana', value: 20 }, icon: '🏠' },
    { id: 20, name: '能量护符', description: '最大体力+15 最大法力+10', type: 'passive', effect: { type: 'stamina', value: 15 }, icon: '⚡' },
    { id: 21, name: '两姓家奴', description: '怪物对你造成的伤害-10%', type: 'passive', effect: { type: 'damageReduction', value: 10 }, icon: '🔱' },
    { id: 22, name: '变动的世界线', description: '获得时将角色所在的层数提升3层', type: 'passive', effect: { type: 'floorShift', value: -3 }, icon: '🌀' },
    { id: 23, name: '染血的沐浴露', description: '对BOSS大帝造成的伤害+20%', type: 'passive', effect: { type: 'bossDmgBoost', value: 20 }, icon: '🩸' },
    { id: 24, name: '不战而怯', description: '战斗时使用技能有10%概率失败', type: 'passive', effect: { type: 'skillFail', value: 10 }, icon: '💤' },
    { id: 25, name: '霸王之卵', description: '每次战斗免疫敌方单位的第一次攻击，死亡后可复活一次', type: 'event', icon: '🥚', effect: { type: '霸王之卵' } },
    { id: 26, name: '连续施法', description: '每回合恢复5点法力值', type: 'passive', effect: { type: 'manaPerTurn', value: 5 }, icon: '🔮', note: '我的力量，无穷无尽' },
    { id: 27, name: '鹿管', description: '每回合恢复5点体力值，有【开导】技能时改为每回合恢复10点体力值', type: 'passive', effect: { type: 'staminaPerTurn', value: 5 }, icon: '🦌', note: '如果你让我开导，我会让你知道什么叫做残忍' },
    { id: 28, name: '魔法转物理', description: '获得等同于当前最大法力值的最大体力值加成，随后将自身最大法力值设置为0', type: 'passive', effect: { type: 'magicToPhysical' }, icon: '⚔️', note: '贴身肉搏才是法爷的浪漫' },
    { id: 29, name: '物理转魔法', description: '获得等同于当前最大体力值的最大法力值加成，随后将自身最大体力值设置为0', type: 'passive', effect: { type: 'physicalToMagic' }, icon: '🔮', note: '只有傻子才会冲锋' },
    { id: 30, name: '猫宁的围巾', description: '防御力+3，战斗中若猫宁存活则每回合恢复猫宁10点生命值', type: 'passive', effect: { type: 'def', value: 3 }, icon: '🧣', note: '十分温暖' },
    { id: 31, name: '八宝粥', description: '生命值+100，技能：夺食攻击伤害类型转换为真实伤害', type: 'event', effect: { type: 'hp', value: 100 }, icon: '🥣', note: '"我们这种人就像是野狗一般"' },
    { id: 32, name: '和成天下', description: '最大体力-10，攻击力+20', type: 'event', effect: { type: 'stamina', value: -10, atk: 20 }, icon: '🌴', note: '"白生生的精品大果！"' }
];
