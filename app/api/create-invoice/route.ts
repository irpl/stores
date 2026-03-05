import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Request body:", body)

    // In production, this would send the request to the actual API
    const response = await fetch("https://zoho-invoice-api.onrender.com/api/v1/create-invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    // If the API is not available, simulate a successful response
    const data = await response.json()
    // return NextResponse.json(data)

    // For development, return a mock success response
    return NextResponse.json({
      success: true,
      message: "Invoice created successfully",
      invoice_id: data.invoice.invoice_number,
    })
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
