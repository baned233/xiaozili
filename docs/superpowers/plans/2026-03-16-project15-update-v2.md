# Project15 游戏更新实施计划 - 技能、遗物、事件

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成13项游戏内容更新：添加技能(梦强、饮战、壮誓、子午谷奇谋)、添加buff(壮誓)、添加遗物(足力健、魏延药、汉中兵符、那能一样吗)、添加适应之力设定、添加事件(汉中抉择-1、胃炎)、给技能添加标签系统

**Architecture:** 这是一个HTML/CSS/JS网页游戏项目，需要修改Skill.js、Data.js、Relic.js、Character.js、Battle.js文件

**Tech Stack:** HTML5, CSS3, JavaScript (ES6+)

---

## 文件结构分析

- `js/Skill.js` - 技能类定义，包含SKILL_POOL技能池
- `js/Data.js` - 数据定义，包含BUFF_DATA和RANDOM_EVENTS
- `js/Relic.js` - 遗物类定义，包含RELIC_POOL遗物池
- `js/Character.js` - 角色类，包含属性计算和技能使用逻辑
- `js/Battle.js` - 战斗类，包含回合逻辑和遗物效果应用

---

## 任务1: 给技能添加标签(tag)属性

### 修改文件
- Modify: `E:/project15/js/Skill.js` - Skill类构造函数添加tag属性
- Modify: `E:/project15/js/Skill.js` - 技能数据添加tag字段

- [ ] **Step 1: 在Skill类构造函数中添加tag属性**

在Skill.js第29行后添加：
```javascript
this.tag = data.tag || null;  // 技能标签（如"普攻"）
```

- [ ] **Step 2: 给技能挥砍添加"普攻"标签**

在Skill.js中找到id为11的"挥砍"技能，添加tag属性：
```javascript
{
    id: 11,
    name: '挥砍',
    ...
    tag: '普攻',  // 新增
}
```

---

## 任务2: 添加BUFF：壮誓

### 修改文件
- Modify: `E:/project15/js/Data.js` - BUFF_DATA添加壮誓buff定义
- Modify: `E:/project15/js/Battle.js` - 使用技能后检查壮誓buff

- [ ] **Step 1: 在BUFF_DATA中添加壮誓buff**

在Data.js的BUFF_DATA对象末尾添加：
```javascript
'壮誓': {
    name: '壮誓',
    icon: '💪',
    type: 'positive',
    description: '使用带有"普攻"标签的技能后不会结束回合，至多X层，使用普攻后减少一层',
    effect: (character, stacks) => {
        return {};
    }
}
```

- [ ] **Step 2: 在Battle.js中实现壮誓效果**

在Battle.js的executePlayerAction方法中，第442行修改：
```javascript
// 原代码
const noEndTurn = skillUsed && (skillUsed.noEndTurn || skillUsed.name === '开导');

// 修改为
const player = this.playerTeam[0];
const hasZhuangshi = player.buffs && player.buffs.some(b => b.name === '壮誓');
const skillHasNormalTag = skillUsed && skillUsed.tag === '普攻';
const noEndTurn = skillUsed && (skillUsed.noEndTurn || skillUsed.name === '开导' || (hasZhuangshi && skillHasNormalTag));
```

- [ ] **Step 3: 使用普攻后减少一层壮誓**

在Battle.js中noEndTurn为true的处理逻辑之后添加：
```javascript
if (noEndTurn && hasZhuangshi && skillHasNormalTag) {
    player.buffs.forEach(buff => {
        if (buff.name === '壮誓') {
            buff.stacks = Math.max(0, buff.stacks - 1);
        }
    });
    player.buffs = player.buffs.filter(b => b.name !== '壮誓' || b.stacks > 0);
}
```

---

## 任务3: 添加技能：梦强

### 修改文件
- Modify: `E:/project15/js/Skill.js` - SKILL_POOL添加梦强技能

- [ ] **Step 1: 在SKILL_POOL中添加梦强技能**

在Skill.js的SKILL_POOL数组中添加：
```javascript
{
    id: 22,
    name: '梦强',
    description: '越梦越强！使用后玩家立即获得五层BUFF：士气',
    type: 'buff',
    rarity: 'rare',
    power: 0,
    level: 3,
    icon: '💤',
    cost: 30,
    isMagic: false,
    targetSelf: true,
    effect: { type: 'gainBuff', buffName: '士气', stacks: 5 }
}
```

---

## 任务4: 添加技能：饮战

### 修改文件
- Modify: `E:/project15/js/Skill.js` - SKILL_POOL添加饮战技能
- Modify: `E:/project15/js/Character.js` - 攻击后检查饮战被动回血

- [ ] **Step 1: 在SKILL_POOL中添加饮战技能**

