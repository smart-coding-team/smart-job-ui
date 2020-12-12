# smart-job-ui
分布式定时任务UI

## 开发

```bash
# 克隆项目
git clone https://github.com/smart-coding-team/smart-job-ui.git

# 进入项目目录
cd smart-job-ui

# 方式一 1.安装依赖
yarn

# 方式一 2.启动服务
yarn run dev
# 修改端口
编辑文件 vue.config.js 
```

浏览器访问 http://localhost:1024

## 发布

```bash
# 方式一 1.构建测试环境
yarn run build:stage


# 方式一 1.构建生产环境
yarn run build:prod
```