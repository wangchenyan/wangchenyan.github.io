const REL_ATTR = 'noopener noreferrer';
const EXTERNAL_POSTS_URL = 'https://juejin.cn/user/2313028193754168/posts';
const FALLBACK_STATS = {
    repos: '-',
    stars: '-',
    articles: '-'
};

function getElement(id) {
    return document.getElementById(id);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function normalizeNumber(value, fallback = 0) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function safeUrl(value) {
    if (typeof value !== 'string') {
        return '';
    }

    const trimmedValue = value.trim();
    if (trimmedValue === '') {
        return '';
    }

    try {
        const url = new URL(trimmedValue);
        const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
        return isHttp ? url.toString() : '';
    } catch {
        return '';
    }
}

function animateValue(id, start, end, duration) {
    const element = getElement(id);
    if (element === null) {
        return;
    }

    const startValue = normalizeNumber(start);
    const endValue = normalizeNumber(end);
    const range = endValue - startValue;
    if (range === 0) {
        element.textContent = String(endValue);
        return;
    }

    const minTimer = 50;
    let stepTime = Math.abs(Math.floor(duration / Math.abs(range)));
    stepTime = Math.max(stepTime, minTimer);

    const startTime = Date.now();
    const endTime = startTime + duration;
    let timer = 0;

    function run() {
        const now = Date.now();
        const remaining = Math.max((endTime - now) / duration, 0);
        const value = Math.round(endValue - remaining * range);
        element.textContent = String(value);

        if (value === endValue) {
            clearInterval(timer);
        }
    }

    timer = window.setInterval(run, stepTime);
    run();
}

function formatDate(timestamp) {
    const date = new Date(normalizeNumber(timestamp) * 1000);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function renderArticleCard(article) {
    const articleUrl = safeUrl(article.url) || EXTERNAL_POSTS_URL;
    const coverUrl = safeUrl(article.cover_image);
    const articleTitle = escapeHtml(article.title || '未命名文章');
    const articleSummary = escapeHtml(article.brief_content || '暂无摘要');
    const articleDate = article.date_text || formatDate(article.ctime);

    return `
        <a href="${articleUrl}" class="article-card" target="_blank" rel="${REL_ATTR}">
            <div class="article-layout">
                <div class="article-cover">
                    ${coverUrl === '' ? '' : `<img src="${coverUrl}" alt="${articleTitle}" loading="lazy" referrerpolicy="no-referrer">`}
                </div>
                <div class="article-body">
                    <div class="article-header">
                        <h3 class="article-title">${articleTitle}</h3>
                        <span class="article-date">${escapeHtml(articleDate)}</span>
                    </div>
                    <p class="article-summary">${articleSummary}</p>
                    <div class="article-meta">
                        <span>👁 ${normalizeNumber(article.view_count)}</span>
                        <span>👍 ${normalizeNumber(article.digg_count)}</span>
                        <span>💬 ${normalizeNumber(article.comment_count)}</span>
                    </div>
                </div>
            </div>
        </a>
    `;
}

function renderEmptyState(containerId, message) {
    const container = getElement(containerId);
    if (container === null) {
        return;
    }

    container.innerHTML = `<div class="loading">${escapeHtml(message)}</div>`;
}

function renderProjectCard(repo) {
    const sourceUrl = safeUrl(repo.html_url);
    const introUrl = safeUrl(repo.homepage);
    const projectName = escapeHtml(repo.name || '未命名项目');
    const projectDesc = escapeHtml(repo.description || '暂无描述');
    const projectMeta = repo.stars == null
        ? escapeHtml(repo.language || 'Unknown')
        : `⭐ ${normalizeNumber(repo.stars)} stars · ${escapeHtml(repo.language || 'Unknown')}`;

    return `
        <div class="project-card">
            <div class="project-header">
                <h3 class="project-title">${projectName}</h3>
                <span class="project-tech">${projectMeta}</span>
            </div>
            <div class="project-body">
                <p class="project-description">${projectDesc}</p>
                <div class="project-links">
                    ${sourceUrl === '' ? '' : `<a href="${sourceUrl}" class="project-link" target="_blank" rel="${REL_ATTR}">查看源码 →</a>`}
                    ${introUrl === '' ? '' : `<a href="${introUrl}" class="project-link" target="_blank" rel="${REL_ATTR}">项目介绍 →</a>`}
                </div>
            </div>
        </div>
    `;
}

function renderArticles(articles) {
    const container = getElement('articles-container');
    if (container === null) {
        return;
    }

    if (Array.isArray(articles) === false || articles.length === 0) {
        renderFallbackArticles();
        return;
    }

    container.innerHTML = articles.slice(0, 5).map(renderArticleCard).join('');
}

function renderFallbackArticles() {
    renderEmptyState('articles-container', '暂无文章数据');
}

function renderProjects(repos) {
    const container = getElement('projects-container');
    if (container === null) {
        return;
    }

    if (Array.isArray(repos) === false || repos.length === 0) {
        renderFallbackProjects();
        return;
    }

    container.innerHTML = repos.slice(0, 3).map(renderProjectCard).join('');
}

function renderFallbackProjects() {
    renderEmptyState('projects-container', '暂无项目数据');
}

function setFallbackStats() {
    const repoCount = getElement('repo-count');
    const starCount = getElement('star-count');
    const articleCount = getElement('article-count');

    if (repoCount !== null) {
        repoCount.textContent = FALLBACK_STATS.repos;
    }

    if (starCount !== null) {
        starCount.textContent = FALLBACK_STATS.stars;
    }

    if (articleCount !== null) {
        articleCount.textContent = FALLBACK_STATS.articles;
    }
}

async function fetchJson(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (response.ok === false) {
        throw new Error(`Request failed: ${path}`);
    }

    return response.json();
}

async function loadStats() {
    try {
        const [githubData, juejinData] = await Promise.all([
            fetchJson('assets/data/github-stats.json'),
            fetchJson('assets/data/juejin-articles.json')
        ]);

        animateValue('repo-count', 0, githubData.public_repos, 1500);
        animateValue('star-count', 0, githubData.total_stars, 1500);
        animateValue('article-count', 0, juejinData.total_articles, 1500);
        renderProjects(githubData.top_repos);
        renderArticles(juejinData.articles);
    } catch (error) {
        console.log('Using fallback data:', error);
        setFallbackStats();
        renderFallbackProjects();
        renderFallbackArticles();
    }
}

function copyWechat() {
    const wx = 'wangchenyan-top';
    alert(`微信号: ${wx}\n已复制到剪贴板，请注明来意！`);
    navigator.clipboard.writeText(wx).catch(() => {});
}

function setupWechatButton() {
    const wechatButton = getElement('wechat-btn');
    if (wechatButton === null) {
        return;
    }

    wechatButton.addEventListener('click', copyWechat);
}

function setupMobileMenu() {
    const mobileMenuBtn = getElement('mobile-menu-btn');
    const mobileNav = getElement('mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileMenuBtn === null || mobileNav === null) {
        return;
    }

    function setMenuState(isOpen) {
        mobileNav.classList.toggle('active', isOpen);
        mobileMenuBtn.textContent = isOpen ? '✕' : '☰';
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
        mobileMenuBtn.setAttribute('aria-label', isOpen ? '关闭导航菜单' : '打开导航菜单');
    }

    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = mobileNav.classList.contains('active');
        setMenuState(isOpen === false);
    });

    mobileNavLinks.forEach((link) => {
        link.addEventListener('click', () => {
            setMenuState(false);
        });
    });

    document.addEventListener('click', (event) => {
        const clickedOutsideNav = mobileNav.contains(event.target) === false;
        const clickedOutsideBtn = mobileMenuBtn.contains(event.target) === false;

        if (clickedOutsideNav && clickedOutsideBtn) {
            setMenuState(false);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setMenuState(false);
        }
    });
}

function setupSmoothScroll() {
    function getScrollTop(target) {
        const nav = document.querySelector('nav');
        const navHeight = nav instanceof HTMLElement ? nav.offsetHeight : 0;
        const title = target.querySelector('.section-title');
        const anchorTarget = title instanceof HTMLElement ? title : target;
        const targetTop = window.scrollY + anchorTarget.getBoundingClientRect().top;
        const offset = target.id === '' ? navHeight : navHeight + 16;
        return Math.max(targetTop - offset, 0);
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function handleClick(event) {
            event.preventDefault();
            const targetSelector = this.getAttribute('href');
            if (targetSelector === null || targetSelector === '#') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const target = document.querySelector(targetSelector);
            if (target !== null) {
                window.scrollTo({
                    top: getScrollTop(target),
                    behavior: 'smooth',
                });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    setupWechatButton();
    setupMobileMenu();
    setupSmoothScroll();
});
