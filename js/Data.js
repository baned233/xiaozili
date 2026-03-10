const WEAPONS = {
    sword: { name: '剑', icon: '⚔️', atkBonus: 10, critBonus: 5 },
    bow: { name: '弓', icon: '🏹', atkBonus: 8, critBonus: 10, range: true },
    staff: { name: '法杖', icon: '🪄', atkBonus: 12, critBonus: 0, magic: true },
    blade: { name: '刀', icon: '🔪', atkBonus: 15, critBonus: 8 },
    hammer: { name: '锤', icon: '🔨', atkBonus: 20, critBonus: -5 },
    shield: { name: '盾', icon: '🛡️', atkBonus: 5, defBonus: 10 }
};

const FLOOR_DATA = {
    1: { name: '地牢入口', enemyLevel: 1, bgClass: 'floor-bg-1' },
    2: { name: '阴暗走廊', enemyLevel: 1, bgClass: 'floor-bg-1' },
    3: { name: '囚室区', enemyLevel: 2, bgClass: 'floor-bg-1' },
    4: { name: '废水池', enemyLevel: 2, bgClass: 'floor-bg-1' },
    5: { name: '刑讯室', enemyLevel: 2, bgClass: 'floor-bg-1' },
    6: { name: '武器库', enemyLevel: 3, bgClass: 'floor-bg-1' },
    7: { name: '典狱室', enemyLevel: 3, bgClass: 'floor-bg-1' },
    8: { name: '秘密通道', enemyLevel: 3, bgClass: 'floor-bg-1' },
    9: { name: '看台', enemyLevel: 4, bgClass: 'floor-bg-1' },
    10: { name: '地牢深处', enemyLevel: 5, isBoss: true, bossName: '地牢守卫者', bgClass: 'floor-bg-1' },
    11: { name: '深渊入口', enemyLevel: 5, bgClass: 'floor-bg-2' },
    12: { name: '熔岩河', enemyLevel: 5, bgClass: 'floor-bg-2' },
    13: { name: '灼热洞穴', enemyLevel: 6, bgClass: 'floor-bg-2' },
    14: { name: '岩浆池', enemyLevel: 6, bgClass: 'floor-bg-2' },
    15: { name: '黑曜石殿', enemyLevel: 6, bgClass: 'floor-bg-2' },
    16: { name: '深渊祭坛', enemyLevel: 7, bgClass: 'floor-bg-2' },
    17: { name: '恶魔领域', enemyLevel: 7, bgClass: 'floor-bg-2' },
    18: { name: '堕落的王座', enemyLevel: 7, bgClass: 'floor-bg-2' },
    19: { name: '绝望深渊', enemyLevel: 8, bgClass: 'floor-bg-2' },
    20: { name: '深渊最深处', enemyLevel: 10, isBoss: true, bossName: '大帝', bgClass: 'floor-bg-2' },
    21: { name: '灵域入口', enemyLevel: 10, bgClass: 'floor-bg-3' },
    22: { name: '云雾阶梯', enemyLevel: 10, bgClass: 'floor-bg-3' },
    23: { name: '星辰回廊', enemyLevel: 11, bgClass: 'floor-bg-3' },
    24: { name: '神圣花园', enemyLevel: 11, bgClass: 'floor-bg-3' },
    25: { name: '光明圣殿', enemyLevel: 11, bgClass: 'floor-bg-3' },
    26: { name: '天使长阶', enemyLevel: 12, bgClass: 'floor-bg-3' },
    27: { name: '诸神黄昏', enemyLevel: 12, bgClass: 'floor-bg-3' },
    28: { name: '最终试炼', enemyLevel: 12, bgClass: 'floor-bg-3' },
    29: { name: '天门之前', enemyLevel: 13, bgClass: 'floor-bg-3' },
    30: { name: '灵域之巅', enemyLevel: 15, isBoss: true, bossName: '灵域天王', bgClass: 'floor-bg-3' }
};

const BOSS_DIALOGS = {
    10: {
        name: '地牢守卫者',
        enter: '闯入者...死！',
        battle: '休想...通过！',
        death: '这就是...代价...'
    },
    20: {
        name: '大帝',
        enter: '亵渎者，接受审判！',
        battle: '你的死期已至！',
        death: '不可能...'
    },
    30: {
        name: '灵域天王',
        enter: '凡人...止步！',
        battle: '这是...最后！',
        death: '你...通过了...'
    }
};

