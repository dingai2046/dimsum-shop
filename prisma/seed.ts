// Seed script — 将产品数据写入 Supabase
// 运行方式: npx tsx prisma/seed.ts

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const seedCategories = [
  { name: "手工水饺", slug: "dumplings",     description: "手工现包，皮薄馅嫩", icon: "🥟", sortOrder: 0 },
  { name: "蒸点烧卖", slug: "steamed",       description: "港式经典蒸点",         icon: "🍡", sortOrder: 1 },
  { name: "鲜虾云吞", slug: "wontons",       description: "皮薄馅嫩，鲜虾爆汁",  icon: "🍜", sortOrder: 2 },
  { name: "香脆春卷", slug: "spring-rolls",  description: "金黄酥脆，现炸现卖",  icon: "🌿", sortOrder: 3 },
];

// helper: 缩略图用 -2.jpg（特写方图）；轮播含 -1.jpg（全景宽图）+ -3..5.jpg
const thumb = (slug: string) => `/images/products/${slug}-2.jpg`;
const carousel = (slug: string) =>
  [1, 3, 4, 5].map((n) => `/images/products/${slug}-${n}.jpg`);

const seedProducts = [
  // ── 手工水饺 ──
  {
    name: "半月饺 Crescent Dumplings",
    slug: "crescent",
    description:
      "形如半月的精致手工水饺，皮薄透亮，每只手工捏褶。精选猪肉与时蔬调馅，蒸熟后鲜嫩多汁，是店内最受小朋友喜爱的款式。",
    price: 1780,
    originalPrice: null,
    wholesalePrice: 1400,
    image: thumb("crescent"),
    images: carousel("crescent"),
    categorySlug: "dumplings",
    stock: 90,
    soldCount: 489,
    tags: ["含猪肉", "含麸质"],
    servingSize: "每份6只",
    sortOrder: 1,
  },
  {
    name: "翡翠饺 Jade Dumplings",
    slug: "jade",
    description:
      "菠菜汁染就翡翠色面皮，晶莹剔透，颜值担当。内馅选用鲜虾与荸荠，脆中带弹，清爽不腻，上镜率极高的网红款。",
    price: 1780,
    originalPrice: null,
    wholesalePrice: 1400,
    image: thumb("jade"),
    images: carousel("jade"),
    categorySlug: "dumplings",
    stock: 80,
    soldCount: 421,
    tags: ["含虾", "含麸质"],
    servingSize: "每份6只",
    sortOrder: 2,
  },
  {
    name: "水晶虾饺 Crystal Prawn Dumplings",
    slug: "xiajiao",
    description:
      "广式点心的灵魂之作。澄粉皮半透明如水晶，包裹整颗新鲜大虾，蒸好后虾肉粉红透皮而现，弹牙鲜甜，一口满足。",
    price: 1880,
    originalPrice: null,
    wholesalePrice: 1500,
    image: thumb("xiajiao"),
    images: carousel("xiajiao"),
    categorySlug: "dumplings",
    stock: 70,
    soldCount: 723,
    tags: ["含虾", "含麸质"],
    servingSize: "每份4只",
    sortOrder: 3,
  },

  // ── 蒸点烧卖 ──
  {
    name: "小笼包 Xiao Long Bao",
    slug: "xiaolongbao",
    description:
      "招牌手工小笼包，18褶传统工艺。精选上等猪肉，混入秘制高汤冻，蒸熟后汤汁四溢。轻咬一口，鲜美汤汁在口中迸发，回味无穷。",
    price: 1880,
    originalPrice: null,
    wholesalePrice: 1500,
    image: thumb("xiaolongbao"),
    images: carousel("xiaolongbao"),
    categorySlug: "steamed",
    stock: 100,
    soldCount: 856,
    tags: ["招牌", "含猪肉", "含麸质"],
    servingSize: "每份6只",
    sortOrder: 1,
  },
  {
    name: "鸡肉烧卖 Chicken Siu Mai",
    slug: "siumai-chicken",
    description:
      "精选嫩滑鸡肉与鲜虾调馅，花口造型饱满精致。蒸熟后皮糯馅嫩，顶部点缀橙黄鱼籽，色香味俱全，老少皆宜。",
    price: 1780,
    originalPrice: null,
    wholesalePrice: 1400,
    image: thumb("siumai-chicken"),
    images: carousel("siumai-chicken"),
    categorySlug: "steamed",
    stock: 80,
    soldCount: 534,
    tags: ["含鸡肉", "含虾"],
    servingSize: "每份4只",
    sortOrder: 2,
  },
  {
    name: "黄金烧卖 Golden Siu Mai",
    slug: "siumai-gold",
    description:
      "金黄色蛋皮包裹的高档烧卖，选用猪肉与虾仁混馅，内馅扎实弹牙。金黄外皮在蒸制后格外诱人，是搭档早茶的绝佳伴侣。",
    price: 1780,
    originalPrice: null,
    wholesalePrice: 1400,
    image: thumb("siumai-gold"),
    images: carousel("siumai-gold"),
    categorySlug: "steamed",
    stock: 75,
    soldCount: 398,
    tags: ["含猪肉", "含虾", "含蛋"],
    servingSize: "每份4只",
    sortOrder: 3,
  },

  // ── 鲜虾云吞 ──
  {
    name: "鲜虾云吞 Prawn Wontons",
    slug: "wonton",
    description:
      "皮薄如纸，内馅整颗新鲜大虾。精选昆士兰鲜虾，肉质弹牙，包裹于薄如蝉翼的云吞皮中。可下汤或红油，各有风味。",
    price: 1880,
    originalPrice: null,
    wholesalePrice: 1500,
    image: thumb("wonton"),
    images: carousel("wonton"),
    categorySlug: "wontons",
    stock: 60,
    soldCount: 612,
    tags: ["含虾", "含麸质"],
    servingSize: "每份12只",
    sortOrder: 1,
  },

  // ── 香脆春卷 ──
  {
    name: "长春卷 Long Spring Rolls",
    slug: "springroll-long",
    description:
      "经典长条形炸春卷，金黄酥脆的外皮包裹着鲜美猪肉与爽脆蔬菜馅料。现炸现售，外脆内香，一咬嘎嘣响，是街头小食的澳洲版本。",
    price: 1580,
    originalPrice: null,
    wholesalePrice: 1260,
    image: thumb("springroll-long"),
    images: carousel("springroll-long"),
    categorySlug: "spring-rolls",
    stock: 80,
    soldCount: 356,
    tags: ["含猪肉", "含麸质", "煎炸"],
    servingSize: "每份4只",
    sortOrder: 1,
  },
  {
    name: "方春卷 Square Spring Rolls",
    slug: "springroll-square",
    description:
      "方形迷你春卷，一口一个的惬意。皮薄酥脆，素馅清爽，搭配甜辣酱更是绝配。适合聚会派对，小朋友尤其喜爱。",
    price: 1580,
    originalPrice: null,
    wholesalePrice: 1260,
    image: thumb("springroll-square"),
    images: carousel("springroll-square"),
    categorySlug: "spring-rolls",
    stock: 80,
    soldCount: 287,
    tags: ["含麸质", "煎炸"],
    servingSize: "每份6只",
    sortOrder: 2,
  },
];

