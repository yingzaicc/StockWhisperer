# StockWhisperer (股语者)

🤖 AI驱动的股票走势预测工具 - 倾听股市，洞见未来

![Version](https://img.shields.io/badge/version-1.0.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ⚠️ 当前版本状态 (v1.0.2)

**最新更新**: 2026-01-30

### ✅ 已修复
- ✅ 数据确认界面 - 用户可验证数据后再调用AI
- ✅ 可调整大小侧边栏 - 拖动调整面板宽度
- ✅ 个股价格提取 - 支持科创板(688981)等
- ✅ 涨跌幅提取 - 正确提取-4.78%等涨跌幅

### ⚠️ 已知问题
- ⚠️ **成交量提取暂未修复** - 显示为0,不影响主要功能
- ⚠️ 部分A股可能需要调整选择器

### 📚 文档索引
- [使用指南](./docs/使用指南.md) - 详细使用说明
- [调试指南](./docs/调试指南.md) - 问题排查
- [开发日志](./docs/开发日志.md) - 版本更新记录
- [需求分析](./docs/需求分析与功能点.md) - 功能设计
- [技术方案](./docs/技术方案对比分析_v2.0.md) - 技术选型

---

## 项目简介

StockWhisperer 是一个基于 AI 大语言模型的股票预测助手，通过油猴脚本(tampermonkey userscript)的方式在东方财富网页上实时展示 AI 预测分析和投资建议。

### 核心特点

- ⚡ **即插即用**: 单文件油猴脚本，安装即可使用
- 🤖 **AI 驱动**: 使用 DeepSeek/GPT-4 等大模型进行智能分析
- 📊 **多维分析**: 技术面 + 基本面 + 情绪面综合分析
- 💰 **成本低廉**: 按 API 调用付费，月均 50-200 元
- 🎨 **界面精美**: 现代化 UI 设计，响应式布局
- 🔒 **数据安全**: API Key 本地存储，不上传服务器

### 功能展示

- ✅ 实时股票数据提取
- ✅ AI 走势预测（1-3天）
- ✅ 投资建议（买入/持有/卖出）
- ✅ 原因分析（技术/基本面/情绪面）
- ✅ 置信度评估
- ✅ 自选股管理
- ✅ 预测结果缓存

## 快速开始

### 1. 安装浏览器插件

首先需要安装 Tampermonkey 浏览器扩展：

- **Chrome/Edge**: [Chrome 商店链接](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Firefox 附加组件](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- **Safari**: [App Store](https://apps.apple.com/us/app/tampermonkey/id1482490089)

### 2. 安装油猴脚本

有两种安装方式：

#### 方式1: 从文件安装（推荐）

1. 下载 [`stockwhisperer.user.js`](./stockwhisperer.user.js) 文件
2. 点击 Tampermonkey 图标 → "管理面板"
3. 点击 "+" 号创建新脚本
4. 将下载的文件内容复制粘贴到编辑器
5. 按 `Ctrl+S` 保存

#### 方式2: 自动安装（需要托管）

点击以下链接（需先安装 Tampermonkey）：
```
(即将上线)
```

### 3. 配置 API Key

1. 访问 [东方财富](https://quote.eastmoney.com/) 任意股票页面
2. 页面右侧会自动弹出 "AI预测分析" 面板
3. 点击面板上的 "⚙️ 设置" 按钮
4. 选择 API 提供商并输入 API Key

#### 获取 API Key

**推荐使用 DeepSeek（高性价比）**:

1. 访问 [DeepSeek 官网](https://www.deepseek.com/)
2. 注册/登录账号
3. 进入 "API Keys" 页面
4. 创建新的 API Key
5. 复制 Key 并粘贴到设置对话框

**或使用 OpenAI GPT-4**:

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册/登录账号
3. 进入 "API keys" 页面
4. 创建新的 API Key
5. 复制 Key 并粘贴到设置对话框

### 4. 开始使用

配置完成后，刷新页面，AI 会自动分析当前股票并展示预测结果！

## 使用说明

### 基本使用

1. 访问东方财富股票详情页，例如：
   - **A股**: https://quote.eastmoney.com/SZ000001.html（平安银行）
   - **A股**: https://quote.eastmoney.com/SH600000.html（浦发银行）
   - **科创板**: https://quote.eastmoney.com/kcb/688981.html
   - **港股**: https://quote.eastmoney.com/hk/00981.html

2. 页面右侧会自动显示 AI 预测面板

3. 面板包含以下信息：
   - **当前价格**: 股票实时价格
   - **预测价格**: AI 预测的1-3天目标价格
   - **置信区间**: 预测价格的可能范围
   - **走势原因分析**:
     - 技术面分析（MACD、RSI、均线等）
     - 基本面分析（行业、公司业绩等）
     - 情绪面分析（市场情绪、资金流向等）
   - **投资建议**: 买入/持有/卖出
   - **置信度**: 预测的可信度（0-100%）

### 面板操作

- **🔄 刷新**: 重新运行 AI 分析
- **⚙️ 设置**: 修改 API 配置
- **× 关闭**: 关闭预测面板

### 自选股管理

（即将推出）

## 成本估算

### API 调用成本

#### DeepSeek（推荐）

- 定价：约 ¥0.14 / 1M tokens
- 单次预测：约 500-1000 tokens
- 每天预测100次：约 ¥0.07-0.14/天
- **月均成本：¥2-4** ⭐

#### OpenAI GPT-4

- 定价：约 ¥18 / 1M tokens
- 单次预测：约 500-1000 tokens
- 每天预测100次：约 ¥9-18/天
- **月均成本：¥270-540**

**结论**: 推荐使用 DeepSeek，成本极低且中文理解能力强。

## 架构设计

### 技术栈

- **前端**: JavaScript ES6+ + Tampermonkey API
- **AI**: DeepSeek API / OpenAI API
- **数据源**: 东方财富网页 DOM 提取
- **存储**: 本地浏览器存储（GM_setValue/GM_getValue）

### 模块结构

```
stockwhisperer.user.js
├── 常量配置 (CONFIG)
├── 工具函数模块 (Utils)
├── 错误处理模块 (ErrorHandler)
├── 本地存储模块 (StorageModule)
├── API调用模块 (APIModule)
├── UI渲染模块 (UIModule)
├── 数据提取模块 (DataExtractor)
└── 业务逻辑层 (App)
```

### 数据流

```
用户访问股票页面
    ↓
页面检测与数据提取
    ↓
调用 LLM API 分析
    ↓
解析预测结果
    ↓
渲染 UI 面板
```

## 常见问题

### Q1: 脚本无法运行？

**解决方案**:

1. 确认已安装 Tampermonkey 扩展
2. 确认脚本已启用（Tampermonkey 管理面板中查看）
3. 刷新页面
4. 检查浏览器控制台是否有错误信息

### Q2: 提示 "无法获取股票数据"？

**解决方案**:

1. 确认访问的是东方财富股票详情页（URL 格式：`quote.eastmoney.com/SZ000001.html`）
2. 等待页面完全加载后再查看
3. 刷新页面重试

### Q3: API 调用失败？

**解决方案**:

1. 检查 API Key 是否正确
2. 检查网络连接
3. 确认 API 账户余额充足
4. 尝试切换 API 提供商

### Q4: 预测结果准确吗？

**重要提示**:

- ⚠️ AI 预测仅供参考，不构成投资建议
- 股市有风险，投资需谨慎
- AI 预测并非 100% 准确
- 建议结合自己的判断和其他分析工具

### Q5: 如何提高预测准确率？

当前版本使用基础 Prompt，后续会持续优化：

- 增加更多历史数据
- 优化 Prompt 工程
- 引入新闻情感分析
- 结合技术指标计算

## 开发路线

### ✅ 已完成（v1.0）

- [x] 基础油猴脚本框架
- [x] 数据提取模块
- [x] UI 渲染模块
- [x] LLM API 集成
- [x] 配置管理
- [x] 错误处理

### 🚀 即将推出（v1.1）

- [ ] 自选股管理功能
- [ ] 历史预测记录
- [ ] 准确率统计
- [ ] 新闻情感分析
- [ ] 批量分析功能

### 📋 规划中（v2.0）

- [ ] Chrome 插件版本
- [ ] 本地 Python 后端支持
- [ ] 更多数据源
- [ ] 技术指标自动计算
- [ ] 移动端适配

## 免责声明

⚠️ **重要提示**:

1. 本工具提供的预测仅供参考，不构成任何投资建议
2. 股市有风险，投资需谨慎
3. AI 预测并非 100% 准确，请理性对待
4. 任何投资决策请基于自己的判断
5. 使用本工具即表示您同意自行承担投资风险

开发团队不对任何投资损失负责。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发环境

无需任何开发环境，直接编辑 `stockwhisperer.user.js` 文件即可。

### 测试

1. 修改脚本文件
2. 在 Tampermonkey 中更新脚本
3. 刷新测试页面查看效果

## 许可证

MIT License

## 联系方式

- GitHub Issues: [提交问题](https://github.com/your-repo/issues)
- Email: your-email@example.com

## 鸣谢

- [DeepSeek](https://www.deepseek.com/) - 提供高性价比的 AI API
- [Tampermonkey](https://www.tampermonkey.net/) - 强大的油猴脚本管理器
- [东方财富](https://www.eastmoney.com/) - 股票数据来源

---

**Star ⭐ if you like this project!**

🤖 **StockWhisperer** - 倾听股市，洞见未来
