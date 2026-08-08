import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      await connectDB();

      await User.findOneAndUpdate(
        { email: user.email },
        {
          $set: {
            googleId: account.providerAccountId,
            avatarUrl: user.image,
          },
          $setOnInsert: {
            name: user.name,
            email: user.email,
          }
        },
        {
          upsert: true,
          returnDocument: "after",
        }
      );

      return true;
    },

    async jwt({ token, user }) {
      await connectDB();
      const dbUser = await User.findOne({
        email: token.email,
      });

      if (dbUser) {
        token.id = dbUser._id.toString();
        token.role = dbUser.role;
        token.avatarUrl = dbUser.avatarUrl || user?.image;
        token.name = dbUser.name;
      }

      return token;
    },

    async session({ session, token }) {
      await connectDB();
      const dbUser = await User.findById(token.id);

      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.role = dbUser.role;
        session.user.avatarUrl = dbUser.avatarUrl;
        session.user.name = dbUser.name;
      } else {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatarUrl = token.avatarUrl;
        session.user.name = token.name;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };