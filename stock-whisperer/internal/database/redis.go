package database

import (
	"context"
	"fmt"
	"log"

	"github.com/redis/go-redis/v9"
	"stock-whisperer/internal/config"
)

var (
	RedisClient *redis.Client
)

// InitRedis 初始化Redis连接
func InitRedis(cfg *config.Config) error {
	ctx := context.Background()

	// 创建Redis客户端
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cfg.Redis.Host, cfg.Redis.Port),
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})

	// 测试连接
	if err := RedisClient.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("failed to connect to Redis: %w", err)
	}

	log.Printf("Redis connected successfully")

	return nil
}

// CloseRedis 关闭Redis连接
func CloseRedis() error {
	if RedisClient != nil {
		return RedisClient.Close()
	}
	return nil
}
