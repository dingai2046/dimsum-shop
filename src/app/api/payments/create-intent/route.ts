import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { amount, orderNo, items } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "无效的支付金额" }, { status: 400 });
    }

    // 创建 Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // 金额（分）
      currency: "aud",
      metadata: {
        orderNo,
        userId: session.user.id,
        itemCount: items?.length?.toString() || "0",
      },
      description: `東方點心订单 ${orderNo}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("创建支付意向失败:", error);
    return NextResponse.json({ error: "创建支付失败" }, { status: 500 });
  }
}
