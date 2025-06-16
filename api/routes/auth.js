const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Validation schemas
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

// POST /api/auth/login - ログイン
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, password } = value;

    // ユーザー検索
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND status = $2',
      [username, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // パスワード検証（実際の実装では、ハッシュ化されたパスワードと比較）
    // const isValidPassword = await bcrypt.compare(password, user.password_hash);
    // 今回はデモ用に簡単な比較
    const isValidPassword = password === 'password123';

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 最終ログイン時刻を更新
    await pool.query(
      'UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1',
      [user.id]
    );

    // JWTトークン生成
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`User logged in: ${username}`);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    logger.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout - ログアウト
router.post('/logout', (req, res) => {
  // JWTはステートレスなので、クライアント側でトークンを削除
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me - 現在のユーザー情報取得
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, username, email, full_name, role, department, status FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    logger.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;