package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"newscrawler/internal/service"
)

var newsService = service.NewNewsService()

// GetNews 获取新闻列表
func GetNews(c *gin.Context) {
	category := c.Query("category")
	limitStr := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100 // 最大限制100条
	}

	news, err := newsService.GetNews(c.Request.Context(), category, limit)
	if err != nil {
		c.JSON(500, gin.H{
			"code":    500,
			"message": err.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"news": news,
			"pagination": gin.H{
				"limit":    limit,
				"category": category,
				"total":    len(news),
			},
		},
	})
}

// GetNewsByID 根据ID获取新闻
func GetNewsByID(c *gin.Context) {
	id := c.Param("id")

	news, err := newsService.GetNewsByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(500, gin.H{
			"code":    500,
			"message": err.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data":    news,
	})
}

// GetAnnouncements 获取公告列表
func GetAnnouncements(c *gin.Context) {
	stock := c.Query("stock")
	limitStr := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100 // 最大限制100条
	}

	announcements, err := newsService.GetAnnouncements(c.Request.Context(), stock, limit)
	if err != nil {
		c.JSON(500, gin.H{
			"code":    500,
			"message": err.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"announcements": announcements,
			"stock":         stock,
			"total":         len(announcements),
		},
	})
}

// GetAnnouncementByID 根据ID获取公告
func GetAnnouncementByID(c *gin.Context) {
	id := c.Param("id")

	announcement, err := newsService.GetAnnouncementByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(500, gin.H{
			"code":    500,
			"message": err.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data":    announcement,
	})
}

// GetSentiment 获取舆情数据
func GetSentiment(c *gin.Context) {
	stock := c.Query("stock")
	daysStr := c.DefaultQuery("days", "7")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days <= 0 {
		days = 7
	}
	if days > 90 {
		days = 90 // 最大限制90天
	}

	sentiment, err := newsService.GetSentiment(c.Request.Context(), stock, days)
	if err != nil {
		c.JSON(500, gin.H{
			"code":    500,
			"message": err.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data":    sentiment,
	})
}
