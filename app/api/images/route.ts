import { NextResponse } from "next/server"
import { getImageMap, setImageEntry, removeImageEntry, type ImageEntry } from "@/lib/image-store"

export async function GET() {
  const map = await getImageMap()
  return NextResponse.json(map)
}

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD
  const authHeader = request.headers.get("x-admin-password")

  if (!adminPassword || authHeader !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { itemId, url, scale, posX, posY } = await request.json()

  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 })
  }

  if (url) {
    const entry: ImageEntry = {
      url,
      scale: scale ?? 1,
      posX: posX ?? 50,
      posY: posY ?? 50,
    }
    await setImageEntry(itemId, entry)
  } else {
    await removeImageEntry(itemId)
  }

  const map = await getImageMap()
  return NextResponse.json(map)
}
