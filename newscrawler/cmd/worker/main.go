package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/yingzaicc/newscrawler/internal/crawler/collector"
)

func main() {
	log.Println("Starting NewsCrawler worker...")

	// 创建上下文
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 启动爬虫收集器
	go collector.Run(ctx)

	// 优雅关闭
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down worker...")
	cancel()

	// 等待清理完成
	time.Sleep(2 * time.Second)
	log.Println("Worker exited")
}
