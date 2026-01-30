package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"sync"
)

var (
	log  *zap.Logger
	once sync.Once
)

// Init 初始化日志
func Init(level string) {
	once.Do(func() {
		// 解析日志级别
		var zapLevel zapcore.Level
		switch level {
		case "debug":
			zapLevel = zapcore.DebugLevel
		case "info":
			zapLevel = zapcore.InfoLevel
		case "warn":
			zapLevel = zapcore.WarnLevel
		case "error":
			zapLevel = zapcore.ErrorLevel
		default:
			zapLevel = zapcore.InfoLevel
		}

		// 创建logger
		config := zap.Config{
			Level:            zap.NewAtomicLevelAt(zapLevel),
			Development:      false,
			Encoding:         "json",
			EncoderConfig:    zap.NewProductionEncoderConfig(),
			OutputPaths:      []string{"stdout"},
			ErrorOutputPaths: []string{"stderr"},
		}

		log, _ = config.Build()
	})
}

// Debug 日志
func Debug(msg string, fields ...interface{}) {
	if log != nil {
		log.Sugar().Debugw(msg, fields...)
	}
}

// Info 日志
func Info(msg string, fields ...interface{}) {
	if log != nil {
		log.Sugar().Infow(msg, fields...)
	}
}

// Warn 日志
func Warn(msg string, fields ...interface{}) {
	if log != nil {
		log.Sugar().Warnw(msg, fields...)
	}
}

// Error 日志
func Error(msg string, fields ...interface{}) {
	if log != nil {
		log.Sugar().Errorw(msg, fields...)
	}
}

// Fatal 日志
func Fatal(msg string, fields ...interface{}) {
	if log != nil {
		log.Sugar().Fatalw(msg, fields...)
	}
}

// Sync 同步
func Sync() {
	if log != nil {
		_ = log.Sync()
	}
}
