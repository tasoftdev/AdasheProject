import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      memberId?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    memberId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    memberId?: string
  }
}