# 東方點心 Dong Fang Dim Sum — 项目完整总结

> **Session 切换交接文档**
> Last updated: 2026-05-01
> Read this first when starting a new session.

---

## 🎯 项目定位

悉尼 South Hurstville 中式点心外卖店的线上平台。外卖 App 风格（非电商），支持外送/自取，零售/批发。

- **品牌**：東方點心（**Dong Fang Dim Sum**）- 繁体，⚠️ 注意是 Dim Sum（2026-04-27 用户确认，不是 Dim Sim）
- **Logo 字体**：楷体（KaiTi/STKaiti）橙红色
- **地址**：54 Connells Point Rd, South Hurstville, NSW 2221, Sydney
- **电话**：02 8591 4432
- **线上**：https://dimsum-shop.vercel.app
- **GitHub**：https://github.com/dingai2046/dimsum-shop

---

## 🛠 技术栈

- **Next.js 16** (App Router + Turbopack) — 注意 `params`/`searchParams` 都是 Promise
- **TypeScript + Tailwind CSS 4 + shadcn/ui (base-ui)** — 不再支持 `asChild`，用 `buttonVariants()` + className
- **Prisma 7 + @prisma/adapter-pg** → Supabase PostgreSQL (**Session pooler**，不是 direct)
- **NextAuth.js v5** — JWT session，Credentials + Google OAuth（无微信）
- **Stripe Payment Element + Webhook** — AUD 货币
- **next-intl** — 中/英双语，`/zh` 和 `/en` URL 路由
- **Cloudinary** — 产品图片存储
- **Resend** — 邮件通知（延迟初始化，build 时不会报错）
- **Vercel** — 自动部署

---

## 📁 目录结构核心路径

```
src/
  app/
    [locale]/
      (shop)/       # 前台 18+ 页面
      (admin)/admin/ # 后台 11+ 页面
    api/            # 所有 API 路由（不在 [locale] 下）
    layout.tsx      # 根 layout（含 PWA meta）
  components/
    shop/           # 前台组件
    admin/          # 后台组件
  lib/
    auth.ts         # NextAuth 配置（含 Google OAuth JWT 修复 + 新用户奖励）
    prisma.ts       # Prisma 客户端（max:3 连接池）
    cart-context.tsx # 购物车 Context + localStorage
    email.ts        # Resend 邮件（延迟初始化 getResend()）
    stripe.ts       # Stripe 客户端
  i18n/
    routing.ts
    request.ts
    navigation.ts   # 导出 Link/useRouter（重要：[locale] 下必须用这个）
  middleware.ts     # next-intl 中间件
messages/
  zh.json / en.json # 500+ 翻译键，可爱化语气（"购物车空空的呢~" 风格）
prisma/
  schema.prisma     # 12 个数据模型（Campaign/CampaignParticipation 已加入）
  seed.ts           # 4 分类 9 真实 SKU（2026-04-27 重写，替换旧的 7 分类 30 占位产品）
public/
  manifest.json     # PWA manifest
  sw.js             # Service Worker
  icons/            # PWA 图标（192 + 512）
```

---

## 🗂 数据模型（14 个）

User, Category, Product, Address, Order, OrderItem, PointsRecord, Favorite, SiteSettings, **Coupon, CouponUse, Review, Campaign, CampaignParticipation**

### Order 流程枚举
```
PENDING → PAID → CONFIRMED → PREPARING → READY → DELIVERING → DELIVERED
                                        ↓
                              CANCELLED / REFUNDED
```

### 关键字段
- `Product.stock` / `soldCount` — 下单自动扣减，支付失败恢复
- `Product.wholesalePrice` / `tags` / `servingSize` — 已加入后台编辑
- `Coupon.type`: FIXED / PERCENT / FREE_DELIVERY
- `Campaign.type`: google_review / share / checkin (可扩展)
- `Address` 澳洲格式: street1/street2/suburb/state/postcode

---

## ✅ 已实现功能清单

### 用户端（18+ 页面）
- `/` 外卖风格菜单页（StoreStatusBar + DeliveryToggle + 活动横幅 + HotPicks + CategoryTabs + MenuSection）
- `/checkout` 澳洲地址 + Stripe Payment Element + 优惠券 + 已保存地址选择 + 信任标识
- `/cart`, `/products`, `/products/[slug]`, `/categories`, `/search`, `/about`
- `/login`, `/register` (含注册奖励 banner)
- `/account` 个人中心 → orders, addresses, points, **favorites**
- `/orders/success` 重做版本（摘要+积分+预计时间+分享）
- `/campaigns` 活动列表 + `/campaigns/[slug]` 详情（Google Review 活动）

