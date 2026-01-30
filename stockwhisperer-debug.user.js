// ==UserScript==
// @name         StockWhisperer DOM 调试工具
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  辅助调试东方财富页面DOM结构
// @author       StockWhisperer
// @match        https://quote.eastmoney.com/*
// @match        https://emweb.eastmoney.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    console.log('========================================');
    console.log('🔧 StockWhisperer DOM 调试工具已启动');
    console.log('========================================');

    // 等待页面加载完成
    function initWhenReady() {
        if (document.readyState === 'complete') {
            setTimeout(analyzeDOM, 2000);
        } else {
            window.addEventListener('load', () => {
                setTimeout(analyzeDOM, 2000);
            });
        }
    }

    function analyzeDOM() {
        console.log('\n📊 DOM 结构分析开始...\n');

        // 1. 分析页面标题
        console.log('1️⃣ 页面标题:');
        console.log('   标题文本:', document.title);

        // 从标题提取股票代码和价格
        const titleCode = document.title.match(/(\d{6})/);
        const titlePrice = document.title.match(/(\d+\.\d+)/);
        const titlePercent = document.title.match(/([+-]?\d+\.?\d*)%/);

        console.log('   股票代码:', titleCode ? titleCode[1] : '未找到');
        console.log('   价格:', titlePrice ? titlePrice[1] : '未找到');
        console.log('   涨跌幅:', titlePercent ? titlePercent[1] + '%' : '未找到');

        // 2. 查找所有包含价格的元素
        console.log('\n2️⃣ 价格元素分析:');
        const priceElements = document.querySelectorAll('[class*="price"], [id*="price"]');
        console.log(`   找到 ${priceElements.length} 个包含"price"的元素`);

        const relevantPrices = [];
        priceElements.forEach((el, index) => {
            const text = el.textContent.trim();
            const priceMatch = text.match(/(\d+\.?\d*)/);

            if (priceMatch) {
                const price = parseFloat(priceMatch[1]);

                // 只显示合理的股票价格（0.1 - 1000）
                if (price > 0.1 && price < 1000) {
                    relevantPrices.push({
                        index,
                        price,
                        tag: el.tagName,
                        class: el.className,
                        id: el.id,
                        text: text.substring(0, 50)
                    });
                }
            }
        });

        if (relevantPrices.length > 0) {
            console.log('   所有找到的价格元素:');
            relevantPrices.forEach(item => {
                const isIndex = item.price >= 1000 && item.price % 1 === 0;
                const typeLabel = isIndex ? '🔴 大盘指数(跳过)' : '🟢 个股价格';
                console.log(`   [${item.index}] ${typeLabel}`);
                console.log(`       价格: ${item.price}`);
                console.log(`       标签: ${item.tag}`);
                console.log(`       Class: ${item.class || '无'}`);
                console.log(`       ID: ${item.id || '无'}`);
                console.log(`       文本: ${item.text}`);
                console.log('');
            });
        } else {
            console.log('   ⚠️ 未找到合理的价格元素');
        }

        // 特别检查：大盘指数
        const indexPrices = relevantPrices.filter(item =>
            item.price >= 1000 && item.price % 1 === 0
        );
        if (indexPrices.length > 0) {
            console.log('   ⚠️ 发现大盘指数元素（应排除）:');
            indexPrices.forEach(item => {
                console.log(`       价格: ${item.price}, Class: ${item.class || '无'}`);
            });
        }

        // 个股价格
        const stockPrices = relevantPrices.filter(item =>
            item.price < 1000 || (item.price >= 1000 && item.price % 1 !== 0)
        );
        if (stockPrices.length > 0) {
            console.log('   ✅ 发现个股价格元素:');
            stockPrices.forEach(item => {
                console.log(`       价格: ${item.price}, Class: ${item.class || '无'}`);
            });
        }

        // 3. 查找涨跌幅元素
        console.log('\n3️⃣ 涨跌幅元素分析:');
        const changeElements = document.querySelectorAll('[class*="change"], [class*="percent"], [id*="change"]');
        console.log(`   找到 ${changeElements.length} 个包含"change/percent"的元素`);

        const relevantChanges = [];
        changeElements.forEach((el, index) => {
            const text = el.textContent.trim();
            const match = text.match(/([+-]?\d+\.?\d*)/);

            if (match) {
                const change = parseFloat(match[1]);
                // 合理的涨跌幅范围：-20 到 +20
                if (change >= -20 && change <= 20 && change !== 0) {
                    relevantChanges.push({
                        index,
                        change,
                        tag: el.tagName,
                        class: el.className,
                        id: el.id,
                        text: text.substring(0, 50)
                    });
                }
            }
        });

        if (relevantChanges.length > 0) {
            console.log('   合理的涨跌幅元素:');
            relevantChanges.forEach(item => {
                console.log(`   [${item.index}] 涨跌幅: ${item.change}%`);
                console.log(`       标签: ${item.tag}`);
                console.log(`       Class: ${item.class || '无'}`);
                console.log(`       ID: ${item.id || '无'}`);
                console.log(`       文本: ${item.text}`);
                console.log('');
            });
        } else {
            console.log('   ⚠️ 未找到合理的涨跌幅元素');
        }

        // 4. 查找股票名称
        console.log('\n4️⃣ 股票名称元素分析:');
        const nameSelectors = ['h1', 'h2', '.stock-name', '.name', '[class*="title"]'];
        let foundName = false;

        nameSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                const text = el.textContent.trim();
                if (text && text.length < 30 && text.length > 0) {
                    console.log(`   选择器 "${selector}":`);
                    console.log(`     文本: ${text}`);
                    console.log(`     Class: ${el.className}`);
                    foundName = true;
                }
            });
        });

        if (!foundName) {
            console.log('   ⚠️ 未找到明显的股票名称元素');
        }

        // 5. 创建可视化调试面板
        createDebugPanel(relevantPrices, relevantChanges, titleCode);

        console.log('\n✅ DOM 分析完成！');
        console.log('💡 提示: 查看页面右上角的调试面板以获取可视化信息');
    }

    function createDebugPanel(prices, changes, titleCode) {
        const panel = document.createElement('div');
        panel.id = 'stockwhisperer-debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 350px;
            max-height: 80vh;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.95);
            color: #00ff00;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
            z-index: 999999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;

        let html = `
            <div style="border-bottom: 1px solid #00ff00; padding-bottom: 10px; margin-bottom: 10px;">
                <strong style="font-size: 16px;">🔧 StockWhisperer 调试面板</strong>
                <button onclick="this.parentElement.parentElement.remove()" style="float: right; background: #ff4444; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">关闭</button>
            </div>

            <div style="margin-bottom: 15px;">
                <div style="color: #ffff00; font-weight: bold; margin-bottom: 5px;">📋 页面信息</div>
                <div>URL: ${window.location.href.substring(0, 50)}...</div>
                <div>标题: ${document.title.substring(0, 40)}...</div>
                <div>股票代码: ${titleCode ? titleCode[1] : '未找到'}</div>
            </div>

            <div style="margin-bottom: 15px;">
                <div style="color: #00ffff; font-weight: bold; margin-bottom: 5px;">💰 找到的价格 (${prices.length}个)</div>
        `;

        if (prices.length > 0) {
            // 分类显示
            const stockPrices = prices.filter(p => p.price < 1000 || (p.price >= 1000 && p.price % 1 !== 0));
            const indexPrices = prices.filter(p => p.price >= 1000 && p.price % 1 === 0);

            html += '<div style="max-height: 200px; overflow-y: auto;">';

            // 个股价格（绿色）
            if (stockPrices.length > 0) {
                html += '<div style="margin-bottom: 10px;"><span style="color: #00ff00;">✅ 个股价格 (' + stockPrices.length + '个):</span></div>';
                stockPrices.forEach((item, i) => {
                    html += `
                        <div style="padding: 5px; margin: 3px 0; background: rgba(0, 255, 0, 0.1); border-radius: 4px;">
                            <div style="color: #00ff00;"><strong>#${i + 1} 价格: ${item.price}</strong></div>
                            <div style="font-size: 10px; color: #aaaaaa;">
                                Class: <code style="background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 2px;">${item.class || '无'}</code>
                            </div>
                        </div>
                    `;
                });
            }

            // 大盘指数（红色警告）
            if (indexPrices.length > 0) {
                html += '<div style="margin-bottom: 10px; margin-top: 15px;"><span style="color: #ff4444;">⚠️ 大盘指数 (应排除) (' + indexPrices.length + '个):</span></div>';
                indexPrices.forEach((item, i) => {
                    html += `
                        <div style="padding: 5px; margin: 3px 0; background: rgba(255, 68, 68, 0.1); border: 1px solid #ff4444; border-radius: 4px;">
                            <div style="color: #ff4444;"><strong>#${i + 1} 价格: ${item.price}</strong> 🔴</div>
                            <div style="font-size: 10px; color: #aaaaaa;">
                                Class: <code style="background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 2px;">${item.class || '无'}</code>
                            </div>
                        </div>
                    `;
                });
            }

            html += '</div>';
        } else {
            html += '<div style="color: #ff4444;">⚠️ 未找到任何价格元素</div>';
        }

        html += `
            </div>

            <div style="margin-bottom: 15px;">
                <div style="color: #ff00ff; font-weight: bold; margin-bottom: 5px;">📈 找到的涨跌幅 (${changes.length}个)</div>
        `;

        if (changes.length > 0) {
            html += '<div style="max-height: 150px; overflow-y: auto;">';
            changes.forEach((item, i) => {
                const color = item.change >= 0 ? '#00ff00' : '#ff4444';
                html += `
                    <div style="padding: 5px; margin: 3px 0; background: rgba(255, 255, 255, 0.1); border-radius: 4px;">
                        <div style="color: ${color};"><strong>#${i + 1} ${item.change >= 0 ? '+' : ''}${item.change}%</strong></div>
                        <div style="font-size: 10px; color: #aaaaaa;">
                            Class: <code style="background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 2px;">${item.class || '无'}</code>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        } else {
            html += '<div style="color: #ff4444;">⚠️ 未找到合理的涨跌幅元素</div>';
        }

        html += `
            </div>

            <div style="border-top: 1px solid #00ff00; padding-top: 10px; margin-top: 10px;">
                <div style="color: #ffff00; font-size: 11px;">
                    💡 提示: 查看控制台获取更详细的分析结果
                </div>
            </div>
        `;

        panel.innerHTML = html;
        document.body.appendChild(panel);
    }

    // 启动
    initWhenReady();

})();
