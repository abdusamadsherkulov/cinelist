import { getServerSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { cache } from "react";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: { email: {}, password: {} },
      async authorize(c) {
        if (!c?.email || !c?.password) return null;
        const u = await prisma.user.findUnique({ where: { email: c.email.toLowerCase() } });
        if (!u || !u.passwordHash) return null; // Google-only accounts have no password
        if (!(await bcrypt.compare(c.password, u.passwordHash))) return null;
        return { id: u.id, name: u.name, email: u.email };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const p = profile as { email?: string; email_verified?: boolean; name?: string } | undefined;
        if (!p?.email || !p.email_verified) return false;
        const email = p.email.toLowerCase();
        // first Google sign-in creates the account; later ones just find it
        await prisma.user.upsert({
          where: { email },
          update: {},
          create: { email, name: p.name || email.split("@")[0] },
        });
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && token.email) {
        const u = await prisma.user.findUnique({ where: { email: token.email.toLowerCase() } });
        if (u) {
          token.uid = u.id;
          token.name = u.name;
        }
      } else if (user) {
        token.uid = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) (session.user as { id?: string }).id = token.uid as string;
      return session;
    },
  },
};

export const getUser = cache(async () => {
  const s = await getServerSession(authOptions);
  const id = (s?.user as { id?: string } | undefined)?.id;
  if (!id) return null;
  const u = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, username: true } });
  return u ? { id: u.id, name: u.name, username: u.username } : null;
});