import { NextResponse } from "next/server"
import { getImageMap, setImageUrl, removeImageUrl } from "@/lib/image-store"

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

  const { itemId, url } = await request.json()

  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 })
  }

  if (url) {
    await setImageUrl(itemId, url)
  } else {
    await removeImageUrl(itemId)
  }

  const map = await getImageMap()
  return NextResponse.json(map)
}
