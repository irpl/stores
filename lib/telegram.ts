import { CustomerInfo } from "./zoho"

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function sendInvoiceNotification(
  invoice: any,
  customerInfo: CustomerInfo
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) return

  try {
    let lineItemsText = ""
    for (const item of invoice.line_items || []) {
      const name = escapeHtml(String(item.name || item.item_id || "Unknown"))
      const qty = item.quantity || 0
      const rate = item.rate || 0
      const amount = item.item_total || qty * rate
      lineItemsText += `  \u2022 ${name} \u2014 Qty: ${qty}, Rate: ${rate}, Total: ${amount}\n`
    }

    const customerName = escapeHtml(`${customerInfo.first_name} ${customerInfo.last_name}`)
    const customerEmail = escapeHtml(customerInfo.email)

    let message =
      `\ud83e\uddf0 <b>New Invoice Created</b>\n\n` +
      `<b>Invoice #:</b> ${escapeHtml(String(invoice.invoice_number || "N/A"))}\n` +
      `<b>Customer:</b> ${customerName}\n` +
      `<b>Email:</b> ${customerEmail}\n\n` +
      `<b>Line Items:</b>\n${lineItemsText}\n` +
      `<b>Total:</b> ${escapeHtml(String(invoice.currency_symbol || "$"))}${escapeHtml(String(invoice.total || "N/A"))}\n`

    if (invoice.invoice_id) {
      const zohoUrl = `https://invoice.zoho.com/app#/invoices/${escapeHtml(String(invoice.invoice_id))}`
      message += `\n<a href="${zohoUrl}">View in Zoho</a>`
    }

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10000),
    })
  } catch (e) {
    console.error("Failed to send Telegram notification:", e)
  }
}
