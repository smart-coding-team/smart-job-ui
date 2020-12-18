# smart-job-ui
分布式定时任务UI

## 在线体验

演示地址：http://demo.smartcoding.cn:1024/

- demo/demo123 
- 如果喜欢😍，麻烦点个star

## 代码仓库

| 项目名称             | Github                                         | Gitee |
| -------------------- | ---------------------------------------------- | ----- |
| Smart-job(后端)    | [Github](https://github.com/smart-coding-team/smart-job) | [gitee](https://gitee.com/smart-coding-team/smart-job)      |
| Smart-job-ui(前端) |[Github](https://github.com/smart-coding-team/smart-job-ui)| [gitee](https://gitee.com/smart-coding-team/smart-job-ui)        |

## 开发

```bash
# 克隆项目
git clone https://github.com/smart-coding-team/smart-job-ui.git

# 进入项目目录
cd smart-job-ui

#  1.安装依赖
yarn

# 2.启动服务
yarn run dev
# 修改端口
编辑文件 vue.config.js 
```

浏览器访问 http://localhost:1024

## 发布

```bash
# 1.构建测试环境
yarn run build:stage

# 2.构建生产环境
yarn run build:prod
```