package router

import (
	"github.com/gin-gonic/gin"
	"stock-whisperer/internal/api/handler"
	"stock-whisperer/internal/api/middleware"
	"stock-whisperer/internal/config"
)

// Register 注册路由
func Register(engine *gin.Engine, cfg *config.Config) {
	// 中间件
	engine.Use(middleware.Logger())
	engine.Use(middleware.Recovery())
	engine.Use(middleware.Cors())

	// 健康检查
	engine.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	engine.GET("/ready", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ready"})
	})

	// API路由组
	api := engine.Group("/api/v1")
	{
		// 行情相关
		market := api.Group("/market")
		{
			market.GET("/quote/:code", handler.GetQuote)
			market.GET("/klines", handler.GetKlines)
			market.GET("/overview", handler.GetMarketOverview)
		}

		// 资讯相关
		news := api.Group("/news")
		{
			news.GET("", handler.GetNews)
			news.GET("/announcements", handler.GetAnnouncements)
			news.GET("/sentiment", handler.GetSentiment)
		}

		// AI相关
		ai := api.Group("/ai")
		{
			ai.POST("/predict", handler.Predict)
			ai.GET("/advice", handler.GetAdvice)
		}

		// 交易相关
		trading := api.Group("/trading")
		{
			trading.POST("/backtest", handler.Backtest)
			trading.GET("/positions", handler.GetPositions)
			trading.POST("/order", handler.PlaceOrder)
		}

		// 用户相关
		user := api.Group("/user")
		{
			user.POST("/login", handler.Login)
			user.GET("/profile", middleware.Auth(), handler.GetProfile)
			user.GET("/watchlist", middleware.Auth(), handler.GetWatchlist)
		}
	}

	// WebSocket
	engine.GET("/ws", handler.WebSocket)
}
