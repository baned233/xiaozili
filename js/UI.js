class UI {
    constructor(game) {
        this.game = game;
        this.initElements();
        this.bindEvents();
        this.initDraggableBattleLog();
    }

    initElements() {
        this.mainMenu = document.getElementById('main-menu');
        this.gameScreen = document.getElementById('game-screen');
        this.floorDisplay = document.getElementById('floor-display');
        this.goldDisplay = document.getElementById('gold-display');
        this.playerPortrait = document.getElementById('player-portrait');
        this.potionBar = document.getElementById('potion-bar');
        this.hpBarFill = document.getElementById('hp-bar-fill');
        this.mapPanel = document.getElementById('map-panel');
        this.pathOptions = document.getElementById('path-options');
        this.playerSide = document.getElementById('player-side');
        this.enemySide = document.getElementById('enemy-side');
        this.skillPanel = document.getElementById('skill-panel');
        this.skillOptions = document.getElementById('skill-options');
        this.shopPanel = document.getElementById('shop-panel');
        this.shopItems = document.getElementById('shop-items');
        this.restPanel = document.getElementById('rest-panel');
        this.eventPanel = document.getElementById('event-panel');
        this.eventTitle = document.getElementById('event-title');
        this.eventDesc = document.getElementById('event-desc');
        this.eventOptionsEl = document.getElementById('event-options');
        this.dialogPanel = document.getElementById('dialog-panel');
        this.dialogText = document.getElementById('dialog-text');
        this.rewardPanel = document.getElementById('reward-panel');
        this.rewardOptions = document.getElementById('reward-options');
        this.gameOver = document.getElementById('game-over');
        this.victory = document.getElementById('victory');
        this.settingsPanel = document.getElementById('settings-panel');
        this.battleArea = document.getElementById('battle-area');
        this.characterPanel = document.getElementById('character-panel');
        this.skillReplacePanel = document.getElementById('skill-replace-panel');
        this.battleLogPanel = document.getElementById('battle-log-panel');
        this.debugConsole = document.getElementById('debug-console');
    }

    bindEvents() {
        document.getElementById('btn-start').addEventListener('click', () => {
            audioManager.playClick();
            this.game.start();
        });
        
        const continueBtn = document.getElementById('btn-continue');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                audioManager.playClick();
                this.game.continue();
            });
        }
        
        document.getElementById('btn-settings').addEventListener('click', () => {
            audioManager.playClick();
            this.showSettings();
        });
        
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
            const stamina = character.stamina !== undefined ? character.stamina : character.maxStamina || 100;
            const maxStamina = character.maxStamina || 100;
            const mana = character.mana !== undefined ? character.mana : character.maxMana || 50;
            const maxMana = character.maxMana || 50;
            
            staminaDisplay.textContent = `💪 ${stamina}/${maxStamina}`;
            manaDisplay.textContent = `💧 ${mana}/${maxMana}`;
        }
        
        this.updateHpBar(character);
    }

    updateHpBar(character) {
        if (this.hpBarFill && character) {
            const hpPercent = character.getHpPercent ? character.getHpPercent() : Math.floor((character.hp / character.maxHp) * 100);
            this.hpBarFill.style.width = `${hpPercent}%`;
            
            if (hpPercent <= 25) {
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
        
        const levelDisplay = document.getElementById('character-level-display');
        if (levelDisplay) levelDisplay.textContent = `等级 ${player.level || 1}`;
        
        document.getElementById('attr-hp').textContent = `${player.hp}/${player.maxHp}`;
        document.getElementById('attr-atk').textContent = player.atk;
        document.getElementById('attr-def').textContent = player.def;
        document.getElementById('attr-spd').textContent = player.spd;
        document.getElementById('attr-crit').textContent = `${player.crit}%`;
        document.getElementById('attr-critdmg').textContent = `${player.critDmg}%`;
        document.getElementById('attr-stamina').textContent = `${player.stamina}/${player.maxStamina}`;
        document.getElementById('attr-mana').textContent = `${player.mana}/${player.maxMana}`;
        
        const relicsList = document.getElementById('relics-list');
        if (relicsList) {
            relicsList.innerHTML = '';
            
            if (player.relics && player.relics.length > 0) {
                player.relics.forEach(relic => {
                    const relicItem = document.createElement('div');
                    relicItem.className = 'relic-item';
                    relicItem.innerHTML = `
                        <span class="relic-icon">${relic.icon}</span>
                        <div class="relic-tooltip">
                            <div class="tooltip-name">${relic.name}</div>
                            <div class="tooltip-desc">${relic.description}</div>
                        </div>
                    `;
                    relicsList.appendChild(relicItem);
                });
            } else {
                relicsList.innerHTML = '<div style="color:#666;font-size:12px;">暂无遗物</div>';
            }
        }
        
        const petList = document.getElementById('pet-list');
        if (petList) {
            petList.innerHTML = '';
            
            if (player.pets && player.pets.length > 0) {
                player.pets.forEach(pet => {
                    const petItem = document.createElement('div');
                    petItem.className = 'pet-item';
                    const petDesc = pet.specialAbility ? pet.specialAbility.description : pet.description || '';
                    petItem.innerHTML = `
                        <span class="pet-icon">${pet.icon}</span>
                        <div class="pet-tooltip">
                            <div class="tooltip-name">${pet.name}</div>
                            <div class="tooltip-desc">${petDesc}</div>
                            <div class="tooltip-stats">血量: ${pet.hp}/${pet.maxHp}</div>
                        </div>
                    `;
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
            const btn = document.createElement('button');
            btn.className = `replace-skill-btn ${Skill.getRarityColor(skill.rarity)}`;
            btn.innerHTML = `
                <span class="skill-icon">${skill.icon}</span>
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
            
            if (log.type === 'enemyAttack') {
                entry.textContent = `${log.enemy} 攻击 ${log.target} 造成 ${log.damage} 伤害${log.isCrit ? ' (暴击!)' : ''}`;
                entry.classList.add('enemy-action');
            } else if (log.type === 'enemySkill') {
                entry.textContent = `${log.enemy} 使用 ${log.skill} 攻击 ${log.target}`;
                if (log.result && log.result.damage) {
                    entry.textContent += ` 造成 ${log.result.damage} 伤害`;
                    entry.classList.add('enemy-action');
                } else if (log.result && log.result.heal) {
                    entry.textContent += ` 恢复 ${log.result.heal} 生命`;
                    entry.classList.add('enemy-action');
                }
            } else if (log.type === 'skill') {
                entry.textContent = `${log.character} 使用 ${log.skill}`;
                if (log.result && log.result.damage) {
                    entry.textContent += ` 攻击 ${log.target} 造成 ${log.result.damage} 伤害`;
                    entry.classList.add('player-action');
                } else if (log.result && log.result.heal) {
                    entry.textContent += ` 恢复 ${log.result.heal} 生命`;
                    entry.classList.add('player-action');
                }
            } else if (log.type === 'death') {
                entry.textContent = `${log.target} 被击败!`;
                entry.classList.add('enemy-action');
            } else if (log.type === 'reward') {
                entry.textContent = `获得 ${log.exp} 经验, ${log.gold} 金币`;
            } else if (log.type === 'drop') {
                entry.textContent = `掉落: ${log.item}`;
            } else if (log.type === 'pet') {
                entry.textContent = `获得宠物: ${log.item}`;
            }
            
            if (entry.textContent) {
                logContent.appendChild(entry);
            }
        });
        
        logContent.scrollTop = logContent.scrollHeight;
    }

    showMapPanel(paths, floor = 1) {
        this.mapPanel.classList.remove('hidden');
        this.battleArea.classList.add('hidden');
        this.skillPanel.classList.add('hidden');
        this.pathOptions.innerHTML = '';
        
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
            option.innerHTML = `
                <div class="path-icon">${path.icon}</div>
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

    showBattleArea() {
        this.mapPanel.classList.add('hidden');
        this.battleArea.classList.remove('hidden');
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
        card.className = `character-card ${char.isDead ? 'dead' : ''} ${isActive ? 'active' : ''}`;
        card.id = `char-${char.id}`;
        
        let iconHtml = '';
        if (char.image) {
            iconHtml = `<img src="${char.image}" style="width:100%;height:100%;object-fit:cover;border-radius:9px;" onerror="this.style.display='none';this.parentNode.innerHTML='${char.icon}'">`;
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
                buffsHtml += `<div class="buff-icon ${buff.type}" data-buff="${buff.name}" data-stacks="${buff.stacks}" data-description="${buff.description}" title="${buff.name} (${buff.stacks}层)">${buff.icon}</div>`;
            });
            buffsHtml += `</div>`;
        }
        
        card.innerHTML = `
            <div class="character-icon battle-entity">${iconHtml}</div>
            ${buffsHtml}
            <div class="battle-status-bar">
                <div class="status-name">${char.name}</div>
                <div class="status-hp-bar">
                    <div class="status-hp-fill ${hpClass}" style="width: ${hpPercent}%"></div>
                </div>
                <div class="status-hp-text">HP: ${char.hp}/${char.maxHp}</div>
                <div class="status-attrs">
                    <span class="attr-atk">⚔️${char.atk}</span>
                    <span class="attr-def">🛡️${char.def}</span>
                    <span class="attr-spd">⚡${char.spd}</span>
                </div>
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
                buffsHtml += `<div class="buff-icon ${buff.type}" data-buff="${buff.name}" data-stacks="${buff.stacks}" data-description="${buff.description}" title="${buff.name} (${buff.stacks}层)">${buff.icon}</div>`;
            });
            buffsHtml += `</div>`;
        }
        
        card.innerHTML = `
            <div class="enemy-icon battle-entity">${enemyIcon}</div>
            ${buffsHtml}
            <div class="battle-status-bar">
                <div class="status-name">${enemy.name}</div>
                <div class="status-hp-bar">
                    <div class="status-hp-fill ${hpClass}" style="width: ${hpPercent}%"></div>
                </div>
                <div class="status-hp-text">HP: ${enemy.hp}/${enemy.maxHp}</div>
                <div class="status-attrs">
                    <span class="attr-atk">⚔️${enemy.atk}</span>
                    <span class="attr-def">🛡️${enemy.def}</span>
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
        return `<div style="font-size:28px">${icons[Math.floor(Math.random() * icons.length)]}</div>`;
    }

    showDamageEffect(target, result, isPlayer = false, skill = null, isHeal = false) {
        const cardId = isPlayer ? `char-${target.id}` : `enemy-${target.id}`;
        let card = document.getElementById(cardId);
        
        if (!card) {
            this.updateBattleUI();
            card = document.getElementById(cardId);
        }
        
        if (!card) return;
        
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
            const canUse = skill.canUse(character);
            const costType = skill.getCostType();
            const cost = skill.getCost();
            const costIcon = costType === 'mana' ? '💧' : '💪';
            const costColor = canUse ? '#fff' : '#e74c3c';
            
            const shortDesc = skill.description.split('，')[0].split(',')[0];
            
            const btn = document.createElement('button');
            btn.className = `skill-btn ${Skill.getRarityColor(skill.rarity)} ${!canUse ? 'disabled' : ''}`;
            btn.innerHTML = `
                <span class="skill-icon">${skill.icon}</span>
                <span class="skill-name">${skill.name}</span>
                <span class="skill-desc">${shortDesc}</span>
                <span class="skill-cost" style="color:${costColor}">${costIcon} ${cost}</span>
                <div class="skill-tooltip">
                    <div class="tooltip-name">${skill.name}</div>
                    <div class="tooltip-type">${skill.type === 'attack' ? '攻击技能' : skill.type === 'heal' ? '治疗技能' : skill.type === 'defense' ? '防御技能' : skill.type === 'buff' ? '增益技能' : skill.type === 'summon' ? '召唤技能' : skill.type === 'debuff' ? '减益技能' : skill.type === 'fear' ? '恐惧技能' : skill.type === 'mark' ? '标记技能' : skill.type === 'banish' ? '放逐技能' : skill.type === 'passive' ? '被动技能' : '被动技能'}</div>
                    <div class="tooltip-desc">${skill.description}</div>
                    <div class="tooltip-effect">${skill.power ? `伤害: ${skill.power}` : ''}${skill.heal ? `治疗: ${skill.heal}` : ''}${skill.defense ? `防御: ${skill.defense}` : ''}</div>
                    <div class="tooltip-cost">消耗: ${costIcon} ${cost} ${costType === 'mana' ? '法力' : '体力'}</div>
                </div>
            `;
            btn.addEventListener('click', () => this.game.selectSkill(index));
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

    showDialog(text, callback) {
        this.dialogPanel.classList.remove('hidden');
        this.dialogText.textContent = text;
        
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
                option.classList.add(Skill.getRarityColor(skill.rarity));
                option.innerHTML = `
                    <div class="reward-icon">${skill.icon}</div>
                    <div class="reward-name">${skill.name}</div>
                    <div class="reward-desc">${shortDesc}</div>
                `;
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
        skipDiv.textContent = '跳过奖励 (+10金币)';
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
            
            if (!item.sold && canAfford) {
                div.addEventListener('click', () => this.game.buyItem(index));
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
                { id: 100, name: '鱼儿木', type: 'yueremu', description: '半鱼半植物的生物，每回合可以治愈角色10滴血', icon: '🌿🐟', rarity: 'legendary' },
                { id: 101, name: '猫宁', type: 'maoning', description: '死里逃生的小猫，觉醒操纵阴影的能力，每回合有50%概率束缚一只怪物', icon: '🐱‍👤', rarity: 'legendary' },
                { id: 102, name: '滑稽', type: 'humor', description: '一个巨大的漂浮的滑稽脸，敌人80%概率以它作为目标', icon: '🤪', rarity: 'legendary' },
                { id: 103, name: '渡鸦', type: 'raven', description: '一只漆黑的渡鸦，每回合随机偷取怪物技能进行攻击', icon: '🐦‍⬛', rarity: 'legendary' }
            ];
            items = specialPets.filter(p => !term || p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
        }

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'debug-item';
            div.innerHTML = `
                <span class="debug-item-icon">${item.icon}</span>
                <div class="debug-item-info">
                    <div class="debug-item-name">${item.name}</div>
                    <div class="debug-item-desc">${item.description}</div>
                </div>
                <span class="debug-item-rarity ${item.rarity}">${item.rarity}</span>
            `;
            div.addEventListener('click', () => {
                audioManager.playClick();
                this.game.obtainDebugItem(this.currentDebugTab, item);
                this.hideDebugConsole();
            });
            content.appendChild(div);
        });

        if (items.length === 0) {
            content.innerHTML = '<div style="color:#666;text-align:center;padding:20px;">未找到相关内容</div>';
        }
    }
}
