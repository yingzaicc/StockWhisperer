# StockWhisperer Web

智能股票投资工具 - 前端应用

## 技术栈

- React 18+
- TypeScript
- Vite
- React Router
- Ant Design
- Redux Toolkit
- ECharts
- Axios

## 目录结构

```
stock-whisperer-web/
├── public/                     # 静态资源
├── src/
│   ├── api/                    # API封装
│   ├── assets/                 # 资源文件
│   ├── components/             # 组件
│   ├── pages/                  # 页面
│   ├── hooks/                  # 自定义Hooks
│   ├── store/                  # 状态管理
│   ├── types/                  # TypeScript类型
│   ├── utils/                  # 工具函数
│   ├── App.tsx                 # 根组件
│   └── main.tsx                # 入口
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 开发指南

### 安装依赖

```bash
npm install
# 或
pnpm install
# 或
yarn install
```

### 运行

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 预览

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
npm run lint:fix
```

## 环境变量

创建 `.env.local` 文件：

```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
```

## 页面说明

- `/` - 仪表板（Dashboard）
- `/market` - 行情页面
- `/news` - 资讯页面
- `/analysis` - AI分析页面
- `/trading` - 交易页面
- `/settings` - 设置页面

## 组件说明

- `components/common` - 通用组件
- `components/market` - 行情相关组件
- `components/news` - 资讯相关组件
- `components/trading` - 交易相关组件
- `components/charts` - 图表组件

## API封装

所有API调用都封装在 `src/api/` 目录下：

- `config.ts` - API配置
- `market.ts` - 行情API
- `news.ts` - 资讯API
- `ai.ts` - AI API
- `trading.ts` - 交易API

## 状态管理

使用 Redux Toolkit 进行状态管理：

- `store/market` - 行情状态
- `store/user` - 用户状态
- `store/trading` - 交易状态

## Docker

```bash
# 构建镜像
docker build -t stock-whisperer-web:latest .

# 运行容器
docker run -p 80:80 stock-whisperer-web:latest
```

## 许可证

MIT License
