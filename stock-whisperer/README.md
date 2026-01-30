# StockWhisperer 主应用

智能股票投资工具 - 主应用（单体应用）

## 功能模块

- 实时行情系统
- 资讯与事件提醒系统
- AI预测与分析系统
- 自动化交易系统

## 技术栈

- Go 1.21+
- Gin Web框架
- PostgreSQL / TimescaleDB / MongoDB
- Redis

## 目录结构

```
stock-whisperer/
├── cmd/                        # 可执行程序
│   └── api/                   # API服务入口
├── internal/                   # 私有代码
│   ├── api/                   # HTTP层
│   ├── service/               # 业务逻辑层
│   ├── repository/            # 数据访问层
│   ├── model/                 # 数据模型
│   └── config/                # 配置管理
├── pkg/                        # 公共库
│   ├── logger/
│   ├── cache/
│   └── utils/
├── configs/                    # 配置文件
├── scripts/                    # 脚本
└── go.mod
```

## 开发指南

### 安装依赖

```bash
go mod tidy
```

### 运行

```bash
# 开发环境
go run cmd/api/main.go

# 使用配置文件
CONFIG_FILE=./configs/config.yaml go run cmd/api/main.go
```

### 构建

```bash
# 构建二进制文件
go build -o bin/api cmd/api/main.go

# 使用构建脚本
chmod +x scripts/build.sh
./scripts/build.sh
```

### Docker

```bash
# 构建镜像
docker build -t stock-whisperer:latest .

# 运行容器
docker run -p 8080:8080 stock-whisperer:latest
```

## 配置说明

配置文件位于 `configs/config.yaml`

- `server`: 服务器配置（端口、模式等）
- `log`: 日志配置
- `database`: 数据库配置
- `redis`: Redis配置
- `ai`: AI服务配置（Deepseek、通义千问）
- `news_crawler`: NewsCrawler配置

## 环境变量

- `CONFIG_FILE`: 配置文件路径
- `DEEPSEEK_API_KEY`: Deepseek API密钥
- `QWEN_API_KEY`: 通义千问API密钥
- `DATABASE_URL`: 数据库连接字符串
- `REDIS_URL`: Redis连接字符串

## API文档

### 健康检查

- `GET /health` - 健康检查
- `GET /ready` - 就绪检查

### 行情相关

- `GET /api/v1/market/quote/:code` - 获取实时行情
- `GET /api/v1/market/klines` - 获取K线数据
- `GET /api/v1/market/overview` - 获取市场概览

### 资讯相关

- `GET /api/v1/news` - 获取新闻
- `GET /api/v1/news/announcements` - 获取公告
- `GET /api/v1/news/sentiment` - 获取舆情

### AI相关

- `POST /api/v1/ai/predict` - AI预测
- `GET /api/v1/ai/advice` - 获取投资建议

### 交易相关

- `POST /api/v1/trading/backtest` - 策略回测
- `GET /api/v1/trading/positions` - 获取持仓
- `POST /api/v1/trading/order` - 下单

### 用户相关

- `POST /api/v1/user/login` - 登录
- `GET /api/v1/user/profile` - 获取用户信息
- `GET /api/v1/user/watchlist` - 获取自选股

## 开发规范

### 代码组织

- 使用清晰的分层架构
- 业务逻辑放在 `service` 包
- HTTP处理放在 `api/handler` 包
- 数据访问放在 `repository` 包

### 命名规范

- 包名使用小写单词
- 导出的函数/变量使用大驼峰
- 私有的函数/变量使用小驼峰

### 错误处理

- 使用 `pkg/errors` 包处理错误
- 记录详细的错误日志
- 返回友好的错误信息给用户

## 许可证

MIT License
