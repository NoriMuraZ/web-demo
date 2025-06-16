const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
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

// Validation schemas
const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required().max(255),
  full_name: Joi.string().required().max(255),
  role: Joi.string().valid('admin', 'manager', 'operator', 'viewer').required(),
  department: Joi.string().required().max(100),
  status: Joi.string().valid('active', 'inactive').default('active'),
  password: Joi.string().min(8).when('$isUpdate', {
    is: true,
    then: Joi.optional(),
    otherwise: Joi.required()
  })
});

// GET /api/users - ユーザー一覧取得
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, role, department, status } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, username, email, full_name, role, department, status, last_login, created_at, updated_at FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (username ILIKE $${paramIndex} OR full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      query += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    if (department) {
      query += ` AND department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // 総件数取得
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (username ILIKE $${countParamIndex} OR full_name ILIKE $${countParamIndex} OR email ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (role) {
      countQuery += ` AND role = $${countParamIndex}`;
      countParams.push(role);
      countParamIndex++;
    }

    if (department) {
      countQuery += ` AND department = $${countParamIndex}`;
      countParams.push(department);
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
    logger.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id - ユーザー詳細取得
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, username, email, full_name, role, department, status, last_login, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users - ユーザー作成
router.post('/', async (req, res) => {
  try {
    const { error, value } = userSchema.validate(req.body, { context: { isUpdate: false } });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, full_name, role, department, status, password } = value;
    
    // パスワードハッシュ化
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, role, department, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, username, email, full_name, role, department, status, created_at, updated_at`,
      [username, email, password_hash, full_name, role, department, status]
    );

    logger.info(`User created: ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      if (error.constraint.includes('username')) {
        return res.status(400).json({ error: 'Username already exists' });
      } else if (error.constraint.includes('email')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }
    logger.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:id - ユーザー更新
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = userSchema.validate(req.body, { context: { isUpdate: true } });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, full_name, role, department, status, password } = value;
    
    let query, params;
    
    if (password) {
      // パスワードも更新する場合
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      query = `UPDATE users 
               SET username = $1, email = $2, password_hash = $3, full_name = $4, role = $5, department = $6, status = $7, updated_at = NOW()
               WHERE id = $8
               RETURNING id, username, email, full_name, role, department, status, last_login, created_at, updated_at`;
      params = [username, email, password_hash, full_name, role, department, status, id];
    } else {
      // パスワードは更新しない場合
      query = `UPDATE users 
               SET username = $1, email = $2, full_name = $3, role = $4, department = $5, status = $6, updated_at = NOW()
               WHERE id = $7
               RETURNING id, username, email, full_name, role, department, status, last_login, created_at, updated_at`;
      params = [username, email, full_name, role, department, status, id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`User updated: ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      if (error.constraint.includes('username')) {
        return res.status(400).json({ error: 'Username already exists' });
      } else if (error.constraint.includes('email')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }
    logger.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:id - ユーザー削除
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 管理者ユーザーの削除を防ぐ
    const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (userCheck.rows[0].role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin user' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`User deleted: ${id}`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;