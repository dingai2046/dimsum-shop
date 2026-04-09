import { prisma } from "@/lib/prisma";
import { UserManager } from "@/components/admin/user-manager";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      avatar: true,
      points: true,
      role: true,
      buyerType: true,
      createdAt: true,
      _count: {
        select: { orders: true },
      },
    },
  });

  const formattedUsers = users.map((u) => ({
    id: u.id,
    email: u.email,
    phone: u.phone,
    name: u.name,
    avatar: u.avatar,
    points: u.points,
    role: u.role,
    buyerType: u.buyerType,
    createdAt: u.createdAt.toISOString(),
    orderCount: u._count.orders,
  }));

  return (
    <div>
      <UserManager initialUsers={formattedUsers} />
    </div>
  );
}
