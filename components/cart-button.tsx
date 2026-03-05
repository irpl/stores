"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import Link from "next/link"

export function CartButton() {
  const { totalItems } = useCart()

  return (
    <Button variant="outline" size="sm" asChild className="gap-2 h-8 px-3 bg-background/80 backdrop-blur-sm shadow-sm">
      <Link href="/cart">
        <ShoppingCart className="h-4 w-4" />
        {totalItems > 0 ? (
          <span className="text-xs font-medium tabular-nums">{totalItems}</span>
        ) : null}
        <span className="sr-only">View cart</span>
      </Link>
    </Button>
  )
}
