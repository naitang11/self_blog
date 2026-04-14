const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// PostgreSQL 连接
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

console.log('📦 数据库: PostgreSQL (Railway)');

// 初始化表
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS jokes (
        id        SERIAL PRIMARY KEY,
        content   TEXT    NOT NULL,
        date      TEXT    NOT NULL,
        likes     INTEGER DEFAULT 0,
        liked     INTEGER DEFAULT 0,
        createdAt TIMESTAMP DEFAULT (NOW() + INTERVAL '8 hours')
      )
    `);

    // 预置段子（如果表是空的）
    const res = await client.query('SELECT COUNT(*) FROM jokes');
    if (parseInt(res.rows[0].count) === 0) {
      const defaults = [
        ['程序员最讨厌的两件事：写文档和别人不写文档。', '2026-04-09', 0],
        ['为什么程序员总是分不清万圣节和圣诞节？因为 Oct 31 = Dec 25。', '2026-04-08', 0],
        ['一个 SQL 查询走进一家酒吧，看到两张表，问：可以 JOIN 我吗？', '2026-04-07', 0],
        ['我去修手机，老板说：「CPU烧了，修不了，换新的吧。」我：「多少钱？」老板：「八千。」我：「那我直接换台新电脑算了。」老板：「那硬盘也给你装上。」', '2026-04-09', 0],
        ['同事问我：「你为什么每天都这么开心？」我说：「因为我写的代码从来没出过bug。」同事：「……」我：「好吧，是从来没发现过。」', '2026-04-08', 0],
        ['刚才在电梯里看到一个外卖小哥在打电话：「喂，客人吗？您的外卖到了，在电梯里，电梯坏了。」我问他怎么下去，他说：「走楼梯啊。」然后他转头对着手机说：「对，就是这么高。」', '2026-04-07', 0],
        ['女朋友跟我说：「你今天什么都不用做，就在家休息。」然后我就在家躺了一天，她回来问我：「今天干嘛了？」我说：「什么都没做。」她说：「那碗呢？那地呢？那衣服呢？」我：「你说的什么都不用做啊。」她：「……」', '2026-04-06', 0],
        ['刚才面试，面试官问我：「你抗压吗？」我说：「抗。」他又问：「能加班吗？」我说：「能。」他又问：「工资少点行吗？」我说：「……你是在招我还是在招募志愿者？」', '2026-04-05', 0],
        ['昨晚梦见我去面试，面试官看了我的简历三秒钟，然后说：「明天来上班吧。」我问：「不用复试吗？」他说：「不用了，我怕你过两天就自己跑了。」', '2026-04-04', 0],
        ['室友在做饭，突然对我说：「帮我拿个盘子。」我去厨房一看，有个盘子、有个碗、有个杯子。我说：「哪个是盘子？」他说：「就是那个圆的啊。」我：「……」然后我拿了个杯盖给他。', '2026-04-03', 0],
      ];
      for (const [content, date, likes] of defaults) {
        await client.query(
          'INSERT INTO jokes (content, date, likes) VALUES ($1, $2, $3)',
          [content, date, likes]
        );
      }
      console.log('✅ 预置段子已写入数据库');
    }
  } finally {
    client.release();
  }
}

initDB().catch(console.error);

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件（生产模式）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..')));
}

// --- API ---

// GET 所有段子
app.get('/api/jokes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jokes ORDER BY createdAt DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST 发段子
app.post('/api/jokes', async (req, res) => {
  try {
    const { content, date } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '内容不能为空' });
    }
    const result = await pool.query(
      'INSERT INTO jokes (content, date, likes) VALUES ($1, $2, 0) RETURNING *',
      [content.trim(), date || new Date().toISOString().split('T')[0]]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE 删除段子
app.delete('/api/jokes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM jokes WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST 点赞/取消点赞
app.post('/api/jokes/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const jokeRes = await pool.query('SELECT * FROM jokes WHERE id = $1', [id]);
    if (jokeRes.rows.length === 0) return res.status(404).json({ error: '段子不存在' });

    const joke = jokeRes.rows[0];
    const newLiked = joke.liked ? 0 : 1;
    const newLikes = joke.liked ? joke.likes - 1 : joke.likes + 1;
    await pool.query('UPDATE jokes SET liked = $1, likes = $2 WHERE id = $3', [newLiked, newLikes, id]);

    res.json({ liked: newLiked, likes: newLikes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 生产模式：其余请求返回 index.html（支持 SPA 路由）
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在 http://0.0.0.0:${PORT}`);
});
