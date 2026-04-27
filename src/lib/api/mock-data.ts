// 产品数据 — 来源于 UberEats 東方點心菜单
// 价格以澳元分（cents）存储，1880 = $18.80

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // 分 (AUD cents)
  originalPrice: number | null;
  image: string;
  images: string[];
  categoryId: string;
  category?: Category;
  stock: number;
  isActive: boolean;
  sortOrder: number;
}

export const categories: Category[] = [
  {
    id: "cat-popular",
    name: "热门推荐",
    slug: "popular",
    description: "最受欢迎的招牌点心，回头客必点",
    image: null,
    sortOrder: 0,
  },
  {
    id: "cat-signature",
    name: "招牌点心",
    slug: "signature",
    description: "水晶虾饺 · 叉烧包 · 扇贝饺，精工细作",
    image: null,
    sortOrder: 1,
  },
  {
    id: "cat-dumplings",
    name: "水饺",
    slug: "dumplings",
    description: "手工水饺，薄皮大馅，多种口味",
    image: null,
    sortOrder: 2,
  },
  {
    id: "cat-wontons",
    name: "云吞",
    slug: "wontons",
    description: "鲜虾云吞 · 猪肉云吞，皮薄馅嫩",
    image: null,
    sortOrder: 3,
  },
  {
    id: "cat-panfried",
    name: "煎类",
    slug: "pan-fried",
    description: "锅贴 · 葱油饼，香脆金黄",
    image: null,
    sortOrder: 4,
  },
  {
    id: "cat-specials",
    name: "招牌菜",
    slug: "specials",
    description: "豉汁排骨等特色菜式",
    image: null,
    sortOrder: 5,
  },
];

