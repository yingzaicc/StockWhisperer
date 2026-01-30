package handler

import (
	"github.com/gin-gonic/gin"
)

// GetNews 获取新闻列表
func GetNews(c *gin.Context) {
	limit := c.DefaultQuery("limit", "20")
	category := c.Query("category")

	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"news": []gin.H{},
			"pagination": gin.H{
				"limit":    limit,
				"category": category,
			},
		},
	})
}

// GetNewsByID 根据ID获取新闻
func GetNewsByID(c *gin.Context) {
	id := c.Param("id")

	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"id":      id,
			"title":   "新闻标题",
			"content": "新闻内容",
		},
	})
}

// GetAnnouncements 获取公告列表
func GetAnnouncements(c *gin.Context) {
	stock := c.Query("stock")

	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"announcements": []gin.H{},
			"stock":         stock,
		},
	})
}

// GetAnnouncementByID 根据ID获取公告
func GetAnnouncementByID(c *gin.Context) {
	id := c.Param("id")

	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"id":      id,
			"title":   "公告标题",
			"content": "公告内容",
		},
	})
}

// GetSentiment 获取舆情数据
func GetSentiment(c *gin.Context) {
	stock := c.Query("stock")
	days := c.DefaultQuery("days", "7")

	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"stock_code":     stock,
			"sentiment_score": 0.75,
			"trend":          "up",
			"keywords":       []string{"上涨", "利好"},
			"days":           days,
		},
	})
}