const ENEMY_NAMES = {
    common: ['老鼠', '蟑螂', '骷髅', '僵尸', '蝙蝠', '狱卒', '幽灵', '魅魔', '石魔', '暗影'],
    elite: ['精英骷髅', '腐尸统领', '深渊恶魔', '黑暗巫师', '炎魔', '暗金龙'],
    boss: ['地牢守卫者', '大帝', '灵域天王']
};

const ENEMY_ICONS = {
    common: ['🐀', '🪲', '💀', '🧟', '🦇', '👤', '👻', '😈', '🗿', '👤'],
    elite: ['💀', '🧟', '👹', '🧙', '🔥', '🐉'],
    boss: ['👹', '👿', '👼']
};

const SHOP_ITEMS = [
    { id: 'heal_potion', name: '治疗药水', icon: '🧪', price: 30, effect: { type: 'heal', value: 50 }, desc: '恢复50点生命' },
    { id: 'stamina_potion', name: '体力药水', icon: '🍖', price: 25, effect: { type: 'stamina', value: 50 }, desc: '恢复50点体力' },
    { id: 'mana_potion', name: '法力药水', icon: '🧊', price: 35, effect: { type: 'mana', value: 30 }, desc: '恢复30点法力' },
    { id: 'atk_boost', name: '力量药剂', icon: '💪', price: 60, effect: { type: 'atk', value: 3 }, desc: '永久+3攻击' },
    { id: 'def_boost', name: '护甲碎片', icon: '🛡️', price: 50, effect: { type: 'def', value: 2 }, desc: '永久+2防御' },
    { id: 'hp_boost', name: '生命宝石', icon: '❤️', price: 80, effect: { type: 'maxHp', value: 20 }, desc: '永久+20最大生命' },
    { id: 'stamina_boost', name: '体力精髓', icon: '💥', price: 70, effect: { type: 'maxStamina', value: 15 }, desc: '永久+15最大体力' },
    { id: 'mana_boost', name: '魔法水晶', icon: '💎', price: 90, effect: { type: 'maxMana', value: 10 }, desc: '永久+10最大法力' },
    { id: 'crit_boost', name: '幸运符', icon: '🍀', price: 70, effect: { type: 'crit', value: 5 }, desc: '永久+5%暴击率' },
    { id: 'skill_scroll', name: '技能卷轴', icon: '📜', price: 100, effect: { type: 'skill' }, desc: '随机获得一个技能' },
    { id: 'relic_box', name: '遗物盒子', icon: '📦', price: 150, effect: { type: 'relic' }, desc: '随机获得一个遗物' }
];

