interface TokenCache {
  accessToken: string
  expiry: Date
}

let tokenCache: TokenCache | null = null

function getEnv(key: string, required = true): string {
  const value = process.env[key] || ""
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

function zohoHeaders(accessToken: string, json = false) {
  const headers: Record<string, string> = {
    Authorization: `Zoho-oauthtoken ${accessToken}`,
    "X-com-zoho-invoice-organizationid": getEnv("ZOHO_ORGANIZATION_ID"),
  }
  if (json) headers["Content-Type"] = "application/json"
  return headers
}

export async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiry > new Date()) {
    return tokenCache.accessToken
  }

  const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: getEnv("ZOHO_REFRESH_TOKEN"),
      client_id: getEnv("ZOHO_CLIENT_ID"),
      client_secret: getEnv("ZOHO_CLIENT_SECRET"),
      grant_type: "refresh_token",
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to get Zoho access token")
  }

  const data = await response.json()
  tokenCache = {
    accessToken: data.access_token,
    expiry: new Date(Date.now() + data.expires_in * 1000),
  }

  return data.access_token
}

export interface ZohoItem {
  item_id: string
  name: string
  description?: string
  rate: number
  unit?: string
  status: string
}

export async function getItems(): Promise<ZohoItem[]> {
  const accessToken = await getAccessToken()
  const response = await fetch("https://invoice.zoho.com/api/v3/items", {
    headers: zohoHeaders(accessToken),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch items from Zoho")
  }

  const data = await response.json()
  const items = data.items || []

  return items
    .filter((item: any) => item.status === "active")
    .map((item: any) => ({
      item_id: item.item_id,
      name: item.name,
      description: item.description || null,
      rate: parseFloat(item.rate),
      unit: item.unit || null,
      status: item.status,
    }))
}

export interface ItemRate {
  item_id: string
  rate: number
}

export async function getItemRatesByIds(itemIds: string[]): Promise<ItemRate[]> {
  const accessToken = await getAccessToken()
  const response = await fetch("https://invoice.zoho.com/api/v3/items", {
    headers: zohoHeaders(accessToken),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch items from Zoho")
  }

  const data = await response.json()
  const items = data.items || []
  const itemDict = new Map<string, any>(items.map((item: any) => [item.item_id, item]))

  const rates: ItemRate[] = []
  const missingIds: string[] = []

  for (const id of itemIds) {
    const item = itemDict.get(id)
    if (item) {
      rates.push({ item_id: id, rate: parseFloat(item.rate) })
    } else {
      missingIds.push(id)
    }
  }

  if (missingIds.length > 0) {
    throw new Error(`Items not found: ${missingIds.join(", ")}`)
  }

  return rates
}

export async function findCustomerByEmail(email: string): Promise<string | null> {
  const accessToken = await getAccessToken()
  const url = new URL("https://invoice.zoho.com/api/v3/contacts")
  url.searchParams.set("email", email)

  const response = await fetch(url.toString(), {
    headers: zohoHeaders(accessToken),
  })

  if (response.ok) {
    const data = await response.json()
    if (data.contacts?.length > 0) {
      return data.contacts[0].contact_id
    }
  }

  return null
}

export interface CustomerInfo {
  first_name: string
  last_name: string
  email: string
  phone?: string
  billing_address?: Record<string, string>
}

export async function createCustomer(customerInfo: CustomerInfo): Promise<string> {
  const accessToken = await getAccessToken()
  const response = await fetch("https://invoice.zoho.com/api/v3/contacts", {
    method: "POST",
    headers: zohoHeaders(accessToken, true),
    body: JSON.stringify({
      contact_name: `${customerInfo.first_name} ${customerInfo.last_name}`,
      contact_persons: [
        {
          first_name: customerInfo.first_name,
          last_name: customerInfo.last_name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          is_primary_contact: true,
        },
      ],
      billing_address: customerInfo.billing_address,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to create customer")
  }

  const data = await response.json()
  return data.contact.contact_id
}

export interface InvoiceLineItem {
  item_id: string
  quantity: number
  rate: number
}

export async function createInvoice(
  customerId: string,
  lineItems: InvoiceLineItem[],
  notes?: string
): Promise<any> {
  const accessToken = await getAccessToken()
  const response = await fetch("https://invoice.zoho.com/api/v3/invoices", {
    method: "POST",
    headers: zohoHeaders(accessToken, true),
    body: JSON.stringify({
      customer_id: customerId,
      line_items: lineItems,
      notes,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("Failed to create invoice:", errorData)
    throw new Error("Failed to create invoice")
  }

  const data = await response.json()
  return data.invoice
}
