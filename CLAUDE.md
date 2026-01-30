# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**StockWhisperer（股语者）** 是一个 AI 驱动的股票预测工具,通过油猴脚本(tampermonkey userscript)的方式在东方财富网页上展示 AI 预测分析。

### 核心特点
- **轻量级实现**: 单文件油猴脚本 <500 行代码(可选 Python 后端)
- **AI 驱动**: 使用 LLM API(DeepSeek/GPT-4)进行股票走势预测和原因分析
- **快速开发**: 采用 AI 辅助开发模式,开发周期 3-5 天
- **成本低廉**: 完全免费,可选 LLM API 成本 50-200 元/月

### 项目定位
- MVP 阶段:油猴脚本快速验证
- 生产阶段:Chrome 插件方案
- 长期规划:独立应用

## 文档结构

项目包含完整的需求分析和设计文档,位于 `docs/` 目录:

### 核心文档
- `docs/初始需求.md` - 项目原始需求
- `docs/需求分析与功能点.md` - 详细功能模块设计
- `docs/技术方案对比分析_v2.0.md` - 6 种技术方案对比,推荐油猴脚本
- `docs/油猴脚本方案架构设计_v1.0.md` - 油猴脚本详细架构设计
- `docs/项目命名方案_v1.0.md` - 项目命名方案(StockWhisperer/股语者)

### 文档阅读优先级
1. 新手入门: `初始需求.md` → `技术方案对比分析_v2.0.md`
2. 开发实施: `油猴脚本方案架构设计_v1.0.md`
3. 功能扩展: `需求分析与功能点.md`

## 技术栈

### 前端(油猴脚本)
- **语言**: JavaScript ES6+
- **平台**: Tampermonkey / Violentmonkey
- **API**: Tampermonkey API (GM_xmlhttpRequest, GM_setValue/getValue)
- **目标网站**: 东方财富 (quote.eastmoney.com)

### 后端(可选)
- **语言**: Python 3.11+
- **框架**: FastAPI
- **数据源**: efinance / AKShare
- **LLM**: DeepSeek API / GPT-4 API

### 核心依赖
- `efinance`: 东方财富数据获取
- `httpx`: 异步 HTTP 客户端
- `pydantic`: 数据验证

## 架构设计

### 部署模式

#### 模式1: 纯前端模式(MVP 推荐)
```
浏览器 + 油猴脚本 → 直接调用公开 API
```
- 无需后端,开箱即用
- 单文件分发
- 功能受限(无历史数据)

#### 模式2: 混合模式(生产推荐)
```
浏览器 + 油猴脚本 → 本地 Python 服务 → LLM API
```
- 功能完整
- 支持数据缓存
- 支持批量分析

### 核心模块

油猴脚本由 6 个核心模块组成:

1. **页面检测与注入模块**
   - 监听页面加载事件
   - 检测 URL 是否匹配目标网站
   - 触发脚本主逻辑

2. **数据提取模块**
   - 从 DOM 提取股票数据
   - API 调用作为备用
   - 智能容错机制

3. **UI 渲染模块**
   - 创建预测面板
   - 显示原因分析(技术面、基本面、情绪面)
   - 现代化 CSS 样式

4. **API 调用模块**
   - 封装 GM_xmlhttpRequest
   - CORS 处理
   - 超时重试

5. **本地存储模块**
   - GM_setValue/GM_getValue 封装
   - 自选股管理
   - 配置持久化

6. **工具函数模块**
   - 数据格式化
   - 防抖/节流
   - 日期时间处理

## 数据流

```
用户访问页面
  ↓
页面检测与注入
  ↓
数据提取 (DOM 选择器 / API)
  ↓
├─ 直接调用 LLM API (纯前端模式)
└─ 调用本地后端 (混合模式)
      ↓
   后端服务
     - 数据增强
     - LLM 调用
     - 结果缓存
      ↓
   结果解析
      ↓
   UI 渲染
```

## LLM 集成

### Prompt 工程

**System Prompt**: 定义 AI 为专业股票分析师,要求客观理性、明确不确定性、风险提示

**User Prompt 模板**:
```javascript
请分析以下股票:

## 基本信息
- 股票代码: ${stockData.code}
- 股票名称: ${stockData.name}
- 当前价格: ${stockData.currentPrice}元
...

请从以下维度分析:
1. 技术面: 技术指标分析
2. 基本面: 行业和公司分析
3. 情绪面: 市场情绪分析

请以 JSON 格式返回分析结果。
```

### 响应格式

```javascript
{
  "predictPrice": 15.68,
  "changePercent": 3.0,
  "trend": "UP" | "DOWN" | "NEUTRAL",
  "suggestion": "BUY" | "HOLD" | "SELL",
  "confidence": 75,
  "reason": {
    "technical": "技术面原因",
    "fundamental": "基本面原因",
    "sentiment": "情绪面原因",
    "news": ["相关新闻"]
  }
}
```

## 开发指南

### 环境准备

1. **浏览器插件**
   - 安装 Tampermonkey 扩展
   - Chrome/Edge/Firefox 均可

2. **后端服务(可选)**
   ```bash
   # 安装依赖
   pip install fastapi efinance httpx pydantic uvicorn

   # 启动服务
   uvicorn main:app --host localhost --port 8000 --reload
   ```

3. **LLM API**
   - DeepSeek API: https://www.deepseek.com/
   - 获取 API Key 并配置到环境变量

### 开发流程

