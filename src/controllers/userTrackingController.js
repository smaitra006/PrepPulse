const { pool } = require('../config/db');

const updateProblemStatus = async (req, res) => {
    const { problemId } = req.params;
    const { status, notes, revision_date } = req.body;
    const userId = req.user.id;

    const query = `
        INSERT INTO user_problem_status (user_id, problem_id, status, notes, revision_date, updated_at)
        VALUES ($1, $2, COALESCE($3, 'unsolved'), $4, $5, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, problem_id)
        DO UPDATE SET
            status = COALESCE($3, user_problem_status.status),
            notes = COALESCE($4, user_problem_status.notes),
            revision_date = COALESCE($5, user_problem_status.revision_date),
            updated_at = CURRENT_TIMESTAMP
        RETURNING *;
    `;

    const values = [userId, problemId, status, notes, revision_date];

    const result = await pool.query(query, values);

    res.status(200).json({
        message: 'Problem tracking updated successfully',
        data: result.rows[0]
    });
};

const getUserTrackedProblems = async (req, res) => {
    const userId = req.user.id;
    const { status } = req.query;

    let queryText = `
        SELECT
            p.id AS problem_id, p.title, p.url, p.difficulty, p.platform,
            t.name AS topic,
            ups.status, ups.notes, ups.revision_date, ups.updated_at
        FROM user_problem_status ups
        JOIN problems p ON ups.problem_id = p.id
        LEFT JOIN topics t ON p.topic_id = t.id
        WHERE ups.user_id = $1
    `;

    const queryParams = [userId];

    if (status) {
        queryText += ` AND ups.status = $2`;
        queryParams.push(status);
    }

    queryText += ` ORDER BY ups.updated_at DESC`;

    const result = await pool.query(queryText, queryParams);

    res.status(200).json({
        count: result.rowCount,
        tracked_problems: result.rows
    });
};

module.exports = { updateProblemStatus, getUserTrackedProblems };
