import 'next-auth'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      username: string
      role: UserRole
      member?: {
        id: string
        firstName: string
        lastName: string
        memberCode: string
        avatar?: string | null
      }
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email: string
    username: string
    role: UserRole
    member?: {
      id: string
      firstName: string
      lastName: string
      memberCode: string
      avatar?: string | null
    } | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    member?: {
      id: string
      firstName: string
      lastName: string
      memberCode: string
      avatar?: string | null
    }
  }
}