import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow access to auth pages without authentication
        if (pathname.startsWith('/auth/')) {
          return true
        }

        // Require authentication for all other routes
        if (!token) {
          return false
        }

        // Admin-only routes
        if (pathname.startsWith('/admin/')) {
          return token.role === 'ADMIN'
        }

        // Manager and Admin can access management routes
        if (pathname.startsWith('/manage/')) {
          return token.role === 'ADMIN' || token.role === 'MANAGER'
        }

        // All authenticated users can access dashboard and member routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!api/auth|auth/signin|auth/signup|_next/static|_next/image|favicon.ico|public).*)',
  ],
}