```javascript
{
    id: 23,
    name: '饮战',
    description: '普攻回血！你使用带有"普攻"标签的技能造成伤害后回复本次伤害10%的生命值（不大于最大生命值的50%）',
    type: 'passive',
    rarity: 'rare',
    power: 0,
    level: 3,
    icon: '🩸',
    cost: 0,
    isMagic: false,
    targetSelf: true,
    passive: true,
    effect: { type: 'lifestealAttack', rate: 0.1, maxRate: 0.5 }
}
```

- [ ] **Step 2: 在Character.js中实现饮战效果**

在Character.js的useSkill方法中，攻击技能造成伤害后检查是否有饮战被动：
找到attack类型技能伤害结算后，添加：
```javascript
// 检查饮战被动
if (this.hasSkillEffect && this.hasSkillEffect('饮战')) {
    const healAmount = Math.min(
        Math.floor(result.damage * 0.1),
        Math.floor(this.maxHp * 0.5)
    );
    if (healAmount > 0) {
        this.heal(healAmount);
        battle.battleLog.push({
            type: 'heal',
            target: this.name,
            amount: healAmount,
            source: '饮战'
        });
    }
}
```

---

## 任务5: 添加技能：壮誓(献祭技能)

### 修改文件
- Modify: `E:/project15/js/Skill.js` - SKILL_POOL添加壮誓技能
- Modify: `E:/project15/js/Character.js` - 实现献祭消耗逻辑

- [ ] **Step 1: 在SKILL_POOL中添加壮誓技能**

```javascript
{
    id: 24,
    name: '壮誓',
    description: '该技能每消耗50生命值获得一层【壮誓】，至多获得5层',
    type: 'sacrifice',
    rarity: 'legendary',
    power: 0,
    level: 5,
    icon: '🔥',
    costType: 'sacrifice',
    costPercent: 0.8,  // 消耗80%当前生命值
    maxStacks: 5,     // 最多5层
    isMagic: false,
    targetSelf: true
}
```

- [ ] **Step 2: 在Character.js中实现壮誓消耗逻辑**

在useSkill方法中添加sacrifice类型处理：
```javascript
else if (skill.type === 'sacrifice') {
    const sacrificeCost = Math.floor(this.hp * skill.costPercent);
    const stacksGained = Math.min(Math.floor(sacrificeCost / 50), skill.maxStacks || 5);
    
    // 扣除生命值
    this.takeDamage(sacrificeCost);
    
    // 添加壮誓buff
    this.addBuff('壮誓', stacksGained);
    
    return { type: 'sacrifice', stacks: stacksGained, cost: sacrificeCost };
}
```

---

## 任务6: 添加技能：子午谷奇谋

### 修改文件
- Modify: `E:/project15/js/Skill.js` - SKILL_POOL添加子午谷奇谋技能

- [ ] **Step 1: 在SKILL_POOL中添加子午谷奇谋技能**

```javascript
{
    id: 25,
    name: '子午谷奇谋',
    description: '消耗最大生命值的10%对敌方单体造成较高物理伤害',
    type: 'attack',
    rarity: 'mythic',
    power: '100+1.6*atk',
    level: 5,
    icon: '🗡️',
    costType: 'sacrifice',
    costPercent: 0.1,  // 消耗10%最大生命值
    tag: '普攻',
    isMagic: false,
    targetAll: false
}
```

- [ ] **Step 2: 在Character.js中处理子午谷奇谋的消耗**

在useSkill方法中attack类型处理前添加：
```javascript
// 处理献祭类型消耗
if (skill.costType === 'sacrifice' && skill.costPercent) {
    const sacrificeCost = Math.floor(this.maxHp * skill.costPercent);
    this.takeDamage(sacrificeCost);
}
```

---

## 任务7: 添加遗物：足力健

### 修改文件
- Modify: `E:/project15/js/Relic.js` - RELIC_POOL添加足力健

- [ ] **Step 1: 在RELIC_POOL中添加足力健**

在Relic.js的RELIC_POOL数组中添加（id继续使用39）：
```javascript
{ 
    id: 39, 
    name: '足力健', 
    description: '速度+9', 
    type: 'passive', 
    effect: { type: 'speed', value: 9 }, 
    icon: '👟',
    note: '"健步如飞"'
}
```

---

## 任务8: 添加遗物：魏延药

### 修改文件
- Modify: `E:/project15/js/Relic.js` - RELIC_POOL添加魏延药
- Modify: `E:/project15/js/Character.js` - 实现防御锁定和不能闪避效果

- [ ] **Step 1: 在RELIC_POOL中添加魏延药**

```javascript
{ 
    id: 40, 
    name: '魏延药', 
    description: '速度+50，防御锁定为零，攻击+25，最大生命值+100，你不再能够闪避', 
    type: 'event', 
    effect: { type: 'weiYanYao' }, 
    icon: '💊',
    note: '"我，魏延，只进，不退😡"'
}
```

