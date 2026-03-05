"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CircuitBoard, CheckCircle, AlertCircle, Edit, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/components/cart-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Type for user information
type UserInfo = {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  address: string
}

export function CheckoutForm() {
  const { items, clearCart, totalItems } = useCart()
  const router = useRouter()
  const [formState, setFormState] = useState<UserInfo & { notes: string }>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    notes: "",
  })
  const [saveInfo, setSaveInfo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invoiceId, setInvoiceId] = useState<string | null>(null)
  const [savedUserInfo, setSavedUserInfo] = useState<UserInfo | null>(null)
  const [usingSavedInfo, setUsingSavedInfo] = useState(false)

  const totalPrice = items.reduce((total, item) => {
    return total + item.rate * (item.quantity || 1)
  }, 0)

  // Load saved user information on component mount
  useEffect(() => {
    const savedInfo = localStorage.getItem("userCheckoutInfo")
    if (savedInfo) {
      try {
        const parsedInfo = JSON.parse(savedInfo) as UserInfo
        setSavedUserInfo(parsedInfo)
        setUsingSavedInfo(true)
        // Pre-fill the form with saved info
        setFormState((prev) => ({
          ...prev,
          ...parsedInfo,
        }))
      } catch (error) {
        console.error("Failed to parse saved user info:", error)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Save user information if checkbox is checked
      if (saveInfo) {
        const userInfo: UserInfo = {
          firstName: formState.firstName,
          lastName: formState.lastName,
          email: formState.email,
          phone: formState.phone,
          company: formState.company,
          address: formState.address,
        }
        localStorage.setItem("userCheckoutInfo", JSON.stringify(userInfo))
      }

      // Format the request data according to the required structure
      const requestData = {
        customer_info: {
          first_name: formState.firstName,
          last_name: formState.lastName,
          email: formState.email,
          phone: formState.phone,
          billing_address: {
            address: formState.address,
            company: formState.company || undefined,
          },
        },
        items: items.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity || 1,
        })),
        notes: formState.notes,
      }

      // Send the request to our API route
      const response = await fetch("/api/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invoice")
      }

      // Store the invoice ID if returned
      if (data.invoice_id) {
        setInvoiceId(data.invoice_id)
      }

      // Clear cart and show success message
      clearCart()
      setIsSubmitted(true)
    } catch (err) {
      console.error("Error submitting request:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUseNewInfo = () => {
    setUsingSavedInfo(false)
    // Clear the form to let user enter new information
    setFormState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      notes: "",
    })
  }

  const handleUseSavedInfo = () => {
    if (savedUserInfo) {
      setUsingSavedInfo(true)
      setFormState((prev) => ({
        ...prev,
        ...savedUserInfo,
      }))
    }
  }

  if (items.length === 0 && !isSubmitted) {
    return (
      <div className="text-center py-10">
        <CircuitBoard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Your cart is empty</h3>
        <p className="text-muted-foreground mt-2 mb-6">Add some items to your cart to place a request.</p>
        <Button asChild>
          <Link href="/">Browse Items</Link>
        </Button>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="max-w-sm mx-auto text-center py-16">
        <CheckCircle className="h-10 w-10 text-foreground mx-auto mb-5" />
        <h2 className="text-xl font-semibold tracking-tight mb-2">Request submitted</h2>
        <p className="text-sm text-muted-foreground mb-3">
          We'll be in touch shortly to confirm your order.
        </p>
        {invoiceId && (
          <p className="text-xs text-muted-foreground mb-6 font-mono">
            Invoice: {invoiceId}
          </p>
        )}
        <Button variant="outline" size="sm" asChild>
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Saved User Information Card */}
        {savedUserInfo && (
          <div className="mb-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Saved Information</CardTitle>
                  </div>
                  {usingSavedInfo ? (
                    <Button variant="outline" size="sm" onClick={handleUseNewInfo}>
                      <Edit className="h-4 w-4 mr-2" />
                      Use Different Info
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleUseSavedInfo}>
                      Use Saved Info
                    </Button>
                  )}
                </div>
              </CardHeader>
              {usingSavedInfo && (
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p>
                          {savedUserInfo.firstName} {savedUserInfo.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>{savedUserInfo.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p>{savedUserInfo.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Company</p>
                        <p>{savedUserInfo.company || "Not provided"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p>{savedUserInfo.address || "Not provided"}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* Form */}
        {!usingSavedInfo && (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Contact Information</CardTitle>
                <CardDescription className="text-xs">Please provide your contact details for this request.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      value={formState.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      value={formState.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formState.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input id="phone" name="phone" value={formState.phone} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input id="company" name="company" value={formState.company} onChange={handleInputChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <Input id="address" name="address" value={formState.address} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea id="notes" name="notes" value={formState.notes} onChange={handleInputChange} />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="saveInfo"
                    checked={saveInfo}
                    onCheckedChange={(checked) => setSaveInfo(checked as boolean)}
                  />
                  <Label htmlFor="saveInfo" className="text-sm font-normal">
                    Save my information for faster checkout next time
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}

        {/* Notes field when using saved info */}
        {usingSavedInfo && (
          <form onSubmit={handleSubmit} className="mt-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Order Notes</CardTitle>
                <CardDescription className="text-xs">Add any additional information about your order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea id="notes" name="notes" value={formState.notes} onChange={handleInputChange} />
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="saveInfo"
                    checked={saveInfo}
                    onCheckedChange={(checked) => setSaveInfo(checked as boolean)}
                  />
                  <Label htmlFor="saveInfo" className="text-sm font-normal">
                    Update my saved information
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>

      {/* Order Summary */}
      <div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order Summary</CardTitle>
            <CardDescription className="text-xs">
              {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="max-h-[300px] overflow-auto">
              {items.map((item) => (
                <div key={item.item_id} className="flex justify-between py-2">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Qty: {item.quantity || 1} × ${item.rate.toFixed(2)}
                    </div>
                  </div>
                  <div className="font-medium">${((item.quantity || 1) * item.rate).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center justify-between font-medium">
              <div>Total</div>
              <div>${totalPrice.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
