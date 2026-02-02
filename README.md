# StockWhisperer

智能股票投资工具 - 为个人投资者提供实时行情、资讯提醒、AI预测和自动化交易等一体化服务

## 项目简介

StockWhisperer 是一个基于 Go + React 的智能股票投资工具，采用单体架构 + Go Workspace 模块化设计，为个人投资者提供：
- 实时行情查看与分析
- 财经新闻与公告监控
- AI驱动的投资建议
- 策略回测与模拟交易

## 架构设计

项目采用 **单体架构 + Go Workspace 模块化** 模式：

```
stock-whisperer-project/
├── go.work                    # Go Workspace配置
├── stock-whisperer/           # 主应用（单体应用）
├── newscrawler/               # 新闻爬虫模块（独立Go模块）
└── stock-whisperer-web/       # 前端（独立项目）
```

**架构优势**：
- 单体应用避免微服务的管理复杂度和通信损耗
- Go Workspace 实现模块化管理
- 内部模块间通过 Go 函数调用，零网络开销
- 前端和爬虫作为独立项目，通过 HTTP API 与主应用通信

## 技术栈

### 后端
- **语言**: Go 1.25+
- **框架**: Gin
- **数据库**: PostgreSQL / TimescaleDB / MongoDB
- **缓存**: Redis
- **AI模型**: Deepseek（主要）、通义千问（备用）

### 前端
- **框架**: React 18+
- **语言**: TypeScript
- **构建工具**: Vite
- **UI组件**: Ant Design
- **图表**: ECharts

## 快速开始

### 环境要求

- Go 1.25+
- Node.js 18+
- Docker & Docker Compose（可选）
- PostgreSQL 15+
- MongoDB 6+
- Redis 7+

### 安装依赖

#### 后端

```bash
# 安装Go依赖
cd stock-whisperer
go mod tidy

cd ../newscrawler
go mod tidy
```

#### 前端

```bash
cd stock-whisperer-web
npm install
```

### 运行

#### 方式一：本地开发

```bash
# 1. 启动数据库服务
docker-compose up -d postgres mongodb redis

# 2. 启动 NewsCrawler
cd newscrawler
go run cmd/server/main.go

# 3. 启动主应用
cd stock-whisperer
export DEEPSEEK_API_KEY=your_api_key
go run cmd/api/main.go

# 4. 启动前端
cd stock-whisperer-web
npm run dev
```

#### 方式二：Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 访问

- 前端: http://localhost:3000
- 主应用 API: http://localhost:8080
- NewsCrawler API: http://localhost:8081

## 模块说明

### 主应用 (stock-whisperer)

单体应用，包含所有业务逻辑：

- **行情服务**: 实时行情、K线数据、市场概览
- **资讯服务**: 财经新闻、公告、舆情
- **AI服务**: 预测分析、投资建议
- **交易服务**: 策略回测、模拟交易
- **用户服务**: 用户管理、自选股

### NewsCrawler (newscrawler)

独立的新闻爬虫模块：

- 财经新闻爬取（东方财富、新浪财经等）
- 个股公告爬取
- 舆情数据采集
- HTTP API 服务

### 前端 (stock-whisperer-web)

React 应用，提供用户界面：

- 仪表板
- 行情页面
- 资讯页面
- AI 分析页面
- 交易页面
- 设置页面

## 配置说明

### 环境变量

创建 `.env` 文件：

```env
# Deepseek API
DEEPSEEK_API_KEY=your_deepseek_api_key

# 通义千问 API
QWEN_API_KEY=your_qwen_api_key

# 数据库
DATABASE_URL=postgres://admin:password@localhost:5432/stockwhisperer
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://localhost:27017

# NewsCrawler
NEWSCRAWLER_URL=http://localhost:8081
```

### 配置文件

- 主应用: `stock-whisperer/configs/config.yaml`
- 前端: `stock-whisperer-web/.env.local`

## 开发指南

### 项目结构

详见各模块的 README 文件：

- [主应用 README](stock-whisperer/README.md)
- [NewsCrawler README](newscrawler/README.md)
- [前端 README](stock-whisperer-web/README.md)

### API 文档

- [架构设计文档](docs/设计文档/架构设计_v1.0.md)
- [需求分析文档](docs/设计文档/需求分析_v1.0.md)

### 代码规范

- **Go**: 遵循 `gofmt` 和 ` Effective Go`
- **React**: 遵循 Airbnb JavaScript 风格指南
- **Git**: 使用语义化提交信息

### 测试

```bash
# 后端测试
cd stock-whisperer
go test ./...

# 前端测试
cd stock-whisperer-web
npm run lint
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

### Kubernetes

参考 [架构设计文档](docs/设计文档/架构设计_v1.0.md#七部署架构设计) 中的 Kubernetes 配置。

## 功能状态

### 第一阶段：MVP版本（开发中）

- [ ] 实时行情查询与展示
- [ ] K线图表与技术指标
- [ ] 自选股管理
- [ ] 基础财经新闻展示
- [ ] 简单技术指标分析

### 第二阶段：AI预测功能（规划中）

- [ ] 新闻情感分析
- [ ] 短期走势预测模型
- [ ] 基础投资建议生成
- [ ] 预测走势图可视化
- [ ] 事件日历与提醒

### 第三阶段：策略回测（规划中）

- [ ] 策略引擎开发
- [ ] 历史数据回测系统
- [ ] 回测报告生成
- [ ] 多策略比较

### 第四阶段：自动化交易（规划中）

- [ ] 模拟交易系统
- [ ] 资金管理模块
- [ ] 风控系统
- [ ] 策略自动执行

## 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- GitHub: https://github.com/yingzaicc/stock-whisperer
- Issues: https://github.com/yingzaicc/stock-whisperer/issues

## 致谢

感谢所有开源项目的贡献者！

- [Gin](https://github.com/gin-gonic/gin)
- [React](https://github.com/facebook/react)
- [Ant Design](https://github.com/ant-design/ant-design)
- [ECharts](https://github.com/apache/echarts)
