const { pool } = require('../config/db');

const getDashboardStats = async (req, res) => {
    const userId = req.user.id;

    const problemStatsQuery = pool.query(`
        SELECT
            COUNT(*) FILTER (WHERE status = 'solved') AS solved_count,
            COUNT(*) FILTER (WHERE status = 'revisiting') AS revisiting_count,
            COUNT(*) AS total_tracked
        FROM user_problem_status
        WHERE user_id = $1
    `, [userId]);

    const topicProgressQuery = pool.query(`
        SELECT
            t.name AS topic,
            COUNT(ups.problem_id) FILTER (WHERE ups.status = 'solved') AS solved,
            COUNT(ups.problem_id) AS total_tracked
        FROM topics t
        JOIN problems p ON t.id = p.topic_id
        JOIN user_problem_status ups ON p.id = ups.problem_id
        WHERE ups.user_id = $1
        GROUP BY t.name
        ORDER BY solved DESC
    `, [userId]);

    const applicationStatsQuery = pool.query(`
        SELECT status, COUNT(*) AS count
        FROM user_applications
        WHERE user_id = $1
        GROUP BY status
    `, [userId]);

    const upcomingDeadlinesQuery = pool.query(`
        SELECT c.name AS company, ua.role, ua.deadline, ua.status
        FROM user_applications ua
        JOIN companies c ON ua.company_id = c.id
        WHERE ua.user_id = $1
          AND ua.deadline >= CURRENT_DATE
          AND ua.status NOT IN ('rejected', 'offer received')
        ORDER BY ua.deadline ASC
        LIMIT 5
    `, [userId]);

    const [problemStats, topicProgress, applicationStats, upcomingDeadlines] = await Promise.all([
        problemStatsQuery,
        topicProgressQuery,
        applicationStatsQuery,
        upcomingDeadlinesQuery
    ]);

    res.status(200).json({
        problem_stats: {
            solved: parseInt(problemStats.rows[0].solved_count || 0),
            revisiting: parseInt(problemStats.rows[0].revisiting_count || 0),
            total_tracked: parseInt(problemStats.rows[0].total_tracked || 0)
        },
        topic_progress: topicProgress.rows.map(row => ({
            topic: row.topic,
            solved: parseInt(row.solved),
            total_tracked: parseInt(row.total_tracked)
        })),
        application_stats: applicationStats.rows.reduce((acc, row) => {
            acc[row.status] = parseInt(row.count);
            return acc;
        }, {}),
        upcoming_deadlines: upcomingDeadlines.rows
    });
};

module.exports = { getDashboardStats };
