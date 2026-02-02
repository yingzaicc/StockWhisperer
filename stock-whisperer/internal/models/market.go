package models

import "time"

// Quote 实时行情
type Quote struct {
	StockCode   string  `json:"stock_code"`
	StockName   string  `json:"stock_name"`
	CurrentPrice float64 `json:"current_price"`
	OpenPrice    float64 `json:"open_price"`
	HighPrice    float64 `json:"high_price"`
	LowPrice     float64 `json:"low_price"`
	PrevClose    float64 `json:"prev_close"`
	Volume       int64   `json:"volume"`
	Amount       float64 `json:"amount"`
	Change       float64 `json:"change"`        // 涨跌额
	ChangePct    float64 `json:"change_pct"`    // 涨跌幅
	Timestamp    time.Time `json:"timestamp"`
}

// Kline K线数据
type Kline struct {
	StockCode  string    `json:"stock_code"`
	Timestamp  time.Time `json:"timestamp"`
	Open       float64   `json:"open"`
	High       float64   `json:"high"`
	Low        float64   `json:"low"`
	Close      float64   `json:"close"`
	Volume     int64     `json:"volume"`
	Amount     float64   `json:"amount"`
	ChangePct  float64   `json:"change_pct"`
}

// MarketOverview 市场概览
type MarketOverview struct {
	Index []IndexData `json:"index"`
	Sectors []SectorData `json:"sectors"`
	HotStocks []Quote `json:"hot_stocks"`
	Timestamp time.Time `json:"timestamp"`
}

// IndexData 指数数据
type IndexData struct {
	Code        string  `json:"code"`
	Name        string  `json:"name"`
	CurrentPrice float64 `json:"current_price"`
	Change      float64 `json:"change"`
	ChangePct   float64 `json:"change_pct"`
}

// SectorData 板块数据
type SectorData struct {
	Name      string  `json:"name"`
	ChangePct float64 `json:"change_pct"`
	Leader    string  `json:"leader"`
}
