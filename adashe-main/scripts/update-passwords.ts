import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function updatePasswords() {
  console.log('🔐 Updating user passwords with hashed versions...')

  const users = await prisma.user.findMany()

  for (const user of users) {
    // Hash the existing password
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    console.log(`✅ Updated password for user: ${user.email}`)
  }

  // Create an admin user
  const adminExists = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!adminExists) {
    const hashedAdminPassword = await bcrypt.hash('admin123', 12)
    const memberCount = await prisma.member.count()
    const memberCode = `ADS${String(memberCount + 1).padStart(4, '0')}`

    const admin = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email: 'admin@adashe.com',
          username: 'admin',
          password: hashedAdminPassword,
          role: 'ADMIN'
        }
      })

      const member = await tx.member.create({
        data: {
          userId: user.id,
          firstName: 'Admin',
          lastName: 'User',
          phone: '+2348000000000',
          email: 'admin@adashe.com',
          occupation: 'Administrator',
          memberCode,
          status: 'ACTIVE'
        }
      })

      return { user, member }
    })

    console.log('👑 Created admin user: admin@adashe.com / admin123')
  }

  console.log('✅ Password update completed!')
}

updatePasswords()
  .catch((e) => {
    console.error('❌ Error updating passwords:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })