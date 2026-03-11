class Skill {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.type = data.type;
        this.rarity = data.rarity;
        this.power = data.power || 0;
        this.heal = data.heal || 0;
        this.defense = data.defense || 0;
        this.targetSelf = data.targetSelf || false;
        this.icon = data.icon || '✨';
        this.effect = data.effect || null;
        this.costType = data.costType || 'stamina';
        this.cost = data.cost || 0;
        this.isMagic = data.isMagic || false;
        this.targetAll = data.targetAll || false;
        this.passive = data.passive || false;
    }

    needsTarget() {
        if (this.targetAll) return false;
        if (this.type === 'fear' && this.effect?.type === 'fear') return false;
        if (this.type === 'execute') return false;
        return this.type === 'attack' || this.type === 'debuff' || this.type === 'mark' || this.type === 'banish' || this.type === 'buff' || this.type === 'heal' || (this.type === 'summon' && !this.targetSelf);
    }

    getCost() {
        return this.cost || 0;
    }

    getCostType() {
        return this.isMagic ? 'mana' : 'stamina';
    }

    canUse(character) {
        const costType = this.getCostType();
        const cost = this.getCost();
        if (costType === 'mana') {
            return character.hasMana(cost);
        } else {
            return character.hasStamina(cost);
        }
    }

    consume(character) {
        const costType = this.getCostType();
        const cost = this.getCost();
        if (costType === 'mana') {
            return character.consumeMana(cost);
        } else {
            return character.consumeStamina(cost);
        }
    }

    static getRandomSkill(level, excludeIds = []) {
        const pool = SKILL_POOL.filter(s => s.level <= level && !excludeIds.includes(s.id));
        
        if (pool.length === 0) {
            return null;
        }
        
        const weights = pool.map(s => this.getWeight(s.rarity));
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < pool.length; i++) {
            random -= weights[i];
            if (random <= 0) return new Skill(pool[i]);
        }
        return new Skill(pool[pool.length - 1]);
    }

    static getWeight(rarity) {
        switch(rarity) {
            case 'common': return 60;
            case 'rare': return 25;
            case 'epic': return 10;
            case 'legendary': return 5;
            default: return 60;
        }
    }

    static getRarityColor(rarity) {
        switch(rarity) {
            case 'common': return 'skill-rarity-common';
            case 'rare': return 'skill-rarity-rare';
            case 'epic': return 'skill-rarity-epic';
            case 'legendary': return 'skill-rarity-legendary';
            default: return 'skill-rarity-common';
        }
    }
}

const SKILL_POOL = [
    {
        id: 11,
        name: '爪击',
        description: '造成少量物理伤害',
        type: 'attack',
        rarity: 'common',
        power: '30+1*atk',
        level: 1,
        icon: '🐾',
        cost: 0,
        isMagic: false
    },
    {
        id: 12,
        name: '魔术飞弹',
        description: '对敌方单位造成较大魔法伤害',
        type: 'attack',
        rarity: 'rare',
        power: '60+1.4*atk',
        level: 3,
        icon: '🪄',
        cost: 40,
        isMagic: true
    },
    {
        id: 13,
        name: '地鸣',
        description: '发送地鸣，召唤超大型巨人踩踏全场对除自己外的所有单位（包括友方单位）造成极大量物理伤害',
        type: 'attack',
        rarity: 'legendary',
        power: '120+2*atk',
        level: 5,
        icon: '🦶',
        cost: 100,
        isMagic: false,
        targetAll: true
    },
    {
        id: 14,
        name: '猫姬之觉醒',
        description: '对敌方全体单位造成大量伤害，免疫下一次物理伤害',
        type: 'attack',
        rarity: 'legendary',
        power: '100+1.6*atk',
        level: 5,
        icon: '🐱',
        cost: 100,
        isMagic: true,
        targetAll: true
    },
    {
        id: 15,
        name: '鬼！',
        description: '放逐一个敌方单位，将其移除，对精英怪以及BOSS无效',
        type: 'banish',
        rarity: 'rare',
        power: 0,
        level: 3,
        icon: '👻',
        cost: 40,
        isMagic: true,
        effect: { type: 'banish', duration: 2, eliteImmune: true }
    },
    {
        id: 16,
        name: '速胜论',
        description: '对敌方单位造成大量伤害，使得敌方所有单位力量+3',
        type: 'attack',
        rarity: 'epic',
        power: '100+1.6*atk',
        level: 4,
        icon: '⚡',
        cost: 45,
        isMagic: false,
        effect: { type: 'enrage', value: 3 }
    },
    {
        id: 17,
        name: '嘶哈～！？',
        description: '对敌方单位哈气，并对其造成该单位上回合对你造成的伤害',
        type: 'attack',
        rarity: 'common',
        power: 0,
        level: 2,
        icon: '😤',
        cost: 30,
        isMagic: false,
        effect: { type: 'counter' }
    },
    {
        id: 18,
        name: '仗势',
        description: '本次战斗中，若友方单位数大于敌方单位数，则每回合释放技能数+1，若角色被攻击一次，则本次战斗该技能失效',
        type: 'passive',
        rarity: 'epic',
        power: 0,
        level: 4,
        icon: '💪',
        cost: 0,
        isMagic: false,
        targetSelf: true,
        passive: true,
        effect: { type: 'advantage', extraAction: true }
    },
    {
        id: 19,
        name: '棘背龙形态',
        description: '你应激了！对所有敌方单位，造成较大物理伤害，若受击单位受击生命值少于100则该单位获得三层虚弱',
        type: 'attack',
        rarity: 'legendary',
        power: '60+1.4*atk',
        level: 5,
        icon: '🦖',
        cost: 80,
        isMagic: false,
        targetAll: true,
        effect: { type: 'weakness', threshold: 100, stacks: 3 }
    },
    {
        id: 20,
        name: '伏击',
        description: '每回合一次，若敌方攻击伤害小于你的速度，则无视该次伤害并反伤',
        type: 'passive',
        rarity: 'legendary',
        power: 0,
        level: 5,
        icon: '🎯',
        cost: 0,
        isMagic: false,
        passive: true,
        effect: { type: 'counterAttack', condition: 'speed' }
    },
    {
        id: 21,
        name: '来小亮给他整个活！',
        description: '小亮翻了个跟头，移除了所有敌方单位的正面buff',
        type: 'debuff',
        rarity: 'legendary',
        power: 0,
        level: 5,
        icon: '🤸',
        cost: 30,
        isMagic: true,
        targetAll: true,
        effect: { type: 'removePositiveBuffs' }
    },
    {
        id: 22,
        name: '召唤滑稽',
        description: '滑稽的笑声让人抓耳挠腮，使用该技能后获得BUFF：滑稽',
        type: 'buff',
        rarity: 'common',
        power: 0,
        level: 2,
        icon: '🤪',
        cost: 20,
        isMagic: false,
        targetAll: false,
        effect: { type: 'addBuff', buffName: '滑稽' }
    },
    {
        id: 23,
        name: '焉有一合之将',
        description: '滑稽存在四个回合后，爆发了它的潜力！滑稽回复100点生命值，滑稽获得一层滑稽',
        type: 'passive',
        rarity: 'epic',
        power: 0,
        level: 4,
        icon: '💥',
        cost: 0,
        isMagic: false,
        passive: true,
        effect: { type: 'humorBurst' }
    },
    {
        id: 24,
        name: '回来了我的原子弹！',
        description: '你在看球赛，并高呼"我的原子弹，回来了！"，你随机对一名敌方单位造成20%最大生命值伤害',
        type: 'attack',
        rarity: 'rare',
        power: 0,
        level: 3,
        icon: '⚾',
        cost: 50,
        isMagic: false,
        effect: { type: 'maxHpDamage', percent: 0.2 }
    },
    {
        id: 25,
        name: '猪鼻吧，这怎么这么菜啊',
        description: '你对敌方单位进行了嘲讽，被嘲讽的单位红温了，他们获得攻击力+2，但下次攻击有50%攻击到其他敌方单位',
        type: 'debuff',
        rarity: 'common',
        power: 0,
        level: 1,
        icon: '🐷',
        cost: 15,
        isMagic: false,
        effect: { type: 'enrage', value: 2, selfAttack: 0.5 }
    },
    {
        id: 26,
        name: 'q打断别人的e啊',
        description: '你的q打断了别人的e，被该技能攻击的单位下回合无法使用技能',
        type: 'attack',
        rarity: 'legendary',
        power: '40+1.6*atk',
        level: 5,
        icon: '❌',
        cost: 30,
        isMagic: false,
        effect: { type: 'silence' }
    },
    {
        id: 27,
        name: '哇沃！',
        description: '你哇沃大叫！给大伙吓一跳，受击单位下回合无法使用技能且攻击力+5',
        type: 'debuff',
        rarity: 'epic',
        power: 1,
        level: 4,
        icon: '😱',
        cost: 45,
        isMagic: true,
        targetAll: true,
        effect: { type: 'fearAndBuff', buffAtk: 5 }
    },
    {
        id: 29,
        name: '吞食',
        description: '若使用此技能杀死敌方单位，使用者最大生命值+5',
        type: 'attack',
        rarity: 'rare',
        power: '1*atk',
        level: 3,
        icon: '😋',
        cost: 30,
        isMagic: true,
        effect: { type: 'drain', hpBonus: 5 }
    },
    {
        id: 30,
        name: '脱衣',
        description: '敌方单位获得3层勇气，你获得5层勇气',
        type: 'buff',
        rarity: 'common',
        power: 0,
        level: 2,
        icon: '👕',
        cost: 30,
        isMagic: true,
        effect: { type: 'addBuffs', selfBuff: '勇气', stacks: 5, targetBuff: '勇气', targetStacks: 3 }
    },
    {
        id: 31,
        name: '夺食',
        description: '夺走敌方单位的一个正面buff，若该单位无正面buff则无事发生，并造成少量物理伤害',
        type: 'attack',
        rarity: 'common',
        power: 30,
        level: 1,
        icon: '🍖',
        cost: 45,
        isMagic: false,
        effect: { type: 'stealBuff' }
    },
    {
        id: 32,
        name: '冲击之龙吼',
        description: '对敌方单位造成大量法术伤害',
        type: 'attack',
        rarity: 'epic',
        power: '80+1.6*atk',
        level: 4,
        icon: '🐉',
        cost: 60,
        isMagic: true
    },
    {
        id: 33,
        name: '数值之拳',
        description: '对敌方单位造成极大量物理伤害',
        type: 'attack',
        rarity: 'legendary',
        power: '120+2*atk',
        level: 5,
        icon: '👊',
        cost: 80,
        isMagic: false
    },
    {
        id: 34,
        name: '狠狠撕咬',
        description: '造成中量物理伤害',
        type: 'attack',
        rarity: 'rare',
        power: '50+1.2*atk',
        level: 2,
        icon: '🦷',
        cost: 25,
        isMagic: false
    }
];
