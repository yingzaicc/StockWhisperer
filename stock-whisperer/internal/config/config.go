package config

import (
	"fmt"
	"os"

	"github.com/spf13/viper"
)

// Config 应用配置
type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Log      LogConfig      `mapstructure:"log"`
	Database DatabaseConfig `mapstructure:"database"`
	Redis    RedisConfig    `mapstructure:"redis"`
	AI       AIConfig       `mapstructure:"ai"`
	NewsCrawler NewsCrawlerConfig `mapstructure:"news_crawler"`
}

// ServerConfig 服务器配置
type ServerConfig struct {
	Port         int    `mapstructure:"port"`
	Mode         string `mapstructure:"mode"`         // debug, release
	ReadTimeout  int    `mapstructure:"read_timeout"`  // 秒
	WriteTimeout int    `mapstructure:"write_timeout"` // 秒
}

// LogConfig 日志配置
type LogConfig struct {
	Level  string `mapstructure:"level"`  // debug, info, warn, error
	Format string `mapstructure:"format"` // json, console
	Output string `mapstructure:"output"` // stdout, file
}

// DatabaseConfig 数据库配置
type DatabaseConfig struct {
	Postgres   PostgresConfig   `mapstructure:"postgres"`
	TimescaleDB TimescaleDBConfig `mapstructure:"timescaledb"`
	MongoDB    MongoDBConfig    `mapstructure:"mongodb"`
}

// PostgresConfig PostgreSQL配置
type PostgresConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	DBName   string `mapstructure:"dbname"`
	SSLMode  string `mapstructure:"sslmode"`
}

// TimescaleDBConfig TimescaleDB配置
type TimescaleDBConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	DBName   string `mapstructure:"dbname"`
	SSLMode  string `mapstructure:"sslmode"`
}

// MongoDBConfig MongoDB配置
type MongoDBConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	DBName   string `mapstructure:"dbname"`
}

// RedisConfig Redis配置
type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
}

// AIConfig AI服务配置
type AIConfig struct {
	Deepseek DeepseekConfig `mapstructure:"deepseek"`
	Qwen     QwenConfig     `mapstructure:"qwen"`
}

// DeepseekConfig Deepseek配置
type DeepseekConfig struct {
	APIKey string `mapstructure:"api_key"`
	BaseURL string `mapstructure:"base_url"`
	Model  string `mapstructure:"model"`
}

// QwenConfig 通义千问配置
type QwenConfig struct {
	APIKey string `mapstructure:"api_key"`
	BaseURL string `mapstructure:"base_url"`
	Model  string `mapstructure:"model"`
}

// NewsCrawlerConfig NewsCrawler配置
type NewsCrawlerConfig struct {
	BaseURL string `mapstructure:"base_url"`
	Timeout int    `mapstructure:"timeout"` // 秒
}

// Load 加载配置
func Load() (*Config, error) {
	var cfg Config

	// 设置配置文件路径
	configFile := os.Getenv("CONFIG_FILE")
	if configFile == "" {
		configFile = "./configs/config.yaml"
	}

	// 读取配置文件
	viper.SetConfigFile(configFile)
	viper.SetConfigType("yaml")

	// 环境变量覆盖
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return &cfg, nil
}
