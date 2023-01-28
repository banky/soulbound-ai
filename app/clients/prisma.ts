import { PrismaClient } from "@prisma/client";

// From here: https://github.com/prisma/prisma/discussions/4399#discussioncomment-142908
const globalForPrisma = global as unknown as { prisma: PrismaClient };
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;
