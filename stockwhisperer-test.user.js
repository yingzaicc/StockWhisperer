// ==UserScript==
// @name         东方财富AI预测助手 (StockWhisperer) - 测试版
// @namespace    http://tampermonkey.net/
// @version      1.0.1-test
// @description  AI驱动的股票走势预测和原因分析 - 测试版
// @author       StockWhisperer
// @match        *://quote.eastmoney.com/*
// @match        *://emweb.eastmoney.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_notification
// @connect      api.deepseek.com
// @connect      api.openai.com
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 🚨 立即输出测试信息（使用多种方式）
    const testLog = '✅ StockWhisperer 脚本已加载！v1.0.1';

    // 方式1: console.log
    console.log('========================================');
    console.log(testLog);
    console.log('URL:', window.location.href);
    console.log('UserAgent:', navigator.userAgent);
    console.log('========================================');

    // 方式2: 页面标题（最明显）
    const originalTitle = document.title;
    document.title = '🤖 ' + testLog;

    // 方式3: 页面元素（即使DOM未完全加载）
    try {
        const testDiv = document.createElement('div');
        testDiv.id = 'stockwhisperer-test';
        testDiv.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            background: red !important;
            color: white !important;
            font-size: 20px !important;
            padding: 10px !important;
            z-index: 999999 !important;
            text-align: center !important;
            font-weight: bold !important;
        `;
        testDiv.textContent = '✅ StockWhisperer 脚本正在运行！';
        document.documentElement.appendChild(testDiv);

        // 3秒后移除
        setTimeout(() => {
            testDiv.remove();
            document.title = originalTitle;
        }, 3000);
    } catch (e) {
        console.error('[测试] 无法创建测试元素:', e);
    }

    // 方式4: GM_notification（如果可用）
    if (typeof GM_notification !== 'undefined') {
        GM_notification({
            title: 'StockWhisperer',
            text: '脚本已成功加载！',
            timeout: 5000
        });
    }

    // 方式5: alert（仅在首次加载时）
    if (!window.stockwhisperer_loaded) {
        window.stockwhisperer_loaded = true;
        // 延迟1秒后显示，避免阻塞页面
        setTimeout(() => {
            alert('✅ StockWhisperer 脚本已成功加载！\n\n当前URL: ' + window.location.href);
        }, 1000);
    }

    console.log('[StockWhisperer] 详细信息:');
    console.log('- Tampermonkey API GM_xmlhttpRequest:', typeof GM_xmlhttpRequest);
    console.log('- Tampermonkey API GM_setValue:', typeof GM_setValue);
    console.log('- document.readyState:', document.readyState);
    console.log('- location.href:', window.location.href);

})();
