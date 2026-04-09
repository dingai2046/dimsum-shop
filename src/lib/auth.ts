import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // Credentials 登录：user.id 就是数据库 ID
        if (account?.provider === "credentials") {
          token.id = user.id;
          token.role = (user as { role?: string }).role || "CUSTOMER";
        }

        // Google OAuth 登录：需要从数据库查真实 ID
        if (account?.provider === "google" && token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, role: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        }

        if (account) {
          token.provider = account.provider;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
    async signIn({ account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        // 检查用户是否已存在
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (existingUser) {
          // 已有用户，更新头像
          await prisma.user.update({
            where: { email: profile.email },
            data: {
              avatar: (profile as { picture?: string }).picture || undefined,
            },
          });
        } else {
          // 新用户，创建账号
          const user = await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name || profile.email.split("@")[0],
              avatar: (profile as { picture?: string }).picture || null,
              role: "CUSTOMER",
            },
          });

          // 新用户注册奖励：100积分 + $5优惠券
          try {
            await prisma.pointsRecord.create({
              data: {
                userId: user.id,
                points: 100,
                type: "ADJUST",
                description: "新用户注册奖励",
              },
            });
            await prisma.user.update({
              where: { id: user.id },
              data: { points: 100 },
            });

            const couponCode = "WELCOME" + user.id.slice(-6).toUpperCase();
            await prisma.coupon.create({
              data: {
                code: couponCode,
                type: "FIXED",
                value: 500, // $5
                minOrder: 2000, // 满 $20 可用
                totalLimit: 1,
                perUserLimit: 1,
                isNewUserOnly: true,
                description: "新用户首单优惠 $5",
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            });
          } catch (bonusError) {
            console.error("Google注册发放新用户奖励失败:", bonusError);
          }
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});
