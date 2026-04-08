# Dimsum Shop - 中式点心电商平台

## 项目概述
在线展示和销售中国传统点心（包子、饺子、点心）的电商网站，支持下单、积分、订单追踪。

## 技术栈
- **框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS 4 + shadcn/ui
- **ORM**: Prisma
- **数据库**: PostgreSQL (Supabase)
- **支付**: Stripe
- **部署**: Vercel
- **图片存储**: Cloudflare R2

## 开发规范
- 移动端优先（Mobile First）
- 中文为主界面，预留多语言扩展
- 使用中文注释，变量名用英文
- 组件放 `src/components/`，按功能模块分子目录
- API 路由放 `src/app/api/`
- Prisma schema 放 `prisma/schema.prisma`
- 所有价格用分（cents）存储，展示时转换

## 目录结构
```
src/
  app/              # Next.js App Router 页面
    (shop)/         # 前台页面组
    (admin)/        # 后台管理页面组
    api/            # API 路由
  components/       # 可复用组件
    ui/             # shadcn/ui 基础组件
    shop/           # 商城业务组件
    admin/          # 后台业务组件
  lib/              # 工具函数、配置
  types/            # TypeScript 类型定义
prisma/             # 数据库 schema 和 migration
public/             # 静态资源（图片等）
```

## Git 规范
- 分支: main (生产) / dev (开发) / feature/* (功能)
- Commit 格式: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`
