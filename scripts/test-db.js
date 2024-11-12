const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Attempting to connect to database...')
    
    // Test the connection with a simple query
    const result = await prisma.$queryRaw`SELECT current_timestamp;`
    console.log('Connection successful!')
    console.log('Current timestamp:', result[0])
    
    // Try to count users
    const userCount = await prisma.user.count()
    console.log('Number of users in database:', userCount)
    
  } catch (error) {
    console.error('Error connecting to database:', error)
    process.exit(1) // Exit with error code
  } finally {
    await prisma.$disconnect()
  }
}

main() 