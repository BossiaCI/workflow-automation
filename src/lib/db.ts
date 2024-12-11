import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

declare global {
  var cachedPrisma: PrismaClient
}

const prismaClientSingleton = () => {
  return new PrismaClient()
    .$extends(withAccelerate())
    .$extends({
      query: {
        $allModels: {
          async $allOperations({ operation, model, args, query }) {
            const start = performance.now()
            const result = await query(args)
            const end = performance.now()
            
            console.log(`${model}.${operation} took ${end - start}ms`)
            return result
          },
        },
      },
    })
}

export let db: PrismaClient
if (process.env.NODE_ENV === 'production') {
  db = prismaClientSingleton()
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = prismaClientSingleton()
  }
  db = global.cachedPrisma
}

export type { 
  User,
  Form,
  FormSubmission,
  FormAnalytics,
  Payment,
  Event,
  ActivityLog,
  Role,
  UserStatus,
  FormType,
  FormStatus,
  SubmissionStatus,
  PaymentStatus,
  EventStatus,
} from '@prisma/client'