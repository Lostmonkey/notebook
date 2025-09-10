# 智能笔记本系统设计文档

## 1. 系统概览

### 1.1 架构图
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用      │    │   后端API       │    │   MongoDB       │
│   React + MUI   │◄──►│  Node.js/Express│◄──►│   云数据库      │
│   TipTap编辑器  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.2 技术栈
- **前端**: React 19, Material-UI, TipTap, Axios
- **后端**: Node.js, Express.js, Mongoose
- **数据库**: MongoDB Atlas
- **部署**: 阿里云函数计算
- **开发工具**: Vite, ESLint, Prettier

## 2. 数据库设计

### 2.1 数据模型

#### 2.1.1 用户模型 (Users)
```javascript
{
  _id: ObjectId,
  username: String,        // 用户名（唯一）
  createdAt: Date,
  updatedAt: Date
}
```

#### 2.1.2 文件夹模型 (Folders)
```javascript
{
  _id: ObjectId,
  name: String,           // 文件夹名称
  type: String,           // "system" | "user"
  userId: ObjectId,       // 所属用户ID
  order: Number,          // 显示顺序
  createdAt: Date,
  updatedAt: Date
}
```

#### 2.1.3 笔记模型 (Notes)
```javascript
{
  _id: ObjectId,
  title: String,          // 笔记标题
  content: Object,        // TipTap JSON格式内容
  folderId: ObjectId,     // 所属文件夹ID
  userId: ObjectId,       // 所属用户ID
  order: Number,          // 文件夹内显示顺序
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 索引设计
```javascript
// 用户索引
db.users.createIndex({ "username": 1 }, { unique: true })

// 文件夹索引
db.folders.createIndex({ "userId": 1, "type": 1 })
db.folders.createIndex({ "userId": 1, "order": 1 })

// 笔记索引
db.notes.createIndex({ "userId": 1, "folderId": 1 })
db.notes.createIndex({ "folderId": 1, "order": 1 })
```

## 3. API设计

### 3.1 认证相关

#### POST /api/auth/login
**请求体:**
```json
{
  "username": "string"
}
```
**响应:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "username": "string"
    },
    "token": "string"
  }
}
```

### 3.2 文件夹管理

#### GET /api/folders
**响应:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "name": "string",
      "type": "system|user",
      "order": "number",
      "notesCount": "number"
    }
  ]
}
```

#### POST /api/folders
**请求体:**
```json
{
  "name": "string"
}
```

#### PUT /api/folders/:id
**请求体:**
```json
{
  "name": "string"
}
```

#### DELETE /api/folders/:id
**响应:**
```json
{
  "success": true,
  "message": "文件夹删除成功"
}
```

### 3.3 笔记管理

#### GET /api/folders/:folderId/notes
**响应:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "title": "string",
      "order": "number",
      "updatedAt": "string"
    }
  ]
}
```

#### GET /api/notes/:id
**响应:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "title": "string",
    "content": "object",
    "folderId": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### POST /api/folders/:folderId/notes
**请求体:**
```json
{
  "title": "string",
  "content": "object"
}
```

#### PUT /api/notes/:id
**请求体:**
```json
{
  "title": "string",
  "content": "object"
}
```

#### DELETE /api/notes/:id

### 3.4 AI接口 (预留)

#### POST /api/ai/suggest
**请求体:**
```json
{
  "content": "string",
  "context": "string"
}
```

#### POST /api/ai/enhance
**请求体:**
```json
{
  "content": "string",
  "action": "string"
}
```

## 4. 前端架构设计

### 4.1 组件结构
```
src/
├── components/           # 可复用组件
│   ├── Editor/          # TipTap编辑器相关
│   │   ├── TipTapEditor.jsx
│   │   ├── TableExtension.jsx
│   │   └── Toolbar.jsx
│   ├── FileTree/        # 文件树相关
│   │   ├── FolderNode.jsx
│   │   ├── NoteNode.jsx
│   │   └── ContextMenu.jsx
│   └── common/          # 通用组件
│       ├── Loading.jsx
│       └── ErrorBoundary.jsx
├── pages/               # 页面组件
│   ├── Login.jsx
│   └── Notebook.jsx
├── hooks/               # 自定义Hook
│   ├── useAuth.js
│   ├── useNotes.js
│   └── useFolders.js
├── services/            # API服务
│   ├── api.js
│   ├── authService.js
│   ├── folderService.js
│   └── noteService.js
├── store/               # 状态管理
│   ├── authSlice.js
│   ├── notebookSlice.js
│   └── store.js
└── utils/               # 工具函数
    ├── constants.js
    └── helpers.js
```

### 4.2 状态管理 (Redux Toolkit)

#### 4.2.1 Auth State
```javascript
{
  user: {
    id: string,
    username: string
  },
  token: string,
  isAuthenticated: boolean,
  loading: boolean
}
```

#### 4.2.2 Notebook State
```javascript
{
  folders: [
    {
      id: string,
      name: string,
      type: string,
      notes: array
    }
  ],
  currentNote: {
    id: string,
    title: string,
    content: object,
    folderId: string
  },
  selectedFolderId: string,
  loading: boolean,
  error: string
}
```

### 4.3 TipTap编辑器配置

#### 4.3.1 基础扩展
```javascript
const extensions = [
  StarterKit,
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  Placeholder.configure({
    placeholder: '开始写笔记...',
  }),
]
```

