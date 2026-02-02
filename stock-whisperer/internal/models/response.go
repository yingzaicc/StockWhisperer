package models

// Response 统一响应格式
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// PaginationResponse 分页响应
type PaginationResponse struct {
	Total     int64       `json:"total"`
	Page      int         `json:"page"`
	PageSize  int         `json:"page_size"`
	Data      interface{} `json:"data"`
}

// SuccessResponse 成功响应
func SuccessResponse(data interface{}) Response {
	return Response{
		Code:    0,
		Message: "success",
		Data:    data,
	}
}

// ErrorResponse 错误响应
func ErrorResponse(code int, message string) Response {
	return Response{
		Code:    code,
		Message: message,
	}
}