const RANDOM_EVENTS = [
    {
        id: 'cliff',
        name: '悬崖绝境',
        icon: '🏔️',
        desc: '你被怪物追着逼入了绝境，前面是万丈深渊！',
        options: [
            { text: '绕过逃生', effect: { escape: true, message: '你小心翼翼地绕过了悬崖，成功逃生！' } },
            { text: '跳下', effect: { damage: 50, message: '你纵身跳下悬崖...获得了奇遇宠物-鱼儿木！', pet: 'yueremu' } }
        ]
    },
    {
        id: 'rescue',
        name: '拯救',
        icon: '🐱',
        desc: '你发现了一只受伤的小猫，奄奄一息地躺在路边...',
        options: [
            { text: '花费50金币救治', effect: { cost: 50, pet: 'maoning', message: '你救治了这只小猫，它决定跟随你！获得奇遇宠物——猫宁' } },
            { text: '离开', effect: { message: '你转身离开了...' } }
        ]
    },
    {
        id: 'crossroad',
        name: '滑稽与渡鸦',
        icon: '❓',
        desc: '你在分岔路口遇到了一个神秘的抉择，左边是滑稽图案，右边是渡鸦图案...',
        options: [
            { text: '选择滑稽', effect: { pet: 'humor', message: '你选择了滑稽，获得了奇遇宠物——滑稽！' } },
            { text: '选择渡鸦', effect: { pet: 'raven', message: '你选择了渡鸦，获得了奇遇宠物——渡鸦！' } },
            { text: '离开', effect: { message: '你转身离开了...' } }
        ]
    },
    {
        id: 'treasure',
        name: '神秘宝箱',
        icon: '📦',
        desc: '你发现了一个神秘的宝箱，要打开它吗？',
        options: [
            { text: '打开宝箱', effect: { gold: [20, 50], extraReward: true, chance: 0.7, bad: { damage: 20 } } },
            { text: '无视离开', effect: {} }
        ]
    },
    {
        id: 'fountain',
        name: '神秘泉水',
        icon: '⛲',
        desc: '你发现了一眼神秘的泉水，散发着奇异的光芒。',
        options: [
            { text: '饮用泉水', effect: { heal: 30, stamina: 40, mana: 20, chance: 0.8, bad: { damage: 15 } } },
            { text: '装一瓶带走', effect: { item: 'heal_potion' } },
            { text: '离开', effect: {} }
        ]
    },
    {
        id: 'merchant',
        name: '神秘商人',
        icon: '🧙',
        desc: '一个神秘的商人出现在你面前，"想买点什么便宜货吗？"',
        options: [
            { text: '花费20金币购买', effect: { cost: 20, randomItem: true } },
            { text: '拒绝', effect: {} }
        ]
    },
    {
        id: 'trap',
        name: '陷阱',
        icon: '⚠️',
        desc: '你不小心踩到了一个陷阱！',
        options: [
            { text: '触发陷阱', effect: { trapDamage: 0.2, skill: 'disciple' } }
        ]
    },

    {
        id: 'rest_spot',
        name: '休息处',
        icon: '🏕️',
        desc: '你发现了一个舒适的休息处，可以恢复体力和法力。',
        options: [
            { text: '休息恢复', effect: { stamina: 50, mana: 30 } },
            { text: '离开', effect: {} }
        ]
    },
    {
        id: 'room503',
        name: '503的异响',
        icon: '🚪',
        desc: '寝室503中总传来奇怪的声音，是否进入查看？',
        options: [
            { text: '进入503', effect: { relic: 'two_surname_servant' } },
            { text: '放弃进入', effect: { relic: 'world_line' } }
        ]
    },
    {
        id: 'sacrifice',
        name: '献祭',
        icon: '🥚',
        desc: '你望着那让人绝望的怪物，心生恐惧，这时你胸口的霸王之卵疯狂抖动……',
        options: [
            { text: '拒绝献祭', effect: { message: '你放弃了献祭伙伴，你选择英勇赴死', maxHpChange: -10 } },
            { text: '献祭', effect: { relic: 25, sacrifice: true, message: '你选择献祭和你一同战斗的伙伴，往日种种……你当真不记得了吗？' } }
        ]
    },
    {
        id: 'dark_bathroom',
        name: '漆黑的浴室',
        icon: '🚿',
        desc: '已经停水停电的浴室，里面似乎传来一些动静。',
        options: [
            { text: '进入搜索', effect: { relic: 'bloody_soap' } },
            { text: '放弃进入', effect: { relic: 'coward' } }
        ]
    }
];

const PATH_TYPES = {
    battle: { name: '战斗', icon: '⚔️', desc: '遭遇普通敌人', color: '#e74c3c' },
    elite: { name: '精英战', icon: '👹', desc: '遭遇强力敌人，奖励更丰富', color: '#9b59b6' },
    shop: { name: '商店', icon: '🏪', desc: '购买物品强化自身', color: '#f1c40f' },
    rest: { name: '安全屋', icon: '🏕️', desc: '休息恢复或强化属性', color: '#2ecc71' },
    event: { name: '未知事件', icon: '❓', desc: '可能遇到各种随机事件', color: '#3498db' }
};

const PET_EGG_CHANCE = 0.08;

