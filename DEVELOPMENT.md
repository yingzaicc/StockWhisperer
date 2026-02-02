# StockWhisperer 开发文档

## 项目概述

StockWhisperer 是一个智能股票投资工具，采用单体架构 + Go Workspace 模块化设计。

### 模块说明

- **stock-whisperer**: 主应用，提供行情、AI预测、交易等核心功能
- **newscrawler**: 新闻爬虫模块，独立运行的微服务
- **stock-whisperer-web**: React前端应用

## 快速开始

### 环境要求

- Go 1.25+
- Node.js 18+
- Docker & Docker Compose（可选）
- PostgreSQL 15+
- MongoDB 6+
- Redis 7+

### 本地开发

#### 1. 启动数据库服务

```bash
docker-compose up -d postgres mongodb redis
```

#### 2. 配置环境变量

```bash
# 创建环境变量文件
cp .env.example .env

# 编辑.env，填入必要的配置
# DEEPSEEK_API_KEY=your_api_key
# QWEN_API_KEY=your_api_key
```

#### 3. 启动 NewsCrawler 服务

```bash
cd newscrawler
go run cmd/server/main.go
```

服务将在 http://localhost:8081 启动

#### 4. 启动主应用

```bash
cd stock-whisperer
export DEEPSEEK_API_KEY=your_api_key
go run cmd/api/main.go
```

服务将在 http://localhost:8080 启动

#### 5. 启动前端（可选）

```bash
cd stock-whisperer-web
npm install
npm run dev
```

前端将在 http://localhost:3000 启动

## API 文档

### NewsCrawler API (端口 8081)

#### 获取新闻列表
```
GET /api/v1/news?limit=20&category=stock
```

#### 获取新闻详情
```
GET /api/v1/news/:id
```

#### 获取公告列表
```
GET /api/v1/announcements?stock=000001&limit=20
```

#### 获取公告详情
```
GET /api/v1/announcements/:id
```

#### 获取舆情数据
```
GET /api/v1/sentiment?stock=000001&days=7
```

### 主应用 API (端口 8080)

#### 获取实时行情
```
GET /api/v1/market/quote/:code
```

#### 获取K线数据
```
GET /api/v1/market/klines?code=000001&period=1day&limit=100
```

#### 获取市场概览
```
GET /api/v1/market/overview
```

#### AI预测
```
POST /api/v1/ai/predict
Content-Type: application/json

{
  "stock_code": "000001",
  "days": 3
}
```

#### 获取投资建议
```
GET /api/v1/ai/advice?stock_code=000001
```

## 数据库配置

### PostgreSQL

存储用户数据、自选股、交易记录等：

```
host: localhost
port: 5432
user: admin
password: password
database: stockwhisperer
```

### TimescaleDB

存储时序数据（K线、实时行情等）：

```
host: localhost
port: 5432
user: admin
password: password
database: timeseries
```

### MongoDB

存储新闻、公告、舆情等文档数据：

```
host: localhost
port: 27017
database: newscrawler
```

### Redis

用于缓存和会话管理：

```
host: localhost
port: 6379
db: 0
```

## 项目结构

```
StockWhisperer/
├── go.work                      # Go Workspace 配置
├── stock-whisperer/             # 主应用
│   ├── cmd/
│   │   └── api/
│   │       └── main.go          # 应用入口
│   ├── internal/
│   │   ├── api/
│   │   │   ├── handler/         # HTTP处理器
│   │   │   ├── middleware/      # 中间件
│   │   │   └── router/          # 路由配置
│   │   ├── config/              # 配置管理
│   │   ├── database/            # 数据库初始化
│   │   ├── models/              # 数据模型
│   │   └── service/             # 业务逻辑
│   ├── pkg/
│   │   └── logger/              # 日志组件
│   ├── configs/
│   │   └── config.yaml          # 配置文件
│   └── go.mod
├── newscrawler/                 # 新闻爬虫
│   ├── cmd/
│   │   ├── server/              # API服务器
│   │   └── worker/              # 爬虫Worker
│   ├── internal/
│   │   ├── api/
│   │   │   ├── handler/
│   │   │   └── router/
│   │   ├── crawler/             # 爬虫实现
│   │   │   ├── eastmoney/       # 东方财富
│   │   │   └── sina/            # 新浪财经
│   │   ├── models/              # 数据模型
│   │   └── service/             # 业务逻辑
│   └── go.mod
└── stock-whisperer-web/         # 前端应用
    └── ...
```

## 开发指南

### 添加新的API端点

1. 在 `internal/api/handler/` 中添加处理函数
2. 在 `internal/api/router/router.go` 中注册路由
3. 如需数据库操作，在 `internal/service/` 中添加业务逻辑
4. 在 `internal/models/` 中定义数据模型

### 添加新的数据源爬虫

1. 在 `newscrawler/internal/crawler/` 下创建新目录
2. 实现 `Crawl() error` 函数
3. 在 `newscrawler/internal/crawler/collector/collector.go` 中调用

## 常见问题

### 1. 数据库连接失败

检查数据库服务是否启动：
```bash
docker-compose ps
```

### 2. 端口冲突

修改配置文件中的端口号：
- 主应用: `stock-whisperer/configs/config.yaml`
- NewsCrawler: 硬编码在 `cmd/server/main.go`

### 3. Go 依赖问题

重新整理依赖：
```bash
cd stock-whisperer
go mod tidy

cd ../newscrawler
go mod tidy
```

## 部署

### Docker 构建

```bash
# 构建主应用
docker build -t stock-whisperer:latest ./stock-whisperer

# 构建 NewsCrawler
docker build -t newscrawler:latest ./newscrawler

# 构建前端
docker build -t stock-whisperer-web:latest ./stock-whisperer-web
```

### Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 待完成功能

- [ ] 实现真实的数据库查询（目前使用模拟数据）
- [ ] 实现WebSocket实时推送
- [ ] 完善AI预测逻辑（对接Deepseek API）
- [ ] 实现用户认证和JWT
- [ ] 添加单元测试
- [ ] 添加性能监控

## 许可证

MIT License
