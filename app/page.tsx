import { ItemsList } from "@/components/items-list"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 border-b pb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
          Components
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Electronic Circuit Components</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Precision components for prototyping and production.
        </p>
      </div>
      <ItemsList />
    </div>
  )
}