const ENEMY_SKILL_POOL = [
    { id: 101, name: '普通攻击', description: '基础攻击', type: 'attack', power: 10, level: 1, icon: '👊' },
    { id: 102, name: '重击', description: '强力攻击', type: 'attack', power: 20, level: 2, icon: '💪' },
    { id: 103, name: '撕咬', description: '撕咬攻击', type: 'attack', power: 15, level: 1, icon: '🦷' },
    { id: 104, name: '爪击', description: '爪击攻击', type: 'attack', power: 18, level: 2, icon: '🩸' },
    { id: 105, name: '暗影箭', description: '暗影魔法攻击', type: 'attack', power: 25, level: 3, icon: '🌑', isMagic: true },
    { id: 106, name: '火焰吐息', description: '火焰攻击', type: 'attack', power: 30, level: 3, icon: '🔥', isMagic: true },
    { id: 107, name: '冰霜箭', description: '冰霜魔法攻击', type: 'attack', power: 22, level: 3, icon: '❄️', isMagic: true },
    { id: 108, name: '毒液', description: '毒性攻击', type: 'attack', power: 12, level: 2, icon: '☠️', effect: 'poison' },
    { id: 109, name: '冲锋', description: '快速冲击', type: 'attack', power: 16, level: 2, icon: '💨' },
    { id: 110, name: '护体石肤', description: '提升防御', type: 'defense', defense: 10, level: 1, icon: '🪨' },
    { id: 111, name: '虚弱诅咒', description: '降低敌人攻击', type: 'debuff', power: 5, level: 3, icon: '👻' },
    { id: 112, name: '吸血', description: '攻击回复生命', type: 'attack', power: 10, level: 4, icon: '🧛', effect: 'lifesteal' },
    { id: 113, name: '闪电冲击', description: '雷电攻击', type: 'attack', power: 28, level: 4, icon: '⚡', isMagic: true },
    { id: 114, name: '治疗', description: '恢复生命', type: 'heal', heal: 20, level: 3, icon: '💚' },
    { id: 115, name: '狂怒', description: '提升攻击力', type: 'buff', power: 15, level: 4, icon: '😡' }
];

const BUFF_DATA = {
    '勇气': {
        name: '勇气',
        icon: '💪',
        type: 'positive',
        description: '拥有者临时获得X点攻击力，当拥有者攻击时移除一层',
        effect: (character, stacks) => {
            return { atk: stacks };
        }
    },
    '滑稽': {
        name: '滑稽',
        icon: '🤪',
        type: 'positive',
        description: '在自己的回合开始时自动对随机敌人造成40点伤害',
        effect: null,
        onTurnStart: (battle, character, stacks) => {
            const enemies = battle.getAliveEnemies();
            if (enemies.length > 0) {
                const target = enemies[Math.floor(Math.random() * enemies.length)];
                const damage = target.takeDamage(40);
                battle.battleLog.push({
                    type: 'buffDamage',
                    buff: '滑稽',
                    target: target.name,
                    damage: damage
                });
                return damage;
            }
            return 0;
        }
    },
    '虚弱': {
        name: '虚弱',
        icon: '😩',
        type: 'negative',
        description: '减少Y点攻击力（Y为拥有的虚弱层数），每回合结束时移除一层',
        effect: (character, stacks) => {
            return { atk: -stacks };
        }
    },
    '士气': {
        name: '士气',
        icon: '📈',
        type: 'positive',
        description: '全属性+Z（Z为拥有的士气层数）',
        effect: (character, stacks) => {
            return { atk: stacks, def: stacks, spd: stacks };
        }
    },
    '肌无力': {
        name: '肌无力',
        icon: '💪',
        type: 'negative',
        description: '造成的伤害降低50%，每回合结束时移除一层',
        effect: (character, stacks) => {
            return { damageReduction: 0.5 };
        }
    },
    '凝滞': {
        name: '凝滞',
        icon: '⏳',
        type: 'negative',
        description: '减少Q点速度（Q为拥有的凝滞层数），每回合结束时移除一层',
        effect: (character, stacks) => {
            return { spd: -stacks };
        }
    },
    '重甲': {
        name: '重甲',
        icon: '🛡️',
        type: 'positive',
        description: '增加A点防御（A为拥有的重甲层数）',
        effect: (character, stacks) => {
            return { def: stacks };
        }
    },
    '破防': {
        name: '破防',
        icon: '💔',
        type: 'negative',
        description: '减少S点防御（S为拥有的破防层数）',
        effect: (character, stacks) => {
            return { def: -stacks };
        }
    }
};
