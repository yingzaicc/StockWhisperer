package sina

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"newscrawler/internal/models"
)

const (
	// 新浪财经新闻API
	newsAPI = "https://finance.sina.com.cn/roll/index.d.html"
)

// Crawl 爬取新浪财经数据
func Crawl() error {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// 构建请求
	req, err := http.NewRequest("GET", newsAPI, nil)
	if err != nil {
		return fmt.Errorf("create request failed: %w", err)
	}

	// 设置请求头
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

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

	// 新浪财经返回的是HTML，需要解析
	// 这里简化处理，实际应该使用HTML解析库如goquery
	fmt.Printf("爬取新浪财经数据，内容长度: %d\n", len(body))

	// 创建示例新闻对象
	news := &models.News{
		ID:          generateID(),
		Title:       "示例新闻标题",
		Content:     "示例新闻内容",
		Summary:     "示例新闻摘要",
		Source:      "sina",
		Category:    "finance",
		URL:         newsAPI,
		PublishedAt: time.Now(),
		CreatedAt:   time.Now(),
	}

	// TODO: 实际解析HTML并提取新闻
	// TODO: 保存到数据库
	fmt.Printf("爬取新闻: %s\n", news.Title)

	return nil
}

// generateID 生成ID
func generateID() string {
	return fmt.Sprintf("sina_%d", time.Now().UnixNano())
}
