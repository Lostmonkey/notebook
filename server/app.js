require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const config = require('./config');
const database = require('./utils/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// 导入路由
const authRoutes = require('./routes/auth');
const folderRoutes = require('./routes/folders');
const noteRoutes = require('./routes/notes');
const folderNoteRoutes = require('./routes/folderNotes');

const app = express();

// 信任代理（用于阿里云函数计算）
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false, // 在开发环境中禁用CSP
  crossOriginEmbedderPolicy: false
}));

// 跨域配置
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Gzip压缩
app.use(compression());

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 每15分钟最多1000个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  // 响应结束时记录耗时
  const originalSend = res.send;
  res.send = function(...args) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    return originalSend.apply(this, args);
  };
  
  next();
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    database: database.isConnected() ? '已连接' : '未连接'
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/folders', folderNoteRoutes); // 文件夹下的笔记路由
app.use('/api/notes', noteRoutes);

// 根路径
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '智能笔记本API服务',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      folders: '/api/folders',
      notes: '/api/notes'
    }
  });
});

// 404处理
app.use(notFoundHandler);

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const startServer = async () => {
  try {
    // 连接数据库
    await database.connect();
    
    const server = app.listen(config.port, () => {
      console.log(`\n🚀 服务器启动成功！`);
      console.log(`📊 端口: ${config.port}`);
      console.log(`🌐 本地访问: http://localhost:${config.port}`);
      console.log(`🔗 健康检查: http://localhost:${config.port}/health`);
      console.log(`📖 API文档: http://localhost:${config.port}/api`);
      console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}\n`);
    });
    
    // 优雅关闭
    process.on('SIGTERM', () => {
      console.log('收到SIGTERM信号，正在优雅关闭服务器...');
      server.close(async () => {
        await database.disconnect();
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('\n收到SIGINT信号，正在优雅关闭服务器...');
      server.close(async () => {
        await database.disconnect();
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

// 如果直接运行此文件，则启动服务器
if (require.main === module) {
  startServer();
}

module.exports = app;