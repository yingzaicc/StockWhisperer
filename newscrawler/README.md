# NewsCrawler 新闻爬虫模块

StockWhisperer的新闻资讯爬虫模块（独立Go模块）

## 功能

- 财经新闻爬取
- 个股公告爬取
- 舆情数据采集
- HTTP API服务

## 技术栈

- Go 1.21+
- Gin Web框架
- Colly爬虫框架
- MongoDB (数据存储)
- Redis (缓存)

## 目录结构

```
newscrawler/
├── cmd/
│   ├── server/              # HTTP服务器
│   └── worker/              # 定时爬取任务
├── internal/
│   ├── api/                 # HTTP API
│   ├── crawler/             # 爬虫引擎
│   │   ├── eastmoney/
│   │   └── sina/
│   ├── parser/              # 内容解析器
│   ├── repository/          # 数据存储
│   └── model/               # 数据模型
├── scripts/                 # 脚本
├── go.mod
└── Dockerfile
```

## 开发指南

### 安装依赖

```bash
go mod tidy
```

### 运行

```bash
# 运行HTTP服务器
go run cmd/server/main.go

# 运行爬虫Worker
go run cmd/worker/main.go
```

### 构建

```bash
# 构建服务器
go build -o bin/server cmd/server/main.go

# 构建Worker
go build -o bin/worker cmd/worker/main.go
```

### Docker

```bash
# 构建镜像
docker build -t newscrawler:latest .

# 运行服务器
docker run -p 8081:8081 newscrawler:latest ./server

# 运行Worker
docker run newscrawler:latest ./worker
```

## API文档

### 健康检查

- `GET /health` - 健康检查

### 新闻相关

- `GET /api/v1/news?limit=20&category=market` - 获取新闻列表
- `GET /api/v1/news/:id` - 根据ID获取新闻

### 公告相关

- `GET /api/v1/announcements?stock=000001` - 获取公告列表
- `GET /api/v1/announcements/:id` - 根据ID获取公告

### 舆情相关

- `GET /api/v1/sentiment?stock=000001&days=7` - 获取舆情数据

## 环境变量

- `MONGODB_URL`: MongoDB连接字符串
- `REDIS_URL`: Redis连接字符串
- `CRAWL_INTERVAL`: 爬取间隔（分钟）

## 许可证

MIT License
