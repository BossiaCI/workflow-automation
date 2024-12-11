import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@/lib/auth"
 
const f = createUploadthing()
 
export const ourFileRouter = {
  mediaUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 4 } })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error("Unauthorized")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url, name: file.name }
    }),
} satisfies FileRouter
 
export type OurFileRouter = typeof ourFileRouter