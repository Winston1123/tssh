// 主题切换功能
const THEME_KEY = 'site-theme';
const AUTO_THEME_KEY = 'auto-theme';

// 主题类型
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const autoTheme = localStorage.getItem(AUTO_THEME_KEY) === 'true';
    
    if (autoTheme) {
        document.getElementById('auto-theme').checked = true;
        setAutoTheme();
    } else if (savedTheme) {
        setTheme(savedTheme);
        updateActiveButton(savedTheme);
    } else {
        setTheme(THEMES.LIGHT);
        updateActiveButton(THEMES.LIGHT);
    }
}

// 设置主题
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
}

// 更新激活的按钮状态
function updateActiveButton(theme) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });
}

// 根据时间自动设置主题
function setAutoTheme() {
    const hour = new Date().getHours();
    const theme = (hour >= 6 && hour < 18) ? THEMES.LIGHT : THEMES.DARK;
    setTheme(theme);
    updateActiveButton(theme);
    localStorage.setItem(AUTO_THEME_KEY, 'true');
}

// 事件监听器设置
document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    // 主题按钮点击事件
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            document.getElementById('auto-theme').checked = false;
            localStorage.setItem(AUTO_THEME_KEY, 'false');
            setTheme(theme);
            updateActiveButton(theme);
        });
    });

    // 自动主题切换事件
    document.getElementById('auto-theme').addEventListener('change', (event) => {
        if (event.target.checked) {
            setAutoTheme();
        } else {
            const currentTheme = document.documentElement.getAttribute('data-theme') || THEMES.LIGHT;
            localStorage.setItem(AUTO_THEME_KEY, 'false');
            setTheme(currentTheme);
            updateActiveButton(currentTheme);
        }
    });
});