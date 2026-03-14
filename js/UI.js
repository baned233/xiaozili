/**
 * ==================== 用户界面控制器 ====================
 * 这个文件负责游戏中所有可见内容的显示和交互
 * 包括：菜单、地图、战斗、技能、商店、对话框等所有界面
 * 就像游戏的外表，把游戏逻辑呈现给玩家
 */

class UI {
    // 构造函数 - 接收游戏主控制器作为参数
    constructor(game) {
        this.game = game;
        this.initElements();      // 初始化HTML元素引用
        this.bindEvents();        // 绑定点击事件
        this.initDraggableBattleLog();  // 初始化可拖拽的战斗日志
    }

    // ==================== 初始化HTML元素 ====================
    // 把HTML中的元素获取过来，方便后续使用
    initElements() {
        // 主菜单相关
        this.mainMenu = document.getElementById('main-menu');
        this.gameScreen = document.getElementById('game-screen');
        
        // 顶部状态栏
        this.floorDisplay = document.getElementById('floor-display');     // 层数显示
        this.goldDisplay = document.getElementById('gold-display');       // 金币显示
        this.playerPortrait = document.getElementById('player-portrait'); // 玩家头像
        this.potionBar = document.getElementById('potion-bar');          // 药水栏
        this.hpBarFill = document.getElementById('hp-bar-fill');          // 血条
        
        // 地图面板
        this.mapPanel = document.getElementById('map-panel');
        this.pathOptions = document.getElementById('path-options');
        
        // 战斗区域
        this.playerSide = document.getElementById('player-side');        // 玩家这边
        this.enemySide = document.getElementById('enemy-side');          // 敌人那边
        this.battleArea = document.getElementById('battle-area');        // 战斗区域
        
        // 技能面板
        this.skillPanel = document.getElementById('skill-panel');
        this.skillOptions = document.getElementById('skill-options');
        
        // 商店
        this.shopPanel = document.getElementById('shop-panel');
        this.shopItems = document.getElementById('shop-items');
        
        // 安全屋
        this.restPanel = document.getElementById('rest-panel');
        
        // 事件
        this.eventPanel = document.getElementById('event-panel');
        this.eventTitle = document.getElementById('event-title');
        this.eventDesc = document.getElementById('event-desc');
        this.eventOptionsEl = document.getElementById('event-options');
        
        // 对话框
        this.dialogPanel = document.getElementById('dialog-panel');
        this.dialogText = document.getElementById('dialog-text');
        
        // 奖励选择
        this.rewardPanel = document.getElementById('reward-panel');
        this.rewardOptions = document.getElementById('reward-options');
        
        // 游戏结束/胜利
        this.gameOver = document.getElementById('game-over');
        this.victory = document.getElementById('victory');
        
        // 设置面板
        this.settingsPanel = document.getElementById('settings-panel');
        
        // 角色面板
        this.characterPanel = document.getElementById('character-panel');
        
        // 技能替换面板
        this.skillReplacePanel = document.getElementById('skill-replace-panel');
        
        // 战斗日志
        this.battleLogPanel = document.getElementById('battle-log-panel');
        
        // 调试控制台
        this.debugConsole = document.getElementById('debug-console');
        
    }

