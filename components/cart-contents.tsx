"use client"
import { Trash2, CircuitBoard, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/components/cart-provider"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"

export function CartContents() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems } = useCart()
  const router = useRouter()

  const totalPrice = items.reduce((total, item) => {
    return total + item.rate * (item.quantity || 1)
  }, 0)

  const handleQuantityChange = (itemId: string, newQuantity: string) => {
    const quantity = Number.parseInt(newQuantity, 10)
    if (!isNaN(quantity)) {
      updateQuantity(itemId, quantity)
    }
  }

  const handleCheckout = () => {
    router.push("/checkout")
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <CircuitBoard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Your cart is empty</h3>
        <p className="text-muted-foreground mt-2 mb-6">Add some items to your cart to get started.</p>
        <Button asChild>
          <Link href="/">Browse Items</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="rounded-lg border">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-lg font-medium">Cart Items ({totalItems})</h2>
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-700">
              Clear Cart
            </Button>
          </div>
          <Separator />
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.item_id} className="p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0 w-full sm:w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                  <CircuitBoard className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.description || "No description available"}</p>
                  <div className="text-sm">
                    ${item.rate.toFixed(2)} {item.unit && `per ${item.unit}`}
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                  <div className="flex items-center">
                    <label htmlFor={`quantity-${item.item_id}`} className="sr-only">
                      Quantity
                    </label>
                    <Input
                      id={`quantity-${item.item_id}`}
                      type="number"
                      min="1"
                      className="w-16 h-8"
                      value={item.quantity || 1}
                      onChange={(e) => handleQuantityChange(item.item_id, e.target.value)}
                    />
                  </div>
                  <div className="font-medium">${((item.quantity || 1) * item.rate).toFixed(2)}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.item_id)}
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>Subtotal</div>
              <div>${totalPrice.toFixed(2)}</div>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-medium">
              <div>Total</div>
              <div>${totalPrice.toFixed(2)}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleCheckout}>
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
