"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { CircuitBoard, Loader2, Plus, Minus, Search, X } from "lucide-react"
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
  const [search, setSearch] = useState("")
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

  const filtered = search.trim()
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          (item.description?.toLowerCase().includes(search.toLowerCase()))
      )
    : items

  return (
    <div>
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 pr-8 h-9 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">Clear search</span>
          </button>
        )}
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground py-10 text-center">
          No components match &ldquo;{search}&rdquo;
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <Card key={item.item_id} className="flex flex-col transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base font-semibold leading-snug">{item.name}</CardTitle>
                <span
                  className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                    item.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.status === "active" ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              <CardDescription className="line-clamp-2 text-xs">
                {item.description || "No description available"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pb-3">
              <div className="text-xl font-bold tracking-tight">
                ${item.rate.toFixed(2)}
                {item.unit && (
                  <span className="text-sm font-normal text-muted-foreground ml-1">/ {item.unit}</span>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex items-center gap-2 pt-0">
              <div className="flex items-center border rounded-md shrink-0">
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
                  className="w-10 h-8 text-center border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
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
              <Button
                className="flex-1 h-8 text-sm"
                onClick={() => handleAddToCart(item)}
                disabled={item.status !== "active"}
              >
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
