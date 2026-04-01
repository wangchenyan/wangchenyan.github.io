const axios = require('axios');
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
            headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
        }

        // Fetch user info
        const userResponse = await axios.get(
            `https://api.github.com/users/${GITHUB_USERNAME}`,
            { headers }
        );

        // Fetch all repos
        const reposResponse = await axios.get(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
            { headers }
        );

        const repos = reposResponse.data;
        
        // Calculate total stars
        const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        
        // Get top 6 repos by stars
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
            public_repos: userResponse.data.public_repos,
            followers: userResponse.data.followers,
            following: userResponse.data.following,
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

        const response = await axios.post(
            'https://api.juejin.cn/content_api/v1/article/query_list',
            {
                user_id: JUEJIN_USER_ID,
                sort_type: 2,  // 2 = 最新
                cursor: "0"
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.err_no !== 0) {
            throw new Error(response.data.err_msg);
        }

        const articles = response.data.data.map(article => ({
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
            total_articles: articles.length,
            articles: articles.slice(0, 10),  // Keep top 10
            updated_at: new Date().toISOString()
        };

        fs.writeFileSync(
            path.join(DATA_DIR, 'juejin-articles.json'),
            JSON.stringify(stats, null, 2)
        );

        console.log(`✅ Juejin articles saved: ${articles.length} articles`);
        return stats;
    } catch (error) {
        console.error('❌ Error fetching Juejin articles:', error.message);
        // Don't throw, just log error and continue
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
