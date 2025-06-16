const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const Joi = require('joi');
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'master_data',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
});

// Validation schema
const roleSchema = Joi.object({
  name: Joi.string().alphanum().min(2).max(50).required(),
  display_name: Joi.string().required().max(100),
  description: Joi.string().max(1000),
  permissions: Joi.object().default({}),
  status: Joi.string().valid('active', 'inactive').default('active')
});

// GET /api/roles - ロール一覧取得
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM roles WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR display_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // 総件数取得
    let countQuery = 'SELECT COUNT(*) FROM roles WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (name ILIKE $${countParamIndex} OR display_name ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/roles/:id - ロール詳細取得
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/roles - ロール作成
router.post('/', async (req, res) => {
  try {
    const { error, value } = roleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, display_name, description, permissions, status } = value;
    const result = await pool.query(
      `INSERT INTO roles (name, display_name, description, permissions, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [name, display_name, description, JSON.stringify(permissions), status]
    );

    logger.info(`Role created: ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Role name already exists' });
    }
    logger.error('Error creating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/roles/:id - ロール更新
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = roleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, display_name, description, permissions, status } = value;
    
    // 管理者ロールの名前変更を防ぐ
    const existingRole = await pool.query('SELECT name FROM roles WHERE id = $1', [id]);
    if (existingRole.rows.length > 0 && existingRole.rows[0].name === 'admin' && name !== 'admin') {
      return res.status(400).json({ error: 'Cannot change admin role name' });
    }

    const result = await pool.query(
      `UPDATE roles 
       SET name = $1, display_name = $2, description = $3, permissions = $4, status = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, display_name, description, JSON.stringify(permissions), status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    logger.info(`Role updated: ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Role name already exists' });
    }
    logger.error('Error updating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/roles/:id - ロール削除
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 管理者ロールの削除を防ぐ
    const roleCheck = await pool.query('SELECT name FROM roles WHERE id = $1', [id]);
    if (roleCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    if (roleCheck.rows[0].name === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin role' });
    }

    // このロールを使用しているユーザーがいるかチェック
    const userCheck = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', [roleCheck.rows[0].name]);
    if (parseInt(userCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete role that is assigned to users' });
    }

    const result = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING *', [id]);

    logger.info(`Role deleted: ${id}`);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    logger.error('Error deleting role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;