const fs = require('fs');
const path = require('path');

const GITHUB_USERNAME = 'wangchenyan';
const JUEJIN_USER_ID = process.env.JUEJIN_USER_ID || '2313028193754168';
const DATA_DIR = path.join(__dirname, '..', 'assets', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Fetch GitHub user stats
async function fetchGitHubStats() {
    try {
        console.log('Fetching GitHub stats...');

        const headers = {};
        if (process.env.GITHUB_TOKEN) {
            headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
        }

        headers.Accept = 'application/vnd.github+json';

        const userResponse = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}`,
            { headers }
        );

        if (userResponse.ok === false) {
            throw new Error(`GitHub user request failed: ${userResponse.status}`);
        }

        const reposResponse = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}`,
            { headers }
        );

        if (reposResponse.ok === false) {
            throw new Error(`GitHub repos request failed: ${reposResponse.status}`);
        }

        const userData = await userResponse.json();
        const repos = await reposResponse.json();
        const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        const topRepos = repos
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 6)
            .map(repo => ({
                name: repo.name,
                description: repo.description || '暂无描述',
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                language: repo.language,
                html_url: repo.html_url,
                homepage: repo.homepage,
                updated_at: repo.updated_at
            }));

        const stats = {
            username: GITHUB_USERNAME,
            public_repos: userData.public_repos,
            followers: userData.followers,
            following: userData.following,
            total_stars: totalStars,
            top_repos: topRepos,
            updated_at: new Date().toISOString()
        };

        fs.writeFileSync(
            path.join(DATA_DIR, 'github-stats.json'),
            JSON.stringify(stats, null, 2)
        );

        console.log(`✅ GitHub stats saved: ${stats.public_repos} repos, ${totalStars} stars`);
        return stats;
    } catch (error) {
        console.error('❌ Error fetching GitHub stats:', error.message);
        throw error;
    }
}

// Fetch Juejin articles
async function fetchJuejinArticles() {
    try {
        console.log('Fetching Juejin articles...');

        const response = await fetch(
            'https://api.juejin.cn/content_api/v1/article/query_list',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: JUEJIN_USER_ID,
                    sort_type: 2,
                    cursor: '0'
                })
            }
        );

        if (response.ok === false) {
            throw new Error(`Juejin request failed: ${response.status}`);
        }

        const responseData = await response.json();
        if (responseData.err_no !== 0) {
            throw new Error(responseData.err_msg);
        }

        const articles = responseData.data.map(article => ({
            article_id: article.article_id,
            title: article.article_info.title,
            brief_content: article.article_info.brief_content,
            cover_image: article.article_info.cover_image,
            view_count: article.article_info.view_count,
            digg_count: article.article_info.digg_count,
            comment_count: article.article_info.comment_count,
            ctime: article.article_info.ctime,
            url: `https://juejin.cn/post/${article.article_id}`
        }));

        const stats = {
            user_id: JUEJIN_USER_ID,
            total_articles: responseData.count,
            articles: articles.slice(0, 10),
            updated_at: new Date().toISOString()
        };

        fs.writeFileSync(
            path.join(DATA_DIR, 'juejin-articles.json'),
            JSON.stringify(stats, null, 2)
        );

        console.log(`✅ Juejin articles saved: ${responseData.count} articles`);
        return stats;
    } catch (error) {
        console.error('❌ Error fetching Juejin articles:', error.message);
        return null;
    }
}

// Main function
async function main() {
    console.log('🚀 Starting data fetch...\n');

    try {
        await fetchGitHubStats();
        console.log('');

        await fetchJuejinArticles();
        console.log('');

        console.log('✨ All data fetched successfully!');
    } catch (error) {
        console.error('❌ Failed to fetch data:', error.message);
        process.exit(1);
    }
}

main();
