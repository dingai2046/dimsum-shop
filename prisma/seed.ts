// Seed script — 将 mock 产品数据写入 Supabase
// 运行方式: npx tsx prisma/seed.ts

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface SeedCategory {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
}

interface SeedProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string;
  images: string[];
  categorySlug: string;
  stock: number;
  isActive: boolean;
  sortOrder: number;
}

const seedCategories: SeedCategory[] = [
  { name: "热门推荐", slug: "popular", description: "最受欢迎的招牌点心，回头客必点", sortOrder: 0 },
  { name: "招牌点心", slug: "signature", description: "水晶虾饺 · 叉烧包 · 扇贝饺，精工细作", sortOrder: 1 },
  { name: "水饺", slug: "dumplings", description: "手工水饺，薄皮大馅，多种口味", sortOrder: 2 },
  { name: "云吞", slug: "wontons", description: "鲜虾云吞 · 猪肉云吞，皮薄馅嫩", sortOrder: 3 },
  { name: "煎类", slug: "pan-fried", description: "锅贴 · 葱油饼，香脆金黄", sortOrder: 4 },
  { name: "招牌菜", slug: "specials", description: "豉汁排骨等特色菜式", sortOrder: 5 },
];

const seedProducts: SeedProduct[] = [
  // 热门推荐
  { name: "小笼包 Xiao Long Bao", slug: "xiao-long-bao", description: "招牌手工小笼包，皮薄馅嫩汤汁鲜美。精选上等猪肉，配以秘制高汤冻，手工18褶包制。蒸熟后一口咬下满嘴留香。每份8只，附赠姜丝香醋蘸料。", price: 1880, originalPrice: null, image: "/images/products/xiaolongbao.jpg", images: ["/images/products/xiaolongbao.jpg"], categorySlug: "popular", stock: 100, isActive: true, sortOrder: 1 },
  { name: "鸡肉烧卖 Chicken Siu Mai", slug: "chicken-siu-mai", description: "精选鸡肉制成的经典烧卖，花口造型精致。搭配鲜虾提味，蒸熟后鲜嫩多汁，口感细腻。每份6只。", price: 1780, originalPrice: null, image: "/images/products/shaomai.jpg", images: ["/images/products/shaomai.jpg"], categorySlug: "popular", stock: 80, isActive: true, sortOrder: 2 },
  { name: "猪肉韭菜水饺 Pork & Chive Dumplings", slug: "pork-chive-dumplings", description: "经典猪肉韭菜馅水饺，韭菜的清香与猪肉的鲜美完美融合。手工擀皮，馅料饱满，煮熟后皮Q弹有嚼劲。每份12只。", price: 1780, originalPrice: null, image: "/images/products/xiajiao.jpg", images: ["/images/products/xiajiao.jpg"], categorySlug: "popular", stock: 90, isActive: true, sortOrder: 3 },

  // 招牌点心
  { name: "水晶虾饺 Crystal Prawn Dumplings", slug: "crystal-prawn-dumplings", description: "晶莹剔透的虾饺皮包裹着整颗鲜虾，口感弹牙鲜美。广式点心的代表之作，每一只都是师傅的心血。每份4只。", price: 1780, originalPrice: null, image: "/images/products/xiajiao.jpg", images: ["/images/products/xiajiao.jpg"], categorySlug: "signature", stock: 60, isActive: true, sortOrder: 1 },
  { name: "韭菜虾饺 Prawn & Chive Dumplings", slug: "prawn-chive-dumplings", description: "翡翠般的韭菜与弹牙大虾的完美搭配，皮薄透亮。每一只都包裹着鲜虾仁，鲜嫩爽滑。每份4只。", price: 1780, originalPrice: null, image: "/images/products/xiajiao.jpg", images: ["/images/products/xiajiao.jpg"], categorySlug: "signature", stock: 50, isActive: true, sortOrder: 2 },
  { name: "叉烧包 BBQ Pork Buns", slug: "bbq-pork-buns", description: "广式经典叉烧包，面皮自然开裂露出蜜汁叉烧馅。选用上等五花肉慢火烧制后切丁，口感软嫩带有焦香。每份3只。", price: 1580, originalPrice: null, image: "/images/products/naihuangbao.jpg", images: ["/images/products/naihuangbao.jpg"], categorySlug: "signature", stock: 70, isActive: true, sortOrder: 3 },
  { name: "扇贝饺 Scallop Dumplings", slug: "scallop-dumplings", description: "精选新鲜扇贝制成的高级饺子，海鲜鲜味浓郁。搭配时令蔬菜，口感层次丰富。每份4只。", price: 1780, originalPrice: null, image: "/images/products/xiajiao.jpg", images: ["/images/products/xiajiao.jpg"], categorySlug: "signature", stock: 40, isActive: true, sortOrder: 4 },

  // 水饺
  { name: "牛肉香菜水饺 Beef & Coriander Dumplings", slug: "beef-coriander-dumplings", description: "精选牛肉搭配新鲜香菜，馅料鲜香多汁。手工擀皮，每一只都馅料饱满。每份12只。", price: 1780, originalPrice: null, image: "/images/products/xiajiao.jpg", images: ["/images/products/xiajiao.jpg"], categorySlug: "dumplings", stock: 80, isActive: true, sortOrder: 1 },
  { name: "鸡肉白菜水饺 Chicken & Cabbage Dumplings", slug: "chicken-cabbage-dumplings", description: "嫩滑鸡肉与清甜白菜的经典搭配，口感清爽不油腻。适合全家老小。每份12只。", price: 1780, originalPrice: null, image: "/images/products/xiajiao.jpg", images: ["/images/products/xiajiao.jpg"], categorySlug: "dumplings", stock: 70, isActive: true, sortOrder: 2 },
  { name: "鸡肉玉米冬菇水饺 Chicken, Corn & Mushroom Dumplings", slug: "chicken-corn-mushroom-dumplings", description: "鸡肉的嫩滑、甜玉米的清甜、冬菇的鲜香三味合一，每一口都有惊喜。每份12只。", price: 1780, originalPrice: null, image: "/images/products/xiajiao.jpg", images: ["/images/products/xiajiao.jpg"], categorySlug: "dumplings", stock: 60, isActive: true, sortOrder: 3 },
  { name: "三鲜水饺 Sanxian Dumplings", slug: "sanxian-dumplings", description: "猪肉、虾仁、鸡蛋三鲜合一，搭配时令蔬菜。手工擀皮，馅料调味恰到好处，煮熟后皮Q弹有嚼劲。每份12只。", price: 1880, originalPrice: null, image: "/images/products/xiajiao.jpg", images: ["/images/products/xiajiao.jpg"], categorySlug: "dumplings", stock: 75, isActive: true, sortOrder: 4 },
  { name: "牛肉大葱水饺 Beef & Leek Dumplings", slug: "beef-leek-dumplings", description: "精选牛肉搭配新鲜大葱，北方经典口味。馅料饱满多汁，香气四溢。每份12只。", price: 1780, originalPrice: null, image: "/images/products/xiajiao.jpg", images: ["/images/products/xiajiao.jpg"], categorySlug: "dumplings", stock: 65, isActive: true, sortOrder: 5 },
  { name: "猪肉白菜水饺 Pork & Cabbage Dumplings", slug: "pork-cabbage-dumplings", description: "最传统的猪肉白菜馅水饺，白菜的清甜中和猪肉的油脂，口感均衡美味。每份12只。", price: 1780, originalPrice: null, image: "/images/products/xiajiao.jpg", images: ["/images/products/xiajiao.jpg"], categorySlug: "dumplings", stock: 85, isActive: true, sortOrder: 6 },

  // 云吞
  { name: "虾肉云吞 Prawn Wontons", slug: "prawn-wontons", description: "鲜虾肉馅的经典云吞，皮薄如纸，虾肉弹牙。可搭配高汤或辣油享用。每份12只。", price: 1880, originalPrice: null, image: "/images/products/wonton.jpg", images: ["/images/products/wonton.jpg"], categorySlug: "wontons", stock: 50, isActive: true, sortOrder: 1 },
  { name: "猪肉云吞 Pork Wontons", slug: "pork-wontons", description: "传统猪肉馅云吞，馅料鲜嫩，皮薄透亮。煮熟后撒上葱花，鲜美可口。每份12只。", price: 1580, originalPrice: null, image: "/images/products/wonton.jpg", images: ["/images/products/wonton.jpg"], categorySlug: "wontons", stock: 60, isActive: true, sortOrder: 2 },

  // 煎类
  { name: "猪肉锅贴 Pork Potstickers", slug: "pork-potstickers", description: "底部煎至金黄酥脆的猪肉锅贴，一面酥一面软。蘸上醋和辣油，香脆可口。每份6只。", price: 1780, originalPrice: null, image: "/images/products/guotie.jpg", images: ["/images/products/guotie.jpg"], categorySlug: "pan-fried", stock: 55, isActive: true, sortOrder: 1 },
  { name: "葱油饼 Scallion Pancake", slug: "scallion-pancake", description: "层层酥脆的葱油饼，手工揉制，葱香四溢。外酥内软，每一口都能感受到葱花的香气。每份1块。", price: 1500, originalPrice: null, image: "/images/products/congyoubing.jpg", images: ["/images/products/congyoubing.jpg"], categorySlug: "pan-fried", stock: 40, isActive: true, sortOrder: 2 },

  // 招牌菜
  { name: "豉汁排骨 Pork Ribs Black Bean Sauce", slug: "pork-ribs-black-bean", description: "精选猪排骨以豉汁调味，蒸制入味。骨肉分离，酱香浓郁，是佐饭佐点的经典粤式菜品。", price: 1580, originalPrice: null, image: "/images/products/paigu.jpg", images: ["/images/products/paigu.jpg"], categorySlug: "specials", stock: 35, isActive: true, sortOrder: 1 },
];

async function main() {
  console.log("开始 seed...");

  // 清空已有数据（按依赖关系顺序）
  await prisma.pointsRecord.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log("已清空旧数据");

  // 创建分类
  const categoryMap = new Map<string, string>(); // slug -> id
  for (const cat of seedCategories) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
      },
    });
    categoryMap.set(cat.slug, created.id);
    console.log(`  ✓ 分类: ${cat.name}`);
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
        image: prod.image,
        images: prod.images,
        categoryId,
        stock: prod.stock,
        isActive: prod.isActive,
        sortOrder: prod.sortOrder,
      },
    });
    console.log(`  ✓ 产品: ${prod.name}`);
  }

  // 创建一个测试管理员用户
  await prisma.user.create({
    data: {
      email: "admin@dongfangdimsim.com",
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log("  ✓ 管理员用户已创建");

  console.log(`\nSeed 完成！`);
  console.log(`  分类: ${seedCategories.length}`);
  console.log(`  产品: ${seedProducts.length}`);
}

main()
  .catch((e) => {
    console.error("Seed 失败:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
