import { NextResponse } from "next/server"
import {
  findCustomerByEmail,
  createCustomer,
  getItemRatesByIds,
  createInvoice,
  type CustomerInfo,
} from "@/lib/zoho"
import { sendInvoiceNotification } from "@/lib/telegram"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customer_info, items, notes } = body as {
      customer_info: CustomerInfo
      items: { item_id: string; quantity: number }[]
      notes?: string
    }

    // Find or create customer
    let customerId = await findCustomerByEmail(customer_info.email)
    if (!customerId) {
      customerId = await createCustomer(customer_info)
    }

    // Fetch item rates and build line items
    const itemRates = await getItemRatesByIds(items.map((i) => i.item_id))
    const rateMap = new Map(itemRates.map((r) => [r.item_id, r.rate]))

    const lineItems = items.map((item) => ({
      item_id: item.item_id,
      quantity: item.quantity,
      rate: rateMap.get(item.item_id)!,
    }))

    // Create invoice
    const invoice = await createInvoice(customerId, lineItems, notes)

    // Send Telegram notification (non-blocking)
    sendInvoiceNotification(invoice, customer_info)

    return NextResponse.json({
      success: true,
      message: "Invoice created successfully",
      invoice_id: invoice.invoice_number,
    })
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
