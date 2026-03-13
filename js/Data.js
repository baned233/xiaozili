/**
 * ==================== 游戏数据配置文件 ====================
 * 这个文件包含游戏中所有的静态数据
 * 包括：武器数据、层数数据、敌人数据、技能池、遗物池、宠物池、商店物品、随机事件等
 * 就像游戏的数据库，存储了所有游戏内容
 */

// ==================== 武器数据 ====================
// 武器类型及其属性加成
const WEAPONS = {
    sword: { name: '剑', icon: '⚔️', atkBonus: 10, critBonus: 5 },
    bow: { name: '弓', icon: '🏹', atkBonus: 8, critBonus: 10, range: true },
    staff: { name: '法杖', icon: '🪄', atkBonus: 12, critBonus: 0, magic: true },
    blade: { name: '刀', icon: '🔪', atkBonus: 15, critBonus: 8 },
    hammer: { name: '锤', icon: '🔨', atkBonus: 20, critBonus: -5 },
    shield: { name: '盾', icon: '🛡️', atkBonus: 5, defBonus: 10 }
};

// ==================== 层数数据 ====================
// 每层的名称、敌人等级、是否是BOSS等
const FLOOR_DATA = {
    1: { name: '宿舍大门', enemyLevel: 1, bgClass: 'floor-bg-1' },
    2: { name: '宿舍走廊', enemyLevel: 1, bgClass: 'floor-bg-1' },
    3: { name: '101室', enemyLevel: 2, bgClass: 'floor-bg-1' },
    4: { name: '102室', enemyLevel: 2, bgClass: 'floor-bg-1' },
    5: { name: '103室', enemyLevel: 2, bgClass: 'floor-bg-1' },
    6: { name: '104室', enemyLevel: 3, bgClass: 'floor-bg-1' },
    7: { name: '105室', enemyLevel: 3, bgClass: 'floor-bg-1' },
    8: { name: '106室', enemyLevel: 3, bgClass: 'floor-bg-1' },
    9: { name: '107室', enemyLevel: 4, bgClass: 'floor-bg-1' },
    10: { name: '108室', enemyLevel: 4, bgClass: 'floor-bg-1' },
    11: { name: '109室', enemyLevel: 4, bgClass: 'floor-bg-1' },
    12: { name: '110室', enemyLevel: 5, bgClass: 'floor-bg-1' },
    13: { name: '111室', enemyLevel: 5, bgClass: 'floor-bg-1' },
    14: { name: '112室', enemyLevel: 5, bgClass: 'floor-bg-1' },
    15: { name: '宿舍楼顶', enemyLevel: 6, isBoss: true, bossName: '宿舍管理员', bgClass: 'floor-bg-1' },
    16: { name: '实验室一楼', enemyLevel: 6, bgClass: 'floor-bg-2' },
    17: { name: '化学实验室', enemyLevel: 7, bgClass: 'floor-bg-2' },
    18: { name: '物理实验室', enemyLevel: 7, bgClass: 'floor-bg-2' },
    19: { name: '生物实验室', enemyLevel: 7, bgClass: 'floor-bg-2' },
    20: { name: '仪器室', enemyLevel: 8, bgClass: 'floor-bg-2' },
    21: { name: '准备室', enemyLevel: 8, bgClass: 'floor-bg-2' },
    22: { name: '器材室', enemyLevel: 8, bgClass: 'floor-bg-2' },
    23: { name: '试剂库', enemyLevel: 9, bgClass: 'floor-bg-2' },
    24: { name: '样品室', enemyLevel: 9, bgClass: 'floor-bg-2' },
    25: { name: '分析室', enemyLevel: 9, bgClass: 'floor-bg-2' },
    26: { name: '资料室', enemyLevel: 10, bgClass: 'floor-bg-2' },
    27: { name: '档案室', enemyLevel: 10, bgClass: 'floor-bg-2' },
    28: { name: '会议室', enemyLevel: 10, bgClass: 'floor-bg-2' },
    29: { name: '主任办公室', enemyLevel: 11, bgClass: 'floor-bg-2' },
    30: { name: '实验室顶层', enemyLevel: 12, isBoss: true, bossName: '176实验体', bgClass: 'floor-bg-2' },
    31: { name: '磨砂迪加大厅', enemyLevel: 12, bgClass: 'floor-bg-3' },
    32: { name: '前台', enemyLevel: 13, bgClass: 'floor-bg-3' },
    33: { name: '休息区', enemyLevel: 13, bgClass: 'floor-bg-3' },
    34: { name: 'KTV包间', enemyLevel: 13, bgClass: 'floor-bg-3' },
    35: { name: '棋牌室', enemyLevel: 14, bgClass: 'floor-bg-3' },
    36: { name: '健身房', enemyLevel: 14, bgClass: 'floor-bg-3' },
    37: { name: '游泳池', enemyLevel: 14, bgClass: 'floor-bg-3' },
    38: { name: '餐厅', enemyLevel: 15, bgClass: 'floor-bg-3' },
    39: { name: '厨房', enemyLevel: 15, bgClass: 'floor-bg-3' },
    40: { name: '储藏室', enemyLevel: 15, bgClass: 'floor-bg-3' },
    41: { name: '员工区', enemyLevel: 16, bgClass: 'floor-bg-3' },
    42: { name: '经理室', enemyLevel: 16, bgClass: 'floor-bg-3' },
    43: { name: '财务室', enemyLevel: 16, bgClass: 'floor-bg-3' },
    44: { name: '监控室', enemyLevel: 17, bgClass: 'floor-bg-3' },
    45: { name: '顶楼天台', enemyLevel: 18, isBoss: true, bossName: '磨砂迪加老板', bgClass: 'floor-bg-3' },
    46: { name: '教学楼一楼', enemyLevel: 18, bgClass: 'floor-bg-1' },
    47: { name: '101教室', enemyLevel: 19, bgClass: 'floor-bg-1' },
    48: { name: '102教室', enemyLevel: 19, bgClass: 'floor-bg-1' },
    49: { name: '103教室', enemyLevel: 19, bgClass: 'floor-bg-1' },
    50: { name: '104教室', enemyLevel: 20, bgClass: 'floor-bg-1' },
    51: { name: '105教室', enemyLevel: 20, bgClass: 'floor-bg-1' },
    52: { name: '106教室', enemyLevel: 20, bgClass: 'floor-bg-1' },
    53: { name: '107教室', enemyLevel: 21, bgClass: 'floor-bg-1' },
    54: { name: '108教室', enemyLevel: 21, bgClass: 'floor-bg-1' },
    55: { name: '教师办公室', enemyLevel: 21, bgClass: 'floor-bg-1' },
    56: { name: '教务处', enemyLevel: 22, bgClass: 'floor-bg-1' },
    57: { name: '校长室', enemyLevel: 22, bgClass: 'floor-bg-1' },
    58: { name: '会议室', enemyLevel: 22, bgClass: 'floor-bg-1' },
    59: { name: '天台入口', enemyLevel: 23, bgClass: 'floor-bg-1' },
    60: { name: '教学楼天台', enemyLevel: 25, isBoss: true, bossName: '教导主任', bgClass: 'floor-bg-1' }
};

