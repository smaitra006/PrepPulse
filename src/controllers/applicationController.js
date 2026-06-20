const { pool } = require('../config/db');

const getCompanies = async (req, res) => {
    const result = await pool.query('SELECT id, name, industry FROM companies ORDER BY name ASC');
    res.status(200).json({ companies: result.rows });
};

const getApplications = async (req, res) => {
    const userId = req.user.id;
    const { status } = req.query;

    let queryText = `
        SELECT
            ua.id, ua.role, ua.status, ua.applied_date, ua.deadline, ua.priority, ua.notes, ua.updated_at,
            c.name AS company_name, c.industry
        FROM user_applications ua
        JOIN companies c ON ua.company_id = c.id
        WHERE ua.user_id = $1
    `;

    const queryParams = [userId];

    if (status) {
        queryText += ` AND ua.status = $2`;
        queryParams.push(status);
    }

    queryText += ` ORDER BY ua.deadline ASC NULLS LAST`;

    const result = await pool.query(queryText, queryParams);

    res.status(200).json({
        count: result.rowCount,
        applications: result.rows
    });
};

const createApplication = async (req, res) => {
    const userId = req.user.id;
    const { companyId, role, status, appliedDate, deadline, priority, notes } = req.body;

    if (!companyId || !role) {
        return res.status(400).json({ error: 'Company ID and Role are required.' });
    }

    const query = `
        INSERT INTO user_applications
        (user_id, company_id, role, status, applied_date, deadline, priority, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const values = [userId, companyId, role, status || 'not applied', appliedDate, deadline, priority || 'Medium', notes];

    try {
        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Application tracked successfully', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'You are already tracking an application for this specific role at this company.' });
        }
        throw error;
    }
};

const updateApplication = async (req, res) => {
    const userId = req.user.id;
    const { applicationId } = req.params;
    const { status, appliedDate, deadline, priority, notes } = req.body;

    const query = `
        UPDATE user_applications
        SET
            status = COALESCE($1, status),
            applied_date = COALESCE($2, applied_date),
            deadline = COALESCE($3, deadline),
            priority = COALESCE($4, priority),
            notes = COALESCE($5, notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6 AND user_id = $7
        RETURNING *;
    `;

    const values = [status, appliedDate, deadline, priority, notes, applicationId, userId];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Application not found or unauthorized.' });
    }

    res.status(200).json({ message: 'Application updated successfully', data: result.rows[0] });
};

module.exports = { getCompanies, getApplications, createApplication, updateApplication };
