"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { CircuitBoard, Loader2, Plus, Minus } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart, type Item } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"

export function ItemsList() {
  // Update the initial state to be an empty array instead of undefined
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const { addToCart } = useCart()
  const { toast } = useToast()

  // In the useEffect function, update the error handling to ensure we properly check the API response
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/items")

        if (!response.ok) {
          throw new Error(`Error fetching items: ${response.status}`)
        }

        const data = await response.json()

        // Check if data.items exists before setting state
        if (data && Array.isArray(data.items)) {
          setItems(data.items)

          // Initialize quantities for all items
          const initialQuantities: Record<string, number> = {}
          data.items.forEach((item: Item) => {
            initialQuantities[item.item_id] = 1
          })
          setQuantities(initialQuantities)
        } else {
          console.error("Invalid API response format:", data)
          setError("Received invalid data format from API")
          setItems([]) // Ensure items is always an array
        }
      } catch (err) {
        console.error("Failed to fetch items:", err)
        setError("Failed to load items. Please try again later.")
        setItems([]) // Ensure items is always an array
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  const handleAddToCart = (item: Item) => {
    // Get the quantity for this item, default to 1 if not set
    const quantity = quantities[item.item_id] || 1

    // Add the item with the selected quantity
    const itemWithQuantity = { ...item, quantity }
    addToCart(itemWithQuantity)

    toast({
      title: "Added to cart",
      description: `${quantity} × ${item.name} has been added to your cart.`,
    })
  }

  const handleQuantityChange = (itemId: string, value: number) => {
    // Ensure quantity is at least 1
    const newQuantity = Math.max(1, value)
    setQuantities((prev) => ({
      ...prev,
      [itemId]: newQuantity,
    }))
  }

  const incrementQuantity = (itemId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 1) + 1,
    }))
  }

  const decrementQuantity = (itemId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) - 1),
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <CircuitBoard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No items available</h3>
        <p className="text-muted-foreground mt-2">Check back later for new inventory.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.item_id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.description || "No description available"}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="aspect-square relative bg-muted rounded-md flex items-center justify-center mb-4">
                <CircuitBoard className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="flex justify-between items-center">
                <div className="font-medium">
                  Price: ${item.rate.toFixed(2)} {item.unit && `per ${item.unit}`}
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.status === "active" ? (
                    <span className="text-green-500">In Stock</span>
                  ) : (
                    <span className="text-red-500">Out of Stock</span>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <div className="flex items-center w-full">
                <Label htmlFor={`quantity-${item.item_id}`} className="mr-2">
                  Qty:
                </Label>
                <div className="flex items-center border rounded-md">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-r-none"
                    onClick={() => decrementQuantity(item.item_id)}
                    disabled={quantities[item.item_id] <= 1}
                  >
                    <Minus className="h-3 w-3" />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  <Input
                    id={`quantity-${item.item_id}`}
                    type="number"
                    min="1"
                    className="w-12 h-8 text-center border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={quantities[item.item_id] || 1}
                    onChange={(e) => handleQuantityChange(item.item_id, Number.parseInt(e.target.value) || 1)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-l-none"
                    onClick={() => incrementQuantity(item.item_id)}
                  >
                    <Plus className="h-3 w-3" />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                </div>
              </div>
              <Button className="w-full" onClick={() => handleAddToCart(item)} disabled={item.status !== "active"}>
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Helper component for the label
function Label({ htmlFor, className, children }: { htmlFor: string; className?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium ${className || ""}`}>
      {children}
    </label>
  )
}
