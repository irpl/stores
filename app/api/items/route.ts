import { NextResponse } from "next/server"
import { getItems } from "@/lib/zoho"

export async function GET() {
  try {
    const items = await getItems()
    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ items: [] }, { status: 500 })
  }
}
