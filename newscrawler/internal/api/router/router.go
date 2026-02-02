package router

import (
	"github.com/gin-gonic/gin"
	"newscrawler/internal/api/handler"
)

// Register 注册路由
func Register(engine *gin.Engine) {
	// 健康检查
	engine.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API路由组
	api := engine.Group("/api/v1")
	{
		// 新闻相关
		api.GET("/news", handler.GetNews)
		api.GET("/news/:id", handler.GetNewsByID)

		// 公告相关
		api.GET("/announcements", handler.GetAnnouncements)
		api.GET("/announcements/:id", handler.GetAnnouncementByID)

		// 舆情相关
		api.GET("/sentiment", handler.GetSentiment)
	}
}
