// ==UserScript==
// @name         东方财富AI预测助手 (StockWhisperer)
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  AI驱动的股票走势预测和原因分析 - 倾听股市，洞见未来
// @author       StockWhisperer
// @match        https://quote.eastmoney.com/*
// @match        https://emweb.eastmoney.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @connect      api.deepseek.com
// @connect      api.openai.com
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // ==================== 常量配置 ====================
    const CONFIG = {
        DEFAULT_TIMEOUT: 10000,
        CACHE_DURATION: 5 * 60 * 1000, // 5分钟
        VERSION: '1.0.0',
        PANEL_WIDTH: 360,
        API_ENDPOINTS: {
            DEEPSEEK: 'https://api.deepseek.com/v1/chat/completions',
            OPENAI: 'https://api.openai.com/v1/chat/completions'
        }
    };

    // ==================== 工具函数模块 ====================
    const Utils = {
        // 格式化数字
        formatNumber(num, decimals = 2) {
            if (num === null || num === undefined || isNaN(num)) return '-';
            return parseFloat(num).toFixed(decimals);
        },

        // 格式化百分比
        formatPercent(num) {
            if (num === null || num === undefined || isNaN(num)) return '-';
            const sign = num >= 0 ? '+' : '';
            return `${sign}${parseFloat(num).toFixed(2)}%`;
        },

        // 格式化时间
        formatTime(timestamp) {
            if (!timestamp) return '-';
            return new Date(timestamp).toLocaleString('zh-CN');
        },

        // 防抖
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func.apply(this, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // 节流
        throttle(func, limit) {
            let inThrottle;
            return function (...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // XSS防护
        sanitizeHTML(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },

        // 生成缓存键
        generateCacheKey(stockCode, timestamp) {
            return `predict_${stockCode}_${Math.floor(timestamp / CONFIG.CACHE_DURATION)}`;
        }
    };

    // ==================== 错误处理模块 ====================
    const ErrorHandler = {
        // 错误类型
        ErrorTypes: {
            EXTRACTION_FAILED: '数据提取失败',
            API_CALL_FAILED: 'API调用失败',
            INVALID_DATA: '数据无效',
            NETWORK_ERROR: '网络错误',
            TIMEOUT: '请求超时',
            PARSE_ERROR: '数据解析失败'
        },

        // 处理错误
        handle(error, context = {}) {
            console.error('[StockWhisperer Error]', context, error);

            // 用户友好提示
            const message = this.getUserMessage(error);
            this.showErrorNotification(message);

            // 错误上报（可选）
            this.report(error, context);
        },

        // 获取用户友好的错误信息
        getUserMessage(error) {
            const errorMap = {
                [this.ErrorTypes.EXTRACTION_FAILED]: '无法获取股票数据，请刷新页面重试',
                [this.ErrorTypes.API_CALL_FAILED]: '预测服务暂时不可用，请稍后重试',
                [this.ErrorTypes.INVALID_DATA]: '股票数据异常',
                [this.ErrorTypes.NETWORK_ERROR]: '网络连接失败',
                [this.ErrorTypes.TIMEOUT]: '请求超时，请稍后重试',
                [this.ErrorTypes.PARSE_ERROR]: '数据解析失败'
            };

            return errorMap[error.message] || error.message || '发生未知错误';
        },

        // 显示错误通知
        showErrorNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
                border-radius: 8px;
                padding: 16px 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10001;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 12px;
                animation: slideInNotification 0.3s ease-out;
            `;

            notification.innerHTML = `
                <span style="font-size: 18px;">⚠️</span>
                <span>${Utils.sanitizeHTML(message)}</span>
            `;

            document.body.appendChild(notification);

            // 3秒后自动消失
            setTimeout(() => {
                notification.style.animation = 'slideOutNotification 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }, 3000);

            // 添加通知动画样式（如果不存在）
            if (!document.getElementById('stockwhisperer-notification-animations')) {
                const style = document.createElement('style');
                style.id = 'stockwhisperer-notification-animations';
                style.textContent = `
                    @keyframes slideInNotification {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                    @keyframes slideOutNotification {
                        from {
                            transform: translateX(0);
                            opacity: 1;
                        }
                        to {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        },

        // 错误上报
        report(error, context) {
            // 可以发送到日志服务
            console.log('[Error Report]', { error, context, timestamp: Date.now() });
        }
    };

    // ==================== 本地存储模块 ====================
    const StorageModule = {
        // 保存数据
        async set(key, value) {
            return new Promise((resolve) => {
                try {
                    GM_setValue(key, JSON.stringify(value));
                    resolve(true);
                } catch (error) {
                    console.error('[Storage] 保存失败:', error);
                    resolve(false);
                }
            });
        },

        // 获取数据
        async get(key, defaultValue = null) {
            return new Promise((resolve) => {
                try {
                    const value = GM_getValue(key);
                    // 修复：空字符串检查
                    if (value === undefined || value === null || value === '') {
                        resolve(defaultValue);
                    } else {
                        resolve(JSON.parse(value));
                    }
                } catch (error) {
                    console.error('[Storage] 读取失败:', error);
                    resolve(defaultValue);
                }
            });
        },

        // 删除数据
        async remove(key) {
            return new Promise((resolve) => {
                try {
                    GM_deleteValue(key);
                    resolve(true);
                } catch (error) {
                    console.error('[Storage] 删除失败:', error);
                    resolve(false);
                }
            });
        },

        // 自选股管理
        watchlist: {
            // 添加自选股
            async add(stock) {
                const list = await StorageModule.get('watchlist', []);
                if (!list.find(item => item.code === stock.code)) {
                    list.push({
                        ...stock,
                        addTime: Date.now()
                    });
                    await StorageModule.set('watchlist', list);
                    return true;
                }
                return false;
            },

            // 删除自选股
            async remove(code) {
                const list = await StorageModule.get('watchlist', []);
                const filtered = list.filter(item => item.code !== code);
                await StorageModule.set('watchlist', filtered);
                return true;
            },

            // 获取自选股列表
            async getAll() {
                return await StorageModule.get('watchlist', []);
            },

            // 检查是否已存在
            async exists(code) {
                const list = await this.getAll();
                return list.some(item => item.code === code);
            }
        },

        // API配置管理
        config: {
            // 保存API配置
            async setApiConfig(provider, apiKey) {
                const configs = await StorageModule.get('api_configs', {});
                configs[provider] = {
                    apiKey,
                    updateTime: Date.now()
                };
                await StorageModule.set('api_configs', configs);
            },

            // 获取API配置
            async getApiConfig(provider) {
                const configs = await StorageModule.get('api_configs', {});
                return configs[provider] || null;
            },

            // 获取当前使用的API提供商
            async getCurrentProvider() {
                return await StorageModule.get('current_provider', 'deepseek');
            },

            // 设置当前使用的API提供商
            async setCurrentProvider(provider) {
                await StorageModule.set('current_provider', provider);
            }
        }
    };

    // ==================== API调用模块 ====================
    const APIModule = {
        // 通用请求方法
        request(config) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: config.method || 'GET',
                    url: config.url,
                    data: config.data ? JSON.stringify(config.data) : undefined,
                    headers: {
                        'Content-Type': 'application/json',
                        ...config.headers
                    },
                    timeout: config.timeout || CONFIG.DEFAULT_TIMEOUT,
                    onload: function (response) {
                        try {
                            if (response.status >= 200 && response.status < 300) {
                                const data = JSON.parse(response.responseText);
                                resolve(data);
                            } else {
                                reject(new Error(`HTTP ${response.status}`));
                            }
                        } catch (error) {
                            // 尝试直接返回文本
                            resolve(response.responseText);
                        }
                    },
                    onerror: function () {
                        reject(new Error(ErrorHandler.ErrorTypes.NETWORK_ERROR));
                    },
                    ontimeout: function () {
                        reject(new Error(ErrorHandler.ErrorTypes.TIMEOUT));
                    }
                });
            });
        },

        // 调用LLM API进行预测
        async predict(stockData, historyData = []) {
            try {
                // 获取API配置
                const provider = await StorageModule.config.getCurrentProvider();
                const config = await StorageModule.config.getApiConfig(provider);

                if (!config || !config.apiKey) {
                    throw new Error('请先配置API Key');
                }

                // 构建API请求
                const apiUrl = provider === 'deepseek'
                    ? CONFIG.API_ENDPOINTS.DEEPSEEK
                    : CONFIG.API_ENDPOINTS.OPENAI;

                const model = provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4';

                const prompt = this.generatePrompt(stockData, historyData);

                const response = await this.request({
                    method: 'POST',
                    url: apiUrl,
                    headers: {
                        'Authorization': `Bearer ${config.apiKey}`
                    },
                    data: {
                        model: model,
                        messages: [
                            {
                                role: 'system',
                                content: `你是一位专业的股票分析师，拥有10年以上的A股市场分析经验。

你的任务是：
1. 分析股票的技术面、基本面、情绪面
2. 预测未来1-3天的价格走势
3. 给出明确的投资建议（买入/持有/卖出）
4. 解释预测的原因和依据

分析原则：
- 客观理性，基于数据和事实
- 明确不确定性，不夸大预测准确性
- 风险提示，强调投资有风险
- 多维度分析，综合考虑各种因素

输出要求：
- 以JSON格式返回结果
- 原因分析简洁明了，每条不超过50字
- 预测价格基于当前价格合理波动范围内（±3%）
- 置信度要客观，通常在50-80%之间`
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 1000
                    }
                });

                // 解析响应
                const content = response.choices[0].message.content;
                return this.parseResponse(content);

            } catch (error) {
                ErrorHandler.handle(error, { context: 'LLM预测' });
                throw error;
            }
        },

        // 生成Prompt
        generatePrompt(stockData, historyData) {
            let prompt = `请分析以下股票：

## 基本信息
- 股票代码：${stockData.code}
- 股票名称：${stockData.name}
- 所属市场：${stockData.market === 'SZ' ? '深圳' : '上海'}

## 实时行情
- 当前价格：${stockData.currentPrice}元
- 今开：${stockData.openPrice || '暂无'}元
- 昨收：${stockData.closePrice || '暂无'}元
- 最高：${stockData.highPrice || '暂无'}元
- 最低：${stockData.lowPrice || '暂无'}元
- 涨跌幅：${stockData.changePercent || 0}%
- 成交量：${stockData.volume ? (stockData.volume / 10000).toFixed(2) + '万手' : '暂无'}`;

            if (historyData && historyData.length > 0) {
                prompt += `\n\n## 历史数据（最近5天）
${historyData.slice(0, 5).map((day, i) => {
                    return `第${i + 1}天：${day.close}元，涨跌${day.changePercent || 0}%`;
                }).join('\n')}`;
            }

            prompt += `

请以JSON格式返回分析结果，格式如下：
{
    "predictPrice": 预测价格（数字）,
    "changePercent": 预测涨跌幅（数字，如3.0表示+3%）,
    "trend": "UP"或"DOWN"或"NEUTRAL",
    "suggestion": "BUY"或"HOLD"或"SELL",
    "confidence": 置信度（0-100的数字）,
    "reason": {
        "technical": "技术面原因（不超过50字）",
        "fundamental": "基本面原因（不超过50字）",
        "sentiment": "情绪面原因（不超过50字）"
    }
}`;

            return prompt;
        },

        // 解析LLM响应
        parseResponse(content) {
            try {
                // 尝试直接解析JSON
                let result = content;

                // 如果是字符串，尝试提取JSON
                if (typeof result === 'string') {
                    // 提取JSON部分
                    const jsonMatch = result.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        result = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('无法提取JSON');
                    }
                }

                // 验证必需字段
                const requiredFields = [
                    'predictPrice',
                    'changePercent',
                    'trend',
                    'suggestion',
                    'confidence',
                    'reason'
                ];

                const missingFields = requiredFields.filter(field => !(field in result));
                if (missingFields.length > 0) {
                    throw new Error(`缺少必需字段：${missingFields.join(', ')}`);
                }

                // 数据类型转换和验证
                result.predictPrice = parseFloat(result.predictPrice);
                result.changePercent = parseFloat(result.changePercent);
                result.confidence = parseInt(result.confidence);

                if (isNaN(result.predictPrice) || isNaN(result.changePercent) || isNaN(result.confidence)) {
                    throw new Error('数据类型错误');
                }

                // 趋势归一化
                result.trend = result.trend.toUpperCase();
                if (!['UP', 'DOWN', 'NEUTRAL'].includes(result.trend)) {
                    result.trend = 'NEUTRAL';
                }

                // 建议归一化
                result.suggestion = result.suggestion.toUpperCase();
                if (!['BUY', 'HOLD', 'SELL'].includes(result.suggestion)) {
                    result.suggestion = 'HOLD';
                }

                // 置信度范围检查
                result.confidence = Math.max(0, Math.min(100, result.confidence));

                // 计算预测区间
                const volatility = Math.abs(result.changePercent) * 0.5;
                result.lowerBound = result.predictPrice * (1 - volatility / 100);
                result.upperBound = result.predictPrice * (1 + volatility / 100);

                return result;

            } catch (error) {
                console.error('[LLM Parser] 解析失败:', error, content);
                throw new Error(ErrorHandler.ErrorTypes.PARSE_ERROR);
            }
        }
    };

    // ==================== UI渲染模块 ====================
    const UIModule = {
        // 已存在的面板
        currentPanel: null,

        // 创建预测面板
        createPredictionPanel() {
            // 如果已存在面板，先移除
            if (this.currentPanel) {
                this.currentPanel.remove();
            }

            const panel = document.createElement('div');
            panel.id = 'stockwhisperer-panel';
            panel.className = 'stockwhisperer-panel';

            // 尝试从本地存储加载保存的宽度
            let savedWidth = CONFIG.PANEL_WIDTH;
            try {
                const width = GM_getValue('stockwhisperer-panel-width', CONFIG.PANEL_WIDTH);
                if (width && typeof width === 'number') {
                    savedWidth = width;
                }
            } catch (err) {
                console.warn('无法加载保存的面板宽度');
            }

            panel.style.width = savedWidth + 'px';

            panel.innerHTML = `
                <div class="panel-header">
                    <div class="panel-title">
                        <span class="icon">🤖</span>
                        <span class="text">AI预测分析</span>
                        <span class="version">v${CONFIG.VERSION}</span>
                    </div>
                    <div class="panel-controls">
                        <button class="btn-minimize" title="最小化">−</button>
                        <button class="btn-settings" title="设置">⚙️</button>
                        <button class="btn-refresh" title="刷新">🔄</button>
                        <button class="btn-close" title="关闭">×</button>
                    </div>
                </div>

                <div class="panel-content">
                    <div class="loading-container">
                        <div class="loading-spinner"></div>
                        <div class="loading-text">正在提取数据...</div>
                    </div>
                </div>

                <div class="panel-footer">
                    <span class="update-time"></span>
                    <span class="disclaimer">⚠️ 仅供参考，不构成投资建议</span>
                </div>

                <div class="resize-handle" title="拖动调整大小"></div>
            `;

            // 注入样式
            this.injectStyles();

            // 绑定事件
            this.bindEvents(panel);
            this.initResizable(panel);

            document.body.appendChild(panel);
            this.currentPanel = panel;

            return panel;
        },

        // 显示数据确认界面
        showDataConfirmation(stockData) {
            if (!this.currentPanel) {
                this.createPredictionPanel();
            }

            const content = this.currentPanel.querySelector('.panel-content');
            content.innerHTML = `
                <div class="confirm-container">
                    <div class="confirm-header">
                        <div class="confirm-title">📊 提取的股票数据</div>
                        <div class="confirm-subtitle">请确认以下数据是否正确</div>
                    </div>

                    <div class="data-display">
                        <div class="data-row">
                            <span class="data-label">股票名称</span>
                            <span class="data-value">${Utils.sanitizeHTML(stockData.name)}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">股票代码</span>
                            <span class="data-value">${Utils.sanitizeHTML(stockData.code)}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">所属市场</span>
                            <span class="data-value">${Utils.sanitizeHTML(stockData.market)}</span>
                        </div>
                        <div class="data-row highlight">
                            <span class="data-label">当前价格</span>
                            <span class="data-value price-value">${stockData.currentPrice.toFixed(2)} 元</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">涨跌幅</span>
                            <span class="data-value ${stockData.changePercent >= 0 ? 'trend-up' : 'trend-down'}">
                                ${stockData.changePercent >= 0 ? '+' : ''}${stockData.changePercent.toFixed(2)}%
                            </span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">成交量</span>
                            <span class="data-value">${stockData.volume ? stockData.volume.toLocaleString() : '暂无'}</span>
                        </div>
                    </div>

                    <div class="confirm-actions">
                        <button class="btn-confirm btn-primary">
                            <span>✅</span>
                            <span>数据正确，开始预测</span>
                        </button>
                        <button class="btn-confirm btn-secondary">
                            <span>🔄</span>
                            <span>重新提取</span>
                        </button>
                    </div>

                    <div class="confirm-tip">
                        💡 提示：如果数据有误，点击"重新提取"或按 F12 查看控制台日志
                    </div>
                </div>
            `;

            // 绑定确认按钮事件
            const confirmBtn = content.querySelector('.btn-primary');
            const retryBtn = content.querySelector('.btn-secondary');

            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    window.dispatchEvent(new CustomEvent('stockwhisperer-data-confirmed', { detail: stockData }));
                });
            }

            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    window.dispatchEvent(new CustomEvent('stockwhisperer-refresh'));
                });
            }
        },

        // 初始化可调整大小功能
        initResizable(panel) {
            if (!panel) return;

            const resizeHandle = panel.querySelector('.resize-handle');
            if (!resizeHandle) return;

            let isResizing = false;
            let startX = 0;
            let startWidth = 0;

            resizeHandle.addEventListener('mousedown', (e) => {
                isResizing = true;
                startX = e.clientX;
                startWidth = panel.offsetWidth;

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);

                e.preventDefault();
            });

            const handleMouseMove = (e) => {
                if (!isResizing) return;

                const diff = startX - e.clientX;
                const newWidth = Math.max(300, Math.min(800, startWidth + diff));

                panel.style.width = newWidth + 'px';

                // 保存到本地存储
                try {
                    GM_setValue('stockwhisperer-panel-width', newWidth);
                } catch (err) {
                    console.warn('无法保存面板宽度');
                }
            };

            const handleMouseUp = () => {
                isResizing = false;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        },

        // 渲染价格卡片
        renderPriceCard(data) {
            const trendClass = data.trend === 'UP' ? 'trend-up' : data.trend === 'DOWN' ? 'trend-down' : 'trend-neutral';
            const trendIcon = data.trend === 'UP' ? '📈' : data.trend === 'DOWN' ? '📉' : '➡️';

            return `
                <div class="price-card">
                    <div class="price-row">
                        <span class="label">当前价格</span>
                        <span class="value">¥${Utils.formatNumber(data.currentPrice)}</span>
                    </div>
                    <div class="price-row ${trendClass}">
                        <span class="label">预测价格</span>
                        <span class="value">
                            ${trendIcon} ¥${Utils.formatNumber(data.predictPrice)}
                            <span class="change">(${Utils.formatPercent(data.changePercent)})</span>
                        </span>
                    </div>
                    <div class="price-row">
                        <span class="label">置信区间</span>
                        <span class="value range">
                            ¥${Utils.formatNumber(data.lowerBound)} - ¥${Utils.formatNumber(data.upperBound)}
                        </span>
                    </div>
                </div>
            `;
        },

        // 渲染原因分析
        renderReasonAnalysis(data) {
            if (!data.reason) return '';

            return `
                <div class="reason-analysis">
                    <div class="analysis-title">
                        <span class="icon">📊</span>
                        <span class="text">走势原因分析</span>
                    </div>

                    ${data.reason.technical ? `
                    <div class="analysis-item">
                        <div class="item-header">
                            <span class="badge technical">技术面</span>
                        </div>
                        <div class="item-content">
                            ${Utils.sanitizeHTML(data.reason.technical)}
                        </div>
                    </div>
                    ` : ''}

                    ${data.reason.fundamental ? `
                    <div class="analysis-item">
                        <div class="item-header">
                            <span class="badge fundamental">基本面</span>
                        </div>
                        <div class="item-content">
                            ${Utils.sanitizeHTML(data.reason.fundamental)}
                        </div>
                    </div>
                    ` : ''}

                    ${data.reason.sentiment ? `
                    <div class="analysis-item">
                        <div class="item-header">
                            <span class="badge sentiment">情绪面</span>
                        </div>
                        <div class="item-content">
                            ${Utils.sanitizeHTML(data.reason.sentiment)}
                        </div>
                    </div>
                    ` : ''}

                    ${data.reason.news && data.reason.news.length > 0 ? `
                    <div class="analysis-item">
                        <div class="item-header">
                            <span class="badge news">相关新闻</span>
                        </div>
                        <div class="item-content">
                            <ul class="news-list">
                                ${data.reason.news.map(news => `
                                    <li><a href="${news.url || '#'}" target="_blank">${Utils.sanitizeHTML(news.title || news)}</a></li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        },

        // 渲染投资建议
        renderSuggestion(data) {
            const suggestionConfig = {
                'BUY': { text: '买入', class: 'suggestion-buy', icon: '🟢' },
                'HOLD': { text: '持有', class: 'suggestion-hold', icon: '🟡' },
                'SELL': { text: '卖出', class: 'suggestion-sell', icon: '🔴' }
            };

            const config = suggestionConfig[data.suggestion] || suggestionConfig['HOLD'];

            return `
                <div class="suggestion-card">
                    <div class="suggestion-header ${config.class}">
                        <span class="icon">${config.icon}</span>
                        <span class="text">投资建议：${config.text}</span>
                    </div>
                    <div class="suggestion-details">
                        <div class="detail-row">
                            <span class="label">置信度</span>
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: ${data.confidence}%"></div>
                                <span class="confidence-text">${data.confidence}%</span>
                            </div>
                        </div>
                        <div class="detail-row">
                            <span class="label">预测周期</span>
                            <span class="value">1-3天</span>
                        </div>
                    </div>
                </div>
            `;
        },

        // 显示预测结果
        showPredictionResult(stockData, predictionResult) {
            if (!this.currentPanel) {
                this.createPredictionPanel();
            }

            const content = this.currentPanel.querySelector('.panel-content');
            content.innerHTML = `
                ${this.renderPriceCard({ ...stockData, ...predictionResult })}
                ${this.renderReasonAnalysis(predictionResult)}
                ${this.renderSuggestion(predictionResult)}
            `;

            // 更新时间
            const timeEl = this.currentPanel.querySelector('.update-time');
            if (timeEl) {
                timeEl.textContent = `更新于：${Utils.formatTime(Date.now())}`;
            }
        },

        // 显示错误状态
        // 显示错误状态
        showError(message) {
            if (!this.currentPanel) {
                this.createPredictionPanel();
            }

            const content = this.currentPanel.querySelector('.panel-content');
            content.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">❌</div>
                    <div class="error-message">${Utils.sanitizeHTML(message)}</div>
                    <button class="error-retry">重试</button>
                </div>
            `;

            // 绑定重试事件
            const retryBtn = content.querySelector('.error-retry');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    window.dispatchEvent(new CustomEvent('stockwhisperer-refresh'));
                });
            }
        },

        // 显示加载状态
        showLoading() {
            if (!this.currentPanel) {
                this.createPredictionPanel();
            }

            const content = this.currentPanel.querySelector('.panel-content');
            content.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">AI正在分析中...</div>
                </div>
            `;
        },

        // 注入样式
        injectStyles() {
            if (document.getElementById('stockwhisperer-styles')) return;

            const styles = `
                <style id="stockwhisperer-styles">
                    /* 主面板样式 */
                    .stockwhisperer-panel {
                        position: fixed;
                        top: 100px;
                        right: 20px;
                        width: ${CONFIG.PANEL_WIDTH}px;
                        max-height: 80vh;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 12px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        z-index: 10000;
                        overflow: hidden;
                        animation: slideIn 0.3s ease-out;
                    }

                    @keyframes slideIn {
                        from {
                            transform: translateX(400px);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }

                    @keyframes slideOut {
                        from {
                            transform: translateX(0);
                            opacity: 1;
                        }
                        to {
                            transform: translateX(400px);
                            opacity: 0;
                        }
                    }

                    /* 标题栏 */
                    .panel-header {
                        background: rgba(255,255,255,0.1);
                        backdrop-filter: blur(10px);
                        padding: 12px 16px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                    }

                    .panel-title {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        color: white;
                        font-weight: 600;
                        font-size: 14px;
                    }

                    .panel-version {
                        font-size: 10px;
                        opacity: 0.7;
                    }

                    .panel-controls {
                        display: flex;
                        gap: 8px;
                    }

                    .panel-controls button {
                        background: rgba(255,255,255,0.2);
                        border: none;
                        width: 28px;
                        height: 28px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .panel-controls button:hover {
                        background: rgba(255,255,255,0.3);
                        transform: scale(1.1);
                    }

                    /* 内容区 */
                    .panel-content {
                        background: white;
                        padding: 16px;
                        max-height: calc(80vh - 120px);
                        overflow-y: auto;
                    }

                    /* 加载状态 */
                    .loading-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 40px 20px;
                        gap: 16px;
                    }

                    .loading-spinner {
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #667eea;
                        border-radius: 50%;
                        width: 30px;
                        height: 30px;
                        animation: spin 1s linear infinite;
                    }

                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }

                    .loading-text {
                        color: #6c757d;
                        font-size: 14px;
                    }

                    /* 价格卡片 */
                    .price-card {
                        margin-bottom: 16px;
                        padding: 12px;
                        background: #f8f9fa;
                        border-radius: 8px;
                    }

                    .price-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px 0;
                    }

                    .price-row .label {
                        color: #6c757d;
                        font-size: 13px;
                    }

                    .price-row .value {
                        font-weight: 600;
                        font-size: 15px;
                    }

                    .trend-up .value {
                        color: #dc3545;
                    }

                    .trend-down .value {
                        color: #28a745;
                    }

                    .trend-neutral .value {
                        color: #6c757d;
                    }

                    .price-row .change {
                        font-size: 12px;
                        margin-left: 4px;
                    }

                    /* 原因分析 */
                    .reason-analysis {
                        margin-bottom: 16px;
                    }

                    .analysis-title {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-weight: 600;
                        margin-bottom: 12px;
                        color: #212529;
                        font-size: 14px;
                    }

                    .analysis-item {
                        margin-bottom: 12px;
                        padding: 10px;
                        background: #f8f9fa;
                        border-radius: 6px;
                    }

                    .badge {
                        display: inline-block;
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 11px;
                        font-weight: 500;
                    }

                    .badge.technical {
                        background: #e7f3ff;
                        color: #0066cc;
                    }

                    .badge.fundamental {
                        background: #fff4e6;
                        color: #ff6600;
                    }

                    .badge.sentiment {
                        background: #e8f5e9;
                        color: #2e7d32;
                    }

                    .badge.news {
                        background: #f3e5f5;
                        color: #7b1fa2;
                    }

                    .item-content {
                        margin-top: 8px;
                        font-size: 12px;
                        line-height: 1.6;
                        color: #495057;
                    }

                    .news-list {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }

                    .news-list li {
                        padding: 4px 0;
                    }

                    .news-list a {
                        color: #0066cc;
                        text-decoration: none;
                        font-size: 12px;
                    }

                    .news-list a:hover {
                        text-decoration: underline;
                    }

                    /* 投资建议 */
                    .suggestion-card {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 12px;
                    }

                    .suggestion-header {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-weight: 600;
                        margin-bottom: 12px;
                        padding: 8px;
                        border-radius: 6px;
                        font-size: 13px;
                    }

                    .suggestion-buy {
                        background: #d4edda;
                        color: #155724;
                    }

                    .suggestion-hold {
                        background: #fff3cd;
                        color: #856404;
                    }

                    .suggestion-sell {
                        background: #f8d7da;
                        color: #721c24;
                    }

                    .suggestion-details {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }

                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 12px;
                    }

                    .detail-row .label {
                        color: #6c757d;
                    }

                    .confidence-bar {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        flex: 1;
                        max-width: 200px;
                    }

                    .confidence-fill {
                        height: 6px;
                        background: linear-gradient(90deg, #ffc107, #28a745);
                        border-radius: 3px;
                        transition: width 0.5s ease;
                    }

                    .confidence-text {
                        font-size: 11px;
                        color: #495057;
                        font-weight: 600;
                    }

                    /* 错误状态 */
                    .error-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 40px 20px;
                        gap: 16px;
                    }

                    .error-icon {
                        font-size: 48px;
                    }

                    .error-message {
                        color: #dc3545;
                        text-align: center;
                        font-size: 13px;
                    }

                    .error-retry {
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 8px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 13px;
                        transition: all 0.2s;
                    }

                    .error-retry:hover {
                        background: #5568d3;
                        transform: scale(1.05);
                    }

                    /* 底部栏 */
                    .panel-footer {
                        background: rgba(255,255,255,0.1);
                        backdrop-filter: blur(10px);
                        padding: 10px 16px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 10px;
                        color: rgba(255,255,255,0.8);
                        flex-wrap: wrap;
                        gap: 8px;
                    }

                    /* 滚动条美化 */
                    .panel-content::-webkit-scrollbar {
                        width: 6px;
                    }

                    .panel-content::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 3px;
                    }

                    .panel-content::-webkit-scrollbar-thumb {
                        background: #888;
                        border-radius: 3px;
                    }

                    .panel-content::-webkit-scrollbar-thumb:hover {
                        background: #555;
                    }

                    /* 数据确认界面 */
                    .confirm-container {
                        padding: 10px 0;
                    }

                    .confirm-header {
                        text-align: center;
                        margin-bottom: 20px;
                    }

                    .confirm-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #212529;
                        margin-bottom: 8px;
                    }

                    .confirm-subtitle {
                        font-size: 13px;
                        color: #6c757d;
                    }

                    .data-display {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 16px;
                        margin-bottom: 20px;
                    }

                    .data-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 10px 0;
                        border-bottom: 1px solid #e9ecef;
                    }

                    .data-row:last-child {
                        border-bottom: none;
                    }

                    .data-row.highlight {
                        background: #e7f3ff;
                        margin: 8px -16px;
                        padding: 12px 16px;
                        border-radius: 6px;
                    }

                    .data-label {
                        font-size: 13px;
                        color: #6c757d;
                        font-weight: 500;
                    }

                    .data-value {
                        font-size: 14px;
                        color: #212529;
                        font-weight: 600;
                    }

                    .price-value {
                        font-size: 20px;
                        color: #667eea;
                    }

                    .trend-up {
                        color: #dc3545;
                    }

                    .trend-down {
                        color: #28a745;
                    }

                    .confirm-actions {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        margin-bottom: 16px;
                    }

                    .btn-confirm {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        width: 100%;
                        padding: 12px 20px;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    }

                    .btn-primary {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }

                    .btn-primary:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                    }

                    .btn-secondary {
                        background: #f8f9fa;
                        color: #6c757d;
                        border: 1px solid #dee2e6;
                    }

                    .btn-secondary:hover {
                        background: #e9ecef;
                        transform: translateY(-1px);
                    }

                    .confirm-tip {
                        text-align: center;
                        font-size: 12px;
                        color: #6c757d;
                        padding: 12px;
                        background: #fff3cd;
                        border-radius: 6px;
                        border: 1px solid #ffc107;
                    }

                    /* 调整大小手柄 */
                    .resize-handle {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 4px;
                        height: 100%;
                        background: rgba(255, 255, 255, 0.1);
                        cursor: ew-resize;
                        transition: background 0.2s;
                    }

                    .resize-handle:hover {
                        background: rgba(255, 255, 255, 0.3);
                    }

                    .resize-handle:active {
                        background: rgba(255, 255, 255, 0.5);
                    }

                    /* 最小化按钮 */
                    .btn-minimize {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .stockwhisperer-panel.minimized {
                        width: auto !important;
                    }

                    .stockwhisperer-panel.minimized .panel-content,
                    .stockwhisperer-panel.minimized .panel-footer,
                    .stockwhisperer-panel.minimized .resize-handle {
                        display: none;
                    }

                    /* 响应式 */
                    @media (max-width: 768px) {
                        .stockwhisperer-panel {
                            width: calc(100vw - 40px) !important;
                            right: 20px !important;
                            left: 20px !important;
                        }

                        .resize-handle {
                            display: none;
                        }
                    }

                    @media (max-width: 480px) {
                        .stockwhisperer-panel {
                            top: 60px !important;
                            width: calc(100vw - 20px) !important;
                            right: 10px !important;
                            left: 10px !important;
                        }
                    }
                </style>
            `;

            document.head.insertAdjacentHTML('beforeend', styles);
        },

        // 绑定事件
        bindEvents(panel) {
            // 关闭按钮
            const closeBtn = panel.querySelector('.btn-close');
            closeBtn?.addEventListener('click', () => {
                panel.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    panel.remove();
                    this.currentPanel = null;
                }, 300);
            });

            // 刷新按钮
            const refreshBtn = panel.querySelector('.btn-refresh');
            refreshBtn?.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('stockwhisperer-refresh'));
            });

            // 设置按钮
            const settingsBtn = panel.querySelector('.btn-settings');
            settingsBtn?.addEventListener('click', () => {
                this.showSettingsDialog();
            });

            // 最小化按钮
            const minimizeBtn = panel.querySelector('.btn-minimize');
            minimizeBtn?.addEventListener('click', () => {
                panel.classList.toggle('minimized');
                minimizeBtn.textContent = panel.classList.contains('minimized') ? '+' : '−';
            });
        },

        // 显示设置对话框
        showSettingsDialog() {
            // 移除旧的对话框
            const oldDialog = document.getElementById('stockwhisperer-settings');
            if (oldDialog) {
                oldDialog.remove();
            }

            const dialog = document.createElement('div');
            dialog.id = 'stockwhisperer-settings';
            dialog.innerHTML = `
                <div class="settings-overlay">
                    <div class="settings-dialog">
                        <div class="settings-header">
                            <h3>⚙️ API设置</h3>
                            <button class="btn-close">×</button>
                        </div>
                        <div class="settings-content">
                            <div class="setting-group">
                                <label>API提供商</label>
                                <select id="provider-select">
                                    <option value="deepseek">DeepSeek (推荐)</option>
                                    <option value="openai">OpenAI GPT-4</option>
                                </select>
                            </div>
                            <div class="setting-group">
                                <label>API Key</label>
                                <input type="password" id="api-key-input" placeholder="请输入API Key">
                                <small>您的API Key将安全保存在本地浏览器中</small>
                            </div>
                            <div class="setting-help">
                                <p>📌 获取API Key:</p>
                                <ul>
                                    <li><a href="https://www.deepseek.com/" target="_blank">DeepSeek</a> - 高性价比中文模型</li>
                                    <li><a href="https://platform.openai.com/" target="_blank">OpenAI</a> - GPT-4</li>
                                </ul>
                            </div>
                        </div>
                        <div class="settings-footer">
                            <button class="btn-cancel">取消</button>
                            <button class="btn-save">保存</button>
                        </div>
                    </div>
                </div>
            `;

            // 注入样式
            this.injectSettingsStyles();

            // 绑定事件
            this.bindSettingsEvents(dialog);

            document.body.appendChild(dialog);
        },

        // 注入设置对话框样式
        injectSettingsStyles() {
            if (document.getElementById('stockwhisperer-settings-styles')) return;

            const styles = `
                <style id="stockwhisperer-settings-styles">
                    .settings-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10002;
                        animation: fadeIn 0.2s ease-out;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    .settings-dialog {
                        background: white;
                        border-radius: 12px;
                        width: 90%;
                        max-width: 500px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                        animation: slideUp 0.3s ease-out;
                    }

                    @keyframes slideUp {
                        from {
                            transform: translateY(50px);
                            opacity: 0;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }

                    .settings-header {
                        padding: 20px;
                        border-bottom: 1px solid #e9ecef;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .settings-header h3 {
                        margin: 0;
                        font-size: 18px;
                        color: #212529;
                    }

                    .settings-header .btn-close {
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #6c757d;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 6px;
                        transition: all 0.2s;
                    }

                    .settings-header .btn-close:hover {
                        background: #f8f9fa;
                        color: #212529;
                    }

                    .settings-content {
                        padding: 20px;
                    }

                    .setting-group {
                        margin-bottom: 20px;
                    }

                    .setting-group label {
                        display: block;
                        margin-bottom: 8px;
                        font-weight: 600;
                        color: #495057;
                        font-size: 14px;
                    }

                    .setting-group select,
                    .setting-group input {
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ced4da;
                        border-radius: 6px;
                        font-size: 14px;
                        box-sizing: border-box;
                        transition: border-color 0.2s;
                    }

                    .setting-group select:focus,
                    .setting-group input:focus {
                        outline: none;
                        border-color: #667eea;
                        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    }

                    .setting-group small {
                        display: block;
                        margin-top: 4px;
                        color: #6c757d;
                        font-size: 11px;
                    }

                    .setting-help {
                        background: #f8f9fa;
                        padding: 12px;
                        border-radius: 6px;
                        font-size: 12px;
                    }

                    .setting-help p {
                        margin: 0 0 8px 0;
                        font-weight: 600;
                        color: #495057;
                    }

                    .setting-help ul {
                        margin: 0;
                        padding-left: 20px;
                    }

                    .setting-help li {
                        margin-bottom: 4px;
                    }

                    .setting-help a {
                        color: #667eea;
                        text-decoration: none;
                    }

                    .setting-help a:hover {
                        text-decoration: underline;
                    }

                    .settings-footer {
                        padding: 16px 20px;
                        border-top: 1px solid #e9ecef;
                        display: flex;
                        justify-content: flex-end;
                        gap: 12px;
                    }

                    .settings-footer button {
                        padding: 10px 24px;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                        border: none;
                    }

                    .btn-cancel {
                        background: #f8f9fa;
                        color: #6c757d;
                    }

                    .btn-cancel:hover {
                        background: #e9ecef;
                    }

                    .btn-save {
                        background: #667eea;
                        color: white;
                    }

                    .btn-save:hover {
                        background: #5568d3;
                        transform: scale(1.05);
                    }
                </style>
            `;

            document.head.insertAdjacentHTML('beforeend', styles);
        },

        // 绑定设置对话框事件
        async bindSettingsEvents(dialog) {
            const overlay = dialog.querySelector('.settings-overlay');
            const closeBtn = dialog.querySelector('.settings-header .btn-close');
            const cancelBtn = dialog.querySelector('.btn-cancel');
            const saveBtn = dialog.querySelector('.btn-save');

            // 加载当前配置
            const currentProvider = await StorageModule.config.getCurrentProvider();
            const config = await StorageModule.config.getApiConfig(currentProvider);

            const providerSelect = dialog.querySelector('#provider-select');
            const apiKeyInput = dialog.querySelector('#api-key-input');

            providerSelect.value = currentProvider;
            if (config && config.apiKey) {
                apiKeyInput.value = config.apiKey;
            }

            // 关闭对话框
            const closeDialog = () => {
                overlay.remove();
            };

            closeBtn.addEventListener('click', closeDialog);
            cancelBtn.addEventListener('click', closeDialog);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeDialog();
                }
            });

            // 保存配置
            saveBtn.addEventListener('click', async () => {
                const provider = providerSelect.value;
                const apiKey = apiKeyInput.value.trim();

                if (!apiKey) {
                    alert('请输入API Key');
                    return;
                }

                await StorageModule.config.setApiConfig(provider, apiKey);
                await StorageModule.config.setCurrentProvider(provider);

                alert('设置已保存');

                closeDialog();

                // 刷新预测
                window.dispatchEvent(new CustomEvent('stockwhisperer-refresh'));
            });
        }
    };

    // ==================== 数据提取模块 ====================
    const DataExtractor = {
        // 从URL提取股票代码
        extractStockCodeFromURL() {
            const url = window.location.href;

            // 支持多种东方财富URL格式：
            // 1. A股: quote.eastmoney.com/SZ000001.html 或 SH600000.html
            // 2. 科创板: quote.eastmoney.com/kcb/688981.html
            // 3. 港股: quote.eastmoney.com/hk/00981.html

            // 模式1: A股 (SZ/SH + 6位数字)
            const aShareMatch = url.match(/\/(SZ|SH)(\d{6})\.html/);
            if (aShareMatch) {
                console.log('[DataExtractor] 提取A股代码:', aShareMatch[1], aShareMatch[2]);
                return {
                    market: aShareMatch[1], // SZ 或 SH
                    code: aShareMatch[2],   // 6位数字代码
                    type: 'stock'           // A股
                };
            }

            // 模式2: 科创板 (kcb/ + 6位数字)
            const kcbMatch = url.match(/\/kcb\/(\d{6})\.html/);
            if (kcbMatch) {
                console.log('[DataExtractor] 提取科创板代码:', kcbMatch[1]);
                return {
                    market: 'KCB',          // 科创板市场标识
                    code: kcbMatch[1],      // 6位数字代码
                    type: 'kcb_stock'       // 科创板
                };
            }

            // 模式3: 港股 (hk/ + 5位及以上数字)
            const hkStockMatch = url.match(/\/hk\/(\d{5,})\.html/);
            if (hkStockMatch) {
                console.log('[DataExtractor] 提取港股代码:', hkStockMatch[1]);
                return {
                    market: 'HK',           // 港股市场标识
                    code: hkStockMatch[1],  // 5位及以上数字代码
                    type: 'hk_stock'        // 港股
                };
            }

            // 模式4: 通用格式 (任意路径 + 数字代码)
            const generalMatch = url.match(/\/.*\/(\d{5,})\.html/);
            if (generalMatch) {
                console.log('[DataExtractor] 提取通用代码:', generalMatch[1]);
                return {
                    market: 'OTHER',        // 其他市场
                    code: generalMatch[1],  // 5位及以上数字代码
                    type: 'other'           // 其他类型
                };
            }

            console.warn('[DataExtractor] 无法从URL提取股票代码:', url);
            return null;
        },

        // 从DOM提取股票数据 - 严格模式
        extractStockDataFromDOM() {
            try {
                console.log('[DataExtractor] 开始从DOM提取股票数据...');

                const stockInfo = this.extractStockCodeFromURL();
                if (!stockInfo) {
                    throw new Error('无法从URL提取股票代码');
                }

                console.log('[DataExtractor] 股票信息:', stockInfo);

                // ==================== 股票名称提取 ====================
                let name = '';
                const titleMatch = document.title.match(/^(.+?)(?:\(|（|\s)/);
                if (titleMatch) {
                    name = titleMatch[1].trim();
                    console.log('[DataExtractor] 从标题提取股票名称:', name);
                } else {
                    throw new Error('无法从页面标题提取股票名称');
                }

                // ==================== 价格提取 - 严格模式 ====================
                let currentPrice = 0;
                let changePercent = 0;
                let volume = 0;

                // 查找价格元素 - 精确定位个股价格
                const code = stockInfo.code; // 例如: 688981, 603719
                console.log('[DataExtractor] 查找股票代码', code, '对应的价格元素');

                // 策略1: 科创板使用 .zs_brief 容器
                let priceEl = null;
                let containerInfo = '';
                let priceContainer = null; // 保存容器引用,用于后续查找涨跌幅

                if (stockInfo.market === 'KCB') {
                    // 科创板: 在 .zs_brief 容器中查找
                    priceContainer = document.querySelector('.zs_brief, .zsquote3l');
                    if (priceContainer) {
                        priceEl = priceContainer.querySelector('.price_up, .price_down, [class*="price_up"], [class*="price_down"]');
                        if (priceEl) {
                            containerInfo = '科创板容器: .zs_brief';
                            console.log('[DataExtractor] 在科创板容器中找到价格元素');
                        }
                    }
                }

                // 策略2: 如果科创板策略失败,尝试通过股票代码容器查找
                if (!priceEl) {
                    const possibleContainers = [
                        `#${code}`,           // 直接使用代码: #688981, #603719
                        `#sh${code}`,         // 上海前缀: #sh603719
                        `#sz${code}`,         // 深圳前缀: #sz688981
                        `#kcb${code}`,        // 科创板前缀: #kcb688981
                        `[id*="${code}"]`     // 任意包含代码的ID
                    ];

                    for (const containerSelector of possibleContainers) {
                        const container = document.querySelector(containerSelector);
                        if (container) {
                            console.log('[DataExtractor] 找到容器:', containerSelector);
                            // 在容器内查找价格元素
                            priceEl = container.querySelector('.price_up, .price_down, [class*="price_up"], [class*="price_down"]');
                            if (priceEl) {
                                containerInfo = `容器: ${containerSelector}`;
                                priceContainer = container; // 保存容器引用
                                break;
                            }
                        }
                    }
                }

                // 策略3: 最后的兜底 - 全局查找(警告可能不准确)
                if (!priceEl) {
                    console.warn('[DataExtractor] 在特定容器内未找到价格元素,尝试全局查找(可能不准确)');
                    const fallbackSelectors = [
                        '.new_price',
                        '.price_up',
                        '.price_down'
                    ];
                    for (const selector of fallbackSelectors) {
                        priceEl = document.querySelector(selector);
                        if (priceEl) {
                            containerInfo = `全局查找: ${selector} (警告: 可能不是个股价格)`;
                            console.warn('[DataExtractor] ⚠️ 使用全局查找,可能提取到错误价格!');
                            break;
                        }
                    }
                }

                if (priceEl) {
                    const text = priceEl.textContent.trim();
                    console.log('[DataExtractor] 找到价格元素, ', containerInfo, '内容:', text);

                    // 提取价格 (格式: "122.40" 或 "122.40-4.78%")
                    const priceMatch = text.match(/^(\d+\.\d+)/);
                    if (priceMatch) {
                        currentPrice = parseFloat(priceMatch[1]);
                        console.log('[DataExtractor] 提取到价格:', currentPrice);
                    } else {
                        throw new Error('价格元素内容格式不正确: ' + text);
                    }
                } else {
                    throw new Error('未找到价格元素');
                }

                // ==================== 涨跌幅提取 ====================
                // 在容器内单独查找涨跌幅元素
                if (priceContainer && changePercent === 0) {
                    console.log('[DataExtractor] 在容器内查找涨跌幅元素');

                    // 使用 .zd 元素(东方财富标准)
                    const changeEl = priceContainer.querySelector('.zd');
                    if (changeEl) {
                        const text = changeEl.textContent.trim();
                        console.log('[DataExtractor] 找到.zd元素, 内容:', text);

                        // 提取涨跌幅 (支持整数和小数: -5% 或 -4.78%)
                        const changeMatch = text.match(/([+-]?\d+\.?\d*)%/);
                        if (changeMatch) {
                            changePercent = parseFloat(changeMatch[1]);
                            console.log('[DataExtractor] ✅ 提取到涨跌幅:', changePercent);
                        } else {
                            console.log('[DataExtractor] .zd元素中未找到百分比格式');
                        }
                    } else {
                        console.log('[DataExtractor] 未找到.zd元素');
                    }
                }

                // 如果容器内没找到,尝试从价格元素本身提取
                if (changePercent === 0 && priceEl) {
                    const text = priceEl.textContent.trim();
                    const changeMatch = text.match(/([+-]?\d+\.?\d*)%/);
                    if (changeMatch) {
                        changePercent = parseFloat(changeMatch[1]);
                        console.log('[DataExtractor] 从价格元素提取涨跌幅:', changePercent);
                    }
                }

                // ==================== 数据验证 ====================
                // 严格验证价格数据
                if (!currentPrice || isNaN(currentPrice) || currentPrice <= 0) {
                    throw new Error('提取的价格无效: ' + currentPrice + ', 价格必须大于0');
                }

                if (currentPrice >= 1000) {
                    // 价格 >= 1000 必须有小数部分,否则可能是大盘指数
                    if (currentPrice % 1 === 0) {
                        throw new Error('提取的价格 ' + currentPrice + ' 疑似大盘指数(整数且>=1000),请检查页面元素');
                    }
                }

                // 涨跌幅验证
                if (changePercent !== 0 && Math.abs(changePercent) > 25) {
                    console.warn('[DataExtractor] 警告: 涨跌幅异常 (' + changePercent + '%), 可能不是涨跌幅数据');
                }

                // ==================== 成交量提取（可选） ====================
                // 在 .zs_brief 容器中查找 .price_draw 元素(blinkgreen或blinkblue)
                if (priceContainer) {
                    // 先尝试 blinkgreen,再尝试 blinkblue
                    let volumeEl = priceContainer.querySelector('.price_draw.blinkgreen');
                    if (!volumeEl) {
                        volumeEl = priceContainer.querySelector('.price_draw.blinkblue');
                    }

                    if (volumeEl) {
                        const text = volumeEl.textContent.replace(/,/g, '').trim();
                        console.log('[DataExtractor] 找到成交量元素, 内容:', text);
                        // 提取数字(可能包含单位 如"万"、"手"等)
                        const match = text.match(/(\d+(?:\.\d+)?)/);
                        if (match) {
                            volume = parseFloat(match[1]);
                            console.log('[DataExtractor] ✅ 提取到成交量:', volume);
                        }
                    } else {
                        console.log('[DataExtractor] 在容器内未找到.price_draw元素');
                    }
                }

                // 如果上面没找到,尝试通用方法
                if (volume === 0) {
                    const volumeEl = document.querySelector('[class*="volume"]');
                    if (volumeEl) {
                        const text = volumeEl.textContent.replace(/,/g, '').trim();
                        const match = text.match(/(\d+(?:\.\d+)?)/);
                        if (match) {
                            volume = parseFloat(match[1]);
                            console.log('[DataExtractor] 通过通用方法提取成交量:', volume);
                        }
                    }
                }

                // ==================== 构建结果 ====================
                const result = {
                    code: stockInfo.code,
                    name: name,
                    market: stockInfo.market,
                    currentPrice: currentPrice,
                    openPrice: 0,
                    closePrice: 0,
                    highPrice: 0,
                    lowPrice: 0,
                    changePercent: changePercent,
                    volume: volume,
                    timestamp: Date.now()
                };

                console.log('[DataExtractor] ✅ 数据提取成功:', result);
                return result;

            } catch (error) {
                console.error('[DataExtractor] ❌ 数据提取失败:', error.message);
                console.error('[DataExtractor] 错误堆栈:', error.stack);
                return null;
            }
        },


        // 智能提取（严格模式）
        async smartExtractStockData() {
            // 从URL和DOM提取数据
            let data = this.extractStockDataFromDOM();


            // 数据验证
            if (!data || !data.code || !data.currentPrice || data.currentPrice <= 0) {
                throw new Error(ErrorHandler.ErrorTypes.EXTRACTION_FAILED);
            }

            return data;
        }
    };

    // ==================== 业务逻辑层 ====================
    const App = {
        // 是否正在加载
        isLoading: false,

        // 刷新事件处理器
        _refreshHandler: null,

        // 移除刷新事件监听器
        removeRefreshListener() {
            if (this._refreshHandler) {
                window.removeEventListener('stockwhisperer-refresh', this._refreshHandler);
                this._refreshHandler = null;
            }
        },

        // 初始化
        async init() {
            console.log('[StockWhisperer] ==================== 脚本初始化开始 ====================');
            console.log('[StockWhisperer] 脚本已加载');
            console.log('[StockWhisperer] Tampermonkey API 可用:', typeof GM_xmlhttpRequest !== 'undefined');

            // 检查页面类型
            const pageType = this.detectPageType();

            // 只在股票详情页运行
            if (pageType !== 'stock_detail') {
                console.log('[StockWhisperer] 非股票详情页，跳过');
                console.log('[StockWhisperer] 页面类型:', pageType);
                this.showDebugInfo('当前页面不是股票详情页，脚本不会运行');
                return;
            }

            console.log('[StockWhisperer] 确认为股票详情页，继续执行');

            // 等待页面加载完成
            console.log('[StockWhisperer] 等待页面加载完成...');
            await this.waitForPageReady();
            console.log('[StockWhisperer] 页面加载完成');

            // 检查API配置
            const provider = await StorageModule.config.getCurrentProvider();
            const config = await StorageModule.config.getApiConfig(provider);

            console.log('[StockWhisperer] API提供商:', provider);
            console.log('[StockWhisperer] API配置存在:', !!config);
            console.log('[StockWhisperer] API Key存在:', !!(config && config.apiKey));

            if (!config || !config.apiKey) {
                // 如果没有配置，显示设置对话框
                console.log('[StockWhisperer] 未配置API Key，显示设置面板');
                // 创建面板但不加载数据
                UIModule.createPredictionPanel();
                UIModule.showError('请先配置API Key才能使用AI预测功能');
                return;
            }

            // 执行主逻辑
            console.log('[StockWhisperer] 开始执行主逻辑');
            await this.main();

            // 修复：防止重复绑定刷新事件
            this.removeRefreshListener();
            const refreshHandler = Utils.debounce(() => {
                this.main();
            }, 1000);
            window.addEventListener('stockwhisperer-refresh', refreshHandler);
            this._refreshHandler = refreshHandler;

            // 监听数据确认事件
            window.addEventListener('stockwhisperer-data-confirmed', (e) => {
                const stockData = e.detail;
                console.log('[StockWhisperer] 用户确认数据:', stockData);
                this.executePrediction(stockData);
            });

            console.log('[StockWhisperer] ==================== 脚本初始化完成 ====================');
        },

        // 显示调试信息
        showDebugInfo(message) {
            // 在页面右上角显示调试信息（10秒后自动消失）
            const debugDiv = document.createElement('div');
            debugDiv.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 12px;
                z-index: 99999;
                max-width: 300px;
                font-family: monospace;
            `;
            debugDiv.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 4px;">🔧 StockWhisperer Debug</div>
                <div>${message}</div>
                <div style="margin-top: 8px; font-size: 10px; opacity: 0.7;">URL: ${window.location.href}</div>
            `;
            document.body.appendChild(debugDiv);
            setTimeout(() => debugDiv.remove(), 10000);
        },

        // 检测页面类型
        detectPageType() {
            const url = window.location.href;
            console.log('[StockWhisperer] 当前URL:', url);

            // 支持多种东方财富URL格式：
            // 1. A股: quote.eastmoney.com/SZ000001.html 或 quote.eastmoney.com/SH600000.html
            // 2. 科创板: quote.eastmoney.com/kcb/688981.html
            // 3. 港股: quote.eastmoney.com/hk/00981.html
            // 4. 其他: quote.eastmoney.com/******.html (只要是5位以上数字ID)

            const patterns = [
                /quote\.eastmoney\.com\/(SZ|SH)\d{6}\.html/, // A股 (SZ000001, SH600000)
                /quote\.eastmoney\.com\/kcb\/\d+\.html/,       // 科创板 (kcb/688981)
                /quote\.eastmoney\.com\/hk\/\d{5,}\.html/,     // 港股 (hk/00981)
                /quote\.eastmoney\.com\/.*\/\d{5,}\.html/       // 通用格式 (其他/123456)
            ];

            for (let i = 0; i < patterns.length; i++) {
                if (patterns[i].test(url)) {
                    console.log(`[StockWhisperer] 检测到股票详情页 (匹配模式${i + 1})`);
                    return 'stock_detail';
                }
            }

            // 列表页
            if (/quote\.eastmoney\.com\/center\/gridlist\.html/.test(url)) {
                console.log('[StockWhisperer] 检测到股票列表页');
                return 'stock_list';
            }

            console.log('[StockWhisperer] 未知页面类型，URL不匹配任何股票页面模式');
            return 'unknown';
        },

        // 等待页面就绪
        async waitForPageReady() {
            return new Promise((resolve) => {
                if (document.readyState === 'complete') {
                    // 额外等待一些动态内容
                    setTimeout(resolve, 1000);
                } else {
                    window.addEventListener('load', () => {
                        setTimeout(resolve, 1000);
                    });
                }
            });
        },

        // 主逻辑
        async main() {
            if (this.isLoading) {
                console.log('[StockWhisperer] 正在加载中，跳过');
                return;
            }

            this.isLoading = true;

            try {
                // 1. 创建UI面板
                UIModule.createPredictionPanel();

                // 2. 提取股票数据
                console.log('[StockWhisperer] 提取股票数据...');
                const stockData = await DataExtractor.smartExtractStockData();

                if (!stockData) {
                    throw new Error(ErrorHandler.ErrorTypes.EXTRACTION_FAILED);
                }

                console.log('[StockWhisperer] 股票数据:', stockData);

                // 3. 显示数据确认界面，等待用户确认
                console.log('[StockWhisperer] 显示数据确认界面');
                UIModule.showDataConfirmation(stockData);

            } catch (error) {
                console.error('[StockWhisperer] 主流程错误:', error);
                ErrorHandler.handle(error, { context: '主流程' });
                UIModule.showError(error.message || '预测失败，请重试');
                this.isLoading = false;
            }
        },

        // 执行AI预测（在用户确认数据后调用）
        async executePrediction(stockData) {
            if (this.isLoading) {
                console.log('[StockWhisperer] 正在加载中，跳过');
                return;
            }

            this.isLoading = true;

            try {
                // 显示加载状态
                UIModule.showLoading();

                // 调用AI预测
                console.log('[StockWhisperer] 开始AI预测...');
                const predictionResult = await APIModule.predict(stockData);

                console.log('[StockWhisperer] 预测结果:', predictionResult);

                // 显示预测结果
                UIModule.showPredictionResult(stockData, predictionResult);

            } catch (error) {
                console.error('[StockWhisperer] AI预测错误:', error);
                ErrorHandler.handle(error, { context: 'AI预测' });
                UIModule.showError(error.message || '预测失败，请重试');
            } finally {
                this.isLoading = false;
            }
        }
    };

    // ==================== 启动脚本 ====================
    // 立即执行启动逻辑
    console.log('[StockWhisperer] 开始启动脚本...');
    console.log('[StockWhisperer] 当前页面URL:', window.location.href);
    console.log('[StockWhisperer] 页面状态:', document.readyState);

    // 立即尝试初始化
    App.init();

    // 同时也在DOMContentLoaded后尝试（防止第一次失败）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[StockWhisperer] DOMContentLoaded触发，重新初始化');
            setTimeout(() => {
                App.init();
            }, 1000);
        });
    }

    console.log('[StockWhisperer] StockWhisperer v1.0.1 - 倾听股市，洞见未来');

})();
