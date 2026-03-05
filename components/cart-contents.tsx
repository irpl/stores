"use client"
import { Trash2, ArrowRight } from "lucide-react"
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
          <div className="px-4 py-3 flex justify-between items-center">
            <h2 className="text-sm font-medium text-muted-foreground">
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
          <Separator />
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.item_id} className="px-4 py-4 flex items-start gap-4">
                <div className="flex-grow min-w-0">
                  <h3 className="font-medium text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ${item.rate.toFixed(2)}{item.unit ? ` / ${item.unit}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <label htmlFor={`quantity-${item.item_id}`} className="sr-only">
                    Quantity
                  </label>
                  <Input
                    id={`quantity-${item.item_id}`}
                    type="number"
                    min="1"
                    className="w-14 h-8 text-sm text-center"
                    value={item.quantity || 1}
                    onChange={(e) => handleQuantityChange(item.item_id, e.target.value)}
                  />
                  <div className="text-sm font-medium w-16 text-right">
                    ${((item.quantity || 1) * item.rate).toFixed(2)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.item_id)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">Subtotal</div>
              <div>${totalPrice.toFixed(2)}</div>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm font-semibold">
              <div>Total</div>
              <div>${totalPrice.toFixed(2)}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-9 text-sm" onClick={handleCheckout}>
              Checkout
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