    // ==================== 绑定点击事件 ====================
    // 给按钮等元素添加点击事件，点击后执行相应的游戏操作
    bindEvents() {
        // 开始游戏按钮
        document.getElementById('btn-start').addEventListener('click', () => {
            audioManager.playClick();
            this.game.start();
        });
        
        // 继续游戏按钮
        const continueBtn = document.getElementById('btn-continue');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                audioManager.playClick();
                this.game.continue();
            });
        }
        
        // 设置按钮
        document.getElementById('btn-settings').addEventListener('click', () => {
            audioManager.playClick();
            this.showSettings();
        });
        
        // 更新日志按钮
        document.getElementById('btn-changelog').addEventListener('click', () => {
            audioManager.playClick();
            this.showChangelog();
        });
        
        document.getElementById('btn-close-changelog').addEventListener('click', () => {
            audioManager.playClick();
            this.hideChangelog();
        });
        
        document.getElementById('btn-encyclopedia').addEventListener('click', () => {
            audioManager.playClick();
            this.showEncyclopedia();
        });
        
        document.getElementById('btn-close-encyclopedia').addEventListener('click', () => {
            audioManager.playClick();
            this.hideEncyclopedia();
        });
        
        this.bindEncyclopediaTabEvents();
        
        const exitBtn = document.getElementById('btn-exit');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                audioManager.playClick();
                if (confirm('确定要退出游戏吗？')) {
                    window.close();
                }
            });
        }
        
        document.getElementById('btn-close-settings').addEventListener('click', () => {
            audioManager.playClick();
            this.hideSettings();
        });
        document.getElementById('btn-restart').addEventListener('click', () => {
            audioManager.playClick();
            this.game.restart();
        });
        document.getElementById('btn-victory-restart').addEventListener('click', () => {
            audioManager.playClick();
            this.game.restart();
        });
        document.getElementById('btn-leave-shop').addEventListener('click', () => {
            audioManager.playClick();
            this.game.leaveShop();
        });
        document.getElementById('btn-rest').addEventListener('click', () => {
            audioManager.playClick();
            this.game.rest();
        });
        document.getElementById('btn-enhance').addEventListener('click', () => {
            audioManager.playClick();
            this.game.enhance();
        });
        document.getElementById('btn-leave-rest').addEventListener('click', () => {
            audioManager.playClick();
            this.game.leaveRest();
        });
        
        const toggleLogBtn = document.getElementById('btn-toggle-battle-log');
        if (toggleLogBtn) {
            toggleLogBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                audioManager.playClick();
                this.battleLogPanel.classList.toggle('collapsed');
                toggleLogBtn.textContent = this.battleLogPanel.classList.contains('collapsed') ? '▲' : '▼';
            });
        }
        
        const sfxVolume = document.getElementById('sfx-volume');
        const musicVolume = document.getElementById('music-volume');
        const musicToggle = document.getElementById('music-toggle');
        
        if (sfxVolume) {
            sfxVolume.addEventListener('input', (e) => {
                audioManager.setSfxVolume(e.target.value / 100);
            });
        }
        
        if (musicVolume) {
            musicVolume.addEventListener('input', (e) => {
                audioManager.setMusicVolume(e.target.value / 100);
            });
        }
        
        if (musicToggle) {
            musicToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    audioManager.startBgMusic();
                } else {
                    audioManager.stopBgMusic();
                }
            });
        }

        if (this.playerPortrait) {
            this.playerPortrait.addEventListener('click', () => {
                audioManager.playClick();
                this.showCharacterPanel();
            });
        }

        const closeCharBtn = document.getElementById('btn-close-character');
        if (closeCharBtn) {
            closeCharBtn.addEventListener('click', () => {
                audioManager.playClick();
                this.hideCharacterPanel();
            });
        }

        const consoleInput = document.getElementById('console-input');
        if (consoleInput) {
            consoleInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const value = consoleInput.value.trim();
                    if (value === '114514') {
                        audioManager.playClick();
                        this.showDebugConsole();
                        consoleInput.value = '';
                    }
                }
            });
        }

        const closeConsoleBtn = document.getElementById('btn-close-console');
        if (closeConsoleBtn) {
            closeConsoleBtn.addEventListener('click', () => {
                this.hideDebugConsole();
            });
        }

        this.initDebugConsoleDraggable();
        this.bindDebugTabEvents();
        this.bindDebugSearchEvents();
    }

    initDraggableBattleLog() {
        const logPanel = document.getElementById('battle-log-panel');
        if (!logPanel) return;

        let isDragging = false;
        let offsetX, offsetY;

        const onMouseDown = (e) => {
            if (e.target.closest('button') || e.target.closest('.battle-log-entry')) return;
            isDragging = true;
            logPanel.classList.add('dragging');
            offsetX = e.clientX - logPanel.offsetLeft;
            offsetY = e.clientY - logPanel.offsetTop;
            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;
            const container = document.getElementById('game-container');
            if (container) {
                const containerRect = container.getBoundingClientRect();
                newX = Math.max(containerRect.left, Math.min(newX, containerRect.right - logPanel.offsetWidth));
                newY = Math.max(containerRect.top, Math.min(newY, containerRect.bottom - logPanel.offsetHeight));
            }
            logPanel.style.left = newX + 'px';
            logPanel.style.top = newY + 'px';
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                logPanel.classList.remove('dragging');
            }
        };

        logPanel.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        logPanel.addEventListener('touchstart', (e) => {
            if (e.target.closest('button') || e.target.closest('.battle-log-entry')) return;
            isDragging = true;
            logPanel.classList.add('dragging');
            const touch = e.touches[0];
            offsetX = touch.clientX - logPanel.offsetLeft;
            offsetY = touch.clientY - logPanel.offsetTop;
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            let newX = touch.clientX - offsetX;
            let newY = touch.clientY - offsetY;
            const container = document.getElementById('game-container');
            if (container) {
                const containerRect = container.getBoundingClientRect();
                newX = Math.max(containerRect.left, Math.min(newX, containerRect.right - logPanel.offsetWidth));
                newY = Math.max(containerRect.top, Math.min(newY, containerRect.bottom - logPanel.offsetHeight));
            }
            logPanel.style.left = newX + 'px';
            logPanel.style.top = newY + 'px';
        }, { passive: false });

        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                logPanel.classList.remove('dragging');
            }
        });
    }

    showMainMenu() {
        this.mainMenu.classList.remove('hidden');
        this.gameScreen.classList.add('hidden');
        this.settingsPanel.classList.add('hidden');
        
        const continueBtn = document.getElementById('btn-continue');
        if (continueBtn) {
            if (this.game.hasSave()) {
                continueBtn.classList.remove('hidden');
            } else {
                continueBtn.classList.add('hidden');
            }
        }
    }

    showGameScreen() {
        this.mainMenu.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
    }

    updateFloor(floor) {
        const floorData = FLOOR_DATA[floor];
        this.floorDisplay.textContent = `第 ${floor} 层 - ${floorData.name}`;
    }

    updateGold(gold) {
        this.goldDisplay.textContent = `金币: ${gold}`;
    }

    updatePlayerPortrait(character) {
        if (character.image) {
            this.playerPortrait.innerHTML = `<img src="${character.image}" alt="${character.name}">`;
        } else {
            this.playerPortrait.innerHTML = `<span style="font-size:24px">${character.icon}</span>`;
        }
        this.updatePlayerResources(character);
    }

    updatePlayerResources(character) {
        const staminaDisplay = document.getElementById('stamina-display');
        const manaDisplay = document.getElementById('mana-display');

        if (staminaDisplay && manaDisplay && character) {
            const stamina = character.stamina !== undefined ? character.stamina : character.maxStamina;
            const maxStamina = character.maxStamina !== undefined ? character.maxStamina : 100;
            const mana = character.mana !== undefined ? character.mana : character.maxMana;
            const maxMana = character.maxMana !== undefined ? character.maxMana : 50;
            
            staminaDisplay.textContent = `💪 ${stamina}/${maxStamina}`;
            manaDisplay.textContent = `💧 ${mana}/${maxMana}`;
        }
        
        this.updateHpBar(character);
    }

    updateHpBar(character) {
        if (this.hpBarFill && character) {
            const hpPercent = character.getHpPercent ? character.getHpPercent() : Math.floor((character.hp / character.maxHp) * 100);
            
            // 计算护盾值占当前生命值的百分比
            const shield = character.shield || 0;
            const shieldPercent = shield > 0 ? Math.floor((shield / character.maxHp) * 100) : 0;
            
            // 设置血条宽度（只显示生命值部分，护盾通过叠加层显示）
            this.hpBarFill.style.width = `${hpPercent}%`;
            
            // 设置血条背景，如果有护盾则添加银白色覆盖层
            if (shield > 0) {
                // 护盾使用银白色渐变覆盖在血条上
                this.hpBarFill.style.background = `linear-gradient(90deg, #c0c0c0 0%, #a0a0a0 ${shieldPercent}%, #2ecc71 ${shieldPercent}%, #27ae60 100%)`;
            } else if (hpPercent <= 25) {
                this.hpBarFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            } else if (hpPercent <= 50) {
                this.hpBarFill.style.background = 'linear-gradient(90deg, #f1c40f, #f39c12)';
            } else {
                this.hpBarFill.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
            }
        }
    }

    updatePotionBar(potions) {
        if (!this.potionBar) return;
        
        this.potionBar.innerHTML = '';
        const potionIcons = {
            'heal': '🧪',
            'stamina': '🍖',
            'mana': '🧊'
        };
        
        for (let i = 0; i < 3; i++) {
            const slot = document.createElement('div');
            slot.className = 'potion-slot';
            
            if (potions[i]) {
                slot.textContent = potionIcons[potions[i]];
                slot.title = potions[i] === 'heal' ? '治疗药水' : potions[i] === 'stamina' ? '体力药水' : '法力药水';
                slot.addEventListener('click', () => {
                    audioManager.playClick();
                    this.game.usePotion(i);
                });
            } else {
                slot.className += ' empty';
            }
            
            this.potionBar.appendChild(slot);
        }
    }

    showCharacterPanel() {
        const player = this.game.playerTeam[0];
        if (!player) return;
        
        this.characterPanel.classList.remove('hidden');
        
        const portraitLarge = document.getElementById('character-portrait-large');
        if (portraitLarge) {
            if (player.image) {
                portraitLarge.innerHTML = `<img src="${player.image}" alt="${player.name}">`;
            } else {
                portraitLarge.textContent = player.icon;
            }
        }
        
        const nameDisplay = document.getElementById('character-name-display');
        if (nameDisplay) nameDisplay.textContent = player.name;
        
        document.getElementById('attr-hp').textContent = `${player.hp}/${player.maxHp}`;
        document.getElementById('attr-atk').textContent = player.atk;
        document.getElementById('attr-def').textContent = player.def;
        document.getElementById('attr-spd').textContent = player.spd;
        document.getElementById('attr-crit').textContent = `${player.crit}%`;
        document.getElementById('attr-critdmg').textContent = `${player.critDmg}%`;
        document.getElementById('attr-stamina').textContent = `${player.stamina}/${player.maxStamina}`;
        document.getElementById('attr-mana').textContent = `${player.mana}/${player.maxMana}`;
        document.getElementById('attr-magicPower').textContent = player.magicPower || 10;
        
        const relicsList = document.getElementById('relics-list');
        if (relicsList) {
            relicsList.innerHTML = '';
            
            if (player.relics && player.relics.length > 0) {
                player.relics.forEach(relic => {
                    const relicItem = document.createElement('div');
                    relicItem.className = 'relic-item';
                    const noteHtml = relic.note ? `<div class="tooltip-note" style="color:#888;font-style:italic;margin-top:5px;font-size:11px;">${relic.note}</div>` : '';
                    relicItem.innerHTML = `
                        <span class="relic-icon">${relic.icon}</span>
                        <div class="relic-tooltip">
                            <div class="tooltip-name">${relic.name}</div>
                            <div class="tooltip-desc">${relic.description}</div>
                            ${noteHtml}
                        </div>
                    `;
                    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
                    if (isTouchDevice) {
                        relicItem.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const tooltip = relicItem.querySelector('.relic-tooltip');
                            if (tooltip) {
                                const isVisible = tooltip.style.display === 'block';
                                document.querySelectorAll('.relic-tooltip, .pet-tooltip').forEach(t => {
                                    t.style.display = 'none';
                                });
                                if (!isVisible) {
                                    tooltip.style.display = 'block';
                                }
                            }
                        });
                        document.addEventListener('click', () => {
                            document.querySelectorAll('.relic-tooltip, .pet-tooltip').forEach(t => {
                                t.style.display = 'none';
                            });
                        });
                    }
                    relicsList.appendChild(relicItem);
                });
            } else {
                relicsList.innerHTML = '<div style="color:#666;font-size:12px;">暂无遗物</div>';
            }
        }
        
        const petList = document.getElementById('pet-list');
        if (petList) {
            petList.innerHTML = '';
            
            const alivePets = player.pets ? player.pets.filter(pet => !pet.isDead) : [];
            
            if (alivePets.length > 0) {
                alivePets.forEach(pet => {
                    const petItem = document.createElement('div');
                    petItem.className = 'pet-item';
                    const petDesc = pet.specialAbility ? pet.specialAbility.description : pet.description || '';
                    const petIconHtml = pet.icon && pet.icon.endsWith('.png') 
                        ? `<img src="${pet.icon}" alt="${pet.name}" style="width: 40px; height: 40px; object-fit: contain;">`
                        : `<span class="pet-icon">${pet.icon}</span>`;
                    petItem.innerHTML = `
                        ${petIconHtml}
                        <div class="pet-tooltip">
                            <div class="tooltip-name">${pet.name}</div>
                            <div class="tooltip-desc">${petDesc}</div>
                            <div class="tooltip-stats">血量: ${pet.hp}/${pet.maxHp}</div>
                        </div>
                    `;
                    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
                    if (isTouchDevice) {
                        petItem.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const tooltip = petItem.querySelector('.pet-tooltip');
                            if (tooltip) {
                                const isVisible = tooltip.style.display === 'block';
                                document.querySelectorAll('.relic-tooltip, .pet-tooltip').forEach(t => {
                                    t.style.display = 'none';
                                });
                                if (!isVisible) {
                                    tooltip.style.display = 'block';
                                }
                            }
                        });
                        document.addEventListener('click', () => {
                            document.querySelectorAll('.relic-tooltip, .pet-tooltip').forEach(t => {
                                t.style.display = 'none';
                            });
                        });
                    }
                    petList.appendChild(petItem);
                });
            } else {
                petList.innerHTML = '<div style="color:#666;font-size:12px;">暂无宠物</div>';
            }
        }
    }

    hideCharacterPanel() {
        this.characterPanel.classList.add('hidden');
    }

    showSkillReplacePanel(currentSkills, newSkill) {
        this.skillReplacePanel.classList.remove('hidden');
        
        const optionsContainer = document.getElementById('replace-skill-options');
        optionsContainer.innerHTML = '';
        
        currentSkills.forEach((skill, index) => {
            const shortDesc = skill.description.split('，')[0].split(',')[0];
            const skillIconHtml = skill.icon && skill.icon.endsWith('.png')
                ? `<img src="${skill.icon}" alt="${skill.name}" style="width:28px;height:28px;object-fit:contain;">`
                : `<span class="skill-icon">${skill.icon}</span>`;
            const btn = document.createElement('button');
            btn.className = `replace-skill-btn ${Skill.getRarityColor(skill.rarity)}`;
            btn.innerHTML = `
                ${skillIconHtml}
                <span class="skill-name">${skill.name}</span>
                <span class="skill-desc">${shortDesc}</span>
            `;
            btn.addEventListener('click', () => {
                audioManager.playClick();
                this.game.replaceSkill(index);
            });
            optionsContainer.appendChild(btn);
        });
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'action-btn';
        cancelBtn.textContent = '取消';
        cancelBtn.style.marginTop = '10px';
        cancelBtn.addEventListener('click', () => {
            audioManager.playClick();
            this.game.cancelSkillReplace();
        });
        optionsContainer.appendChild(cancelBtn);
        
        const newSkillInfo = document.createElement('div');
        newSkillInfo.style.cssText = 'width:100%;text-align:center;margin-bottom:10px;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;';
        newSkillInfo.innerHTML = `
            <div style="color:#ffd700;font-weight:bold;">新技能: ${newSkill.icon} ${newSkill.name}</div>
            <div style="color:#aaa;font-size:12px;">${newSkill.description}</div>
        `;
        optionsContainer.insertBefore(newSkillInfo, optionsContainer.firstChild);
    }

    hideSkillReplacePanel() {
        this.skillReplacePanel.classList.add('hidden');
    }

    showBattleLog() {
        this.battleLogPanel.classList.remove('hidden');
    }

    hideBattleLog() {
        this.battleLogPanel.classList.add('hidden');
    }

    updateBattleLog(battleLog) {
        const logContent = document.getElementById('battle-log-content');
        if (!logContent) return;
        
        logContent.innerHTML = '';
        
        const recentLogs = battleLog.slice(-20);
        
        recentLogs.forEach(log => {
            const entry = document.createElement('div');
            entry.className = 'battle-log-entry';
            
            if (log.type === 'reward' || log.type === 'drop') {
                return;
            }
            
            if (log.type === 'enemyAttack') {
                if (log.dodged) {
                    entry.innerHTML = `${log.enemy} 攻击 ${log.target} <strong>闪避!</strong>`;
                    entry.classList.add('player-action');
                } else {
                    entry.innerHTML = `${log.enemy} 攻击 ${log.target} 造成 <strong>${log.damage}</strong> 伤害${log.isCrit ? ' (暴击!)' : ''}`;
                    entry.classList.add('enemy-action');
                }
            } else if (log.type === 'enemySkill') {
                entry.textContent = `${log.enemy} 使用 ${log.skill} 攻击 ${log.target}`;
                if (log.result && log.result.damage) {
                    entry.innerHTML += ` 造成 <strong>${log.result.damage}</strong> 伤害`;
                    entry.classList.add('enemy-action');
                } else if (log.result && log.result.heal) {
                    entry.innerHTML += ` 恢复 <strong>${log.result.heal}</strong> 生命`;
                    entry.classList.add('enemy-action');
                }
            } else if (log.type === 'skill') {
                entry.textContent = `${log.character} 使用 ${log.skill}`;
                if (log.result && log.result.damage) {
                    entry.innerHTML += ` 攻击 ${log.target} 造成 <strong>${log.result.damage}</strong> 伤害${log.result.isCrit ? ' (暴击!)' : ''}`;
                    entry.classList.add('player-action');
                } else if (log.result && log.result.heal) {
                    entry.innerHTML += ` 恢复 <strong>${log.result.heal}</strong> 生命`;
                    entry.classList.add('player-action');
                } else if (log.result && log.result.shield) {
                    entry.innerHTML += ` 获得 <strong>${log.result.shield}</strong> 护盾`;
                    entry.classList.add('player-action');
                } else if (log.result && log.result.summonName) {
                    entry.innerHTML += ` 召唤了 <strong>${log.result.summonName}</strong>`;
                    entry.classList.add('player-action');
                }
            } else if (log.type === 'death') {
                entry.textContent = `${log.target} 被击败!`;
                entry.classList.add('enemy-action');
            } else if (log.type === 'reward') {
                entry.innerHTML = `获得 <strong>${log.exp}</strong> 经验, <strong>${log.gold}</strong> 金币`;
            } else if (log.type === 'drop') {
                entry.textContent = `掉落: ${log.item}`;
            } else if (log.type === 'pet') {
                entry.textContent = `获得宠物: ${log.item}`;
            } else if (log.type === 'petAbility') {
                if (log.ability === 'heal') {
                    entry.innerHTML = `${log.pet} 使用治愈能力恢复了 <strong>${log.value}</strong> 生命`;
                } else if (log.ability === 'bind') {
                    entry.textContent = `${log.pet} 束缚了 ${log.target}`;
                } else if (log.ability === 'breakDefense') {
                    entry.textContent = `${log.pet} 对 ${log.target} 施加破防 (${log.stacks}层)`;
                } else if (log.ability === 'giveHumorBuff') {
                    entry.textContent = log.message || `${log.pet} 给玩家添加了滑稽buff`;
                } else if (log.ability === 'speedBoost') {
                    entry.textContent = `${log.pet} 提升了玩家 ${log.value} 点速度`;
                } else if (log.ability === 'mimic') {
                    entry.textContent = `${log.pet} 复制了技能 ${log.skill}`;
                } else if (log.ability === 'mimicAttack') {
                    entry.innerHTML = `${log.pet} 使用 ${log.skill} 攻击 ${log.target} 造成 <strong>${log.result?.damage || 0}</strong> 伤害`;
                } else if (log.ability === 'steal') {
                    entry.innerHTML = `${log.pet} 偷取 ${log.target} 的 ${log.skill} 造成 <strong>${log.damage}</strong> 伤害`;
                }
                entry.classList.add('player-action');
            } else if (log.type === 'buffDamage') {
                entry.innerHTML = `${log.buff} 对 ${log.target} 造成 <strong>${log.damage}</strong> 伤害`;
                entry.classList.add('player-action');
            } else if (log.type === 'passiveTrigger') {
                entry.textContent = log.message;
                entry.classList.add('player-action');
            }
            
            if (entry.textContent || entry.innerHTML) {
                logContent.appendChild(entry);
            }
        });
        
        logContent.scrollTop = logContent.scrollHeight;
    }

    // ==================== 显示地图选择面板 ====================
    // 每层开始时显示3个路径供玩家选择
    showMapPanel(paths, floor = 1) {
        this.mapPanel.classList.remove('hidden');       // 显示地图面板
        this.battleArea.classList.add('hidden');        // 隐藏战斗区域
        this.skillPanel.classList.add('hidden');         // 隐藏技能面板
        this.pathOptions.innerHTML = '';                // 清空之前的路径选项
        
        // 设置背景图片 - 1-15层使用qianjin1.png
        let bgImage = this.mapPanel.querySelector('.map-bg-image');
        if (!bgImage) {
            bgImage = document.createElement('img');
            bgImage.className = 'map-bg-image';
            this.mapPanel.insertBefore(bgImage, this.mapPanel.firstChild);
        }
        
        if (floor >= 1 && floor <= 15) {
            bgImage.src = 'assets/images/qianjin1.png';
            bgImage.style.display = 'block';
        } else if (floor >= 16 && floor <= 30) {
            bgImage.src = 'assets/images/qianjin2.png';
            bgImage.style.display = 'block';
        } else {
            bgImage.style.display = 'none';
        }
        
        // 根据层数添加不同的样式类（改变背景色调）
        this.mapPanel.classList.remove('map-dungeon', 'map-abyss', 'map-spirit');
        if (floor >= 21) {
            this.mapPanel.classList.add('map-spirit');
        } else if (floor >= 11) {
            this.mapPanel.classList.add('map-abyss');
        } else {
            this.mapPanel.classList.add('map-dungeon');
        }
        
        const game = this.game;
        
        paths.forEach((path, index) => {
            const option = document.createElement('div');
            option.className = `path-option path-${path.type}`;
            const pathIconHtml = path.icon && path.icon.endsWith('.png')
                ? `<img src="${path.icon}" alt="${path.name}" style="width: 32px; height: 32px; object-fit: contain;">`
                : `<div class="path-icon">${path.icon}</div>`;
            option.innerHTML = `
                ${pathIconHtml}
                <div class="path-name">${path.name}</div>
                <div class="path-desc">${path.desc}</div>
            `;
            option.onclick = function() {
                game.selectPath(index);
            };
            this.pathOptions.appendChild(option);
        });
    }

    hideMapPanel() {
        this.mapPanel.classList.add('hidden');
    }

    // ==================== 显示战斗区域 ====================
    // 开始战斗时显示战斗界面
    showBattleArea() {
        this.mapPanel.classList.add('hidden');           // 隐藏地图
        this.battleArea.classList.remove('hidden');       // 显示战斗区域
        
        // 设置战斗背景图片 - 1-15层使用zhandou1.png
        let bgImage = this.battleArea.querySelector('.battle-bg-image');
        if (!bgImage) {
            bgImage = document.createElement('img');
            bgImage.className = 'battle-bg-image';
            this.battleArea.insertBefore(bgImage, this.battleArea.firstChild);
        }
        
        const floor = this.game.currentFloor;
        if (floor >= 1 && floor <= 15) {
            bgImage.src = 'assets/images/zhandou1.png';
            bgImage.style.display = 'block';
        } else if (floor >= 16 && floor <= 30) {
            bgImage.src = 'assets/images/zhandou2.png';
            bgImage.style.display = 'block';
        } else {
            bgImage.style.display = 'none';
        }
    }

    hideBattleArea() {
        this.battleArea.classList.add('hidden');
    }

    updateBattleArea(battle) {
        this.playerSide.innerHTML = '';
        this.enemySide.innerHTML = '';

        const currentActor = battle.currentActor;
        
        battle.playerTeam.forEach((char) => {
            const isActive = currentActor === char && battle.currentActorType === 'player';
            const card = this.createCharacterCard(char, isActive);
            this.playerSide.appendChild(card);
        });

        battle.enemies.forEach((enemy) => {
            const card = this.createEnemyCard(enemy, battle);
            this.enemySide.appendChild(card);
        });
        
        const playerCount = battle.playerTeam.filter(c => !c.isDead && !c.banished).length;
        const enemyCount = battle.enemies.filter(e => !e.isDead && !e.banished).length;
        
        this.playerSide.style.flexWrap = 'wrap';
        this.enemySide.style.flexWrap = 'wrap';
        
        if (playerCount > 4) {
            this.playerSide.style.transform = `scale(${Math.max(0.5, 4 / playerCount)})`;
            this.playerSide.style.marginBottom = '-30px';
        } else {
            this.playerSide.style.transform = 'scale(1)';
            this.playerSide.style.marginBottom = '0';
        }
        
        if (enemyCount > 4) {
            this.enemySide.style.transform = `scale(${Math.max(0.5, 4 / enemyCount)})`;
            this.enemySide.style.marginBottom = '-30px';
        } else {
            this.enemySide.style.transform = 'scale(1)';
            this.enemySide.style.marginBottom = '0';
        }
    }

    createCharacterCard(char, isActive) {
        const card = document.createElement('div');
        const isPet = char.isSummoned;
        card.className = `character-card ${char.isDead ? 'dead' : ''} ${isActive ? 'active' : ''} ${isPet ? 'pet-card' : ''}`;
        card.id = `char-${char.id}`;
        
        let iconHtml = '';
        if (char.image) {
            iconHtml = `<img src="${char.image}" style="width:100%;height:100%;object-fit:cover;border-radius:9px;" onerror="this.style.display='none';this.parentNode.innerHTML='${char.icon}'">`;
        } else if (char.icon && char.icon.endsWith('.png')) {
            iconHtml = `<img src="${char.icon}" style="width:100%;height:100%;object-fit:contain;border-radius:9px;" onerror="this.style.display='none';this.parentNode.innerHTML='❓'">`;
        } else {
            iconHtml = char.icon;
        }
        
        const hpPercent = char.getHpPercent ? char.getHpPercent() : Math.floor((char.hp / char.maxHp) * 100);
        let hpClass = 'high';
        if (hpPercent <= 25) hpClass = 'low';
        else if (hpPercent <= 50) hpClass = 'medium';

        const stamina = char.stamina !== undefined ? char.stamina : char.maxStamina || 100;
        const maxStamina = char.maxStamina || 100;
        const mana = char.mana !== undefined ? char.mana : char.maxMana || 50;
        const maxMana = char.maxMana || 50;
        
        let buffsHtml = '';
        if (char.buffs && char.buffs.length > 0) {
            buffsHtml = `<div class="buff-icons">`;
            char.buffs.forEach(buff => {
                const buffData = BUFF_DATA[buff.name];
                const buffDesc = buffData ? buffData.description : buff.description || '';
                const buffType = buffData ? buffData.type : (buff.type || 'positive');
                buffsHtml += `<div class="buff-icon ${buffType}" data-buff="${buff.name}" data-stacks="${buff.stacks}" data-description="${buff.name}: ${buffDesc}" title="${buff.name} (${buff.stacks}层)">${buffData ? buffData.icon : buff.icon}</div>`;
            });
            buffsHtml += `</div>`;
        }
        
        const attrsHtml = isPet ? '' : `
            <div class="status-attrs">
                <span class="attr-atk">⚔️${char.atk}</span>
                <span class="attr-def">🛡️${char.def}</span>
                <span class="attr-spd">⚡${char.spd}</span>
                <span class="attr-magicPower">✨${char.magicPower || 10}</span>
            </div>
        `;
        
        const shield = char.shield || 0;
        const shieldPercent = shield > 0 ? Math.floor((shield / char.hp) * 100) : 0;
        const shieldOverlayHtml = shield > 0 ? `<div class="shield-overlay" style="width: ${shieldPercent}%"></div>` : '';
        const shieldTextHtml = shield > 0 ? `<span class="status-shield-text"> 🛡️${shield}</span>` : '';
        
        card.innerHTML = `
            <div class="character-icon battle-entity">${iconHtml}</div>
            ${buffsHtml}
            <div class="battle-status-bar">
                <div class="status-name">${char.name}</div>
                <div class="status-hp-bar">
                    <div class="status-hp-fill ${hpClass}" style="width: ${hpPercent}%"></div>
                    ${shieldOverlayHtml}
                </div>
                <div class="status-hp-text">HP: ${char.hp}/${char.maxHp}${shieldTextHtml}</div>
                ${attrsHtml}
            </div>
        `;
        
        return card;
    }

    createEnemyCard(enemy, battle) {
        const card = document.createElement('div');
        card.className = `enemy-card enemy-type-${enemy.type} ${enemy.isDead ? 'dead' : ''}`;
        card.id = `enemy-${enemy.id}`;
        
        if (battle.battleState === 'selectTarget' && battle.isPlayerTurn() && !enemy.isDead) {
            card.classList.add('targetable');
            card.addEventListener('click', () => this.game.selectTarget(enemy));
        }
        
        const enemyIcon = this.getEnemyIcon(enemy);
        
        const hpPercent = enemy.getHpPercent();
        let hpClass = 'high';
        if (hpPercent <= 25) hpClass = 'low';
        else if (hpPercent <= 50) hpClass = 'medium';
        
        let buffsHtml = '';
        if (enemy.buffs && enemy.buffs.length > 0) {
            buffsHtml = `<div class="buff-icons">`;
            enemy.buffs.forEach(buff => {
                const buffData = BUFF_DATA[buff.name];
                const buffDesc = buffData ? buffData.description : buff.description || '';
                const buffType = buffData ? buffData.type : (buff.type || 'positive');
                buffsHtml += `<div class="buff-icon ${buffType}" data-buff="${buff.name}" data-stacks="${buff.stacks}" data-description="${buff.name}: ${buffDesc}" title="${buff.name} (${buff.stacks}层)">${buffData ? buffData.icon : buff.icon}</div>`;
            });
            buffsHtml += `</div>`;
        }
        
        const enemyShield = enemy.shield || 0;
        const enemyShieldPercent = enemyShield > 0 ? Math.floor((enemyShield / enemy.hp) * 100) : 0;
        const enemyShieldOverlayHtml = enemyShield > 0 ? `<div class="shield-overlay" style="width: ${enemyShieldPercent}%"></div>` : '';
        const enemyShieldTextHtml = enemyShield > 0 ? `<span class="status-shield-text"> 🛡️${enemyShield}</span>` : '';
        
        card.innerHTML = `
            <div class="enemy-icon battle-entity">${enemyIcon}</div>
            ${buffsHtml}
            <div class="battle-status-bar">
                <div class="status-name">${enemy.name}</div>
                <div class="status-hp-bar">
                    <div class="status-hp-fill ${hpClass}" style="width: ${hpPercent}%"></div>
                    ${enemyShieldOverlayHtml}
                </div>
                <div class="status-hp-text">HP: ${enemy.hp}/${enemy.maxHp}${enemyShieldTextHtml}</div>
                <div class="status-attrs">
                    <span class="attr-atk">⚔️${enemy.atk}</span>
                    <span class="attr-def">🛡️${enemy.def}</span>
                    <span class="attr-spd">⚡${enemy.spd}</span>
                </div>
            </div>
        `;
        
        return card;
    }

    getEnemyIcon(enemy) {
        if (enemy.type === 'boss') {
            return `<div style="font-size:28px">👹</div>`;
        } else if (enemy.type === 'elite') {
            return `<div style="font-size:28px">👺</div>`;
        }
        
        const icons = ['🐀', '🪲', '💀', '🧟', '🦇', '👤', '👻', '😈', '🗿', '🦂'];
        const index = enemy.name.charCodeAt(0) % icons.length;
        return `<div style="font-size:28px">${icons[index]}</div>`;
    }

    showDamageEffect(target, result, isPlayer = false, skill = null, isHeal = false) {
        const cardId = isPlayer ? `char-${target.id}` : `enemy-${target.id}`;
        let card = document.getElementById(cardId);
        
        if (!card) {
            if (this.game && this.game.battle) {
                this.updateBattleArea(this.game.battle);
                card = document.getElementById(cardId);
            }
        }
        
        if (!card) return;
        
        if (result && result.dodged) {
            const dodgeText = document.createElement('div');
            dodgeText.className = 'damage-text dodge';
            dodgeText.textContent = '闪避!';
            
            const rect = card.getBoundingClientRect();
            const container = document.getElementById('game-container');
            const containerRect = container.getBoundingClientRect();
            
            dodgeText.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
            dodgeText.style.top = `${rect.top - containerRect.top}px`;
            
            container.appendChild(dodgeText);
            
            card.classList.add('dodged');
            setTimeout(() => {
                card.classList.remove('dodged');
                dodgeText.remove();
            }, 600);
            return;
        }
        
        if (isHeal && result && result.heal) {
            const healText = document.createElement('div');
            healText.className = 'damage-text heal';
            healText.textContent = `+${result.heal}`;
            
            const rect = card.getBoundingClientRect();
            const container = document.getElementById('game-container');
            const containerRect = container.getBoundingClientRect();
            
            healText.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
            healText.style.top = `${rect.top - containerRect.top}px`;
            
            container.appendChild(healText);
            setTimeout(() => healText.remove(), 1000);
            return;
        }
        
        if (card && result && (result.damage || result.damage === 0)) {
            card.classList.add('damaged');
            setTimeout(() => card.classList.remove('damaged'), 400);
            
            const entity = card.querySelector('.battle-entity');
            if (entity) {
                entity.classList.add('hit');
                setTimeout(() => entity.classList.remove('hit'), 400);
            }
            
            const damageText = document.createElement('div');
            let damageClass = 'damage-text';
            let damageValue = result.damage;
            
            if (skill && skill.rarity === 'legendary') {
                damageClass += ' legendary';
                damageValue = `${damageValue}!`;
            } else if (result.isCrit || result.doubleStrike) {
                damageClass += ' crit';
                damageValue = `${damageValue}!`;
            } else {
                damageValue = `-${damageValue}`;
            }
            
            damageText.className = damageClass;
            damageText.textContent = damageValue;
            
            const rect = card.getBoundingClientRect();
            const container = document.getElementById('game-container');
            const containerRect = container.getBoundingClientRect();
            
            damageText.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
            damageText.style.top = `${rect.top - containerRect.top}px`;
            
            container.appendChild(damageText);
            
            setTimeout(() => damageText.remove(), 1000);
        }
    }

    showAttackAnimation(attacker, isPlayer) {
        const cardId = isPlayer ? `char-${attacker.id}` : `enemy-${attacker.id}`;
        const card = document.getElementById(cardId);
        
        if (!card) return;
        
        card.classList.add('attacking');
        
        const entity = card.querySelector('.battle-entity');
        if (entity) {
            const direction = isPlayer ? 'attackUp' : 'attackDown';
            entity.style.animation = `${direction} 0.3s ease-out`;
            setTimeout(() => {
                entity.style.animation = '';
            }, 300);
        }
        
        setTimeout(() => card.classList.remove('attacking'), 300);
    }

    showSkillPanel() {
        this.skillPanel.classList.remove('hidden');
        this.updateSkillButtons();
    }

    hideSkillPanel() {
        this.skillPanel.classList.add('hidden');
    }

    updateSkillButtons() {
        this.skillOptions.innerHTML = '';
        
        const battle = this.game.battle;
        if (!battle) return;
        
        const skills = battle.getCurrentSkills();
        const character = battle.getPlayerCharacter();
        
        if (!skills || skills.length === 0) {
            this.skillOptions.innerHTML = '<div style="color:#aaa">没有可用技能</div>';
            return;
        }
        
        skills.forEach((skill, index) => {
            const canUse = skill.canUse(character) && !skill.passive;
            const costType = skill.getCostType();
            const cost = skill.getCost();
            const costIcon = costType === 'mana' ? '💧' : '💪';
            const costColor = canUse ? '#fff' : '#e74c3c';
            
            const shortDesc = skill.description.split('，')[0].split(',')[0];
            
            // 计算技能的实际伤害/治疗值
            let damageText = '';
            if (skill.power || skill.effect?.type === 'maxHpDamage') {
                let calculatedDamage;
                let formulaText = String(skill.power || '30+0.2*maxHp');
                if (skill.effect?.type === 'maxHpDamage') {
                    // 肉蛋冲击：30+20%自身最大生命值
                    calculatedDamage = Math.floor(character.maxHp * 0.2) + 30;
                    formulaText = '30+0.2*maxHp';
                } else {
                    calculatedDamage = character.calculateSkillDamage(skill.power, skill.isMagic);
                    // 魔法技能使用法强(matk)，物理技能使用攻击力(atk)
                    if (skill.isMagic) {
                        formulaText = formulaText.replace(/\batk\b/g, 'matk').replace(/\b攻击力\b/g, '法强');
                    }
                }
                damageText = `伤害: ${calculatedDamage} (公式: ${formulaText})`;
            }
            
            // 添加护盾值显示
            if (skill.effect?.type === 'shield') {
                const base = skill.effect?.base || 0;
                const multiplier = skill.effect?.multiplier || 0;
                const lostHp = character.maxHp - character.hp;
                const shieldValue = Math.floor(base + lostHp * multiplier);
                const shieldFormula = `${base} + ${multiplier} × 自身已损失生命值`;
                damageText = damageText ? damageText + ` | 护盾: ${shieldValue} (公式: ${shieldFormula})` : `护盾: ${shieldValue} (公式: ${shieldFormula})`;
            }
            
            const skillIconHtml = skill.icon && skill.icon.endsWith('.png')
                ? `<img src="${skill.icon}" alt="${skill.name}" style="width:28px;height:28px;object-fit:contain;">`
                : `<span class="skill-icon">${skill.icon}</span>`;
            
            const btn = document.createElement('button');
            btn.className = `skill-btn ${Skill.getRarityColor(skill.rarity)} ${!canUse ? 'disabled' : ''}`;
            btn.innerHTML = `
                ${skillIconHtml}
                <span class="skill-name">${skill.name}</span>
                <span class="skill-desc">${shortDesc}</span>
                <span class="skill-cost" style="color:${costColor}">${costIcon} ${cost}</span>
                <div class="skill-tooltip">
                    <div class="tooltip-name">${skill.name}</div>
                    <div class="tooltip-type">${skill.type === 'attack' ? '攻击技能' : skill.type === 'heal' ? '治疗技能' : skill.type === 'defense' ? '防御技能' : skill.type === 'buff' ? '增益技能' : skill.type === 'summon' ? '召唤技能' : skill.type === 'debuff' ? '减益技能' : skill.type === 'fear' ? '恐惧技能' : skill.type === 'mark' ? '标记技能' : skill.type === 'banish' ? '放逐技能' : skill.type === 'passive' ? '被动技能' : '被动技能'}</div>
                    <div class="tooltip-desc">${skill.description}</div>
                    <div class="tooltip-effect">${damageText}${skill.heal ? `治疗: ${skill.heal}` : ''}${skill.defense ? `防御: ${skill.defense}` : ''}</div>
                    <div class="tooltip-cost">消耗: ${costIcon} ${cost} ${costType === 'mana' ? '法力' : '体力'}</div>
                </div>
            `;
            btn.addEventListener('click', () => {
                if (!skill.passive) {
                    this.game.selectSkill(index);
                }
            });
            
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            
            if (isTouchDevice) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    const tooltip = btn.querySelector('.skill-tooltip');
                    if (tooltip) {
                        document.querySelectorAll('.skill-tooltip').forEach(t => {
                            if (t !== tooltip) t.style.display = 'none';
                        });
                        tooltip.style.display = 'block';
                    }
                });
                
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    const tooltip = btn.querySelector('.skill-tooltip');
                    if (tooltip) {
                        tooltip.style.display = 'none';
                    }
                    if (!skill.passive) {
                        this.game.selectSkill(index);
                    }
                });
            }
            
            this.skillOptions.appendChild(btn);
        });
    }

    showTargetSelect() {
        this.skillPanel.classList.add('hidden');
        this.updateBattleArea(this.game.battle);
        
        const cancelBtn = document.getElementById('btn-cancel-target');
        if (cancelBtn) {
            cancelBtn.classList.remove('hidden');
            cancelBtn.onclick = () => {
                audioManager.playClick();
                this.game.cancelTargetSelect();
            };
        }
    }
    
    hideCancelTargetSelect() {
        const cancelBtn = document.getElementById('btn-cancel-target');
        if (cancelBtn) {
            cancelBtn.classList.add('hidden');
        }
    }

    // ==================== 显示对话框 ====================
    // 用于显示获得物品、提示信息等
    // 参数：text显示文字，callback点击继续后的回调，options额外选项（如图标、描述）
    showDialog(text, callback, options = {}) {
        this.dialogPanel.classList.remove('hidden');  // 显示对话框
        
        let dialogContent = text;
        // 如果有图标选项，显示图标和悬浮提示
        // 确保options存在且icon存在
        if (options && options.icon) {
            // 判断是图片还是emoji
            const iconImg = options.icon.endsWith('.png') 
                ? `<img src="${options.icon}" alt="" style="width:48px;height:48px;object-fit:contain;margin-right:10px;">`
                : `<span style="font-size:36px;margin-right:10px;">${options.icon}</span>`;
            
            // 悬浮提示框内容
            const tooltipHtml = options.description 
                ? `<div class="dialog-tooltip" style="display:none;position:absolute;bottom:100%;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.95);border:1px solid #ffd700;border-radius:8px;padding:10px;z-index:1000;white-space:normal;width:220px;text-align:left;margin-bottom:10px;">
                    <div style="color:#ffd700;font-weight:bold;margin-bottom:5px;">${options.name || ''}</div>
                    <div style="color:#ccc;font-size:12px;">${options.description}</div>
                   </div>`
                : '';
            
            // 组合图标和文字
            dialogContent = `<div style="display:flex;align-items:center;justify-content:center;position:relative;">
                ${iconImg}
                <span>${text}</span>
                ${tooltipHtml}
            </div>`;
        }
        
        this.dialogText.innerHTML = dialogContent;
        
        // 如果有描述，添加鼠标悬停显示提示的功能
        // 确保options存在
        if (options && options.icon && options.description) {
            const iconContainer = this.dialogText.querySelector('div');
            if (iconContainer) {
                iconContainer.addEventListener('mouseenter', function() {
                    const tooltip = this.querySelector('.dialog-tooltip');
                    if (tooltip) tooltip.style.display = 'block';
                });
                iconContainer.addEventListener('mouseleave', function() {
                    const tooltip = this.querySelector('.dialog-tooltip');
                    if (tooltip) tooltip.style.display = 'none';
                });
            }
        }
        
        const continueBtn = document.getElementById('btn-dialog-continue');
        if (continueBtn) {
            continueBtn.onclick = () => {
                audioManager.playClick();
                this.dialogPanel.classList.add('hidden');
                continueBtn.onclick = null;
                if (callback) callback();
            };
        }
    }

    showRewards(choiceRewards, goldGain) {
        this.rewardPanel.classList.remove('hidden');
        this.rewardOptions.innerHTML = '';
        
        const goldDiv = document.createElement('div');
        goldDiv.className = 'reward-option gold-reward';
        goldDiv.innerHTML = `
            <div class="reward-icon">💰</div>
            <div class="reward-name">金币 +${goldGain}</div>
            <div class="reward-desc">已自动获得</div>
        `;
        this.rewardOptions.appendChild(goldDiv);
        
        choiceRewards.forEach((reward) => {
            const option = document.createElement('div');
            option.className = 'reward-option';
            
            if (reward.type === 'skill') {
                const skill = reward.item;
                const shortDesc = skill.description.split('，')[0].split(',')[0];
                const skillIconHtml = skill.icon && skill.icon.endsWith('.png')
                    ? `<img src="${skill.icon}" alt="${skill.name}" style="width:clamp(28px,4vw,36px);height:clamp(28px,4vw,36px);object-fit:contain;">`
                    : `<span class="reward-icon">${skill.icon}</span>`;
                option.classList.add(Skill.getRarityColor(skill.rarity));
                option.innerHTML = `
                    <div class="reward-icon">${skillIconHtml}</div>
                    <div class="reward-name">${skill.name}</div>
                    <div class="reward-desc">${shortDesc}</div>
                    <div class="skill-tooltip" style="display: none; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); z-index: 1000; white-space: normal; width: 200px;">
                        <div class="tooltip-name">${skill.name}</div>
                        <div class="tooltip-type">${skill.type === 'attack' ? '攻击技能' : skill.type === 'heal' ? '治疗技能' : skill.type === 'defense' ? '防御技能' : skill.type === 'buff' ? '增益技能' : skill.type === 'summon' ? '召唤技能' : skill.type === 'debuff' ? '减益技能' : skill.type === 'fear' ? '恐惧技能' : skill.type === 'mark' ? '标记技能' : skill.type === 'banish' ? '放逐技能' : skill.type === 'passive' ? '被动技能' : '被动技能'}</div>
                        <div class="tooltip-desc">${skill.description}</div>
                        <div class="tooltip-cost">消耗: ${skill.cost} ${skill.isMagic ? '法力' : '体力'}</div>
                    </div>
                `;
                option.addEventListener('mouseenter', function() {
                    const tooltip = this.querySelector('.skill-tooltip');
                    if (tooltip) tooltip.style.display = 'block';
                });
                option.addEventListener('mouseleave', function() {
                    const tooltip = this.querySelector('.skill-tooltip');
                    if (tooltip) tooltip.style.display = 'none';
                });
                option.addEventListener('touchstart', function(e) {
                    const tooltip = this.querySelector('.skill-tooltip');
                    if (tooltip) {
                        document.querySelectorAll('.skill-tooltip').forEach(t => t.style.display = 'none');
                        tooltip.style.display = 'block';
                    }
                    e.stopPropagation();
                }, {passive: true});
            } else if (reward.type === 'relic') {
                const relic = reward.item;
                if (relic) {
                    option.innerHTML = `
                        <div class="reward-icon">${relic.icon}</div>
                        <div class="reward-name">${relic.name}</div>
                        <div class="reward-desc">${relic.description}</div>
                    `;
                }
            } else if (reward.type === 'attribute') {
                const attr = reward.item;
                option.innerHTML = `
                    <div class="reward-icon">${attr.icon}</div>
                    <div class="reward-name">${attr.name}</div>
                    <div class="reward-desc">${attr.description}</div>
                `;
            }
            
            option.addEventListener('click', () => {
                audioManager.playClick();
                this.rewardPanel.classList.add('hidden');
                this.game.selectReward(reward);
            });
            
            this.rewardOptions.appendChild(option);
        });
        
        const skipDiv = document.createElement('div');
        skipDiv.className = 'reward-skip';
        skipDiv.textContent = '随机属性 (+少量)';
        skipDiv.addEventListener('click', () => {
            audioManager.playClick();
            this.rewardPanel.classList.add('hidden');
            this.game.skipReward();
        });
        this.rewardOptions.appendChild(skipDiv);
    }

    hideRewards() {
        this.rewardPanel.classList.add('hidden');
    }

    showShop(items, gold) {
        this.shopPanel.classList.remove('hidden');
        this.shopItems.innerHTML = '';
        
        items.forEach((item, index) => {
            const div = document.createElement('div');
            const canAfford = gold >= item.price;
            div.className = `shop-item ${item.sold ? 'sold' : ''} ${!canAfford && !item.sold ? 'unaffordable' : ''}`;
            div.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-price">${item.sold ? '已售出' : `${item.price} 金币`}</div>
                <div class="shop-item-desc">${item.desc}</div>
            `;
            
            if (!item.sold) {
                if (canAfford) {
                    div.addEventListener('click', () => this.game.buyItem(index));
                } else {
                    div.addEventListener('click', () => {
                        audioManager.playClick();
                        this.showDialog('金币不足！', () => {});
                    });
                }
            }
            
            this.shopItems.appendChild(div);
        });
    }

    hideShop() {
        this.shopPanel.classList.add('hidden');
    }

    showRest() {
        this.restPanel.classList.remove('hidden');
        const player = this.game.playerTeam[0];
        document.getElementById('rest-desc').textContent = 
            `当前生命: ${player.hp}/${player.maxHp} | 体力: ${player.stamina}/${player.maxStamina} | 法力: ${player.mana}/${player.maxMana}`;
    }

    hideRest() {
        this.restPanel.classList.add('hidden');
    }

    showEvent(event) {
        this.eventPanel.classList.remove('hidden');
        this.eventTitle.textContent = event.name;
        document.getElementById('event-desc').textContent = event.desc;
        
        const eventImage = document.getElementById('event-image');
        if (event.id === 'rescue' && event.icon) {
            eventImage.src = event.icon;
            eventImage.style.display = 'block';
            eventImage.style.filter = 'blur(0px) drop-shadow(0 0 15px rgba(255, 255, 255, 0.8))';
            eventImage.style.borderRadius = '50%';
            eventImage.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(100, 200, 255, 0.3)';
        } else {
            eventImage.style.display = 'none';
        }
        
        this.eventOptionsEl.innerHTML = '';
        event.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.textContent = option.text;
            btn.addEventListener('click', () => this.game.selectEventOption(index));
            this.eventOptionsEl.appendChild(btn);
        });
    }

    hideEvent() {
        this.eventPanel.classList.add('hidden');
    }

    showGameOver() {
        this.gameOver.classList.remove('hidden');
        document.getElementById('death-message').textContent = 
            `你到达了第 ${this.game.currentFloor} 层...`;
    }

    hideGameOver() {
        this.gameOver.classList.add('hidden');
    }

    showVictory() {
        this.victory.classList.remove('hidden');
    }

    hideVictory() {
        this.victory.classList.add('hidden');
    }

    showSettings() {
        this.settingsPanel.classList.remove('hidden');
    }

    hideSettings() {
        this.settingsPanel.classList.add('hidden');
    }

    showChangelog() {
        const panel = document.getElementById('changelog-panel');
        const content = document.getElementById('changelog-content');
        const changelogText = window.CHANGELOG_TEXT || '暂无更新日志';
        content.innerHTML = changelogText.replace(/\n/g, '<br>');
        panel.classList.remove('hidden');
    }

    hideChangelog() {
        const panel = document.getElementById('changelog-panel');
        panel.classList.add('hidden');
    }

    setBackgroundClass(floor) {
        const bgClass = FLOOR_DATA[floor]?.bgClass || 'floor-bg-1';
        this.gameScreen.className = `game-screen ${bgClass}`;
    }

    showDebugConsole() {
        if (!this.debugConsole) return;
        this.debugConsole.classList.remove('hidden');
        this.currentDebugTab = 'skills';
        this.updateDebugContent();
    }

    hideDebugConsole() {
        if (this.debugConsole) {
            this.debugConsole.classList.add('hidden');
        }
    }

    initDebugConsoleDraggable() {
        const console = this.debugConsole;
        if (!console) return;

        let isDragging = false;
        let offsetX, offsetY;

        const header = console.querySelector('.debug-header');
        if (!header) return;

        const onMouseDown = (e) => {
            if (e.target.closest('button') || e.target.closest('input')) return;
            isDragging = true;
            console.classList.add('dragging');
            offsetX = e.clientX - console.offsetLeft;
            offsetY = e.clientY - console.offsetTop;
            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;
            const container = document.getElementById('game-container');
            if (container) {
                const containerRect = container.getBoundingClientRect();
                newX = Math.max(containerRect.left, Math.min(newX, containerRect.right - console.offsetWidth));
                newY = Math.max(containerRect.top, Math.min(newY, containerRect.bottom - console.offsetHeight));
            }
            console.style.left = newX + 'px';
            console.style.top = newY + 'px';
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                console.classList.remove('dragging');
            }
        };

        header.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    bindDebugTabEvents() {
        const tabs = document.querySelectorAll('.debug-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentDebugTab = tab.dataset.tab;
                this.updateDebugContent();
            });
        });
    }

    bindDebugSearchEvents() {
        const searchInput = document.getElementById('debug-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.updateDebugContent(searchInput.value);
            });
        }
    }

    updateDebugContent(searchTerm = '') {
        const content = document.getElementById('debug-content');
        if (!content) return;

        content.innerHTML = '';
        const term = searchTerm.toLowerCase();

        let items = [];
        if (this.currentDebugTab === 'skills') {
            items = SKILL_POOL.filter(s => !term || s.name.toLowerCase().includes(term) || s.description.toLowerCase().includes(term));
        } else if (this.currentDebugTab === 'relics') {
            items = RELIC_POOL.filter(r => !term || r.name.toLowerCase().includes(term) || r.description.toLowerCase().includes(term));
        } else if (this.currentDebugTab === 'pets') {
            const specialPets = [
                { id: 100, name: '鱼儿木', type: 'yueremu', description: '半鱼半植物的生物，每回合可以治愈角色当前层数点血', icon: 'assets/images/yuermu.png', rarity: 'legendary' },
                { id: 101, name: '猫宁', type: 'maoning', description: '死里逃生的小猫，觉醒操纵阴影的能力，每回合随机给一个敌人挂2层破防', icon: 'assets/images/maoning1.png', rarity: 'legendary' },
                { id: 102, name: '滑稽', type: 'humor', description: '一个巨大的漂浮的滑稽脸，可以给角色提供滑稽BUFF', icon: '🤪', rarity: 'legendary' },
                { id: 103, name: '渡鸦', type: 'raven', description: '一只漆黑的渡鸦，每回合可以给与角色速度加成', icon: 'assets/images/duya.png', rarity: 'legendary' }
            ];
            items = specialPets.filter(p => !term || p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
        } else if (this.currentDebugTab === 'events') {
            items = RANDOM_EVENTS.filter(e => !term || e.name.toLowerCase().includes(term) || e.desc.toLowerCase().includes(term));
        } else if (this.currentDebugTab === 'stats') {
            this.renderDebugStats(content);
            return;
        } else if (this.currentDebugTab === 'floor') {
            this.renderDebugFloor(content);
            return;
        }

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'debug-item';
            
            if (this.currentDebugTab === 'events') {
                const eventIconHtml = item.icon && item.icon.endsWith('.png')
                    ? `<img src="${item.icon}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: contain;">`
                    : `<span class="debug-item-icon">${item.icon}</span>`;
                div.innerHTML = `
                    ${eventIconHtml}
                    <div class="debug-item-info">
                        <div class="debug-item-name">${item.name}</div>
                        <div class="debug-item-desc">${item.desc}</div>
                    </div>
                `;
                div.addEventListener('click', () => {
                    audioManager.playClick();
                    this.game.triggerDebugEvent(item);
                });
            } else {
                const itemIconHtml = item.icon && item.icon.endsWith('.png')
                    ? `<img src="${item.icon}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: contain;">`
                    : `<span class="debug-item-icon">${item.icon}</span>`;
                div.innerHTML = `
                    ${itemIconHtml}
                    <div class="debug-item-info">
                        <div class="debug-item-name">${item.name}</div>
                        <div class="debug-item-desc">${item.description}</div>
                    </div>
                    <span class="debug-item-rarity ${item.rarity}">${item.rarity}</span>
                `;
                div.addEventListener('click', () => {
                    audioManager.playClick();
                    this.game.obtainDebugItem(this.currentDebugTab, item);
                });
            }
            content.appendChild(div);
        });

        if (items.length === 0) {
            content.innerHTML = '<div style="color:#666;text-align:center;padding:20px;">未找到相关内容</div>';
        }
    }

    renderDebugStats(content) {
        const player = this.game.playerTeam[0];
        if (!player) return;

        const stats = [
            { key: 'maxHp', label: '最大生命', value: player.maxHp },
            { key: 'hp', label: '当前生命', value: player.hp },
            { key: 'atk', label: '攻击力', value: player.atk },
            { key: 'def', label: '防御力', value: player.def },
            { key: 'spd', label: '速度', value: player.spd },
            { key: 'crit', label: '暴击率', value: player.crit },
            { key: 'critDmg', label: '暴击伤害', value: player.critDmg },
            { key: 'maxStamina', label: '最大体力', value: player.maxStamina },
            { key: 'maxMana', label: '最大法力', value: player.maxMana }
        ];

        stats.forEach(stat => {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px;border-bottom:1px solid #333;';
            row.innerHTML = `
                <span style="color:#ccc;">${stat.label}</span>
                <div style="display:flex;align-items:center;gap:5px;">
                    <button class="debug-stat-btn" data-stat="${stat.key}" data-action="dec" style="width:24px;height:24px;border-radius:4px;border:1px solid #555;background:#333;color:#fff;cursor:pointer;">-</button>
                    <input type="number" class="debug-stat-input" data-stat="${stat.key}" value="${stat.value}" style="width:50px;padding:4px;text-align:center;background:#222;border:1px solid #444;color:#fff;border-radius:4px;">
                    <button class="debug-stat-btn" data-stat="${stat.key}" data-action="inc" style="width:24px;height:24px;border-radius:4px;border:1px solid #555;background:#333;color:#fff;cursor:pointer;">+</button>
                </div>
            `;
            content.appendChild(row);
        });

        const resetBtn = document.createElement('button');
        resetBtn.textContent = '重置属性';
        resetBtn.style.cssText = 'width:100%;padding:10px;margin-top:15px;background:#c0392b;border:none;border-radius:4px;color:#fff;cursor:pointer;font-size:14px;';
        resetBtn.onclick = () => {
            player.maxHp = 120;
            player.hp = 120;
            player.atk = 15;
            player.def = 8;
            player.spd = 12;
            player.crit = 8;
            player.critDmg = 150;
            player.maxStamina = 80;
            player.maxMana = 120;
            player.level = 1;
            this.renderDebugStats(content);
        };
        content.appendChild(resetBtn);

        const inputs = content.querySelectorAll('.debug-stat-input');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                const statKey = input.dataset.stat;
                let newValue = parseInt(input.value) || 1;
                if (statKey === 'maxHp' || statKey === 'hp') {
                    newValue = Math.max(1, newValue);
                } else if (statKey === 'atk' || statKey === 'def' || statKey === 'spd' || statKey === 'crit' || statKey === 'level') {
                    newValue = Math.max(1, newValue);
                } else if (statKey === 'critDmg') {
                    newValue = Math.max(100, newValue);
                } else {
                    newValue = Math.max(0, newValue);
                }
                player[statKey] = newValue;
                this.renderDebugStats(content);
            });
        });

        const btns = content.querySelectorAll('.debug-stat-btn');
        btns.forEach(btn => {
            btn.onclick = () => {
                const statKey = btn.dataset.stat;
                const action = btn.dataset.action;
                const change = action === 'inc' ? 1 : -1;
                
                if (statKey === 'maxHp' || statKey === 'hp') {
                    player[statKey] = Math.max(1, player[statKey] + change * 10);
                } else if (statKey === 'atk' || statKey === 'def' || statKey === 'spd') {
                    player[statKey] = Math.max(1, player[statKey] + change);
                } else if (statKey === 'crit' || statKey === 'level') {
                    player[statKey] = Math.max(1, player[statKey] + change);
                } else if (statKey === 'critDmg') {
                    player[statKey] = Math.max(100, player[statKey] + change * 10);
                } else {
                    player[statKey] = Math.max(0, player[statKey] + change);
                }
                this.renderDebugStats(content);
            };
        });
    }

    renderDebugFloor(content) {
        const currentFloor = this.game.currentFloor;
        
        const floorSection = document.createElement('div');
        floorSection.style.cssText = 'padding:15px;';
        floorSection.innerHTML = `
            <div style="color:#ccc;font-size:14px;margin-bottom:15px;">当前层数: 第 ${currentFloor} 层</div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:15px;">
                <label style="color:#ccc;">转移到第 </label>
                <input type="number" id="debug-floor-input" value="${currentFloor}" min="1" max="60" style="width:60px;padding:8px;text-align:center;background:#222;border:1px solid #444;color:#fff;border-radius:4px;">
                <label style="color:#ccc;"> 层</label>
            </div>
            <button id="btn-transfer-floor" style="width:100%;padding:10px;background:#27ae60;border:none;border-radius:4px;color:#fff;cursor:pointer;font-size:14px;">转移层数</button>
            <div style="margin-top:15px;color:#888;font-size:12px;">提示: 只能在非战斗状态下使用</div>
        `;
        content.appendChild(floorSection);

        const transferBtn = document.getElementById('btn-transfer-floor');
        if (transferBtn) {
            transferBtn.addEventListener('click', () => {
                const floorInput = document.getElementById('debug-floor-input');
                const targetFloor = parseInt(floorInput.value);
                
                if (isNaN(targetFloor) || targetFloor < 1 || targetFloor > 60) {
                    alert('请输入1-60之间的层数');
                    return;
                }
                
                if (this.game.state === 'battle') {
                    alert('战斗中无法转移层数');
                    return;
                }
                
                audioManager.playClick();
                this.game.currentFloor = targetFloor;
                this.game.saveGame();
                this.updateFloor(targetFloor);
                this.hideDebugConsole();
                this.game.showMapSelection();
            });
        }
    }

    showEncyclopedia() {
        const panel = document.getElementById('encyclopedia-panel');
        if (!panel) return;
        panel.classList.remove('hidden');
        this.currentEncyclopediaTab = 'skills';
        this.updateEncyclopediaContent();
    }

    hideEncyclopedia() {
        const panel = document.getElementById('encyclopedia-panel');
        if (panel) panel.classList.add('hidden');
    }

    bindEncyclopediaTabEvents() {
        const tabs = document.querySelectorAll('.encyc-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentEncyclopediaTab = tab.dataset.tab;
                this.updateEncyclopediaContent();
            });
        });
    }

    updateEncyclopediaContent() {
        const content = document.getElementById('encyclopedia-content');
        if (!content) return;
        content.innerHTML = '';

        if (this.currentEncyclopediaTab === 'skills') {
            this.renderEncyclopediaSkills(content);
        } else if (this.currentEncyclopediaTab === 'relics') {
            this.renderEncyclopediaRelics(content);
        } else if (this.currentEncyclopediaTab === 'pets') {
            this.renderEncyclopediaPets(content);
        } else if (this.currentEncyclopediaTab === 'enemies') {
            this.renderEncyclopediaEnemies(content);
        }
    }

getRarityCN(rarity) {
        const map = {
            'common': '普通', 'rare': '稀有', 'uncommon': '罕见', 'epic': '史诗', 'legendary': '传说', 'mythic': '神话',
            'normal': '普通', 'elite': '精英', 'boss': 'BOSS'
        };
        return map[rarity] || rarity;
    }

    renderEncyclopediaSkills(content) {
        content.className = 'encyc-grid';
        SKILL_POOL.forEach(skill => {
            const card = document.createElement('div');
            card.className = `encyc-card ${skill.rarity}`;
            const skillIconHtml = skill.icon && skill.icon.endsWith('.png')
                ? `<img src="${skill.icon}" alt="${skill.name}" style="width: 40px; height: 40px; object-fit: contain;">`
                : `<div class="encyc-card-icon">${skill.icon}</div>`;
            card.innerHTML = `
                ${skillIconHtml}
                <div class="encyc-card-name">${skill.name}</div>
                <div class="encyc-rarity-cn ${skill.rarity}">${this.getRarityCN(skill.rarity)}</div>
            `;
            card.addEventListener('click', () => this.showEncyclopediaDetail(skill.name, skill.icon, this.getRarityCN(skill.rarity), skill.description));
            content.appendChild(card);
        });
    }

    renderEncyclopediaRelics(content) {
        content.className = 'encyc-grid-4';
        RELIC_POOL.forEach(relic => {
            const card = document.createElement('div');
            card.className = 'encyc-card normal';
            const desc = relic.description || '暂无描述';
            card.innerHTML = `
                <div class="encyc-card-icon">${relic.icon}</div>
                <div class="encyc-card-name">${relic.name}</div>
            `;
            card.addEventListener('click', () => this.showEncyclopediaDetail(relic.name, relic.icon, '遗物', desc));
            content.appendChild(card);
        });
    }

    renderEncyclopediaPets(content) {
        content.className = 'encyc-grid-1';
        const specialPets = [
            { id: 100, name: '鱼儿木', type: 'yueremu', description: '半鱼半植物的生物，每回合可以治愈角色当前层数点血，攻击力5，防御力10，生命值150', icon: 'assets/images/yuermu.png', rarity: 'legendary' },
            { id: 101, name: '猫宁', type: 'maoning', description: '死里逃生的小猫，觉醒操纵阴影的能力，每回合随机给一个敌人挂2层破防，攻击力8，防御力8，生命值100', icon: 'assets/images/maoning1.png', rarity: 'legendary' },
            { id: 102, name: '滑稽', type: 'humor', description: '一个巨大的漂浮的滑稽脸，可以给玩家提供滑稽BUFF，攻击力0，防御力20，生命值200', icon: '🤪', rarity: 'legendary' },
            { id: 103, name: '渡鸦', type: 'raven', description: '一只漆黑的渡鸦，每回合给玩家提供2点速度，攻击力15，防御力5，生命值80', icon: 'assets/images/duya.png', rarity: 'legendary' }
        ];
        specialPets.forEach(pet => {
            const card = document.createElement('div');
            card.className = `encyc-card ${pet.rarity}`;
            const petIconHtml = pet.icon && pet.icon.endsWith('.png') 
                ? `<img src="${pet.icon}" alt="${pet.name}" style="width: 50px; height: 50px; object-fit: contain;">`
                : `<div class="encyc-card-icon">${pet.icon}</div>`;
            card.innerHTML = `
                ${petIconHtml}
                <div class="encyc-card-name">${pet.name}</div>
                <div class="encyc-rarity-cn ${pet.rarity}">${this.getRarityCN(pet.rarity)}</div>
            `;
            card.addEventListener('click', () => this.showEncyclopediaDetail(pet.name, pet.icon, this.getRarityCN(pet.rarity), pet.description));
            content.appendChild(card);
        });
    }

    renderEncyclopediaEnemies(content) {
        content.className = 'encyc-grid';
        const enemies = [
            { name: '老鼠', icon: '🐀', type: 'common', desc: '宿舍常见生物' },
            { name: '蟑螂', icon: '🪲', type: 'common', desc: '生命力顽强' },
            { name: '臭虫', icon: '🐛', type: 'common', desc: '令人厌恶' },
            { name: '跳蚤', icon: '🦟', type: 'common', desc: '吸血害虫' },
            { name: '衣蛾', icon: '🦋', type: 'common', desc: '衣服杀手' },
            { name: '螨虫', icon: '🐜', type: 'common', desc: '微小生物' },
            { name: '虱子', icon: '🐝', type: 'common', desc: '寄生生物' },
            { name: '蚊子', icon: '🪰', type: 'common', desc: '嗡嗡作响' },
            { name: '学霸', icon: '👓', type: 'elite', desc: '成绩优异' },
            { name: '纪检', icon: '👮', type: 'elite', desc: '检查纪律' },
            { name: '学生会', icon: '🎫', type: 'elite', desc: '管理学生' },
            { name: '导员', icon: '📋', type: 'elite', desc: '辅导员' },
            { name: '实验员', icon: '🥼', type: 'elite', desc: '科研人员' },
            { name: '酒吧经理', icon: '🎰', type: 'elite', desc: '娱乐场所管理者' },
            { name: '宿舍管理员', icon: '🔑', type: 'boss', desc: '第15层Boss' },
            { name: '176实验体', icon: '🧪', type: 'boss', desc: '第30层Boss' },
            { name: '磨砂迪加老板', icon: '💼', type: 'boss', desc: '第45层Boss' },
            { name: '教导主任', icon: '📏', type: 'boss', desc: '第60层Boss' }
        ];
        enemies.forEach(enemy => {
            const card = document.createElement('div');
            card.className = `encyc-card ${enemy.type}`;
            card.innerHTML = `
                <div class="encyc-card-icon">${enemy.icon}</div>
                <div class="encyc-card-name">${enemy.name}</div>
                <div class="encyc-rarity-cn ${enemy.type}">${this.getRarityCN(enemy.type)}</div>
            `;
            card.addEventListener('click', () => this.showEncyclopediaDetail(enemy.name, enemy.icon, this.getRarityCN(enemy.type), enemy.desc));
            content.appendChild(card);
        });
    }

    showEncyclopediaDetail(name, icon, rarity, description) {
        let popup = document.getElementById('encyc-detail-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'encyc-detail-popup';
            popup.className = 'hidden';
            document.body.appendChild(popup);
        }
        
        popup.innerHTML = `
            <div class="encyc-detail-content">
                <div class="encyc-detail-icon">${icon}</div>
                <div class="encyc-detail-name">${name}</div>
                <div class="encyc-detail-rarity ${rarity}">${rarity}</div>
                <div class="encyc-detail-desc">${description}</div>
                <button class="encyc-detail-close">关闭</button>
            </div>
        `;
        
        popup.classList.remove('hidden');
        popup.querySelector('.encyc-detail-close').addEventListener('click', () => {
            popup.classList.add('hidden');
        });
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.add('hidden');
            }
        });
    }

    renderEncyclopediaRelics(content) {
        RELIC_POOL.forEach(relic => {
            const div = document.createElement('div');
            div.className = 'debug-item';
            div.innerHTML = `
                <span class="debug-item-icon">${relic.icon}</span>
                <div class="debug-item-info">
                    <div class="debug-item-name">${relic.name}</div>
                    <div class="debug-item-desc">${relic.description}</div>
                </div>
            `;
            content.appendChild(div);
        });
    }

    renderEncyclopediaPets(content) {
        const specialPets = [
            { id: 100, name: '鱼儿木', type: 'yueremu', description: '半鱼半植物的生物，每回合可以治愈角色当前层数点血', icon: 'assets/images/yuermu.png', rarity: 'legendary' },
            { id: 101, name: '猫宁', type: 'maoning', description: '死里逃生的小猫，觉醒操纵阴影的能力，每回合随机给一个敌人挂2层破防', icon: 'assets/images/maoning1.png', rarity: 'legendary' },
            { id: 102, name: '滑稽', type: 'humor', description: '一个巨大的漂浮的滑稽脸，可以给角色提供滑稽BUFF', icon: '🤪', rarity: 'legendary' },
            { id: 103, name: '渡鸦', type: 'raven', description: '一只漆黑的渡鸦，每回合可以给玩家提供2点速度', icon: 'assets/images/duya.png', rarity: 'legendary' }
        ];
        specialPets.forEach(pet => {
            const div = document.createElement('div');
            div.className = 'debug-item';
            div.style.cssText = 'flex-direction: row; padding: 12px; gap: 12px;';
            const petIconHtml = pet.icon && pet.icon.endsWith('.png') 
                ? `<img src="${pet.icon}" alt="${pet.name}" style="width: 40px; height: 40px; object-fit: contain;">`
                : `<span class="debug-item-icon" style="font-size:32px;">${pet.icon}</span>`;
            div.innerHTML = `
                ${petIconHtml}
                <div class="debug-item-info" style="flex:1;">
                    <div class="debug-item-name">${pet.name}</div>
                    <div class="debug-item-desc" style="text-align:left;">${pet.description}</div>
                </div>
                <span class="debug-item-rarity ${pet.rarity}">${pet.rarity}</span>
            `;
            content.appendChild(div);
        });
    }

    renderEncyclopediaEnemies(content) {
        const enemies = [
            { name: '老鼠', icon: '🐀', type: 'common', desc: '宿舍常见生物' },
            { name: '蟑螂', icon: '🪲', type: 'common', desc: '生命力顽强' },
            { name: '臭虫', icon: '🐛', type: 'common', desc: '令人厌恶' },
            { name: '跳蚤', icon: '🦟', type: 'common', desc: '吸血害虫' },
            { name: '衣蛾', icon: '🦋', type: 'common', desc: '衣服杀手' },
            { name: '螨虫', icon: '🐜', type: 'common', desc: '微小生物' },
            { name: '虱子', icon: '🐝', type: 'common', desc: '寄生生物' },
            { name: '蚊子', icon: '🪰', type: 'common', desc: '嗡嗡作响' },
            { name: '学霸', icon: '👓', type: 'elite', desc: '成绩优异' },
            { name: '纪检', icon: '👮', type: 'elite', desc: '检查纪律' },
            { name: '学生会', icon: '🎫', type: 'elite', desc: '管理学生' },
            { name: '导员', icon: '📋', type: 'elite', desc: '辅导员' },
            { name: '实验员', icon: '🥼', type: 'elite', desc: '科研人员' },
            { name: '酒吧经理', icon: '🎰', type: 'elite', desc: '娱乐场所管理者' },
            { name: '宿舍管理员', icon: '🔑', type: 'boss', desc: '第15层Boss' },
            { name: '176实验体', icon: '🧪', type: 'boss', desc: '第30层Boss' },
            { name: '磨砂迪加老板', icon: '💼', type: 'boss', desc: '第45层Boss' },
            { name: '教导主任', icon: '📏', type: 'boss', desc: '第60层Boss' }
        ];
        enemies.forEach(enemy => {
            const div = document.createElement('div');
            div.className = 'debug-item';
            div.innerHTML = `
                <span class="debug-item-icon">${enemy.icon}</span>
                <div class="debug-item-info">
                    <div class="debug-item-name">${enemy.name}</div>
                    <div class="debug-item-desc">${enemy.desc}</div>
                </div>
                <span class="debug-item-rarity ${enemy.type}">${enemy.type}</span>
            `;
            content.appendChild(div);
        });
    }
}
