// ==UserScript==
// @name         Minefun.io Visual Keyboard
// @namespace    https://github.com/EverlastingUc
// @version      1.0.0
// @description  Shows pressed keys. Alt+Ctrl+K toggle.
// @author       Everlasting
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=minefun.io
// @icon64       https://www.google.com/s2/favicons?sz=64&domain=minefun.io
// @match        *://*.minefun.io/*
// @grant        none
// @run-at       document-idle
// @game         Minefun.io
// @homepage     https://github.com/EverlastingUc/Minefun.io-Visual-Keyboard
// @supportURL   https://guns.lol/everlasting_uc
// @supportURL   mailto:everlastinguchiha@gmail.com
// @downloadURL  https://raw.githubusercontent.com/EverlastingUc/Minefun.io-Visual-Keyboard/main/keyboard.user.js
// @updateURL    https://raw.githubusercontent.com/EverlastingUc/Minefun.io-Visual-Keyboard/main/keyboard.user.js
// @made on      29-06-2026 12:00 AM IST
// @last updated 29-06-2026 12:00 AM IST
// @note         MIT License - Placed at the very bottom of this script.
// ==/UserScript==

// START

(function() {
    'use strict';

    const defTheme = {
        accent: '#0ff',
        panelBg: '#0a0a1a',
        panelDark: '#05050f',
        text: '#e0e0ff',
        dim: '#8888aa'
    };

    let visible = false;
    let posX = 100, posY = 100;
    let scale = 0.6;
    let keyBgColor = '#111';
    let keyActiveColor = '#0ff';
    let keyTextColor = '#e0e0ff';
    let keyTextActive = '#000';
    let useGradient = false;
    let gradientMode = 'active';
    let gradientStart = '#0ff';
    let gradientEnd = '#f0f';
    let panelOpacity = 0.95;
    let keyOpacity = 0.9;
    let glowEnabled = true;
    let shadowEnabled = false;
    let panelGlowEnabled = true;
    let keyAnimation = 'lift';
    let animSpeed = 100;
    let bgImage = null;
    let usePanelGradient = false;

    try {
        visible = localStorage.getItem('vk_visible') === 'true';
        posX = parseInt(localStorage.getItem('vk_x')) || 100;
        posY = parseInt(localStorage.getItem('vk_y')) || 100;
        scale = parseFloat(localStorage.getItem('vk_scale')) || 0.6;
        keyBgColor = localStorage.getItem('vk_keyBg') || '#111';
        keyActiveColor = localStorage.getItem('vk_keyActive') || '#0ff';
        keyTextColor = localStorage.getItem('vk_keyText') || '#e0e0ff';
        keyTextActive = localStorage.getItem('vk_keyTextActive') || '#000';
        useGradient = localStorage.getItem('vk_useGradient') === 'true';
        gradientMode = localStorage.getItem('vk_gradientMode') || 'active';
        gradientStart = localStorage.getItem('vk_gradientStart') || '#0ff';
        gradientEnd = localStorage.getItem('vk_gradientEnd') || '#f0f';
        panelOpacity = parseFloat(localStorage.getItem('vk_opacity')) || 0.95;
        keyOpacity = parseFloat(localStorage.getItem('vk_keyOpacity')) || 0.9;
        glowEnabled = localStorage.getItem('vk_glowEnabled') !== 'false';
        shadowEnabled = localStorage.getItem('vk_shadowEnabled') === 'true';
        panelGlowEnabled = localStorage.getItem('vk_panelGlowEnabled') !== 'false';
        keyAnimation = localStorage.getItem('vk_animation') || 'lift';
        animSpeed = parseInt(localStorage.getItem('vk_anim_speed')) || 100;
        usePanelGradient = localStorage.getItem('vk_usePanelGradient') === 'true';
        bgImage = localStorage.getItem('vk_bgImage') || null;
    } catch(e) {}

    const activeKeys = new Set();
    let panel = null;
    let settingsModal = null;
    let drag = false, offX = 0, offY = 0;
    let dragModal = false, modalOffX = 0, modalOffY = 0;

    const rows = [
        ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
        ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
        ['CapsLock', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
        ['ShiftLeft', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'ShiftRight'],
        ['ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'ControlRight']
    ];

    const keyWidths = {
        'Space': 200, 'Backspace': 80, 'Enter': 80, 'ShiftLeft': 90, 'ShiftRight': 90,
        'CapsLock': 80, 'Tab': 65, 'ControlLeft': 55, 'ControlRight': 55,
        'MetaLeft': 55, 'AltLeft': 55, 'AltRight': 55
    };

    const displayNames = {
        'ShiftLeft': 'Shift', 'ShiftRight': 'Shift',
        'ControlLeft': 'Ctrl', 'ControlRight': 'Ctrl',
        'MetaLeft': 'Win',
        'AltLeft': 'Alt', 'AltRight': 'Alt',
        'Backspace': '⌫', 'Enter': '↵', 'CapsLock': '⇪', 'Tab': '⇥'
    };

    function getDisplayKey(keyCode) {
        return displayNames[keyCode] || (keyCode.length === 1 ? keyCode : keyCode);
    }

    function normalizeKey(code) {
        if (code === 'MetaRight') return 'MetaLeft';
        const symbolMap = {
            'Backquote': '`', 'Minus': '-', 'Equal': '=', 'BracketLeft': '[', 'BracketRight': ']',
            'Backslash': '\\', 'Semicolon': ';', 'Quote': "'", 'Comma': ',', 'Period': '.', 'Slash': '/'
        };
        if (symbolMap[code]) return symbolMap[code];
        if (code === 'ShiftLeft') return 'ShiftLeft';
        if (code === 'ShiftRight') return 'ShiftRight';
        if (code === 'ControlLeft') return 'ControlLeft';
        if (code === 'ControlRight') return 'ControlRight';
        if (code === 'AltLeft') return 'AltLeft';
        if (code === 'AltRight') return 'AltRight';
        if (code === 'MetaLeft') return 'MetaLeft';
        if (code === 'Space') return 'Space';
        if (code === 'Backspace') return 'Backspace';
        if (code === 'Enter') return 'Enter';
        if (code === 'Tab') return 'Tab';
        if (code === 'CapsLock') return 'CapsLock';
        if (code.startsWith('Key')) return code.slice(3);
        if (code.startsWith('Digit')) return code.slice(5);
        return code;
    }

    function hexToRgb(hex) {
        let r=0,g=0,b=0;
        if (hex.startsWith('#')) {
            r = parseInt(hex.slice(1,3),16);
            g = parseInt(hex.slice(3,5),16);
            b = parseInt(hex.slice(5,7),16);
        }
        return `${r},${g},${b}`;
    }

    function getKeyBg(isActive = false) {
        if (useGradient) {
            if (gradientMode === 'active') {
                return `linear-gradient(145deg, ${gradientStart}, ${gradientEnd})`;
            }
            if (gradientMode === 'inactive' && isActive) {
                return `linear-gradient(145deg, ${gradientStart}, ${gradientEnd})`;
            }
        }
        let color = isActive ? keyActiveColor : keyBgColor;
        return `rgba(${hexToRgb(color)}, ${keyOpacity})`;
    }

    function getKeyTextColor(isActive) {
        return isActive ? keyTextActive : keyTextColor;
    }

    function getPanelBackground() {
        if (bgImage) {
            return `linear-gradient(rgba(10,10,26,${1-panelOpacity}), rgba(10,10,26,${1-panelOpacity})), url("${bgImage}") center/cover no-repeat`;
        }
        if (usePanelGradient) {
            return `linear-gradient(145deg, ${gradientStart}, ${gradientEnd})`;
        }
        return `rgba(10,10,26,${panelOpacity})`;
    }

    function getPanelBoxShadow() {
        let shadows = [];
        if (panelGlowEnabled) shadows.push(`0 0 8px ${defTheme.accent}`);
        if (shadowEnabled) shadows.push('0 8px 20px rgba(0,0,0,0.5)');
        return shadows.length ? shadows.join(', ') : 'none';
    }

    function applyAnimation(el, type, speed) {
        if (!el) return;
        const dur = speed;
        const extra = 50;
        switch(type) {
            case 'bounce':
                el.style.transition = `transform ${dur}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
                el.style.transform = 'translateY(-4px) scale(1.05)';
                setTimeout(() => { if (el) el.style.transform = ''; }, dur + 80);
                break;
            case 'rotate':
                el.style.transition = `transform ${dur}ms ease`;
                el.style.transform = 'rotate(15deg) scale(1.1)';
                setTimeout(() => { if (el) el.style.transform = ''; }, dur + 40);
                break;
            case 'pulse':
                el.style.transition = `transform ${dur}ms ease`;
                el.style.transform = 'scale(1.2)';
                setTimeout(() => { if (el) el.style.transform = ''; }, dur + 40);
                break;
            case 'shake':
                el.style.transition = `transform ${dur/2}ms ease`;
                el.style.transform = 'translateX(5px)';
                setTimeout(() => {
                    if (el) {
                        el.style.transform = 'translateX(-5px)';
                        setTimeout(() => { if (el) el.style.transform = ''; }, dur/2 + extra);
                    }
                }, dur/2);
                break;
            case 'wobble':
                el.style.transition = `transform ${dur/2}ms ease`;
                el.style.transform = 'translateX(-4px) rotate(-5deg)';
                setTimeout(() => {
                    if (el) {
                        el.style.transform = 'translateX(4px) rotate(5deg)';
                        setTimeout(() => { if (el) el.style.transform = ''; }, dur/2 + extra);
                    }
                }, dur/2);
                break;
            default:
                el.style.transition = `transform ${dur}ms ease`;
                el.style.transform = 'translateY(3px) scale(0.95)';
                setTimeout(() => { if (el) el.style.transform = ''; }, dur + 40);
        }
    }

    function resetKey(el) {
        if (!el) return;
        el.style.transform = '';
    }

    function buildKeyboard() {
        if (panel) panel.remove();
        panel = document.createElement('div');
        panel.id = 'vk-overlay';
        const panelBg = getPanelBackground();
        panel.style.cssText = `
            position: fixed; left: ${posX}px; top: ${posY}px;
            background: ${panelBg};
            border: 1px solid ${defTheme.accent};
            border-radius: 10px; padding: 6px;
            z-index: 2147483647; user-select: none;
            transform: scale(${scale}); transform-origin: top left;
            box-shadow: ${getPanelBoxShadow()};
            font-family: 'Segoe UI', monospace;
            display: ${visible ? 'block' : 'none'};
            cursor: grab;
        `;

        const header = document.createElement('div');
        header.style.cssText = `display: flex; justify-content: flex-end; margin-bottom: 4px; padding: 0 4px; cursor: grab;`;
        const settingsBtn = document.createElement('span');
        settingsBtn.textContent = '⚙️';
        settingsBtn.setAttribute('data-settings-btn', 'true');
        settingsBtn.style.cssText = 'cursor: pointer; opacity: 0.7; font-size: 9px;';
        settingsBtn.onclick = (e) => { e.stopPropagation(); toggleSettings(); };
        header.appendChild(settingsBtn);
        panel.appendChild(header);

        rows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.style.display = 'flex';
            rowDiv.style.gap = '2px';
            rowDiv.style.marginBottom = '2px';
            rowDiv.style.justifyContent = 'center';
            row.forEach(keyCode => {
                const keyDiv = document.createElement('div');
                keyDiv.className = 'vk-key';
                keyDiv.dataset.key = keyCode;
                const w = keyWidths[keyCode] || 28;
                keyDiv.style.cssText = `
                    width: ${w}px; height: 28px;
                    background: ${getKeyBg(false)};
                    border: 1px solid ${defTheme.accent};
                    border-radius: 5px; display: flex; align-items: center;
                    justify-content: center; font-size: 9px; font-weight: bold;
                    color: ${getKeyTextColor(false)}; transition: background 0.05s ease, color 0.05s ease;
                    box-shadow: ${glowEnabled ? `0 0 4px ${defTheme.accent}` : 'none'};
                `;
                keyDiv.textContent = getDisplayKey(keyCode);
                rowDiv.appendChild(keyDiv);
            });
            panel.appendChild(rowDiv);
        });

        document.body.appendChild(panel);
        attachDragEvents();
        activeKeys.forEach(code => updateKeyState(code, true, true));
    }

    function attachDragEvents() {
        if (!panel) return;
        panel.addEventListener('mousedown', (e) => {
            if (e.target.closest('.vk-key') || e.target.closest('[data-settings-btn]')) return;
            drag = true;
            const rect = panel.getBoundingClientRect();
            offX = (e.clientX - rect.left) / scale;
            offY = (e.clientY - rect.top) / scale;
            panel.style.cursor = 'grabbing';
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!drag) return;
            let newLeft = e.clientX - offX * scale;
            let newTop = e.clientY - offY * scale;
            newLeft = Math.min(Math.max(0, newLeft), window.innerWidth - panel.offsetWidth * scale);
            newTop = Math.min(Math.max(0, newTop), window.innerHeight - panel.offsetHeight * scale);
            panel.style.left = newLeft + 'px';
            panel.style.top = newTop + 'px';
        });
        document.addEventListener('mouseup', () => {
            if (drag) {
                drag = false;
                const rect = panel.getBoundingClientRect();
                posX = rect.left; posY = rect.top;
                localStorage.setItem('vk_x', posX);
                localStorage.setItem('vk_y', posY);
                if (panel) panel.style.cursor = 'grab';
            }
        });
    }

    function updateKeyState(code, pressed, skipAnimation = false) {
        if (!panel) return;
        const keyCode = normalizeKey(code);
        const keys = panel.querySelectorAll(`.vk-key[data-key="${keyCode}"]`);
        keys.forEach(k => {
            if (pressed) {
                k.style.background = getKeyBg(true);
                k.style.color = getKeyTextColor(true);
                k.style.boxShadow = glowEnabled ? `0 0 8px ${defTheme.accent}` : 'none';
                if (!skipAnimation) applyAnimation(k, keyAnimation, animSpeed);
            } else {
                k.style.background = getKeyBg(false);
                k.style.color = getKeyTextColor(false);
                k.style.boxShadow = glowEnabled ? `0 0 2px ${defTheme.accent}` : 'none';
                resetKey(k);
            }
        });
    }

    let scrollStyleAdded = false;
    function buildSettingsModal() {
        if (settingsModal) settingsModal.remove();
        settingsModal = document.createElement('div');
        settingsModal.id = 'vk-settings';
        settingsModal.style.cssText = `
            position: fixed; top: 200px; left: 200px; width: 320px;
            background: ${defTheme.panelBg}; border: 1px solid ${defTheme.accent};
            border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.5), ${defTheme.accent} 0 0 8px;
            z-index: 2147483648; font-family: 'Segoe UI', sans-serif;
            font-size: 12px; display: none; flex-direction: column;
            backdrop-filter: blur(4px);
        `;
        settingsModal.innerHTML = `
            <div class="vk-settings-header" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: ${defTheme.panelDark}; border-bottom: 1px solid ${defTheme.accent}; cursor: move;">
                <span style="color: ${defTheme.accent}; font-weight: bold;">⚙️ SETTINGS</span>
                <button id="vk-settings-close" style="background: none; border: none; color: ${defTheme.dim}; cursor: pointer; font-size: 14px;">✕</button>
            </div>
            <div style="padding: 12px; max-height: 60vh; overflow-y: auto;">
                <div style="margin-bottom:12px;"><label style="color: ${defTheme.text}; font-size: 10px;">SIZE</label><input type="range" id="vk-scale" min="0.4" max="1.2" step="0.02" value="${scale}" style="width:100%;"><span id="vk-scale-val" style="color: ${defTheme.accent}; margin-left:6px;">${Math.round(scale*100)}%</span></div>
                <div style="margin-bottom:12px;"><label style="color: ${defTheme.text}; font-size: 10px;">PANEL OPACITY</label><input type="range" id="vk-opacity" min="0.3" max="1" step="0.01" value="${panelOpacity}" style="width:100%;"><span id="vk-opacity-val" style="color: ${defTheme.accent}; margin-left:6px;">${Math.round(panelOpacity*100)}%</span></div>
                <div style="margin-bottom:12px;"><label style="color: ${defTheme.text}; font-size: 10px;">KEY OPACITY</label><input type="range" id="vk-key-opacity" min="0.2" max="1" step="0.01" value="${keyOpacity}" style="width:100%;"><span id="vk-key-opacity-val" style="color: ${defTheme.accent}; margin-left:6px;">${Math.round(keyOpacity*100)}%</span></div>
                <div style="margin-bottom:12px;"><label style="color: ${defTheme.text}; font-size: 10px;">ANIMATION</label><select id="vk-animation" style="width:100%;">${['lift','bounce','rotate','pulse','shake','wobble'].map(a => `<option value="${a}" ${keyAnimation===a ? 'selected':''}>${a.charAt(0).toUpperCase()+a.slice(1)}</option>`).join('')}</select></div>
                <div style="margin-bottom:12px;"><label style="color: ${defTheme.text}; font-size: 10px;">SPEED</label><input type="range" id="vk-anim-speed" min="30" max="300" step="10" value="${animSpeed}" style="width:100%;"><span id="vk-anim-speed-val" style="color: ${defTheme.accent}; margin-left:6px;">${animSpeed}ms</span></div>
                <div style="margin-bottom:12px;"><label style="color: ${defTheme.text}; font-size: 10px;">KEY BACKGROUND</label><input type="color" id="vk-key-bg" value="${keyBgColor}" style="width:100%;"></div>
                <div style="margin-bottom:12px;"><label style="color: ${defTheme.text}; font-size: 10px;">ACTIVE BACKGROUND</label><input type="color" id="vk-key-active" value="${keyActiveColor}" style="width:100%;"></div>
                <div style="margin-bottom:12px;"><label style="color: ${defTheme.text}; font-size: 10px;">TEXT COLOR</label><input type="color" id="vk-text-color" value="${keyTextColor}" style="width:100%;"></div>
                <div style="margin-bottom:12px;"><label style="color: ${defTheme.text}; font-size: 10px;">ACTIVE TEXT</label><input type="color" id="vk-text-active" value="${keyTextActive}" style="width:100%;"></div>
                <div style="margin-bottom:12px;"><label style="color: ${defTheme.text}; font-size: 10px;">KEY GRADIENT</label>
                <div><label style="font-size:9px;"><input type="radio" name="gradMode" value="active" ${gradientMode === 'active' ? 'checked' : ''}> Active only</label>
                <label style="font-size:9px; margin-left:8px;"><input type="radio" name="gradMode" value="inactive" ${gradientMode === 'inactive' ? 'checked' : ''}> On press</label></div>
                <div style="margin-top:6px;"><input type="checkbox" id="vk-gradient-toggle" ${useGradient ? 'checked' : ''} style="vertical-align:middle;"> Enable Gradient</div>
                <div id="vk-gradient-pickers" style="display: ${useGradient ? 'flex' : 'none'}; gap: 6px; margin-top: 4px;"><input type="color" id="vk-grad-start" value="${gradientStart}"><input type="color" id="vk-grad-end" value="${gradientEnd}"></div></div>
                <div style="margin-bottom:12px;"><label style="color: ${defTheme.text}; font-size: 10px;">PANEL GRADIENT <input type="checkbox" id="vk-panel-gradient-toggle" ${usePanelGradient ? 'checked' : ''}></label></div>
                <div style="margin-bottom:12px;"><label style="color: ${defTheme.text}; font-size: 10px;">BACKGROUND IMAGE</label><input type="file" id="vk-bg-image" accept="image/*"><button id="vk-clear-bg" style="margin-left:6px;">✕</button></div>
                <div style="margin-bottom:12px;"><label style="color: ${defTheme.text}; font-size: 10px;">KEY GLOW <input type="checkbox" id="vk-glow-toggle" ${glowEnabled ? 'checked' : ''}></label></div>
                <div style="margin-bottom:12px;"><label style="color: ${defTheme.text}; font-size: 10px;">PANEL GLOW <input type="checkbox" id="vk-panel-glow" ${panelGlowEnabled ? 'checked' : ''}></label></div>
                <div style="margin-bottom:12px;"><label style="color: ${defTheme.text}; font-size: 10px;">DROP SHADOW <input type="checkbox" id="vk-shadow-toggle" ${shadowEnabled ? 'checked' : ''}></label></div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                    <button id="vk-reset" style="background:#1a1a2a; border:1px solid #ff6666; color:#ff6666; border-radius:6px; cursor:pointer;">RESET</button>
                    <button id="vk-settings-close2" style="background:#1a1a2a; border:1px solid ${defTheme.accent}; color:${defTheme.accent}; border-radius:6px; cursor:pointer;">CLOSE</button>
                </div>
                <div style="border-top:1px solid #2a2a3a; padding-top:8px; text-align:center;">
                    <a href="https://discord.gg/byXxUkZxag" target="_blank" style="color:${defTheme.accent}; text-decoration:none; font-size:10px;"> JOIN DISCORD</a>
                    <div style="font-size:8px; color:#888; margin-top:4px;">Alt+Ctrl+K – toggle overlay<br>Drag keyboard by its header</div>
                </div>
            </div>
        `;
        document.body.appendChild(settingsModal);

        if (!scrollStyleAdded) {
            scrollStyleAdded = true;
            const ss = document.createElement('style');
            ss.textContent = '#vk-settings ::-webkit-scrollbar { width: 5px; } #vk-settings ::-webkit-scrollbar-track { background: #0a0a1a; } #vk-settings ::-webkit-scrollbar-thumb { background: #1a1a2a; border-radius: 3px; } #vk-settings ::-webkit-scrollbar-thumb:hover { background: #0ff; }';
            document.head.appendChild(ss);
        }

        const modalHeader = settingsModal.querySelector('.vk-settings-header');
        modalHeader.addEventListener('mousedown', (e) => {
            if (e.target.id === 'vk-settings-close') return;
            dragModal = true;
            const rect = settingsModal.getBoundingClientRect();
            modalOffX = e.clientX - rect.left;
            modalOffY = e.clientY - rect.top;
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!dragModal) return;
            let left = e.clientX - modalOffX;
            let top = e.clientY - modalOffY;
            left = Math.min(Math.max(0, left), window.innerWidth - settingsModal.offsetWidth);
            top = Math.min(Math.max(0, top), window.innerHeight - settingsModal.offsetHeight);
            settingsModal.style.left = left + 'px';
            settingsModal.style.top = top + 'px';
            settingsModal.style.right = 'auto';
        });
        document.addEventListener('mouseup', () => dragModal = false);

        const scaleSlider = document.getElementById('vk-scale');
        const scaleVal = document.getElementById('vk-scale-val');
        const opacitySlider = document.getElementById('vk-opacity');
        const opacityVal = document.getElementById('vk-opacity-val');
        const keyOpacitySlider = document.getElementById('vk-key-opacity');
        const keyOpacityVal = document.getElementById('vk-key-opacity-val');
        const animSelect = document.getElementById('vk-animation');
        const speedSlider = document.getElementById('vk-anim-speed');
        const speedVal = document.getElementById('vk-anim-speed-val');
        const keyBg = document.getElementById('vk-key-bg');
        const keyActive = document.getElementById('vk-key-active');
        const textColor = document.getElementById('vk-text-color');
        const textActive = document.getElementById('vk-text-active');
        const gradToggle = document.getElementById('vk-gradient-toggle');
        const gradPickers = document.getElementById('vk-gradient-pickers');
        const gradStart = document.getElementById('vk-grad-start');
        const gradEnd = document.getElementById('vk-grad-end');
        const gradModeRadios = document.querySelectorAll('input[name="gradMode"]');
        const panelGradToggle = document.getElementById('vk-panel-gradient-toggle');
        const glowToggle = document.getElementById('vk-glow-toggle');
        const panelGlowToggle = document.getElementById('vk-panel-glow');
        const shadowToggle = document.getElementById('vk-shadow-toggle');
        const resetBtn = document.getElementById('vk-reset');
        const closeBtn = document.getElementById('vk-settings-close');
        const closeBtn2 = document.getElementById('vk-settings-close2');
        const bgImageInput = document.getElementById('vk-bg-image');
        const clearBgBtn = document.getElementById('vk-clear-bg');

        scaleSlider.oninput = () => {
            scale = parseFloat(scaleSlider.value);
            scaleVal.textContent = Math.round(scale*100) + '%';
            if (panel) panel.style.transform = `scale(${scale})`;
            localStorage.setItem('vk_scale', scale);
        };
        opacitySlider.oninput = () => {
            panelOpacity = parseFloat(opacitySlider.value);
            opacityVal.textContent = Math.round(panelOpacity*100) + '%';
            if (panel) panel.style.background = getPanelBackground();
            localStorage.setItem('vk_opacity', panelOpacity);
        };
        keyOpacitySlider.oninput = () => {
            keyOpacity = parseFloat(keyOpacitySlider.value);
            keyOpacityVal.textContent = Math.round(keyOpacity*100) + '%';
            localStorage.setItem('vk_keyOpacity', keyOpacity);
            rebuildKeyboard();
        };
        animSelect.onchange = () => {
            keyAnimation = animSelect.value;
            localStorage.setItem('vk_animation', keyAnimation);
        };
        speedSlider.oninput = () => {
            animSpeed = parseInt(speedSlider.value);
            speedVal.textContent = animSpeed + 'ms';
            localStorage.setItem('vk_anim_speed', animSpeed);
        };
        keyBg.oninput = () => { keyBgColor = keyBg.value; localStorage.setItem('vk_keyBg', keyBgColor); rebuildKeyboard(); };
        keyActive.oninput = () => { keyActiveColor = keyActive.value; localStorage.setItem('vk_keyActive', keyActiveColor); rebuildKeyboard(); };
        textColor.oninput = () => { keyTextColor = textColor.value; localStorage.setItem('vk_keyText', keyTextColor); rebuildKeyboard(); };
        textActive.oninput = () => { keyTextActive = textActive.value; localStorage.setItem('vk_keyTextActive', keyTextActive); rebuildKeyboard(); };
        gradToggle.onchange = () => {
            useGradient = gradToggle.checked;
            gradPickers.style.display = useGradient ? 'flex' : 'none';
            localStorage.setItem('vk_useGradient', useGradient);
            rebuildKeyboard();
        };
        gradStart.oninput = () => { gradientStart = gradStart.value; localStorage.setItem('vk_gradientStart', gradientStart); rebuildKeyboard(); };
        gradEnd.oninput = () => { gradientEnd = gradEnd.value; localStorage.setItem('vk_gradientEnd', gradientEnd); rebuildKeyboard(); };
        gradModeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    gradientMode = radio.value;
                    localStorage.setItem('vk_gradientMode', gradientMode);
                    rebuildKeyboard();
                }
            });
        });
        panelGradToggle.onchange = () => {
            usePanelGradient = panelGradToggle.checked;
            localStorage.setItem('vk_usePanelGradient', usePanelGradient);
            if (panel) panel.style.background = getPanelBackground();
        };
        glowToggle.onchange = () => { glowEnabled = glowToggle.checked; localStorage.setItem('vk_glowEnabled', glowEnabled); rebuildKeyboard(); };
        panelGlowToggle.onchange = () => { panelGlowEnabled = panelGlowToggle.checked; localStorage.setItem('vk_panelGlowEnabled', panelGlowEnabled); if (panel) panel.style.boxShadow = getPanelBoxShadow(); };
        shadowToggle.onchange = () => { shadowEnabled = shadowToggle.checked; localStorage.setItem('vk_shadowEnabled', shadowEnabled); if (panel) panel.style.boxShadow = getPanelBoxShadow(); };
        bgImageInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                bgImage = ev.target.result;
                localStorage.setItem('vk_bgImage', bgImage);
                if (panel) panel.style.background = getPanelBackground();
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        };
        clearBgBtn.onclick = () => {
            bgImage = null;
            localStorage.removeItem('vk_bgImage');
            if (panel) panel.style.background = getPanelBackground();
        };
        resetBtn.onclick = () => {
            scale = 0.6; panelOpacity = 0.95; keyOpacity = 0.9; keyBgColor = '#111'; keyActiveColor = '#0ff';
            keyTextColor = '#e0e0ff'; keyTextActive = '#000'; useGradient = false; gradientMode = 'active';
            gradientStart = '#0ff'; gradientEnd = '#f0f'; usePanelGradient = false; glowEnabled = true;
            shadowEnabled = false; panelGlowEnabled = true; keyAnimation = 'lift'; animSpeed = 100; bgImage = null;
            localStorage.setItem('vk_scale', scale); localStorage.setItem('vk_opacity', panelOpacity);
            localStorage.setItem('vk_keyOpacity', keyOpacity); localStorage.setItem('vk_keyBg', keyBgColor);
            localStorage.setItem('vk_keyActive', keyActiveColor); localStorage.setItem('vk_keyText', keyTextColor);
            localStorage.setItem('vk_keyTextActive', keyTextActive); localStorage.setItem('vk_useGradient', useGradient);
            localStorage.setItem('vk_gradientMode', gradientMode); localStorage.setItem('vk_gradientStart', gradientStart);
            localStorage.setItem('vk_gradientEnd', gradientEnd); localStorage.setItem('vk_usePanelGradient', usePanelGradient);
            localStorage.setItem('vk_glowEnabled', glowEnabled); localStorage.setItem('vk_shadowEnabled', shadowEnabled);
            localStorage.setItem('vk_panelGlowEnabled', panelGlowEnabled); localStorage.setItem('vk_animation', keyAnimation);
            localStorage.setItem('vk_anim_speed', animSpeed); localStorage.removeItem('vk_bgImage');
            rebuildKeyboard();
            scaleSlider.value = scale; scaleVal.textContent = Math.round(scale*100)+'%';
            opacitySlider.value = panelOpacity; opacityVal.textContent = Math.round(panelOpacity*100)+'%';
            keyOpacitySlider.value = keyOpacity; keyOpacityVal.textContent = Math.round(keyOpacity*100)+'%';
            animSelect.value = keyAnimation;
            speedSlider.value = animSpeed; speedVal.textContent = animSpeed+'ms';
            keyBg.value = keyBgColor; keyActive.value = keyActiveColor; textColor.value = keyTextColor; textActive.value = keyTextActive;
            gradToggle.checked = useGradient; gradPickers.style.display = useGradient ? 'flex' : 'none';
            gradStart.value = gradientStart; gradEnd.value = gradientEnd;
            const radioActive = document.querySelector('input[name="gradMode"][value="active"]');
            const radioInactive = document.querySelector('input[name="gradMode"][value="inactive"]');
            if (radioActive && radioInactive) {
                radioActive.checked = (gradientMode === 'active');
                radioInactive.checked = (gradientMode === 'inactive');
            }
            panelGradToggle.checked = usePanelGradient;
            glowToggle.checked = glowEnabled; panelGlowToggle.checked = panelGlowEnabled; shadowToggle.checked = shadowEnabled;
            if (panel) panel.style.background = getPanelBackground();
            if (panel) panel.style.boxShadow = getPanelBoxShadow();
        };
        closeBtn.onclick = () => { settingsModal.style.display = 'none'; };
        closeBtn2.onclick = () => { settingsModal.style.display = 'none'; };
        settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) settingsModal.style.display = 'none'; });
    }

    function toggleSettings() {
        if (!settingsModal) buildSettingsModal();
        settingsModal.style.display = settingsModal.style.display === 'none' ? 'flex' : 'none';
    }

    function rebuildKeyboard() {
        buildKeyboard();
        activeKeys.forEach(code => updateKeyState(code, true, true));
    }

    document.addEventListener('keydown', (e) => {
        if (!visible) return;
        const code = e.code;
        if (!activeKeys.has(code)) {
            activeKeys.add(code);
            updateKeyState(code, true, false);
        }
    });
    document.addEventListener('keyup', (e) => {
        if (!visible) return;
        const code = e.code;
        if (activeKeys.has(code)) {
            activeKeys.delete(code);
            updateKeyState(code, false, false);
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.altKey && e.ctrlKey && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            visible = !visible;
            if (panel) panel.style.display = visible ? 'block' : 'none';
            localStorage.setItem('vk_visible', visible);
        }
    });

    const style = document.createElement('style');
    style.textContent = '#vk-overlay, #vk-settings { filter: none !important; backdrop-filter: none !important; }';
    document.head.appendChild(style);

    buildKeyboard();
})();

// END

/*
MIT License
Copyright (c) 2026 Everlasting

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