const BOSS_DIALOGS = {
    15: {
        name: '宿舍管理员',
        enter: '这么晚了，还不回宿舍？',
        battle: '违反宿舍规定！',
        death: '算你通过...'
    },
    30: {
        name: '176实验体',
        enter: '实验体失控了！',
        battle: '接受实验的洗礼！',
        death: '实验...成功...'
    },
    45: {
        name: '磨砂迪加老板',
        enter: '欢迎来到磨砂迪加！',
        battle: '尽情享受吧！',
        death: '这不可能...'
    },
    60: {
        name: '教导主任',
        enter: '哪个班的？',
        battle: '违反校规！',
        death: '明天来我办公室...'
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
    { id: 'relic_box', name: '遗物盒子', icon: '📦', price: 150, effect: { type: 'relic' }, desc: '随机获得一个遗物' },
    { id: 'betel_nut', name: '槟榔', icon: '🌴', price: 20, effect: { type: 'heal', value: 30 }, desc: '恢复30点生命' }
];

const RANDOM_EVENTS = [
    {
        id: 'food_steal',
        name: '夺食',
        icon: '🐕',
        desc: '一只狗跑来和你抢夺八宝粥...',
        options: [
            { text: '让它吃', effect: { message: '狗子吃饱了。扬长而去。' } },
            { text: '抢过八宝粥', effect: { 
                message: '如果角色有"夺食"技能，获得遗物八宝粥，否则-20生命', 
                customCheck: true,
                check: (game) => {
                    const player = game.playerTeam[0];
                    const hasDuoshi = player.skills && player.skills.some(s => s.name === '夺食');
                    if (hasDuoshi) {
                        const relic = new Relic({ id: 31, name: '八宝粥', description: '生命值+100，技能：夺食攻击伤害类型转换为真实伤害', type: 'event', effect: { type: 'hp', value: 100 }, icon: '🥣', note: '"我们这种人就像是野狗一般"' });
                        if (player.addRelic(relic, game)) {
                            game.obtainedRelicIds.push(relic.id);
                            return { message: '你成功抢夺到了八宝粥！', relic: relic };
                        }
                    }
                    player.takeDamage(20);
                    return { message: '由于你不会技能：夺食，你没有争抢过这只狗，只能看着它扬长而去，生命值-20' };
                }
            } }
        ]
    },
    {
        id: 'betel_nut_seller',
        name: '？！槟榔！？',
        icon: '🌴',
        desc: '一个户外直播的人正在推销槟榔"这个和成天下这个大果啊，劲儿道足，口味正，大伙都得买来尝尝啊。"',
        options: [
            { text: '买一包', effect: { buff: '槟榔上瘾', message: 'woc，槟榔上瘾了！', customBuff: true } },
            { text: '离开', effect: { message: '我不吃槟榔...' } },
            { text: '阻止他卖槟榔', effect: { 
                message: '谁允许你在这里卖槟榔的？', 
                customBattle: true,
                enemy: { name: '槟榔头', type: 'common', hp: 80, atk: 15, def: 5, spd: 12 },
                winReward: { relic: { id: 32, name: '和成天下', description: '最大体力-10，攻击力+20', type: 'event', effect: { type: 'stamina', value: -10, atk: 20 }, icon: '🌴', note: '"白生生的精品大果！"' } }
            } }
        ]
    },
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
        icon: 'assets/images/maoning2.png',
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
        desc: '君子陈某出现在你面前，嘴角带笑"想买点什么便宜货吗？"',
        options: [
            { text: '花费35金币购买', effect: { cost: 35, randomItem: true } },
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
        name: '米奇妙妙屋',
        icon: '🏕️',
        desc: '你发现了一个舒♂适的休息处，可以恢复体力和法力。',
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
            { text: '进入503', effect: { relic: 'two_surname_servant', message: '被503中的成员邀请加入！最大生命值降低10点！' } },
            { text: '放弃进入', effect: { relic: 'world_line', message: '获得了变动的世界线！角色上升3层！' } }
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
            { text: '进入搜索', effect: { relic: 'bloody_soap', message: '在黑暗中摸索半天，摸到了一个东西！' } },
            { text: '放弃进入', effect: { relic: 'coward', message: '你的勇气受到了大帝的鄙夷！' } }
        ]
    }
];

