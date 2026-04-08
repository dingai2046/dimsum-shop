import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import type { OAuthConfig } from "next-auth/providers";
import { prisma } from "@/lib/prisma";

// ==================== 微信 Provider ====================
interface WeChatProfile {
  openid: string;
  nickname: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  unionid?: string;
}

function WeChat(): OAuthConfig<WeChatProfile> {
  return {
    id: "wechat",
    name: "WeChat",
    type: "oauth",
    authorization: {
      url: "https://open.weixin.qq.com/connect/qrconnect",
      params: {
        appid: process.env.WECHAT_APP_ID,
        scope: "snsapi_login",
        response_type: "code",
        state: Math.random().toString(36).slice(2),
      },
    },
    token: {
      url: "https://api.weixin.qq.com/sns/oauth2/access_token",
      params: {
        appid: process.env.WECHAT_APP_ID,
        secret: process.env.WECHAT_APP_SECRET,
        grant_type: "authorization_code",
      },
    },
    userinfo: {
      url: "https://api.weixin.qq.com/sns/userinfo",
    },
    profile(profile) {
      return {
        id: profile.unionid || profile.openid,
        name: profile.nickname,
        image: profile.headimgurl,
      };
    },
    clientId: process.env.WECHAT_APP_ID,
    clientSecret: process.env.WECHAT_APP_SECRET,
  };
}

// ==================== NextAuth 配置 ====================
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    WeChat(),
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
        token.id = user.id;
        token.role = (user as { role?: string }).role || "CUSTOMER";
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
      // Google / 微信首次登录时，自动创建或关联用户
      if (account?.provider === "google" && profile?.email) {
        await prisma.user.upsert({
          where: { email: profile.email },
          create: {
            email: profile.email,
            name: profile.name || profile.email.split("@")[0],
            avatar: (profile as { picture?: string }).picture || null,
            role: "CUSTOMER",
          },
          update: {
            // 更新头像（如果有变化）
            avatar: (profile as { picture?: string }).picture || undefined,
          },
        });
      }

      if (account?.provider === "wechat" && profile) {
        const wechatId = (profile as { unionid?: string; openid: string }).unionid ||
                         (profile as { openid: string }).openid;
        // 微信没有 email，用 phone 或 wechat openid 匹配
        // 这里用 id 做 upsert
        const existing = await prisma.user.findFirst({
          where: { id: wechatId },
        });
        if (!existing) {
          await prisma.user.create({
            data: {
              id: wechatId,
              name: (profile as { nickname?: string }).nickname || "微信用户",
              avatar: (profile as { headimgurl?: string }).headimgurl || null,
              role: "CUSTOMER",
            },
          });
        }
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});
