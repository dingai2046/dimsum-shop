import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 获取当前用户地址列表
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("获取地址失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 新增地址
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { name, phone, street1, street2, suburb, state, postcode, isDefault } = await request.json();

    if (!name || !phone || !street1 || !suburb || !state || !postcode) {
      return NextResponse.json({ error: "请填写完整地址信息" }, { status: 400 });
    }

    // 如果设为默认，先取消其他默认
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        name,
        phone,
        street1,
        street2: street2 || "",
        suburb,
        state,
        postcode,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    console.error("创建地址失败:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
