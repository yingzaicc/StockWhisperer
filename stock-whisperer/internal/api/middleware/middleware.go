package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"stock-whisperer/pkg/logger"
)

// Logger 日志中间件
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		c.Next()

		cost := time.Since(start)
		logger.Info("[GIN]",
			"status", c.Writer.Status(),
			"cost", cost,
			"ip", c.ClientIP(),
			"method", c.Request.Method,
			"path", path,
			"query", query,
		)
	}
}

// Recovery 恢复中间件
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				logger.Error("Panic recovered: %v", err)
				c.JSON(500, gin.H{
					"code":    500,
					"message": "Internal server error",
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}

// Cors 跨域中间件
func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// Auth 认证中间件
func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.JSON(401, gin.H{
				"code":    401,
				"message": "Unauthorized",
			})
			c.Abort()
			return
		}

		// TODO: 验证JWT token
		// claims, err := jwt.Validate(token)
		// if err != nil {
		//     c.JSON(401, gin.H{"code": 401, "message": "Invalid token"})
		//     c.Abort()
		//     return
		// }

		// c.Set("user_id", claims.UserID)
		c.Next()
	}
}
