class Relic {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.type = data.type;
        this.effect = data.effect;
        this.icon = data.icon || '📿';
        this.consumable = data.consumable || false;
    }

    static EXCLUSIVE_RELIC_IDS = [21, 22, 23, 24, 25];

    static getRandomRelic(excludeIds = [], allowExclusive = false) {
        let pool = RELIC_POOL.filter(r => !excludeIds.includes(r.id));
        
        if (!allowExclusive) {
            pool = pool.filter(r => !this.EXCLUSIVE_RELIC_IDS.includes(r.id));
        }
        
        if (pool.length === 0) {
            return null;
        }
        
        const index = Math.floor(Math.random() * pool.length);
        return new Relic(pool[index]);
    }

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
                    break;
                case 'def':
                    character.def += this.effect.value;
                    break;
                case 'hp':
                    character.maxHp += this.effect.value;
                    character.hp += this.effect.value;
                    break;
                case 'stamina':
                    character.maxStamina += this.effect.value;
                    character.stamina += this.effect.value;
                    break;
                case 'mana':
                    character.maxMana += this.effect.value;
                    character.mana += this.effect.value;
                    break;
                case 'crit':
                    character.crit += this.effect.value;
                    break;
                case 'speed':
                    character.spd += this.effect.value;
                    break;
                case 'critDmg':
                    character.critDmg += this.effect.value;
                    break;
            }
        }
    }
}

const RELIC_POOL = [
    { id: 1, name: '力量戒指', description: '攻击力+15', type: 'passive', effect: { type: 'atk', value: 15 }, icon: '💍' },
    { id: 2, name: '防御护符', description: '防御力+10', type: 'passive', effect: { type: 'def', value: 10 }, icon: '🧿' },
    { id: 3, name: '生命水晶', description: '最大生命+30', type: 'passive', effect: { type: 'hp', value: 30 }, icon: '💎' },
    { id: 4, name: '薛定谔的猫', description: '防御力+6', type: 'passive', effect: { type: 'def', value: 6 }, icon: '🐱' },
    { id: 5, name: '暴击之眼', description: '暴击率+5%', type: 'passive', effect: { type: 'crit', value: 5 }, icon: '👁️' },
    { id: 6, name: '虎爪吊坠', description: '暴击伤害+20%', type: 'passive', effect: { type: 'critDmg', value: 20 }, icon: '🐅' },
    { id: 7, name: '圣光十字架', description: '攻击力+8', type: 'passive', effect: { type: 'atk', value: 8 }, icon: '✝️' },
    { id: 8, name: '钟表', description: '防御力+8', type: 'passive', effect: { type: 'def', value: 8 }, icon: '🕐' },
    { id: 9, name: '凤凰羽毛', description: '最大生命+25', type: 'passive', effect: { type: 'hp', value: 25 }, icon: '🪶' },
    { id: 10, name: '龙鳞护甲', description: '防御力+15', type: 'passive', effect: { type: 'def', value: 15 }, icon: '🐉' },
    { id: 11, name: '铃铛', description: '速度+8', type: 'passive', effect: { type: 'speed', value: 8 }, icon: '🔔' },
    { id: 12, name: '恶魔之角', description: '攻击力+20', type: 'passive', effect: { type: 'atk', value: 20 }, icon: '😈' },
    { id: 13, name: '贪婪金币', description: '攻击力+5', type: 'passive', effect: { type: 'atk', value: 5 }, icon: '🪙' },
    { id: 14, name: '勇士勋章', description: '攻击力+12 防御力+5', type: 'passive', effect: { type: 'atk', value: 12 }, icon: '🎖️' },
    { id: 15, name: '守护圣盾', description: '防御力+12 生命+20', type: 'passive', effect: { type: 'def', value: 12 }, icon: '🛡️' },
    { id: 16, name: '体力胸针', description: '最大体力+25', type: 'passive', effect: { type: 'stamina', value: 25 }, icon: '🏅' },
    { id: 17, name: '魔法项链', description: '最大法力+15', type: 'passive', effect: { type: 'mana', value: 15 }, icon: '📿' },
    { id: 18, name: '耐力腰带', description: '最大体力+20 速度+3', type: 'passive', effect: { type: 'stamina', value: 20 }, icon: '🥋' },
    { id: 19, name: '智慧戒指', description: '最大法力+20 暴击率+3%', type: 'passive', effect: { type: 'mana', value: 20 }, icon: '💠' },
    { id: 20, name: '能量护符', description: '最大体力+15 最大法力+10', type: 'passive', effect: { type: 'stamina', value: 15 }, icon: '⚡' },
    { id: 21, name: '两姓家奴', description: '怪物对你造成的伤害-10%', type: 'passive', effect: { type: 'damageReduction', value: 10 }, icon: '🔱' },
    { id: 22, name: '变动的世界线', description: '获得时将角色所在的层数提升3层', type: 'passive', effect: { type: 'floorShift', value: -3 }, icon: '🌀' },
    { id: 23, name: '染血的沐浴露', description: '对BOSS大帝造成的伤害+20%', type: 'passive', effect: { type: 'bossDmgBoost', value: 20 }, icon: '🩸' },
    { id: 24, name: '不战而怯', description: '战斗时使用技能有10%概率失败', type: 'passive', effect: { type: 'skillFail', value: 10 }, icon: '💤' },
    { id: 25, name: '霸王之卵', description: '每次战斗免疫敌方单位的第一次攻击，死亡后可复活一次', type: 'event', icon: '🥚', effect: { type: '霸王之卵' } }
];
