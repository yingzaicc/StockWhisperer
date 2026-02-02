package collector

import (
	"context"
	"log"
	"time"

	"newscrawler/internal/crawler/eastmoney"
	"newscrawler/internal/crawler/sina"
)

// Run 启动爬虫收集器
func Run(ctx context.Context) {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	// 立即执行一次
	crawl()

	for {
		select {
		case <-ticker.C:
			crawl()
		case <-ctx.Done():
			log.Println("Collector stopped")
			return
		}
	}
}

// crawl 执行爬取任务
func crawl() {
	log.Println("Starting crawling...")

	// 爬取东方财富
	if err := eastmoney.Crawl(); err != nil {
		log.Printf("EastMoney crawl error: %v", err)
	}

	// 爬取新浪财经
	if err := sina.Crawl(); err != nil {
		log.Printf("Sina crawl error: %v", err)
	}

	log.Println("Crawling completed")
}