export const products: Product[] = [
  // ========== 热门推荐 ==========
  {
    id: "prod-xlb",
    name: "小笼包 Xiao Long Bao",
    slug: "xiao-long-bao",
    description: "招牌手工小笼包，皮薄馅嫩汤汁鲜美。精选上等猪肉，配以秘制高汤冻，手工18褶包制。蒸熟后一口咬下满嘴留香。每份8只，附赠姜丝香醋蘸料。",
    price: 1880,
    originalPrice: null,
    image: "/images/products/xiaolongbao.jpg",
    images: ["/images/products/xiaolongbao.jpg"],
    categoryId: "cat-popular",
    stock: 100,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "prod-csm",
    name: "鸡肉烧卖 Chicken Siu Mai",
    slug: "chicken-siu-mai",
    description: "精选鸡肉制成的经典烧卖，花口造型精致。搭配鲜虾提味，蒸熟后鲜嫩多汁，口感细腻。每份6只。",
    price: 1780,
    originalPrice: null,
    image: "/images/products/siumai-chicken-2.jpg",
    images: ["/images/products/siumai-chicken-2.jpg"],
    categoryId: "cat-popular",
    stock: 80,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "prod-pcd",
    name: "猪肉韭菜水饺 Pork & Chive Dumplings",
    slug: "pork-chive-dumplings",
    description: "经典猪肉韭菜馅水饺，韭菜的清香与猪肉的鲜美完美融合。手工擀皮，馅料饱满，煮熟后皮Q弹有嚼劲。每份12只。",
    price: 1780,
    originalPrice: null,
    image: "/images/products/xiajiao-2.jpg",
    images: ["/images/products/xiajiao-2.jpg"],
    categoryId: "cat-popular",
    stock: 90,
    isActive: true,
    sortOrder: 3,
  },

  // ========== 招牌点心 ==========
  {
    id: "prod-cpd",
    name: "水晶虾饺 Crystal Prawn Dumplings",
    slug: "crystal-prawn-dumplings",
    description: "晶莹剔透的虾饺皮包裹着整颗鲜虾，口感弹牙鲜美。广式点心的代表之作，每一只都是师傅的心血。每份4只。",
    price: 1780,
    originalPrice: null,
    image: "/images/products/xiajiao-2.jpg",
    images: ["/images/products/xiajiao-2.jpg"],
    categoryId: "cat-signature",
    stock: 60,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "prod-pcd2",
    name: "韭菜虾饺 Prawn & Chive Dumplings",
    slug: "prawn-chive-dumplings",
    description: "翡翠般的韭菜与弹牙大虾的完美搭配，皮薄透亮。每一只都包裹着鲜虾仁，鲜嫩爽滑。每份4只。",
    price: 1780,
    originalPrice: null,
    image: "/images/products/xiajiao-2.jpg",
    images: ["/images/products/xiajiao-2.jpg"],
    categoryId: "cat-signature",
    stock: 50,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "prod-bbp",
    name: "叉烧包 BBQ Pork Buns",
    slug: "bbq-pork-buns",
    description: "广式经典叉烧包，面皮自然开裂露出蜜汁叉烧馅。选用上等五花肉慢火烧制后切丁，口感软嫩带有焦香。每份3只。",
    price: 1580,
    originalPrice: null,
    image: "/images/products/naihuangbao.jpg",
    images: ["/images/products/naihuangbao.jpg"],
    categoryId: "cat-signature",
    stock: 70,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "prod-sd",
    name: "扇贝饺 Scallop Dumplings",
    slug: "scallop-dumplings",
    description: "精选新鲜扇贝制成的高级饺子，海鲜鲜味浓郁。搭配时令蔬菜，口感层次丰富。每份4只。",
    price: 1780,
    originalPrice: null,
    image: "/images/products/xiajiao-2.jpg",
    images: ["/images/products/xiajiao-2.jpg"],
    categoryId: "cat-signature",
    stock: 40,
    isActive: true,
    sortOrder: 4,
  },

  // ========== 水饺 ==========
  {
    id: "prod-bcd",
    name: "牛肉香菜水饺 Beef & Coriander Dumplings",
    slug: "beef-coriander-dumplings",
    description: "精选牛肉搭配新鲜香菜，馅料鲜香多汁。手工擀皮，每一只都馅料饱满。每份12只。",
    price: 1780,
    originalPrice: null,
    image: "/images/products/xiajiao-2.jpg",
    images: ["/images/products/xiajiao-2.jpg"],
    categoryId: "cat-dumplings",
    stock: 80,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "prod-ccd",
    name: "鸡肉白菜水饺 Chicken & Cabbage Dumplings",
    slug: "chicken-cabbage-dumplings",
    description: "嫩滑鸡肉与清甜白菜的经典搭配，口感清爽不油腻。适合全家老小。每份12只。",
    price: 1780,
    originalPrice: null,
    image: "/images/products/xiajiao-2.jpg",
    images: ["/images/products/xiajiao-2.jpg"],
    categoryId: "cat-dumplings",
    stock: 70,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "prod-ccmd",
    name: "鸡肉玉米冬菇水饺 Chicken, Corn & Mushroom Dumplings",
    slug: "chicken-corn-mushroom-dumplings",
    description: "鸡肉的嫩滑、甜玉米的清甜、冬菇的鲜香三味合一，每一口都有惊喜。每份12只。",
    price: 1780,
    originalPrice: null,
    image: "/images/products/xiajiao-2.jpg",
    images: ["/images/products/xiajiao-2.jpg"],
    categoryId: "cat-dumplings",
    stock: 60,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "prod-sxd",
    name: "三鲜水饺 Sanxian Dumplings",
    slug: "sanxian-dumplings",
    description: "猪肉、虾仁、鸡蛋三鲜合一，搭配时令蔬菜。手工擀皮，馅料调味恰到好处，煮熟后皮Q弹有嚼劲。每份12只。",
    price: 1880,
    originalPrice: null,
    image: "/images/products/xiajiao-2.jpg",
    images: ["/images/products/xiajiao-2.jpg"],
    categoryId: "cat-dumplings",
    stock: 75,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "prod-bld",
    name: "牛肉大葱水饺 Beef & Leek Dumplings",
    slug: "beef-leek-dumplings",
    description: "精选牛肉搭配新鲜大葱，北方经典口味。馅料饱满多汁，香气四溢。每份12只。",
    price: 1780,
    originalPrice: null,
    image: "/images/products/xiajiao-2.jpg",
    images: ["/images/products/xiajiao-2.jpg"],
    categoryId: "cat-dumplings",
    stock: 65,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "prod-pcbd",
    name: "猪肉白菜水饺 Pork & Cabbage Dumplings",
    slug: "pork-cabbage-dumplings",
    description: "最传统的猪肉白菜馅水饺，白菜的清甜中和猪肉的油脂，口感均衡美味。每份12只。",
    price: 1780,
    originalPrice: null,
    image: "/images/products/xiajiao-2.jpg",
    images: ["/images/products/xiajiao-2.jpg"],
    categoryId: "cat-dumplings",
    stock: 85,
    isActive: true,
    sortOrder: 6,
  },

  // ========== 云吞 ==========
  {
    id: "prod-pw",
    name: "虾肉云吞 Prawn Wontons",
    slug: "prawn-wontons",
    description: "鲜虾肉馅的经典云吞，皮薄如纸，虾肉弹牙。可搭配高汤或辣油享用。每份12只。",
    price: 1880,
    originalPrice: null,
    image: "/images/products/wonton-2.jpg",
    images: ["/images/products/wonton-2.jpg"],
    categoryId: "cat-wontons",
    stock: 50,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "prod-pkw",
    name: "猪肉云吞 Pork Wontons",
    slug: "pork-wontons",
    description: "传统猪肉馅云吞，馅料鲜嫩，皮薄透亮。煮熟后撒上葱花，鲜美可口。每份12只。",
    price: 1580,
    originalPrice: null,
    image: "/images/products/wonton-2.jpg",
    images: ["/images/products/wonton-2.jpg"],
    categoryId: "cat-wontons",
    stock: 60,
    isActive: true,
    sortOrder: 2,
  },

  // ========== 煎类 ==========
  {
    id: "prod-gt",
    name: "猪肉锅贴 Pork Potstickers",
    slug: "pork-potstickers",
    description: "底部煎至金黄酥脆的猪肉锅贴，一面酥一面软。蘸上醋和辣油，香脆可口。每份6只。",
    price: 1780,
    originalPrice: null,
    image: "/images/products/springroll-long-2.jpg",
    images: ["/images/products/springroll-long-2.jpg"],
    categoryId: "cat-panfried",
    stock: 55,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "prod-cyb",
    name: "葱油饼 Scallion Pancake",
    slug: "scallion-pancake",
    description: "层层酥脆的葱油饼，手工揉制，葱香四溢。外酥内软，每一口都能感受到葱花的香气。每份1块。",
    price: 1500,
    originalPrice: null,
    image: "/images/products/congyoubing.jpg",
    images: ["/images/products/congyoubing.jpg"],
    categoryId: "cat-panfried",
    stock: 40,
    isActive: true,
    sortOrder: 2,
  },

  // ========== 招牌菜 ==========
  {
    id: "prod-pg",
    name: "豉汁排骨 Pork Ribs Black Bean Sauce",
    slug: "pork-ribs-black-bean",
    description: "精选猪排骨以豉汁调味，蒸制入味。骨肉分离，酱香浓郁，是佐饭佐点的经典粤式菜品。",
    price: 1580,
    originalPrice: null,
    image: "/images/products/paigu.jpg",
    images: ["/images/products/paigu.jpg"],
    categoryId: "cat-specials",
    stock: 35,
    isActive: true,
    sortOrder: 1,
  },
];

// 为产品挂载分类信息
export function getProductsWithCategory(): (Product & { category: Category })[] {
  return products
    .filter((p) => p.isActive)
    .map((p) => ({
      ...p,
      category: categories.find((c) => c.id === p.categoryId)!,
    }));
}