采用 **AI 辅助开发模式**:

1. **Day 1(4小时)**: 基础脚本 + 数据提取
2. **Day 2(3小时)**: 后端集成 + 预测展示
3. **Day 3(3小时)**: UI 美化 + 原因分析展示
4. **Day 4-5(4小时)**: 测试、优化、发布

AI 代码生成率: 90%

### AI Prompt 技巧

**优秀的 Prompt 示例**:
```
你是一个精通 JavaScript 和 Tampermonkey API 的前端专家。

请创建一个油猴脚本的 Content Script,要求:
1. 匹配 https://quote.eastmoney.com/*
2. 提取股票代码、名称、当前价格
3. 调用本地 API http://localhost:8000/predict
4. 在页面右侧显示预测结果,包括价格、趋势、原因分析
5. UI 要美观,使用现代 CSS
6. 包含完整的错误处理

请直接提供可运行的完整代码,不要省略任何部分。
```

## 关键技术点

### DOM 数据提取

```javascript
// 股票代码从 URL 提取
const code = window.location.href.match(/\/(SZ|SH)(\d{6})\.html/)[2];

// 当前价格从 DOM 提取
const priceEl = document.querySelector('.current-price');
const price = parseFloat(priceEl?.textContent) || 0;
```

### API 调用

```javascript
GM_xmlhttpRequest({
  method: 'POST',
  url: 'http://localhost:8000/api/predict',
  headers: { 'Content-Type': 'application/json' },
  data: JSON.stringify(stockData),
  onload: function(response) {
    const result = JSON.parse(response.responseText);
    // 处理结果
  }
});
```

### 本地存储

```javascript
// 保存
GM_setValue('watchlist', JSON.stringify(list));

// 读取
const list = JSON.parse(GM_getValue('watchlist', '[]'));
```

## UI 设计

### 颜色方案
- 主色调: 渐变蓝紫 `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- 上涨: 红色 `#dc3545`
- 下跌: 绿色 `#28a745`
- 中性: 灰色 `#6c757d`

### 布局
- 固定在页面右侧
- 宽度: 360px
- 最大高度: 80vh
- 渐入动画

### 组件
- 价格卡片: 当前价格 + 预测价格 + 置信区间
- 原因分析: 技术面 + 基本面 + 情绪面
- 投资建议: 建议类型 + 置信度 + 预测周期

## 安全考虑

### XSS 防护
```javascript
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

### API Key 管理
- 不要硬编码 API Key
- 使用 localStorage 存储用户提供的 Key
- 提供设置界面供用户输入

### 数据验证
```javascript
// A 股代码验证
function validateStockCode(code) {
  return /^\d{6}$/.test(code);
}

// 价格验证
function validatePrice(price) {
  return !isNaN(price) && price > 0;
}
```

## 免责声明

⚠️ **重要提示**:

1. 本工具提供的预测仅供参考,不构成任何投资建议
2. 股市有风险,投资需谨慎
3. AI 预测并非 100% 准确,请理性对待
4. 任何投资决策请基于自己的判断
5. 使用本工具即表示您同意自行承担投资风险

开发团队不对任何投资损失负责。

## 扩展路线

### 短期(1-2个月)
- 增加更多数据源
- 优化 Prompt 工程
- 增加历史准确率统计
- 支持自定义主题

### 中期(3-6个月)
- 增加新闻情感分析
- 增加板块分析
- 支持自选股批量分析
- 开发移动端版本

### 长期(6-12个月)
- 升级为 Chrome 插件
- 开发独立 Web 应用
- 支持多市场(港股、美股)
- 增加自动交易接口

## 参考资源

### 数据源
- [efinance](https://github.com/efinance-data/efinance) - 专门针对东方财富的 Python 库
- [AKShare](https://github.com/akfamily/akshare) - 开源财经数据接口库
- [Tushare](https://tushare.org/) - 财经数据接口包

### AI/LLM
- [DeepSeek](https://www.deepseek.com/) - 高性价比中文大模型(推荐)
- [OpenAI API](https://platform.openai.com/) - GPT-4 API
- [文心一言](https://yiyan.baidu.com/) - 百度大模型

### 开发工具
- [Tampermonkey](https://www.tampermonkey.net/) - 油猴脚本管理器
- [CRXJS](https://github.com/crxjs/chrome-extension-tools) - Chrome 插件开发框架

### 参考项目
- [chocolate](https://github.com/YYJeffrey/chocolate) - 股票基金助手插件
- [Qbot](https://github.com/UFund-Me/Qbot) - AI 量化投研平台

## 常见问题

**Q: 油猴脚本和 Chrome 插件有什么区别?**
- 油猴脚本更轻量,单文件,易于分享
- Chrome 插件功能更强大,可以打包分发
- 对于 MVP,油猴脚本更快;对于正式产品,Chrome 插件更好

**Q: LLM API 调用成本大概是多少?**
- DeepSeek: 约 0.14 元/1M tokens(很便宜)
- GPT-4: 约 18 元/1M tokens(较贵)
- 预估:每天预测 100 次,月成本 50-200 元

**Q: 如何提高预测准确率?**
- 结合技术面、基本面、情绪面综合分析
- 持续优化 Prompt 工程
- 收集反馈,迭代改进

**Q: 可以商用吗?**
- 数据来源:免费 API 需注明来源,不能转售
- 预测建议:必须声明仅供参考,不构成投资建议
- 建议添加免责声明,降低法律风险
