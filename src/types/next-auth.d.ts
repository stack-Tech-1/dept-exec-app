import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  /**
   * Extend the built-in User type with your custom fields.
   * These come from the object returned in the `authorize` callback.
   */
  interface User {
    id: string
    role: string
    position: string
    token: string   // the backend JWT
  }

  /**
   * Extend the built-in Session type to include your custom fields.
   * The session is what is returned to the client.
   */
  interface Session {
    user: {
      id: string
      role: string
      position: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
    accessToken: string   // your backend JWT
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT type (what is stored in the cookie).
   */
  interface JWT {
    id: string
    role: string
    position: string
    accessToken: string
  }
}