#### 4.3.2 自定义表格扩展
```javascript
const TableExtension = Extension.create({
  name: 'customTable',
  
  addCommands() {
    return {
      insertTable: () => ({ commands }) => {
        return commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      },
      addColumnBefore: () => ({ commands }) => {
        return commands.addColumnBefore()
      },
      addColumnAfter: () => ({ commands }) => {
        return commands.addColumnAfter()
      },
      deleteColumn: () => ({ commands }) => {
        return commands.deleteColumn()
      },
      addRowBefore: () => ({ commands }) => {
        return commands.addRowBefore()
      },
      addRowAfter: () => ({ commands }) => {
        return commands.addRowAfter()
      },
      deleteRow: () => ({ commands }) => {
        return commands.deleteRow()
      },
    }
  },
})
```

## 5. 后端架构设计

### 5.1 项目结构
```
server/
├── models/              # 数据模型
│   ├── User.js
│   ├── Folder.js
│   └── Note.js
├── routes/              # 路由定义
│   ├── auth.js
│   ├── folders.js
│   ├── notes.js
│   └── ai.js
├── middleware/          # 中间件
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── controllers/         # 控制器
│   ├── authController.js
│   ├── folderController.js
│   └── noteController.js
├── services/            # 业务逻辑
│   ├── userService.js
│   ├── folderService.js
│   └── noteService.js
├── utils/               # 工具函数
│   ├── database.js
│   └── response.js
├── config/              # 配置文件
│   └── index.js
└── app.js               # 应用入口
```

### 5.2 中间件设计

#### 5.2.1 认证中间件
```javascript
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: '无效的认证令牌' });
  }
};
```

#### 5.2.2 验证中间件
```javascript
const validateFolder = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('文件夹名称长度必须在1-50个字符之间'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '验证失败',
        errors: errors.array()
      });
    }
    next();
  }
];
```

### 5.3 数据库服务

#### 5.3.1 文件夹服务
```javascript
class FolderService {
  async createSystemFolders(userId) {
    const systemFolders = [
      { name: '单词表', type: 'system', userId, order: 1 },
      { name: '例句集', type: 'system', userId, order: 2 },
      { name: '素材库', type: 'system', userId, order: 3 }
    ];
    
    return await Folder.insertMany(systemFolders);
  }
  
  async getUserFolders(userId) {
    return await Folder.find({ userId }).sort({ order: 1 });
  }
  
  async createFolder(userId, name) {
    const maxOrder = await Folder.findOne({ userId }).sort({ order: -1 });
    const order = maxOrder ? maxOrder.order + 1 : 4;
    
    return await Folder.create({
      name,
      type: 'user',
      userId,
      order
    });
  }
}
```

#### 5.3.2 笔记服务
```javascript
class NoteService {
  async getNotesByFolder(folderId, userId) {
    return await Note.find({ folderId, userId })
      .select('title order updatedAt')
      .sort({ order: 1 });
  }
  
  async createNote(folderId, userId, title, content) {
    const maxOrder = await Note.findOne({ folderId }).sort({ order: -1 });
    const order = maxOrder ? maxOrder.order + 1 : 1;
    
    return await Note.create({
      title,
      content,
      folderId,
      userId,
      order
    });
  }
  
  async updateNote(noteId, userId, updates) {
    return await Note.findOneAndUpdate(
      { _id: noteId, userId },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  }
}
```

## 6. 安全设计

### 6.1 认证安全
- JWT令牌过期时间设置为7天
- 用户名唯一性验证
- 输入数据验证和清理

### 6.2 数据安全
- 用户数据隔离（所有查询都包含userId）
- MongoDB查询注入防护
- XSS防护（内容转义）

### 6.3 API安全
- CORS配置
- 请求频率限制
- 输入长度限制

## 7. 性能优化

### 7.1 前端优化
- React.memo优化组件渲染
- 笔记内容懒加载
- 虚拟滚动（长列表）
- 本地缓存策略

### 7.2 后端优化
- 数据库连接池
- 查询结果缓存
- 分页查询
- 索引优化

### 7.3 网络优化
- API响应压缩
- 静态资源CDN
- HTTP/2支持

## 8. 部署架构

### 8.1 开发环境
```
前端: http://localhost:3000
后端: http://localhost:5000
数据库: MongoDB Atlas
```

### 8.2 生产环境
```
前端: 阿里云函数计算 + CDN
后端: 阿里云函数计算
数据库: MongoDB Atlas
```

### 8.3 CI/CD流程
1. 代码提交到Git仓库
2. 自动触发构建流程
3. 运行测试用例
4. 构建生产版本
5. 部署到阿里云函数计算

## 9. 监控和日志

### 9.1 应用监控
- API响应时间监控
- 错误率统计
- 用户行为分析

### 9.2 日志管理
- 结构化日志输出
- 错误日志收集
- 性能日志分析

## 10. 测试策略

### 10.1 单元测试
- 前端组件测试（Jest + React Testing Library）
- 后端API测试（Jest + Supertest）
- 数据库操作测试

### 10.2 集成测试
- API接口集成测试
- 前后端集成测试
- 数据库集成测试

### 10.3 端到端测试
- 关键用户流程测试
- 跨浏览器兼容性测试