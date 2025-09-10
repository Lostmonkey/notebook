# Claude Configuration

智能笔记本系统的 Claude Code 配置文件。

## 项目概述

这是一个基于 React + Node.js 的智能笔记系统，支持富文本编辑、文件夹管理和多用户。

**设计文档**: `docs/design-doc.md` - 包含完整的系统架构、API设计和数据库模型

## 技术栈

- **前端**: React 19, Material-UI, TipTap, Zustand, TanStack Query, Ky
- **后端**: Node.js, Express.js, Mongoose  
- **数据库**: MongoDB Atlas
- **部署**: 阿里云函数计算

## 常用命令

### 开发环境
- `npm run dev` - 启动开发服务器
- `npm run build` - 构建项目
- `npm run lint` - 代码检查
- `npm run test` - 运行测试

### Git 命令
- `git status` - 检查仓库状态
- `git add .` - 暂存所有更改
- `git commit -m "message"` - 提交更改

## 项目结构

### 前端 (src/)
```
components/     # 可复用组件
├── Editor/     # TipTap编辑器
├── FileTree/   # 文件树
└── common/     # 通用组件

pages/          # 页面组件
hooks/          # 自定义Hook  
services/       # API服务
stores/         # Zustand状态管理
utils/          # 工具函数
```

### 后端 (server/)
```
models/         # MongoDB模型 (User, Folder, Note)
routes/         # API路由
controllers/    # 控制器
services/       # 业务逻辑
middleware/     # 中间件 (auth, validation)
```

## API 接口规范

### 认证
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `POST /api/auth/logout` - 用户登出

### 文件夹
- `GET /api/folders` - 获取文件夹列表
- `POST /api/folders` - 创建文件夹
- `PUT /api/folders/:id` - 更新文件夹
- `DELETE /api/folders/:id` - 删除文件夹

### 笔记  
- `GET /api/folders/:folderId/notes` - 获取文件夹下的笔记列表
- `GET /api/notes/:id` - 获取笔记详情
- `POST /api/folders/:folderId/notes` - 创建笔记
- `PUT /api/notes/:id` - 更新笔记
- `DELETE /api/notes/:id` - 删除笔记
- `PUT /api/notes/:id/move` - 移动笔记到其他文件夹

## 数据模型

### User 模型
```javascript
{
  _id: ObjectId,
  username: String,     // 唯一用户名
  createdAt: Date,
  updatedAt: Date
}
```

### Folder 模型
```javascript  
{
  _id: ObjectId,
  name: String,         // 文件夹名称
  type: String,         // "system" | "user"
  userId: ObjectId,     // 所属用户
  createdAt: Date,
  updatedAt: Date
}
```

### Note 模型
```javascript
{
  _id: ObjectId,
  title: String,        // 笔记标题
  content: Object,      // TipTap JSON格式
  folderId: ObjectId,   // 所属文件夹
  userId: ObjectId,     // 所属用户
  createdAt: Date,
  updatedAt: Date
}
```

## 开发注意事项

1. **数据隔离**: 所有API都必须包含用户身份验证，确保数据安全
2. **状态管理**: 使用 Zustand 管理客户端状态，TanStack Query 管理服务端状态
3. **编辑器**: 基于 TipTap，支持富文本、表格等扩展
4. **响应格式**: 统一使用 `{success: boolean, data?: any, message?: string}` 格式
5. 遇到端口占用的情况，先kill对应进程
6. 前端开发尽量用fluent ui，按照fluent 2的设计，不要自己写css什么的