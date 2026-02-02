# 多阶段构建
FROM golang:1.25-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装必要的工具
RUN apk add --no-cache git make

# 复制go mod文件
COPY go.mod go.sum ./

# 下载依赖
RUN go mod download

# 复制源代码
COPY . .

# 构建应用
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o api cmd/api/main.go

# 最终镜像
FROM alpine:latest

# 安装ca证书
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# 从构建阶段复制二进制文件
COPY --from=builder /app/api .

# 复制配置文件
COPY --from=builder /app/configs ./configs

# 暴露端口
EXPOSE 8080

# 运行应用
CMD ["./api"]
