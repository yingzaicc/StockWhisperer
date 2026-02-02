package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"stock-whisperer/internal/api/router"
	"stock-whisperer/internal/config"
	"stock-whisperer/internal/database"
	"stock-whisperer/pkg/logger"
)

func main() {
	// 加载配置
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 初始化日志
	logger.Init(cfg.Log.Level)

	// 初始化数据库（可选，生产环境需要）
	// 注意：当前使用模拟数据，以下连接代码仅供参考
	// if err := initDatabases(cfg); err != nil {
	// 	logger.Warn("Database initialization failed: %v", err)
	// 	logger.Warn("Continuing with mock data...")
	// }

	// 设置Gin模式
	if cfg.Server.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 创建Gin引擎
	engine := gin.New()

	// 注册中间件和路由
	router.Register(engine, cfg)

	// 创建HTTP服务器
	srv := &http.Server{
		Addr:           fmt.Sprintf(":%d", cfg.Server.Port),
		Handler:        engine,
		ReadTimeout:    time.Duration(cfg.Server.ReadTimeout) * time.Second,
		WriteTimeout:   time.Duration(cfg.Server.WriteTimeout) * time.Second,
		MaxHeaderBytes: 1 << 20, // 1 MB
	}

	// 启动服务器
	go func() {
		logger.Info("Starting server on port", "port", cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", "error", err)
		}
	}()

	// 优雅关闭
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown", "error", err)
	}

	// 关闭数据库连接
	// closeDatabases()

	logger.Info("Server exited")
}

// initDatabases 初始化数据库连接
func initDatabases(cfg *config.Config) error {
	// 初始化MongoDB
	if err := database.InitMongoDB(cfg); err != nil {
		return fmt.Errorf("MongoDB init failed: %w", err)
	}

	// 初始化PostgreSQL
	if err := database.InitPostgreSQL(cfg); err != nil {
		return fmt.Errorf("PostgreSQL init failed: %w", err)
	}

	// 初始化TimescaleDB
	if err := database.InitTimescaleDB(cfg); err != nil {
		return fmt.Errorf("TimescaleDB init failed: %w", err)
	}

	// 初始化Redis
	if err := database.InitRedis(cfg); err != nil {
		return fmt.Errorf("Redis init failed: %w", err)
	}

	logger.Info("All databases initialized successfully")
	return nil
}

// closeDatabases 关闭数据库连接
func closeDatabases() {
	database.CloseMongoDB()
	database.ClosePostgreSQL()
	database.CloseTimescaleDB()
	database.CloseRedis()
}
