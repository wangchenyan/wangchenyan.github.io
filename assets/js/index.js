function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    if (element === null) {
        return;
    }

    const range = end - start;
    if (range === 0) {
        element.textContent = String(end);
        return;
    }

    const minTimer = 50;
    let stepTime = Math.abs(Math.floor(duration / range));
    stepTime = Math.max(stepTime, minTimer);

    const startTime = Date.now();
    const endTime = startTime + duration;
    let timer;

    function run() {
        const now = Date.now();
        const remaining = Math.max((endTime - now) / duration, 0);
        const value = Math.round(end - remaining * range);
        element.textContent = String(value);

        if (value === end) {
            clearInterval(timer);
        }
    }

    timer = setInterval(run, stepTime);
    run();
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function renderArticles(articles) {
    const container = document.getElementById('articles-container');
    if (container === null) {
        return;
    }

    if (articles == null || articles.length === 0) {
        renderFallbackArticles();
        return;
    }

    const topArticles = articles.slice(0, 5);
    container.innerHTML = topArticles.map((article) => `
        <a href="${article.url}" class="article-card" target="_blank">
            <div class="article-header">
                <h3 class="article-title">${article.title}</h3>
                <span class="article-date">${formatDate(article.ctime)}</span>
            </div>
            <p class="article-summary">${article.brief_content}</p>
            <div class="article-meta">
                <span>👁 ${article.view_count}</span>
                <span>👍 ${article.digg_count}</span>
                <span>💬 ${article.comment_count}</span>
            </div>
        </a>
    `).join('');
}

function renderFallbackArticles() {
    const container = document.getElementById('articles-container');
    if (container === null) {
        return;
    }

    container.innerHTML = `
        <a href="https://juejin.cn/user/2313028193754168/posts" class="article-card" target="_blank">
            <div class="article-header">
                <h3 class="article-title">Android Jetpack Compose 入门指南</h3>
                <span class="article-date">2024年3月</span>
            </div>
            <p class="article-summary">本文将带你了解 Jetpack Compose 的基础知识，包括声明式 UI、状态管理、布局系统等核心概念...</p>
            <div class="article-meta">
                <span>👁 2500</span>
                <span>👍 128</span>
                <span>💬 32</span>
            </div>
        </a>
        <a href="https://juejin.cn/user/2313028193754168/posts" class="article-card" target="_blank">
            <div class="article-header">
                <h3 class="article-title">Kotlin 协程实战：从入门到精通</h3>
                <span class="article-date">2024年3月</span>
            </div>
            <p class="article-summary">协程是 Kotlin 中最强大的特性之一，本文将深入讲解协程的原理和在实际项目中的应用...</p>
            <div class="article-meta">
                <span>👁 3200</span>
                <span>👍 156</span>
                <span>💬 45</span>
            </div>
        </a>
        <a href="https://juejin.cn/user/2313028193754168/posts" class="article-card" target="_blank">
            <div class="article-header">
                <h3 class="article-title">Android 性能优化最佳实践</h3>
                <span class="article-date">2024年3月</span>
            </div>
            <p class="article-summary">性能优化是 Android 开发中的重要环节，本文总结了常见的性能优化技巧和工具使用方法...</p>
            <div class="article-meta">
                <span>👁 1800</span>
                <span>👍 89</span>
                <span>💬 23</span>
            </div>
        </a>
    `;
}

