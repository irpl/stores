import { ItemsList } from "@/components/items-list"

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Electronic Circuit Components</h1>
      <ItemsList />
    </div>
  )
}
