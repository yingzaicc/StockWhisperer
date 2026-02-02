package eastmoney

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"newscrawler/internal/models"
)

const (
	// 东方财富新闻API
	newsAPI = "https://np-anotice-stock.eastmoney.com/api/security/ann"
)

// NewsResponse 东方财富新闻响应
type NewsResponse struct {
	Data struct {
		AnnList []struct {
			AnnID        string `json:"ann_id"`
			AnnTitle     string `json:"ann_title"`
			AnnContent   string `json:"ann_content"`
			AnnTime      string `json:"ann_time"`
			StockList    []struct {
				Code   string `json:"secCode"`
				Name   string `json:"secName"`
			} `json:"stockList"`
		} `json:"annlist"`
	} `json:"data"`
}

// Crawl 爬取东方财富数据
func Crawl() error {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// 构建请求
	url := fmt.Sprintf("%s?page_size=50&page_index=1", newsAPI)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return fmt.Errorf("create request failed: %w", err)
	}

	// 设置请求头
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	req.Header.Set("Referer", "https://www.eastmoney.com/")

	// 发送请求
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// 读取响应
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read body failed: %w", err)
	}

	// 解析响应
	var newsResp NewsResponse
	if err := json.Unmarshal(body, &newsResp); err != nil {
		return fmt.Errorf("parse response failed: %w", err)
	}

	// 处理新闻数据
	for _, item := range newsResp.Data.AnnList {
		// 解析时间
		publishTime, err := time.Parse("2006-01-02 15:04:05", item.AnnTime)
		if err != nil {
			publishTime = time.Now()
		}

		// 创建新闻对象
		news := &models.News{
			ID:          item.AnnID,
			Title:       item.AnnTitle,
			Content:     item.AnnContent,
			Summary:     truncateString(item.AnnContent, 200),
			Source:      "eastmoney",
			Category:    "stock",
			URL:         fmt.Sprintf("https://data.eastmoney.com/notices/%s.html", item.AnnID),
			PublishedAt: publishTime,
			CreatedAt:   time.Now(),
		}

		// TODO: 保存到数据库
		fmt.Printf("爬取新闻: %s\n", news.Title)
	}

	return nil
}

// truncateString 截断字符串
func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}
