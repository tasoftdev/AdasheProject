import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('Login attempt with credentials:', { email: credentials?.email, hasPassword: !!credentials?.password })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing email or password')
          throw new Error('Invalid credentials')
        }

        console.log('Looking for user with email:', credentials.email)
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            member: true
          }
        })

        if (!user) {
          console.log('User not found for email:', credentials.email)
          throw new Error('User not found')
        }

        console.log('User found:', { id: user.id, email: user.email, username: user.username, hasPassword: !!user.password })

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        console.log('Password validation result:', isPasswordValid)

        if (!isPasswordValid) {
          console.log('Invalid password for user:', user.email)
          throw new Error('Invalid password')
        }

        console.log('Login successful for user:', user.email)
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          member: user.member ? {
            id: user.member.id,
            firstName: user.member.firstName,
            lastName: user.member.lastName,
            memberCode: user.member.memberCode,
            avatar: user.member.avatar
          } : null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.member = user.member || undefined
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.member = token.member as any
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key'
}