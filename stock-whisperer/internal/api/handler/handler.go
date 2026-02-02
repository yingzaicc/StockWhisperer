package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"stock-whisperer/internal/service"
)

var (
	marketService = service.NewMarketService()
	aiService     = service.NewAIService("") // TODO: 从配置读取API Key
)

// GetQuote 获取实时行情
func GetQuote(c *gin.Context) {
	code := c.Param("code")

	quote, err := marketService.GetQuote(c.Request.Context(), code)
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
		"data":    quote,
	})
}

// GetKlines 获取K线数据
func GetKlines(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(400, gin.H{
			"code":    400,
			"message": "code is required",
		})
		return
	}

	period := c.DefaultQuery("period", "1day")
	limitStr := c.DefaultQuery("limit", "100")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 100
	}
	if limit > 1000 {
		limit = 1000 // 最大限制1000条
	}

	klines, err := marketService.GetKlines(c.Request.Context(), code, period, limit)
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
		"data":    klines,
	})
}

// GetMarketOverview 获取市场概览
func GetMarketOverview(c *gin.Context) {
	overview, err := marketService.GetMarketOverview(c.Request.Context())
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
		"data":    overview,
	})
}

// GetNews 获取新闻
func GetNews(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100 // 最大限制100条
	}
	category := c.Query("category")

	// TODO: 调用newscrawler服务获取新闻
	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"news":      []gin.H{},
			"category":  category,
			"limit":     limit,
		},
	})
}

// GetAnnouncements 获取公告
func GetAnnouncements(c *gin.Context) {
	stock := c.Query("stock")

	// TODO: 调用newscrawler服务获取公告
	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"announcements": []gin.H{},
			"stock":         stock,
		},
	})
}

// GetSentiment 获取舆情
func GetSentiment(c *gin.Context) {
	stock := c.Query("stock")

	// TODO: 调用newscrawler服务获取舆情
	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"stock_code":     stock,
			"sentiment_score": 0.75,
			"trend":          "up",
			"keywords":       []string{"上涨", "利好"},
		},
	})
}

// Predict AI预测
func Predict(c *gin.Context) {
	var req struct {
		StockCode string `json:"stock_code" binding:"required"`
		Days      int    `json:"days"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{
			"code":    400,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}

	if req.Days == 0 {
		req.Days = 3
	}

	prediction, err := aiService.Predict(c.Request.Context(), req.StockCode, req.Days)
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
		"data":    prediction,
	})
}

// GetAdvice 获取投资建议
func GetAdvice(c *gin.Context) {
	stockCode := c.Query("stock_code")
	if stockCode == "" {
		c.JSON(400, gin.H{
			"code":    400,
			"message": "stock_code is required",
		})
		return
	}

	advice, err := aiService.GetAdvice(c.Request.Context(), stockCode)
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
		"data":    advice,
	})
}

// Backtest 回测
func Backtest(c *gin.Context) {
	var req struct {
		StockCode string  `json:"stock_code" binding:"required"`
		StartDate string  `json:"start_date"`
		EndDate   string  `json:"end_date"`
		Strategy  string  `json:"strategy"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{
			"code":    400,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}

	// TODO: 实现回测逻辑
	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"stock_code": req.StockCode,
			"strategy":   req.Strategy,
			"return":     "15.5%",
			"sharpe":     1.8,
			"max_drawdown": "-8.2%",
		},
	})
}

// GetPositions 获取持仓
func GetPositions(c *gin.Context) {
	// TODO: 从数据库获取用户持仓
	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": []gin.H{},
	})
}

// PlaceOrder 下单
func PlaceOrder(c *gin.Context) {
	var req struct {
		StockCode string `json:"stock_code" binding:"required"`
		Price     float64 `json:"price"`
		Quantity  int    `json:"quantity" binding:"required"`
		Side      string `json:"side" binding:"required"` // buy, sell
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{
			"code":    400,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}

	// TODO: 实现下单逻辑
	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"order_id": "ORD123456",
			"status":   "submitted",
		},
	})
}

// Login 登录
func Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{
			"code":    400,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}

	// TODO: 实现真实的登录逻辑
	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"token": "mock_jwt_token_123456",
			"user": gin.H{
				"id":       "1",
				"username": req.Username,
			},
		},
	})
}

// GetProfile 获取用户信息
func GetProfile(c *gin.Context) {
	// TODO: 从JWT token获取用户ID并查询数据库
	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"id":       "1",
			"username": "test_user",
			"email":    "test@example.com",
		},
	})
}

// GetWatchlist 获取自选股
func GetWatchlist(c *gin.Context) {
	// TODO: 从数据库获取用户自选股列表
	c.JSON(200, gin.H{
		"code":    0,
		"message": "success",
		"data": []gin.H{},
	})
}

// WebSocket WebSocket连接
func WebSocket(c *gin.Context) {
	// TODO: 实现WebSocket实时推送
	c.JSON(200, gin.H{
		"code":    0,
		"message": "WebSocket endpoint - use ws:// for connection",
	})
}
