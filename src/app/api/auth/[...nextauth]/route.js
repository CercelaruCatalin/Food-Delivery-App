import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import pool from "../../../config/db.js";
import { adapter } from "../../../config/db";
import { findUser } from "../../../models/userModel.js";

const USER_TYPES = {
  USER: 'user',
  COURIER: 'courier'
};

export const authOptions = {
  providers: [
    adapter,
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider.default({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          // Try to find user in users table first
          let user = null;
          let userType = null;

          try {
            user = await findUser(credentials.email, USER_TYPES.USER);
            if (user) {
              userType = USER_TYPES.USER;
            }
          } catch (error) {
            // User not found in users table, continue to check couriers
          }

          // If not found in users table, check couriers table
          if (!user) {
            try {
              user = await findUser(credentials.email, USER_TYPES.COURIER);
              if (user) {
                userType = USER_TYPES.COURIER;
              }
            } catch (error) {
              // User not found in either table
            }
          }

          if (!user) {
            throw new Error("Incorrect email or password");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Incorrect email or password");
          }

          return {
            id: user.id.toString(),
            email: user.email,
            userType: userType,
            name: user.name || null,
            image: user.image || null,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error(error.message);
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.userType = user.userType || USER_TYPES.USER;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.userType = token.userType;
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
  },
};

const handler = NextAuth.default(authOptions);
export { handler as GET, handler as POST };