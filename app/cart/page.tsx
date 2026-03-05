import { CartContents } from "@/components/cart-contents"

export default function CartPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <CartContents />
    </div>
  )
}