### 管理后台（11+ 页面）
- `/admin` 仪表板（真实统计）
- `/admin/products` 分页 + 搜索 + 删除按钮 + 新字段编辑
- `/admin/orders` 分页 + 搜索订单号 + 状态筛选 + **CSV 导出**
- `/admin/categories` CRUD
- `/admin/users` 用户管理（角色/买家类型/积分调整）
- `/admin/coupons` 优惠券管理
- `/admin/reviews` 评价审核
- `/admin/campaigns` 活动管理
- `/admin/settings` 站点设置（数据库持久化）

### API（40+ 路由）
- `/api/coupons/validate` - 优惠券验证
- `/api/coupons/available` - 获取用户可用优惠券
- `/api/favorites` + `/favorites/[id]` - 收藏
- `/api/reviews` - 评价
- `/api/recommendations` - 购物车推荐
- `/api/addresses` + `/[id]` - 地址 CRUD
- `/api/campaigns/[slug]/participate` + `/claim` - 活动参与+领奖
- `/api/admin/export/orders` - CSV 导出
- `/api/admin/orders/[id]/status` - 状态更新（发邮件）
- `/api/webhooks/stripe` - 支付成功更新订单+扣积分+发邮件

### 转化率 + 体验功能
1. 免运费进度条（CartBar + CartSheet）
2. 一键复购（订单详情/列表"再来一单"）
3. 优惠券系统（全栈）
4. 结账页已保存地址自动选择
5. 购物车搭配推荐
6. 收藏功能（心形按钮 + 收藏列表）
7. 产品评价（星级 + 文字 + 后台审核）
8. 邮件通知（下单/支付/状态变更 via Resend）
9. 最低起送额校验（外送 $20）
10. 首单引导（注册送 100 积分 + $5 优惠券，邮箱 + Google 双通道）

### 全站可爱化（50+ 文案 + 空状态动画）
- 文案："购物车空空的呢~ 🥟"、"还差一点点，满$20起送哦"、"谢谢你的支持！我们正在准备你的美味~"
- 空状态 emoji + gentle-bounce 动画（🥟 饺子/🍜 面碗/❤️ 爱心/🏠 房子/🔍 放大镜）
- 菜单加载骨架屏

### PWA 支持
- manifest.json + Service Worker + 图标
- PWAInstall 组件（Android 一键安装 + iOS Safari 引导）
- 7 天内不重复提示

### i18n 国际化
- next-intl，`/zh` 默认、`/en` 英文
- 全站 500+ 翻译键
- Header 中/EN 切换按钮

---

## 🔑 环境变量（本地 `.env` + Vercel 都已配置）

```
DATABASE_URL          # Supabase Session pooler URI
AUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  # 客户端需要 NEXT_PUBLIC_ 前缀
STRIPE_WEBHOOK_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NEXT_PUBLIC_SITE_URL
# RESEND_API_KEY - 可选，缺失时邮件静默不发
```

Stripe Webhook 在 Stripe Dashboard 指向：
`https://dimsum-shop.vercel.app/api/webhooks/stripe`

---

## ⚠️ 重要踩坑记录（避免重犯）

### 1. Google OAuth JWT ID 问题
Google OAuth 的 `user.id` 是 Google ID 不是数据库 ID。`src/lib/auth.ts` 的 `jwt` callback 中查数据库拿真实 ID，否则创建订单会外键约束报错。

### 2. Seed 重置 → 旧 Session 失效
每次重新 seed 会清空 user 表，浏览器 cookie 里存的 user.id 就失效。症状："创建订单失败" 500 错误。解决：退出重新登录 + 清 localStorage `dongfang-cart`。

### 3. Prisma 连接池溢出
Build 时 72 页面并行 prerender 会超过 Supabase Session mode 的连接数。已在 `src/lib/prisma.ts` 设置 `max: 3`。

### 4. Resend 延迟初始化
`new Resend(key)` 在 build 时 key 不存在会报错。用 `getResend()` 函数运行时才实例化。所有发送用 try-catch 不阻塞主流程。

### 5. next-intl 路由
`[locale]` 下所有 Link 必须用 `import { Link } from "@/i18n/navigation"`，不能用 `next/link`。API 路由不需要在 [locale] 下。

### 6. Prisma 7 破坏性变更
- 连接配置在 `prisma.config.ts` 不是 schema
- PrismaClient 必须传 `adapter`
- 使用 `@prisma/adapter-pg` + `pg` 驱动

### 7. shadcn/ui v4 (base-ui)
不支持 `asChild` prop，用 `buttonVariants()` + className 替代