async function main() {
  console.log("开始 seed（9 SKU 真实产品版）...");

  // 清空已有数据（顺序：子表 → 父表）
  await prisma.couponUse.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.pointsRecord.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log("已清空旧数据");

  // 创建分类
  const categoryMap = new Map<string, string>();
  for (const cat of seedCategories) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      },
    });
    categoryMap.set(cat.slug, created.id);
    console.log(`  ✓ 分类: ${cat.icon} ${cat.name}`);
  }

  // 创建产品
  for (const prod of seedProducts) {
    const categoryId = categoryMap.get(prod.categorySlug);
    if (!categoryId) {
      console.error(`  ✗ 未找到分类: ${prod.categorySlug}`);
      continue;
    }
    await prisma.product.create({
      data: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        originalPrice: prod.originalPrice,
        wholesalePrice: prod.wholesalePrice,
        image: prod.image,
        images: prod.images,
        categoryId,
        stock: prod.stock,
        soldCount: prod.soldCount,
        tags: prod.tags,
        servingSize: prod.servingSize,
        isActive: true,
        sortOrder: prod.sortOrder,
      },
    });
    console.log(`  ✓ 产品: ${prod.name}  (月售${prod.soldCount})`);
  }

  // 管理员
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "admin@dongfangdimsim.com",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("  ✓ 管理员 admin@dongfangdimsim.com / admin123");

  // Demo 用户
  const demoPassword = await bcrypt.hash("123456", 10);
  await prisma.user.create({
    data: {
      email: "demo@dongfang.com",
      name: "Demo User",
      password: demoPassword,
      role: "CUSTOMER",
    },
  });
  console.log("  ✓ Demo 用户 demo@dongfang.com / 123456");

  console.log(`\nSeed 完成！`);
  console.log(`  分类: ${seedCategories.length} 个`);
  console.log(`  产品: ${seedProducts.length} 个`);
  console.log(
    `  HotPicks 排序（soldCount）: 小笼包${856} > 水晶虾饺${723} > 鲜虾云吞${612} > 鸡肉烧卖${534} > ...`
  );
}

main()
  .catch((e) => {
    console.error("Seed 失败:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