function renderProjects(repos) {
    const container = document.getElementById('projects-container');
    if (container === null) {
        return;
    }

    if (repos == null || repos.length === 0) {
        renderFallbackProjects();
        return;
    }

    const topRepos = repos.slice(0, 3);
    container.innerHTML = topRepos.map((repo) => `
        <div class="project-card">
            <div class="project-header">
                <h3 class="project-title">${repo.name}</h3>
                <span class="project-tech">⭐ ${repo.stars} stars · ${repo.language || 'Unknown'}</span>
            </div>
            <div class="project-body">
                <p class="project-description">${repo.description || '暂无描述'}</p>
                <div class="project-links">
                    <a href="${repo.html_url}" class="project-link" target="_blank">查看源码 →</a>
                    ${repo.homepage ? `<a href="${repo.homepage}" class="project-link" target="_blank">在线演示 →</a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function renderFallbackProjects() {
    const container = document.getElementById('projects-container');
    if (container === null) {
        return;
    }

    container.innerHTML = `
        <div class="project-card">
            <div class="project-header">
                <h3 class="project-title">MusicPlayer</h3>
                <span class="project-tech">Kotlin · Jetpack</span>
            </div>
            <div class="project-body">
                <p class="project-description">功能完善的本地音乐播放器，支持歌词同步、均衡器等功能。</p>
                <div class="project-links">
                    <a href="https://github.com/wangchenyan" class="project-link" target="_blank">查看源码 →</a>
                </div>
            </div>
        </div>
        <div class="project-card">
            <div class="project-header">
                <h3 class="project-title">WeatherApp</h3>
                <span class="project-tech">Kotlin · Compose</span>
            </div>
            <div class="project-body">
                <p class="project-description">基于 Jetpack Compose 的天气应用，界面简洁美观。</p>
                <div class="project-links">
                    <a href="https://github.com/wangchenyan" class="project-link" target="_blank">查看源码 →</a>
                </div>
            </div>
        </div>
        <div class="project-card">
            <div class="project-header">
                <h3 class="project-title">GitHubClient</h3>
                <span class="project-tech">Kotlin · Coroutines</span>
            </div>
            <div class="project-body">
                <p class="project-description">第三方 GitHub 客户端，支持仓库浏览、Issue 管理。</p>
                <div class="project-links">
                    <a href="https://github.com/wangchenyan" class="project-link" target="_blank">查看源码 →</a>
                </div>
            </div>
        </div>
    `;
}

function showWechat() {
    const wx = 'wangchenyan-top';
    alert(`微信号: ${wx}\n已复制到剪贴板，请注明来意！`);
    navigator.clipboard.writeText(wx).catch(() => {});
}

async function loadStats() {
    try {
        const githubResponse = await fetch('assets/data/github-stats.json');
        const githubData = await githubResponse.json();

        animateValue('repo-count', 0, githubData.public_repos, 1500);
        animateValue('star-count', 0, githubData.total_stars, 1500);
        renderProjects(githubData.top_repos);

        const juejinResponse = await fetch('assets/data/juejin-articles.json');
        const juejinData = await juejinResponse.json();

        animateValue('article-count', 0, juejinData.total_articles, 1500);
        renderArticles(juejinData.articles);
    } catch (error) {
        console.log('Using fallback data:', error);
        const repoCount = document.getElementById('repo-count');
        const starCount = document.getElementById('star-count');
        const articleCount = document.getElementById('article-count');

        if (repoCount !== null) {
            repoCount.textContent = '20+';
        }

        if (starCount !== null) {
            starCount.textContent = '100+';
        }

        if (articleCount !== null) {
            articleCount.textContent = '30+';
        }

        renderFallbackProjects();
        renderFallbackArticles();
    }
}

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileMenuBtn === null || mobileNav === null) {
        return;
    }

    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        mobileMenuBtn.textContent = mobileNav.classList.contains('active') ? '✕' : '☰';
    });

    mobileNavLinks.forEach((link) => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileMenuBtn.textContent = '☰';
        });
    });

    document.addEventListener('click', (event) => {
        const clickedOutsideNav = mobileNav.contains(event.target) === false;
        const clickedOutsideBtn = mobileMenuBtn.contains(event.target) === false;

        if (clickedOutsideNav && clickedOutsideBtn) {
            mobileNav.classList.remove('active');
            mobileMenuBtn.textContent = '☰';
        }
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function handleClick(event) {
            event.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target !== null) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    setupMobileMenu();
    setupSmoothScroll();
});
