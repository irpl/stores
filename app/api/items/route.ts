import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://zoho-invoice-api.onrender.com/api/v1/items")
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ items: [] }, { status: 500 })
  }
}