const PATH_TYPES = {
    battle: { name: '战斗', icon: 'assets/images/zhandou.png', desc: '遭遇普通敌人', color: '#e74c3c' },
    elite: { name: '精英战', icon: 'assets/images/jingyingguai.png', desc: '遭遇强力敌人，奖励更丰富', color: '#9b59b6' },
    shop: { name: '商店', icon: 'assets/images/shangdian.png', desc: '购买物品强化自身', color: '#f1c40f' },
    rest: { name: '摆烂', icon: 'assets/images/bailan.png', desc: '休息恢复或强化属性', color: '#2ecc71' },
    event: { name: '未知事件', icon: 'assets/images/shijian.png', desc: '可能遇到各种随机事件', color: '#3498db' },
    boss: { name: 'BOSS', icon: 'assets/images/boss.png', desc: '遭遇强大的BOSS', color: '#e74c3c' }
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
        description: '拥有者临时获得X点攻击力（每层+1点），当拥有者攻击时移除一层',
        effect: (character, stacks) => {
            return { atk: 1 };
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
        description: '自身造成的伤害降低50%，每回合结束时移除1层，战斗结算后清零',
        effect: (character, stacks) => {
            return { atkReduction: 0.5 };
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
    },
    '流血': {
        name: '流血',
        icon: '🩸',
        type: 'negative',
        description: '拥有者每回合损失P点生命值（P为所拥有的流血层数）',
        effect: (character, stacks) => {
            return {};
        },
        onTurnStart: (battle, character, stacks) => {
            const damage = stacks;
            character.takeDamage(damage);
            battle.battleLog.push({
                type: 'buffDamage',
                buff: '流血',
                target: character.name,
                damage: damage
            });
            return damage;
        }
    },
    '束缚': {
        name: '束缚',
        icon: '⛓️',
        type: 'negative',
        description: '该单位行动时立即受到自身最大生命值5%的物理伤害，每回合结束时移除一层，战斗结算后清零',
        effect: (character, stacks) => {
            return {};
        },
        onTurnStart: (battle, character, stacks) => {
            const damage = Math.floor(character.maxHp * 0.05 * stacks);
            character.takeDamage(damage);
            battle.battleLog.push({
                type: 'buffDamage',
                buff: '束缚',
                target: character.name,
                damage: damage
            });
            return damage;
        }
    },
    '流血': {
        name: '流血',
        icon: '🩸',
        type: 'negative',
        description: '每回合开始时受到等于当前层数的真实伤害，伤害结算后移除1层',
        effect: (character, stacks) => {
            return {};
        },
        onTurnStart: (battle, character, stacks) => {
            const currentStacks = character.getBuffStacks ? character.getBuffStacks('流血') : stacks;
            const damage = currentStacks;
            character.takeDamage(damage, 'true');
            battle.battleLog.push({
                type: 'buffDamage',
                buff: '流血',
                target: character.name,
                damage: damage,
                damageType: 'true'
            });
            character.buffs.forEach(buff => {
                if (buff.name === '流血') {
                    buff.stacks = Math.max(0, buff.stacks - 1);
                }
            });
            character.buffs = character.buffs.filter(b => b.name !== '流血' || b.stacks > 0);
            return damage;
        }
    },
    '槟榔上瘾': {
        name: '槟榔上瘾',
        icon: '🌴',
        type: 'positive',
        description: '持有者攻击力+40，每回合损失5点生命值（若5回合不在商店购买槟榔，则获得负面BUFF：戒断反应）',
        effect: (character, stacks) => {
            return { atk: 40 };
        },
        onTurnStart: (battle, character, stacks) => {
            const damage = 5;
            character.takeDamage(damage);
            battle.battleLog.push({
                type: 'buffDamage',
                buff: '槟榔上瘾',
                target: character.name,
                damage: damage
            });
            return damage;
        }
    },
    '戒断反应': {
        name: '戒断反应',
        icon: '😣',
        type: 'negative',
        description: '持有者每回合损失10点体力值',
        effect: (character, stacks) => {
            return {};
        },
        onTurnStart: (battle, character, stacks) => {
            const staminaLoss = 10;
            character.stamina = Math.max(0, character.stamina - staminaLoss);
            battle.battleLog.push({
                type: 'buffDamage',
                buff: '戒断反应',
                target: character.name,
                damage: staminaLoss,
                isStamina: true
            });
            return staminaLoss;
        }
    }
};
