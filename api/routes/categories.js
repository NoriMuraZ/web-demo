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
const categorySchema = Joi.object({
  name: Joi.string().required().max(100),
  description: Joi.string().max(1000),
  parent_id: Joi.number().integer().allow(null),
  status: Joi.string().valid('active', 'inactive').default('active')
});

// GET /api/categories - カテゴリ一覧取得
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status, parent_id } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM categories WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (parent_id !== undefined) {
      if (parent_id === 'null' || parent_id === '') {
        query += ` AND parent_id IS NULL`;
      } else {
        query += ` AND parent_id = $${paramIndex}`;
        params.push(parent_id);
        paramIndex++;
      }
    }

    query += ` ORDER BY name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // 総件数取得
    let countQuery = 'SELECT COUNT(*) FROM categories WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (name ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (parent_id !== undefined) {
      if (parent_id === 'null' || parent_id === '') {
        countQuery += ` AND parent_id IS NULL`;
      } else {
        countQuery += ` AND parent_id = $${countParamIndex}`;
        countParams.push(parent_id);
      }
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
    logger.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/categories/:id - カテゴリ詳細取得
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/categories - カテゴリ作成
router.post('/', async (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, description, parent_id, status } = value;
    const result = await pool.query(
      `INSERT INTO categories (name, description, parent_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [name, description, parent_id, status]
    );

    logger.info(`Category created: ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Category name already exists' });
    }
    logger.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/categories/:id - カテゴリ更新
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, description, parent_id, status } = value;
    
    // 自分自身を親に設定することを防ぐ
    if (parent_id && parseInt(parent_id) === parseInt(id)) {
      return res.status(400).json({ error: 'Category cannot be its own parent' });
    }

    const result = await pool.query(
      `UPDATE categories 
       SET name = $1, description = $2, parent_id = $3, status = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name, description, parent_id, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    logger.info(`Category updated: ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Category name already exists' });
    }
    logger.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/categories/:id - カテゴリ削除
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 子カテゴリが存在するかチェック
    const childCheck = await pool.query('SELECT COUNT(*) FROM categories WHERE parent_id = $1', [id]);
    if (parseInt(childCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete category with child categories' });
    }

    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    logger.info(`Category deleted: ${id}`);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    logger.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;