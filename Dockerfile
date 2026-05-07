# 使用官方 Nginx 镜像作为基础镜像
#FROM nginx:alpine
FROM 10.21.1.110:8082/base/basenginx:1.17-alpine
# 复制 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制打包好的前端文件到 Nginx 的静态文件目录
COPY dist/ /usr/share/nginx/html/

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"] 