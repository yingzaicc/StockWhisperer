package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"stock-whisperer/internal/config"
)

var (
	PostgresPool *pgxpool.Pool
	TimescaleDBPool *pgxpool.Pool
)

// InitPostgreSQL 初始化PostgreSQL连接
func InitPostgreSQL(cfg *config.Config) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 构建连接字符串
	postgresURI := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Postgres.Host,
		cfg.Database.Postgres.Port,
		cfg.Database.Postgres.User,
		cfg.Database.Postgres.Password,
		cfg.Database.Postgres.DBName,
		cfg.Database.Postgres.SSLMode,
	)

	// 创建连接池
	pool, err := pgxpool.New(ctx, postgresURI)
	if err != nil {
		return fmt.Errorf("failed to create PostgreSQL pool: %w", err)
	}

	// 测试连接
	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("failed to ping PostgreSQL: %w", err)
	}

	PostgresPool = pool
	log.Printf("PostgreSQL connected successfully")

	return nil
}

// InitTimescaleDB 初始化TimescaleDB连接
func InitTimescaleDB(cfg *config.Config) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 构建连接字符串
	timescaleURI := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.TimescaleDB.Host,
		cfg.Database.TimescaleDB.Port,
		cfg.Database.TimescaleDB.User,
		cfg.Database.TimescaleDB.Password,
		cfg.Database.TimescaleDB.DBName,
		cfg.Database.TimescaleDB.SSLMode,
	)

	// 创建连接池
	pool, err := pgxpool.New(ctx, timescaleURI)
	if err != nil {
		return fmt.Errorf("failed to create TimescaleDB pool: %w", err)
	}

	// 测试连接
	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("failed to ping TimescaleDB: %w", err)
	}

	TimescaleDBPool = pool
	log.Printf("TimescaleDB connected successfully")

	return nil
}

// ClosePostgreSQL 关闭PostgreSQL连接
func ClosePostgreSQL() {
	if PostgresPool != nil {
		PostgresPool.Close()
	}
}

// CloseTimescaleDB 关闭TimescaleDB连接
func CloseTimescaleDB() {
	if TimescaleDBPool != nil {
		TimescaleDBPool.Close()
	}
}
