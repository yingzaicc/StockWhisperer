package service

import (
	"context"
	"time"

	"stock-whisperer/internal/models"
)

// MarketService 行情服务
type MarketService struct {
	// TODO: 添加数据库客户端
}

// NewMarketService 创建行情服务
func NewMarketService() *MarketService {
	return &MarketService{}
}

// GetQuote 获取实时行情
func (s *MarketService) GetQuote(ctx context.Context, code string) (*models.Quote, error) {
	// TODO: 从数据库或第三方API获取
	// 这里返回模拟数据
	return &models.Quote{
		StockCode:    code,
		StockName:    "平安银行",
		CurrentPrice: 10.50,
		OpenPrice:    10.30,
		HighPrice:    10.65,
		LowPrice:     10.25,
		PrevClose:    10.28,
		Volume:       125000000,
		Amount:       1312500000,
		Change:       0.22,
		ChangePct:    2.14,
		Timestamp:    time.Now(),
	}, nil
}

// GetKlines 获取K线数据
func (s *MarketService) GetKlines(ctx context.Context, code string, period string, limit int) ([]models.Kline, error) {
	// TODO: 从TimescaleDB查询
	// period: 1min, 5min, 15min, 30min, 1hour, 1day, 1week, 1month

	// 返回模拟数据
	klines := make([]models.Kline, limit)
	for i := 0; i < limit; i++ {
		klines[i] = models.Kline{
			StockCode: code,
			Timestamp: time.Now().Add(time.Duration(-i) * time.Hour * 24),
			Open:      10.30 + float64(i)*0.1,
			High:      10.65 + float64(i)*0.1,
			Low:       10.25 + float64(i)*0.1,
			Close:     10.50 + float64(i)*0.1,
			Volume:    int64(100000000 + i*1000000),
			Amount:    1000000000 + float64(i)*10000000,
			ChangePct: 2.14 + float64(i)*0.1,
		}
	}
	return klines, nil
}

// GetMarketOverview 获取市场概览
func (s *MarketService) GetMarketOverview(ctx context.Context) (*models.MarketOverview, error) {
	// TODO: 从数据库聚合计算

	return &models.MarketOverview{
		Index: []models.IndexData{
			{
				Code:        "000001",
				Name:        "上证指数",
				CurrentPrice: 3050.25,
				Change:      28.50,
				ChangePct:   0.95,
			},
			{
				Code:        "399001",
				Name:        "深证成指",
				CurrentPrice: 9850.30,
				Change:      45.20,
				ChangePct:   0.46,
			},
			{
				Code:        "399006",
				Name:        "创业板指",
				CurrentPrice: 1980.15,
				Change:      38.75,
				ChangePct:   2.00,
			},
		},
		Sectors: []models.SectorData{
			{
				Name:      "新能源",
				ChangePct: 3.25,
				Leader:    "宁德时代",
			},
			{
				Name:      "半导体",
				ChangePct: 2.80,
				Leader:    "中芯国际",
			},
		},
		HotStocks: []models.Quote{
			{
				StockCode:    "300750",
				StockName:    "宁德时代",
				CurrentPrice: 185.50,
				ChangePct:    5.20,
			},
			{
				StockCode:    "688981",
				StockName:    "中芯国际",
				CurrentPrice: 52.30,
				ChangePct:    4.80,
			},
		},
		Timestamp: time.Now(),
	}, nil
}
