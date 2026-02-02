package models

import "time"

// News 新闻模型
type News struct {
	ID          string    `json:"id" bson:"_id"`
	Title       string    `json:"title" bson:"title"`
	Content     string    `json:"content" bson:"content"`
	Summary     string    `json:"summary" bson:"summary"`
	Source      string    `json:"source" bson:"source"`         // 来源：eastmoney, sina
	Category    string    `json:"category" bson:"category"`     // 分类：stock, finance, market
	URL         string    `json:"url" bson:"url"`
	PublishedAt time.Time `json:"published_at" bson:"published_at"`
	CreatedAt   time.Time `json:"created_at" bson:"created_at"`
}

// Announcement 公告模型
type Announcement struct {
	ID          string    `json:"id" bson:"_id"`
	StockCode   string    `json:"stock_code" bson:"stock_code"`
	StockName   string    `json:"stock_name" bson:"stock_name"`
	Title       string    `json:"title" bson:"title"`
	Content     string    `json:"content" bson:"content"`
	Type        string    `json:"type" bson:"type"`           // 公告类型
	URL         string    `json:"url" bson:"url"`
	PublishedAt time.Time `json:"published_at" bson:"published_at"`
	CreatedAt   time.Time `json:"created_at" bson:"created_at"`
}

// Sentiment 舆情模型
type Sentiment struct {
	ID           string    `json:"id" bson:"_id"`
	StockCode    string    `json:"stock_code" bson:"stock_code"`
	StockName    string    `json:"stock_name" bson:"stock_name"`
	Score        float64   `json:"score" bson:"score"`             // 情感得分 -1到1
	Trend        string    `json:"trend" bson:"trend"`             // up, down, neutral
	Keywords     []string  `json:"keywords" bson:"keywords"`
	NewsCount    int       `json:"news_count" bson:"news_count"`
	Date         time.Time `json:"date" bson:"date"`
	CreatedAt    time.Time `json:"created_at" bson:"created_at"`
}
