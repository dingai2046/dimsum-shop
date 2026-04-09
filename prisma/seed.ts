// Seed script — 将产品数据写入 Supabase
// 运行方式: npx tsx prisma/seed.ts

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const seedCategories = [
  { name: "必点推荐", slug: "popular", description: "招牌必点，回头客最爱", icon: "🔥", sortOrder: 0 },
  { name: "招牌点心", slug: "signature", description: "广式经典点心", icon: "⭐", sortOrder: 1 },
  { name: "手工水饺", slug: "dumplings", description: "手工现包水饺", icon: "🥟", sortOrder: 2 },
  { name: "鲜虾云吞", slug: "wontons", description: "皮薄馅嫩云吞", icon: "🍜", sortOrder: 3 },
  { name: "煎炸小食", slug: "pan-fried", description: "香脆煎炸小食", icon: "🍳", sortOrder: 4 },
  { name: "招牌菜式", slug: "specials", description: "特色招牌菜", icon: "🍖", sortOrder: 5 },
  { name: "饮品甜点", slug: "drinks", description: "茶饮与甜品", icon: "🧋", sortOrder: 6 },
];

const seedProducts = [
  // 必点推荐
  { name: "小笼包 Xiao Long Bao", slug: "xiao-long-bao", description: "招牌手工小笼包，皮薄馅嫩汤汁鲜美。精选上等猪肉，配以秘制高汤冻，手工18褶包制。", price: 1880, originalPrice: null, wholesalePrice: 1500, image: "/images/products/xiaolongbao.jpg", categorySlug: "popular", stock: 100, soldCount: 856, tags: ["招牌", "含猪肉"], servingSize: "每份8只", sortOrder: 1 },
  { name: "鸡肉烧卖 Chicken Siu Mai", slug: "chicken-siu-mai", description: "精选鸡肉制成的经典烧卖，花口造型精致。搭配鲜虾提味，蒸熟后鲜嫩多汁。", price: 1780, originalPrice: null, wholesalePrice: 1400, image: "/images/products/shaomai.jpg", categorySlug: "popular", stock: 80, soldCount: 723, tags: ["招牌", "含虾"], servingSize: "每份6只", sortOrder: 2 },
  { name: "猪肉韭菜水饺 Pork & Chive Dumplings", slug: "pork-chive-dumplings", description: "经典猪肉韭菜馅水饺，韭菜的清香与猪肉的鲜美完美融合。手工擀皮，馅料饱满。", price: 1780, originalPrice: null, wholesalePrice: 1400, image: "/images/products/xiajiao.jpg", categorySlug: "popular", stock: 90, soldCount: 612, tags: ["含猪肉", "含韭菜"], servingSize: "每份12只", sortOrder: 3 },

  // 招牌点心
  { name: "水晶虾饺 Crystal Prawn Dumplings", slug: "crystal-prawn-dumplings", description: "晶莹剔透的虾饺皮包裹着整颗鲜虾，口感弹牙鲜美。广式点心的代表之作。", price: 1780, originalPrice: null, wholesalePrice: 1400, image: "/images/products/xiajiao.jpg", categorySlug: "signature", stock: 60, soldCount: 534, tags: ["含虾", "含麸质"], servingSize: "每份4只", sortOrder: 1 },
  { name: "韭菜虾饺 Prawn & Chive Dumplings", slug: "prawn-chive-dumplings", description: "翡翠般的韭菜与弹牙大虾的完美搭配，皮薄透亮。", price: 1780, originalPrice: null, wholesalePrice: 1400, image: "/images/products/xiajiao.jpg", categorySlug: "signature", stock: 50, soldCount: 421, tags: ["含虾", "含韭菜"], servingSize: "每份4只", sortOrder: 2 },
  { name: "叉烧包 BBQ Pork Buns", slug: "bbq-pork-buns", description: "广式经典叉烧包，面皮自然开裂露出蜜汁叉烧馅。选用上等五花肉慢火烧制。", price: 1580, originalPrice: null, wholesalePrice: 1260, image: "/images/products/naihuangbao.jpg", categorySlug: "signature", stock: 70, soldCount: 489, tags: ["含猪肉", "含麸质"], servingSize: "每份3只", sortOrder: 3 },
  { name: "扇贝饺 Scallop Dumplings", slug: "scallop-dumplings", description: "精选新鲜扇贝制成的高级饺子，海鲜鲜味浓郁。搭配时令蔬菜，口感层次丰富。", price: 1880, originalPrice: null, wholesalePrice: 1500, image: "/images/products/xiajiao.jpg", categorySlug: "signature", stock: 40, soldCount: 287, tags: ["含贝类", "含麸质"], servingSize: "每份4只", sortOrder: 4 },
  { name: "奶黄包 Custard Buns", slug: "custard-buns", description: "流沙奶黄馅，咬开金沙流淌。外皮松软，内馅浓郁香甜。", price: 1580, originalPrice: null, wholesalePrice: 1260, image: "/images/products/naihuangbao.jpg", categorySlug: "signature", stock: 55, soldCount: 398, tags: ["含蛋", "含奶"], servingSize: "每份3只", sortOrder: 5 },
  { name: "糯米鸡 Sticky Rice in Lotus Leaf", slug: "sticky-rice-lotus", description: "荷叶包裹的糯米鸡，糯米吸满鸡汁香气，内含鸡肉、冬菇、咸蛋黄。", price: 1680, originalPrice: null, wholesalePrice: 1340, image: "/images/products/xiaolongbao.jpg", categorySlug: "signature", stock: 45, soldCount: 356, tags: ["含鸡肉", "含蛋"], servingSize: "每份1只", sortOrder: 6 },

  // 手工水饺
  { name: "牛肉香菜水饺 Beef & Coriander Dumplings", slug: "beef-coriander-dumplings", description: "精选牛肉搭配新鲜香菜，馅料鲜香多汁。手工擀皮，馅料饱满。", price: 1780, originalPrice: null, wholesalePrice: 1400, image: "/images/products/xiajiao.jpg", categorySlug: "dumplings", stock: 80, soldCount: 445, tags: ["含牛肉", "含香菜"], servingSize: "每份12只", sortOrder: 1 },
  { name: "鸡肉白菜水饺 Chicken & Cabbage Dumplings", slug: "chicken-cabbage-dumplings", description: "嫩滑鸡肉与清甜白菜的经典搭配，口感清爽不油腻。适合全家老小。", price: 1780, originalPrice: null, wholesalePrice: 1400, image: "/images/products/xiajiao.jpg", categorySlug: "dumplings", stock: 70, soldCount: 389, tags: ["含鸡肉"], servingSize: "每份12只", sortOrder: 2 },
  { name: "鸡肉玉米冬菇水饺 Chicken, Corn & Mushroom", slug: "chicken-corn-mushroom-dumplings", description: "鸡肉的嫩滑、甜玉米的清甜、冬菇的鲜香三味合一。", price: 1780, originalPrice: null, wholesalePrice: 1400, image: "/images/products/xiajiao.jpg", categorySlug: "dumplings", stock: 60, soldCount: 312, tags: ["含鸡肉", "含蘑菇"], servingSize: "每份12只", sortOrder: 3 },
  { name: "三鲜水饺 Three Delicacy Dumplings", slug: "sanxian-dumplings", description: "猪肉、虾仁、鸡蛋三鲜合一，搭配时令蔬菜。", price: 1880, originalPrice: null, wholesalePrice: 1500, image: "/images/products/xiajiao.jpg", categorySlug: "dumplings", stock: 75, soldCount: 367, tags: ["含猪肉", "含虾", "含蛋"], servingSize: "每份12只", sortOrder: 4 },
  { name: "牛肉大葱水饺 Beef & Leek Dumplings", slug: "beef-leek-dumplings", description: "精选牛肉搭配新鲜大葱，北方经典口味。馅料饱满多汁。", price: 1780, originalPrice: null, wholesalePrice: 1400, image: "/images/products/xiajiao.jpg", categorySlug: "dumplings", stock: 65, soldCount: 298, tags: ["含牛肉"], servingSize: "每份12只", sortOrder: 5 },
  { name: "猪肉白菜水饺 Pork & Cabbage Dumplings", slug: "pork-cabbage-dumplings", description: "最传统的猪肉白菜馅水饺，口感均衡美味。", price: 1780, originalPrice: null, wholesalePrice: 1400, image: "/images/products/xiajiao.jpg", categorySlug: "dumplings", stock: 85, soldCount: 456, tags: ["含猪肉"], servingSize: "每份12只", sortOrder: 6 },
  { name: "素三鲜水饺 Vegetable Dumplings", slug: "vegetable-dumplings", description: "韭菜、鸡蛋、粉丝三鲜素馅，清淡可口，素食之选。", price: 1580, originalPrice: null, wholesalePrice: 1260, image: "/images/products/xiajiao.jpg", categorySlug: "dumplings", stock: 50, soldCount: 234, tags: ["素食", "含蛋", "含韭菜"], servingSize: "每份12只", sortOrder: 7 },

  // 鲜虾云吞
  { name: "虾肉云吞 Prawn Wontons", slug: "prawn-wontons", description: "鲜虾肉馅的经典云吞，皮薄如纸，虾肉弹牙。", price: 1880, originalPrice: null, wholesalePrice: 1500, image: "/images/products/wonton.jpg", categorySlug: "wontons", stock: 50, soldCount: 523, tags: ["含虾", "含麸质"], servingSize: "每份12只", sortOrder: 1 },
  { name: "猪肉云吞 Pork Wontons", slug: "pork-wontons", description: "传统猪肉馅云吞，馅料鲜嫩，皮薄透亮。", price: 1580, originalPrice: null, wholesalePrice: 1260, image: "/images/products/wonton.jpg", categorySlug: "wontons", stock: 60, soldCount: 412, tags: ["含猪肉", "含麸质"], servingSize: "每份12只", sortOrder: 2 },
  { name: "鲜虾猪肉云吞 Prawn & Pork Wontons", slug: "prawn-pork-wontons", description: "虾肉与猪肉的黄金搭配，鲜味加倍。", price: 1780, originalPrice: null, wholesalePrice: 1400, image: "/images/products/wonton.jpg", categorySlug: "wontons", stock: 55, soldCount: 345, tags: ["含虾", "含猪肉"], servingSize: "每份12只", sortOrder: 3 },

  // 煎炸小食
  { name: "猪肉锅贴 Pork Potstickers", slug: "pork-potstickers", description: "底部煎至金黄酥脆的猪肉锅贴，一面酥一面软。", price: 1780, originalPrice: null, wholesalePrice: 1400, image: "/images/products/guotie.jpg", categorySlug: "pan-fried", stock: 55, soldCount: 378, tags: ["含猪肉", "煎炸"], servingSize: "每份6只", sortOrder: 1 },
  { name: "葱油饼 Scallion Pancake", slug: "scallion-pancake", description: "层层酥脆的葱油饼，手工揉制，葱香四溢。外酥内软。", price: 1500, originalPrice: null, wholesalePrice: 1200, image: "/images/products/congyoubing.jpg", categorySlug: "pan-fried", stock: 40, soldCount: 289, tags: ["素食", "含麸质"], servingSize: "每份1块", sortOrder: 2 },
  { name: "春卷 Spring Rolls", slug: "spring-rolls", description: "金黄酥脆的炸春卷，内馅丰富，蔬菜爽脆。", price: 1580, originalPrice: null, wholesalePrice: 1260, image: "/images/products/guotie.jpg", categorySlug: "pan-fried", stock: 45, soldCount: 312, tags: ["煎炸", "含麸质"], servingSize: "每份4只", sortOrder: 3 },
  { name: "煎饺 Pan-fried Dumplings", slug: "pan-fried-dumplings", description: "底部焦脆，上面软嫩的煎饺。猪肉韭菜馅，香味诱人。", price: 1680, originalPrice: null, wholesalePrice: 1340, image: "/images/products/guotie.jpg", categorySlug: "pan-fried", stock: 50, soldCount: 267, tags: ["含猪肉", "煎炸"], servingSize: "每份6只", sortOrder: 4 },

  // 招牌菜式
  { name: "豉汁排骨 Pork Ribs Black Bean Sauce", slug: "pork-ribs-black-bean", description: "精选猪排骨以豉汁调味，蒸制入味。骨肉分离，酱香浓郁。", price: 1580, originalPrice: null, wholesalePrice: 1260, image: "/images/products/paigu.jpg", categorySlug: "specials", stock: 35, soldCount: 234, tags: ["含猪肉", "含豆制品"], servingSize: "每份1碟", sortOrder: 1 },
  { name: "蒸凤爪 Steamed Chicken Feet", slug: "steamed-chicken-feet", description: "经典粤式茶楼菜，酱汁浓郁，入口即化。", price: 1580, originalPrice: null, wholesalePrice: 1260, image: "/images/products/paigu.jpg", categorySlug: "specials", stock: 30, soldCount: 198, tags: ["含鸡肉"], servingSize: "每份1碟", sortOrder: 2 },
  { name: "肠粉 Rice Noodle Rolls", slug: "rice-noodle-rolls", description: "薄如蝉翼的米浆皮，裹入鲜虾或叉烧，浇上酱油。", price: 1680, originalPrice: null, wholesalePrice: 1340, image: "/images/products/paigu.jpg", categorySlug: "specials", stock: 40, soldCount: 345, tags: ["含虾", "无麸质"], servingSize: "每份3条", sortOrder: 3 },

  // 饮品甜点
  { name: "港式奶茶 HK Milk Tea", slug: "hk-milk-tea", description: "丝袜奶茶，茶香浓郁，奶味丝滑。", price: 680, originalPrice: null, wholesalePrice: 540, image: "/images/products/xiaolongbao.jpg", categorySlug: "drinks", stock: 200, soldCount: 678, tags: ["含奶", "含咖啡因"], servingSize: "每杯350ml", sortOrder: 1 },
  { name: "冻柠茶 Iced Lemon Tea", slug: "iced-lemon-tea", description: "新鲜柠檬搭配锡兰红茶，清爽解腻。", price: 580, originalPrice: null, wholesalePrice: 460, image: "/images/products/xiaolongbao.jpg", categorySlug: "drinks", stock: 200, soldCount: 534, tags: ["含咖啡因"], servingSize: "每杯350ml", sortOrder: 2 },
  { name: "杨枝甘露 Mango Pomelo Sago", slug: "mango-pomelo-sago", description: "芒果、西柚、西米的经典组合，香甜顺滑。", price: 880, originalPrice: null, wholesalePrice: 700, image: "/images/products/xiaolongbao.jpg", categorySlug: "drinks", stock: 50, soldCount: 234, tags: ["含奶"], servingSize: "每份1碗", sortOrder: 3 },
  { name: "蛋挞 Egg Tarts", slug: "egg-tarts", description: "酥皮蛋挞，外层层叠酥脆，内馅嫩滑香甜。", price: 1280, originalPrice: null, wholesalePrice: 1020, image: "/images/products/naihuangbao.jpg", categorySlug: "drinks", stock: 60, soldCount: 456, tags: ["含蛋", "含奶", "含麸质"], servingSize: "每份3只", sortOrder: 4 },
];

async function main() {
  console.log("开始 seed...");

  // 清空已有数据
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
        images: [],
        categoryId,
        stock: prod.stock,
        soldCount: prod.soldCount,
        tags: prod.tags,
        servingSize: prod.servingSize,
        isActive: true,
        sortOrder: prod.sortOrder,
      },
    });
    console.log(`  ✓ 产品: ${prod.name} (月售${prod.soldCount})`);
  }

  // 创建管理员
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
