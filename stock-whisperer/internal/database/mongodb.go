package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"stock-whisperer/internal/config"
)

var (
	MongoClient *mongo.Client
)

// InitMongoDB 初始化MongoDB连接
func InitMongoDB(cfg *config.Config) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 构建连接字符串
	mongoURI := fmt.Sprintf("mongodb://%s:%d",
		cfg.Database.MongoDB.Host,
		cfg.Database.MongoDB.Port,
	)

	// 设置客户端选项
	clientOptions := options.Client().ApplyURI(mongoURI)

	// 如果有用户名密码，添加认证
	if cfg.Database.MongoDB.User != "" && cfg.Database.MongoDB.Password != "" {
		credential := options.Credential{
			Username: cfg.Database.MongoDB.User,
			Password: cfg.Database.MongoDB.Password,
		}
		clientOptions.SetAuth(credential)
	}

	// 连接MongoDB
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	// 测试连接
	if err := client.Ping(ctx, nil); err != nil {
		return fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	MongoClient = client
	log.Printf("MongoDB connected successfully")

	return nil
}

// GetMongoDB 获取MongoDB数据库实例
func GetMongoDB(cfg *config.Config) *mongo.Database {
	return MongoClient.Database(cfg.Database.MongoDB.DBName)
}

// CloseMongoDB 关闭MongoDB连接
func CloseMongoDB() error {
	if MongoClient != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		return MongoClient.Disconnect(ctx)
	}
	return nil
}
