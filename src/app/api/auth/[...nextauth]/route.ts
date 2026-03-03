// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is where you talk to YOUR backend
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          })

          const data = await res.json()

          if (res.ok && data?.token && data?.user) {
            // Return object that will be saved in JWT
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              position: data.user.position,
              token: data.token,           // we’ll store the backend token here
            }
          }

          // Any error from backend → return null = failed login
          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",           // using JWT (no database needed)
  },

  callbacks: {
    async jwt({ token, user }) {
      // First sign in → user object exists
      if (user) {
        token.id = user.id
        token.role = user.role
        token.position = user.position
        token.accessToken = user.token   // your backend JWT
      }
      return token
    },

    async session({ session, token }) {
      // Add custom fields to session
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.position = token.position as string
        session.accessToken = token.accessToken as string
      }
      return session
    },
  },

  pages: {
    signIn: "/login",          // your custom login page
  },

  secret: process.env.NEXTAUTH_SECRET,   // ← very important!
})

export { handler as GET, handler as POST }