### 8. tsx 独立脚本
`npx tsx prisma/seed.ts` 不会自动加载 .env，要 `import "dotenv/config"`

### 9. 购物车 localStorage 旧 productId（已有 API 防护）
seed 重置后产品 ID 变了，但 localStorage 里还存旧 cart。`/api/orders` 已加前置校验，返回 `STALE_CART` 错误码，前端自动清空购物车并提示用户。

### 10. Prisma 7 + PrismaPg 嵌套 create 限制
`prisma.order.create({ items: { create: [...] } })` 嵌套写法在 Prisma 7 + driver adapter 下报 `PrismaClientValidationError`。
已改为 `$transaction(async tx => { tx.order.create; tx.orderItem.createMany })` 分步写。

### 11. next-intl middleware 必须排除 PWA 文件
`manifest.json`、`sw.js`、`icons/` 等 PWA 静态文件如不在 matcher 排除列表中，会被重定向到 `/zh/manifest.json` → 404。
已修复，见 `src/middleware.ts`。

### 12. CartBar 导航
不用 `window.location.href`，用 `useRouter` from `@/i18n/navigation`

---

## 🧪 测试账号

```
# 普通用户
Email: demo@dongfang.com
Password: 123456

# 管理员
Email: admin@dongfangdimsim.com
Password: admin123

# Stripe 测试卡
Card: 4242 4242 4242 4242
Exp: 12/28
CVV: 123
```

---

## 🚀 开发命令

```bash
# 启动 dev server
npx next dev --turbopack

# Build
npx next build

# Seed 数据库
npx tsx prisma/seed.ts

# 推送 schema + 生成 client
npx prisma db push --accept-data-loss && npx prisma generate

# 部署到 Vercel（或 git push 自动触发）
npx vercel deploy --prod --yes
```

---

## 📋 上线前待办（非代码）

- [x] ~~上传真实产品照片~~ 已完成（9 SKU × 5张，2026-04-27）
- [ ] 绑定自定义域名 dongfangdimsim.com.au 到 Vercel
- [ ] Stripe 切换正式模式（test key → live key，重新部署）
- [ ] Google OAuth 加正式域名 redirect URI
- [ ] 配置 Resend API key + 验证发件域名 orders@dongfangdimsim.com.au
- [ ] 在 `/admin/campaigns` 创建 Google Review 活动（填真实 Google review URL）
- [ ] Terms / Privacy 页面（澳洲商业必需）
- [ ] `/admin/settings` 填入真实店铺信息

---

## 🎨 设计规范（来自 `.impeccable.md`）

- **3 words**: 温暖 · 传统 · 精致
- **配色**（oklch）：中国红 primary `oklch(0.52 0.2 25)` + 暖金 accent `oklch(0.78 0.12 70)` + 暖白 bg
- **Typography**: Geist Sans + PingFang SC/Microsoft YaHei 中文系统栈
- **Food First**：图片占主视觉，UI 退让
- **Mobile-Native**：最小 44px 触控区
- **语气**："像热情的点心师傅"，可爱但不幼稚

---

## 💡 Session 继续时建议

- 想看当前进度：读 `git log --oneline -20`
- 想了解某个功能：grep 组件名（比如 `CartSheet`、`GoogleReviewCampaign`）
- 想改翻译：`messages/zh.json` + `messages/en.json` 一起改
- 想加新功能：先想清楚数据模型，再 Prisma db push，再写 API，最后 UI
- 做大改动前：先 build 验证当前代码没问题
- 改完一定：`git add -A && git commit -m "..." && git push`（Vercel 自动部署）

---

## 📊 关键指标

- **路由数**：78+（前台 + 后台 + API）
- **数据模型**：14 个
- **翻译键**：500+ 中英双语
- **提交数**：20+ 大版本（MVP → 外卖 App → i18n → PWA → 可爱化 → 活动系统）
- **代码行数**：约 15,000+ 行 TS/TSX

---

## 🎯 下一步可能的方向

**运营相关**：
- 填入真实店铺数据和产品图片
- 创建 Google Review 活动（需要真实 Place ID）
- 配置 Resend 邮件

**功能扩展**：
- Google Places 地址自动补全
- 实时订单状态 WebSocket/SSE
- 批发模式独立入口 `/wholesale`
- 分享邀请功能（再来一个活动类型）
- 会员等级系统（银/金/铂金卡）

**性能优化**：
- 产品图 blur placeholder
- Cloudinary 自动优化
- 离线优先 PWA（更完整的 service worker 策略）

**分析/监控**：
- Vercel Analytics
- 用户行为追踪
- 错误上报（Sentry）