- [ ] **Step 2: 在Relic.js的applyEffect中添加魏延药效果**

```javascript
case 'weiYanYao':
    character.spd += 50;
    character.relicBonusSpd = (character.relicBonusSpd || 0) + 50;
    character.atk += 25;
    character.relicBonusAtk = (character.relicBonusAtk || 0) + 25;
    character.maxHp += 100;
    character.hp += 100;
    character.def = 0;  // 防御锁定为0
    character.cannotDodge = true;  // 不能闪避
    break;
```

---

## 任务9: 添加遗物：汉中兵符

### 修改文件
- Modify: `E:/project15/js/Relic.js` - RELIC_POOL添加汉中兵符
- Modify: `E:/project15/js/Character.js` - 实现死亡触发效果

- [ ] **Step 1: 在RELIC_POOL中添加汉中兵符**

```javascript
{ 
    id: 41, 
    name: '汉中兵符', 
    description: '最大生命值+50，血量归零时，若你有技能壮誓，失去壮誓和该遗物，将生命值回复至60%', 
    type: 'event', 
    effect: { type: 'hanZhongBingFu' }, 
    icon: '📜',
    note: '"汉中乃北伐剑锋，文长可担太守之则？有何不敢😡"'
}
```

- [ ] **Step 2: 在Character.js的takeDamage方法中添加死亡触发逻辑]

在takeDamage方法中，hp归零后检查：
```javascript
takeDamage(damage, damageType = 'physical') {
    // ... 原有逻辑 ...
    
    this.hp = Math.max(0, this.hp - actualDamage);
    
    // 检查汉中兵符效果
    if (this.hp <= 0 && !this.isDead) {
        const hasHanZhong = this.relics && this.relics.some(r => r.name === '汉中兵符');
        const hasZhuangshiSkill = this.skills && this.skills.some(s => s.name === '壮誓');
        
        if (hasHanZhong && hasZhuangshiSkill) {
            // 失去壮誓技能
            this.skills = this.skills.filter(s => s.name !== '壮誓');
            // 失去汉中兵符遗物
            this.relics = this.relics.filter(r => r.name !== '汉中兵符');
            // 回复60%生命
            this.hp = Math.floor(this.maxHp * 0.6);
            this.isDead = false;
            // 可以添加战斗日志
        }
    }
    
    if (this.hp <= 0) {
        this.isDead = true;
    }
    return actualDamage;
}
```

---

## 任务10: 添加遗物：那能一样吗

### 修改文件
- Modify: `E:/project15/js/Relic.js` - RELIC_POOL添加那能一样吗
- Modify: `E:/project15/js/Character.js` - 实现适应之力逻辑

- [ ] **Step 1: 在RELIC_POOL中添加那能一样吗**

```javascript
{ 
    id: 42, 
    name: '那能一样吗', 
    description: '适应之力+5', 
    type: 'passive', 
    effect: { type: 'adaptation', value: 5 }, 
    icon: '🤔',
    note: '"那当然不一样"'
}
```

- [ ] **Step 2: 在Character.js中添加适应之力计算]

在Character.js的构造函数或属性初始化中添加adaptationPoints属性：
```javascript
this.adaptationPoints = 0;  // 适应之力点数
```

在applyRelicEffects方法中处理adaptation类型：
```javascript
case 'adaptation':
    character.adaptationPoints += relic.effect.value;
    // 计算适应之力
    const adaptationBonus = character.adaptationPoints;
    if (character.atk >= character.magicPower) {
        character.atk += adaptationBonus;
        character.relicBonusAtk = (character.relicBonusAtk || 0) + adaptationBonus;
    } else {
        character.magicPower += adaptationBonus;
        character.relicBonusMagicPower = (character.relicBonusMagicPower || 0) + adaptationBonus;
    }
    break;
```

---

## 任务11: 添加事件：汉中抉择-1

### 修改文件
- Modify: `E:/project15/js/Data.js` - RANDOM_EVENTS添加汉中抉择事件

- [ ] **Step 1: 在RANDOM_EVENTS中添加汉中抉择事件]

