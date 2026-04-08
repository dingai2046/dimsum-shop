// Mock 地址数据 — 后续替换为 Prisma 查询

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

const mockAddresses: Address[] = [
  {
    id: "addr-1",
    userId: "user-1",
    name: "张小明",
    phone: "13800138000",
    province: "广东省",
    city: "广州市",
    district: "天河区",
    detail: "体育西路123号 天河城公寓18楼",
    isDefault: true,
  },
  {
    id: "addr-2",
    userId: "user-1",
    name: "张小明",
    phone: "13800138000",
    province: "广东省",
    city: "深圳市",
    district: "南山区",
    detail: "科技园南区 腾讯大厦",
    isDefault: false,
  },
];

export async function getAddressesByUserId(userId: string): Promise<Address[]> {
  return mockAddresses.filter((a) => a.userId === userId);
}

export async function getAddressById(id: string): Promise<Address | null> {
  return mockAddresses.find((a) => a.id === id) ?? null;
}

export async function getDefaultAddress(userId: string): Promise<Address | null> {
  return mockAddresses.find((a) => a.userId === userId && a.isDefault) ?? null;
}
