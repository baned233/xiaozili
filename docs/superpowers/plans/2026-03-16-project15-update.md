# Project15 游戏更新实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成4个游戏功能更新：修复战斗日志拖拽、商店特质激活剂逻辑修改、安全屋添加转换合成功能、添加马瑟瑟遗物

**Architecture:** 这是一个HTML/CSS/JS网页游戏项目，需要修改现有的Game.js、UI.js和Relic.js文件

**Tech Stack:** HTML5, CSS3, JavaScript (ES6+)

---

## 文件结构分析

- `index.html` - 游戏主页面
- `js/Game.js` - 游戏主逻辑类，包含商店、安全屋等逻辑
- `js/UI.js` - 用户界面控制器，包含战斗日志拖拽、商店、安全屋界面
- `js/Relic.js` - 遗物类定义，包含遗物池数据
- `css/style.css` - 样式文件

---

## 需求1: 修复战斗日志拖拽功能

### 问题分析
UI.js中的`initDraggableBattleLog()`函数(257-308行)存在bug：
- touchmove事件中使用了未定义的`panelWidth`和`panelHeight`变量（应该是`logPanel`）
- touchmove和touchend事件中使用了未定义的`panel`变量（应该是`logPanel`）

### 修改文件
- Modify: `E:/project15/js/UI.js:257-308`

---

## 需求2: 商店买特质激活剂时技能栏已满应替换而非返还金币

### 问题分析
Game.js第1482-1488行，当购买特质激活剂时如果技能栏已满，直接返还一半金币。需要改为显示技能替换面板。

现有代码：
```javascript
} else {
    this.gold += Math.floor(item.price * 0.5);
    this.ui.showDialog('技能栏已满，返还一半金币！', () => {
        this.ui.updateGold(this.gold);
        this.ui.showShop(this.shopItems, this.gold, false);
    });
}
```

需要改为：
- 显示技能替换面板让玩家选择要替换的技能
- 替换后新技能加入，oldString技能被移除

### 修改文件
- Modify: `E:/project15/js/Game.js:1475-1489`
- Modify: `E:/project15/js/Game.js` - 需要添加商店购买时的技能替换逻辑处理方法

---

## 需求3: 安全屋添加转换和合成功能

### 功能分析
需要在安全屋界面添加两个新按钮：
1. **转换** - 选中身上的一个技能转化为同品质随机技能
2. **合成** - 打开遗物合成界面，显示所有可合成遗物和所需材料

### UI修改
- Modify: `E:/project15/index.html:158-168` - 在安全屋添加转换和合成按钮
- Modify: `E:/project15/css/style.css` - 添加新按钮样式

### 逻辑修改
- Modify: `E:/project15/js/Game.js`:
  - `openRest()` - 添加转换和合成按钮显示
  - 添加 `transformSkill()` 方法 - 实现技能转换逻辑
  - 添加 `openRelicSynthesis()` 方法 - 打开遗物合成界面
  - 添加 `synthesizeRelic()` 方法 - 实现遗物合成逻辑
  
- Modify: `E:/project15/js/UI.js`:
  - 添加 `showTransformSkillPanel()` - 显示技能转换界面
  - 添加 `showRelicSynthesisPanel()` - 显示遗物合成界面

### 遗物合成表
根据需求4，合成表为：
- 马瑟瑟 = 钟表(34) + 铃铛(35)

需要添加更多合成配方到数据中。

---

## 需求4: 添加遗物"马瑟瑟"

### 遗物属性
- 名称：马瑟瑟
- 效果：攻击+12，速度+12，每回合回复角色5%最大生命值
- 获得途径：只能通过遗物合成获得
- 合成表：钟表(id:34) + 铃铛(id:35)
- 备注："为什么钟和铃铛合成会变成这个呢？我也不知道"君子如是说道"

### 修改文件
- Modify: `E:/project15/js/Relic.js`:
  - 在RELIC_POOL数组末尾添加新遗物数据
  - 添加遗物效果applyEffect实现

### 效果实现
需要在以下位置添加每回合回复生命值逻辑：
- `E:/project15/js/Battle.js` - 战斗回合开始时应用遗物效果

---

## 任务清单

### Task 1: 修复战斗日志拖拽功能

**Files:**
- Modify: `E:/project15/js/UI.js:257-308`

- [ ] **Step 1: 修复touchmove事件中的变量错误**

修改 `initDraggableBattleLog()` 函数中的 touchmove 和 touchend 事件处理：
- 将 `panelWidth`、`panelHeight`、`panel` 改为 `logPanel`
- 添加正确的边界检测逻辑

### Task 2: 商店特质激活剂技能栏满时替换

**Files:**
- Modify: `E:/project15/js/Game.js:1475-1489`

- [ ] **Step 1: 修改商店购买特质激活剂逻辑**

将技能栏已满时的逻辑从"返还一半金币"改为"显示技能替换面板"

### Task 3: 安全屋添加转换和合成功能

**Files:**
- Modify: `E:/project15/index.html:158-168`
- Modify: `E:/project15/js/Game.js`
- Modify: `E:/project15/js/UI.js`

- [ ] **Step 1: 在HTML安全屋添加转换和合成按钮**

```html
<button id="btn-transform" class="action-btn">转换技能</button>
<button id="btn-synthesize" class="action-btn">遗物合成</button>
```

- [ ] **Step 2: 绑定按钮事件**

在UI.js的bindEvents()中添加事件绑定

- [ ] **Step 3: 实现技能转换逻辑**

在Game.js中添加 `transformSkill()` 方法

- [ ] **Step 4: 实现遗物合成界面**

在UI.js中添加合成界面显示方法
在Game.js中添加合成逻辑

### Task 4: 添加遗物"马瑟瑟"

**Files:**
- Modify: `E:/project15/js/Relic.js`
- Modify: `E:/project15/js/Battle.js`

- [ ] **Step 1: 在遗物池添加马瑟瑟**

```javascript
{ 
    id: 38, 
    name: '马瑟瑟', 
    description: '攻击力+12，速度+12，每回合回复角色5%最大生命值', 
    type: 'passive', 
    effect: { type: 'maseSeSe' }, 
    icon: '🐴',
    note: '"为什么钟和铃铛合成会变成这个呢？我也不知道"君子如是说道"'
}
```

- [ ] **Step 2: 在applyEffect中添加效果**

```javascript
case 'maseSeSe':
    character.atk += 12;
    character.relicBonusAtk = (character.relicBonusAtk || 0) + 12;
    character.spd += 12;
    character.relicBonusSpd = (character.relicBonusSpd || 0) + 12;
    character.hasMaseSeSe = true;
    break;
```

- [ ] **Step 3: 在Battle.js中添加回合回复逻辑**

在每回合开始时检查玩家是否有马瑟瑟遗物，如果有则回复5%最大生命值

---

## 实施步骤

1. 首先修复战斗日志拖拽bug
2. 修改商店特质激活剂逻辑
3. 添加安全屋转换和合成功能
4. 添加马瑟瑟遗物及其效果