在Data.js的RANDOM_EVENTS数组末尾添加：
```javascript
{
    id: 'hanzhong_choice',
    name: '汉中抉择',
    icon: '⚔️',
    desc: '蜀道艰险😨粮草如何运送🤔北伐空耗国力😔不如效仿东吴🤓五虎仅剩一人😭谁敢当北伐先锋🤔',
    options: [
        { 
            text: '有何不敢', 
            effect: { 
                relic: { id: 41, name: '汉中兵符', description: '最大生命值+50，血量归零时，若你有技能壮誓，失去壮誓和该遗物，将生命值回复至60%', type: 'event', effect: { type: 'hanZhongBingFu' }, icon: '📜', note: '"汉中乃北伐剑锋，文长可担太守之则？有何不敢😡"' },
                message: '既承先帝遗志😏怎能困守不前😡嗯嗯嗯~哈！！😡😡我！！😡魏延😡只进不退！！！😡😡若魏寇将十万之众延当为主公尽歼😡👊纵曹贼举天下进犯👊👊👊😡延亦可勠力拒退为主破敌👊😡😡😡👊如鱼饮水魏文长在此👋😂👊尔辈何敢乃尔！😡👊😡👊主公有延助力，何忧汉室难兴？此身搏杀不懈，只为成主公之业😡👊曹贼吴犬，我有何惧哉？😠我尚未全力一搏，又试问谁能阻挡？😡😡👊丞相无需多虑🤫，我定能轻身立功。'
            } 
        },
        { 
            text: '江东杰瑞有何不好？', 
            effect: { 
                message: '我有十万众，岂惧他八百士？' 
            } 
        }
    ],
    repeatable: false,
    minFloor: 1
}
```

---

## 任务12: 添加事件：胃炎

### 修改文件
- Modify: `E:/project15/js/Data.js` - RANDOM_EVENTS添加胃炎事件

- [ ] **Step 1: 在RANDOM_EVENTS中添加胃炎事件]

在Data.js的RANDOM_EVENTS数组中添加：
```javascript
{
    id: 'weiyan',
    name: '胃炎',
    icon: '🤢',
    desc: '最近有点肚子痛😨，好像是胃炎...魏延🤔？',
    options: [
        { 
            text: '玄德公匡扶汉室，我等当弃暗投明', 
            effect: { 
                skill: { id: 25, name: '子午谷奇谋', description: '消耗最大生命值的10%对敌方单体造成较高物理伤害', type: 'attack', rarity: 'mythic', power: '100+1.6*atk', level: 5, icon: '🗡️', costType: 'sacrifice', costPercent: 0.1, tag: '普攻', isMagic: false, targetAll: false },
                message: '十万之众至，请为大王吞之，举天下来犯，请为大王拒之'
            } 
        },
        { 
            text: '平定益州，为主公夺龙兴之地', 
            effect: { 
                skill: { id: 24, name: '壮誓', description: '该技能每消耗50生命值获得一层【壮誓】，至多获得5层', type: 'sacrifice', rarity: 'legendary', power: 0, level: 5, icon: '🔥', costType: 'sacrifice', costPercent: 0.8, maxStacks: 5, isMagic: false, targetSelf: true },
                message: '得此猛将，何愁大业不成？'
            } 
        },
        { 
            text: '杀尽魏贼，扬主公汉室威名', 
            effect: { 
                relic: { id: 40, name: '魏延药', description: '速度+50，防御锁定为零，攻击+25，最大生命值+100，你不再能够闪避', type: 'event', effect: { type: 'weiYanYao' }, icon: '💊', note: '"我，魏延，只进，不退😡"' },
                message: '杀！杀！杀！'
            } 
        }
    ],
    repeatable: false,
    minFloor: 1
}
```

---

## 任务13: 处理事件中的技能/遗物获取

### 修改文件
- Modify: `E:/project15/js/Game.js` - 处理事件中的技能和遗物获取

- [ ] **Step 1: 在Game.js中添加处理事件中获得技能的逻辑**

在Game.js的处理随机事件方法中，添加对skill和relic字段的处理：
```javascript
// 处理事件选项中的技能奖励
if (option.effect.skill) {
    const newSkill = new Skill(option.effect.skill);
    const hasSkill = player.skills.some(s => s.name === newSkill.name);
    if (!hasSkill) {
        if (player.skills.length < 6) {
            player.skills.push(newSkill);
            this.obtainedSkillIds.push(newSkill.id);
        } else {
            // 技能栏满，显示替换面板
            // ... 替换逻辑
        }
    }
}

// 处理事件选项中的遗物奖励
if (option.effect.relic) {
    const relic = new Relic(option.effect.relic);
    player.addRelic(relic, this);
    this.obtainedRelicIds.push(relic.id);
}
```

---

## 实施顺序

1. 任务1: 给技能添加标签(tag)属性
2. 任务2: 添加BUFF：壮誓
3. 任务3: 添加技能：梦强
4. 任务4: 添加技能：饮战
5. 任务5: 添加技能：壮誓(献祭)
6. 任务6: 添加技能：子午谷奇谋
7. 任务7: 添加遗物：足力健
8. 任务8: 添加遗物：魏延药
9. 任务9: 添加遗物：汉中兵符
10. 任务10: 添加遗物：那能一样吗 + 适应之力
11. 任务11: 添加事件：汉中抉择
12. 任务12: 添加事件：胃炎
13. 任务13: 处理事件中的技能/遗物获取
