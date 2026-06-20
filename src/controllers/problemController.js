const { pool } = require('../config/db');

const getTopics = async (req, res) => {
    const result = await pool.query('SELECT id, name FROM topics ORDER BY name ASC');
    res.status(200).json({ topics: result.rows });
};

const getProblems = async (req, res) => {
    const { topic, difficulty, platform, search, page = 1, limit = 20 } = req.query;

    let queryText = `
        SELECT p.id, p.title, p.url, p.difficulty, p.platform, t.name AS topic
        FROM problems p
        LEFT JOIN topics t ON p.topic_id = t.id
        WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    if (topic) {
        queryText += ` AND t.name = $${paramIndex}`;
        queryParams.push(topic);
        paramIndex++;
    }

    if (difficulty) {
        queryText += ` AND p.difficulty = $${paramIndex}`;
        queryParams.push(difficulty);
        paramIndex++;
    }

    if (platform) {
        queryText += ` AND p.platform = $${paramIndex}`;
        queryParams.push(platform);
        paramIndex++;
    }

    if (search) {
        queryText += ` AND p.title ILIKE $${paramIndex}`;
        queryParams.push(`%${search}%`);
        paramIndex++;
    }

    const offset = (page - 1) * limit;
    queryText += ` ORDER BY p.id ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(queryText, queryParams);

    res.status(200).json({
        page: parseInt(page),
        limit: parseInt(limit),
        count: result.rowCount,
        problems: result.rows
    });
};

module.exports = { getProblems, getTopics };
