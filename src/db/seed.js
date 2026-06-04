const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runSeed() {
    console.log('Beginning Database structural migration and seed sequence...');

    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schemaSql);
        console.log('Base relational schema definitions executed cleanly.');

        const topics = ['Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Graphs', 'Dynamic Programming'];
        const topicIdMap = {};

        for (const topic of topics) {
            const res = await pool.query(
                'INSERT INTO topics (name) VALUES ($1) RETURNING id, name',
                [topic]
            );
            topicIdMap[res.rows[0].name] = res.rows[0].id;
        }
        console.log('Canonical topics generated successfully.');

        const initialProblems = [
            { title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'Easy', platform: 'LeetCode', topic: 'Arrays & Hashing' },
            { title: 'Top K Frequent Elements', url: 'https://leetcode.com/problems/top-k-frequent-elements/', difficulty: 'Medium', platform: 'LeetCode', topic: 'Arrays & Hashing' },
            { title: 'Valid Palindrome', url: 'https://leetcode.com/problems/valid-palindrome/', difficulty: 'Easy', platform: 'LeetCode', topic: 'Two Pointers' },
            { title: 'Container With Most Water', url: 'https://leetcode.com/problems/container-with-most-water/', difficulty: 'Medium', platform: 'LeetCode', topic: 'Two Pointers' },
            { title: 'Best Time to Buy and Sell Stock', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', difficulty: 'Easy', platform: 'LeetCode', topic: 'Sliding Window' },
            { title: 'Longest Substring Without Repeating Characters', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', difficulty: 'Medium', platform: 'LeetCode', topic: 'Sliding Window' },
            { title: 'Number of Islands', url: 'https://leetcode.com/problems/number-of-islands/', difficulty: 'Medium', platform: 'LeetCode', topic: 'Graphs' },
            { title: 'Longest Common Subsequence', url: 'https://leetcode.com/problems/longest-common-subsequence/', difficulty: 'Medium', platform: 'LeetCode', topic: 'Dynamic Programming' },
            { title: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/', difficulty: 'Easy', platform: 'LeetCode', topic: 'Dynamic Programming' }
        ];

        for (const prob of initialProblems) {
            await pool.query(
                `INSERT INTO problems (title, url, difficulty, platform, topic_id)
                 VALUES ($1, $2, $3, $4, $5)`,
                [prob.title, prob.url, prob.difficulty, prob.platform, topicIdMap[prob.topic]]
            );
        }
        console.log(`${initialProblems.length} global interview preparation problems successfully cached.`);

        const corporateEntities = [
            { name: 'Google', industry: 'Technology' },
            { name: 'Microsoft', industry: 'Technology' },
            { name: 'Salesforce', industry: 'Enterprise Software' },
            { name: 'JPMorganChase', industry: 'Financial Services' },
            { name: 'Uber', industry: 'Technology' }
        ];

        for (const company of corporateEntities) {
            await pool.query(
                'INSERT INTO companies (name, industry) VALUES ($1, $2)',
                [company.name, company.industry]
            );
        }
        console.log('Enterprise tracking targets seeded cleanly.');
        console.log('Database sync process completed successfully.');

        process.exit(0);
    } catch (error) {
        console.error('Critical database initialization failure encountered:', error);
        process.exit(1);
    }
}

runSeed();
