"use client"

import { useEffect, useState } from "react"
import { Loader2, ImageIcon, Trash2, Save, Lock, LogOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { Item } from "@/components/cart-provider"

type ImageEntry = {
  url: string
  scale: number
  posX: number
  posY: number
}

type ImageMap = Record<string, ImageEntry>

type DraftEntry = {
  url: string
  scale: number
  posX: number
  posY: number
}

const DEFAULT_DRAFT: DraftEntry = { url: "", scale: 1, posX: 50, posY: 50 }

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [authLoading, setAuthLoading] = useState(false)

  const [items, setItems] = useState<Item[]>([])
  const [imageMap, setImageMap] = useState<ImageMap>({})
  const [drafts, setDrafts] = useState<Record<string, DraftEntry>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError("")

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setAuthError(data.error || "Invalid password")
        return
      }

      sessionStorage.setItem("adminPassword", password)
      setAuthenticated(true)
    } catch {
      setAuthError("Failed to authenticate")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("adminPassword")
    setAuthenticated(false)
    setPassword("")
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("adminPassword")
    if (saved) {
      setPassword(saved)
      setAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (!authenticated) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [itemsRes, imagesRes] = await Promise.all([
          fetch("/api/items"),
          fetch("/api/images"),
        ])
        const itemsData = await itemsRes.json()
        const imagesData: ImageMap = await imagesRes.json()

        const itemsList = itemsData?.items || []
        setItems(itemsList)
        setImageMap(imagesData || {})

        const initialDrafts: Record<string, DraftEntry> = {}
        itemsList.forEach((item: Item) => {
          const existing = imagesData[item.item_id]
          initialDrafts[item.item_id] = existing
            ? { url: existing.url, scale: existing.scale, posX: existing.posX, posY: existing.posY }
            : { ...DEFAULT_DRAFT }
        })
        setDrafts(initialDrafts)
      } catch (err) {
        console.error("Failed to load data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [authenticated])

  const updateDraft = (itemId: string, updates: Partial<DraftEntry>) => {
    setDrafts((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || DEFAULT_DRAFT), ...updates },
    }))
  }

  const resetDraft = (itemId: string) => {
    const existing = imageMap[itemId]
    setDrafts((prev) => ({
      ...prev,
      [itemId]: existing
        ? { url: existing.url, scale: existing.scale, posX: existing.posX, posY: existing.posY }
        : { ...DEFAULT_DRAFT },
    }))
  }

  const hasChanged = (itemId: string) => {
    const draft = drafts[itemId]
    const saved = imageMap[itemId]
    if (!draft) return false
    if (!saved) return !!draft.url
    return (
      draft.url !== saved.url ||
      draft.scale !== saved.scale ||
      draft.posX !== saved.posX ||
      draft.posY !== saved.posY
    )
  }

  const handleSave = async (itemId: string) => {
    const storedPassword = sessionStorage.getItem("adminPassword")
    if (!storedPassword) return

    const draft = drafts[itemId]
    if (!draft) return

    setSaving(itemId)
    try {
      const res = await fetch("/api/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": storedPassword,
        },
        body: JSON.stringify({
          itemId,
          url: draft.url || "",
          scale: draft.scale,
          posX: draft.posX,
          posY: draft.posY,
        }),
      })

      if (res.ok) {
        const updatedMap = await res.json()
        setImageMap(updatedMap)
      }
    } catch (err) {
      console.error("Failed to save:", err)
    } finally {
      setSaving(null)
    }
  }

  const handleRemove = async (itemId: string) => {
    const storedPassword = sessionStorage.getItem("adminPassword")
    if (!storedPassword) return

    setSaving(itemId)
    try {
      const res = await fetch("/api/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": storedPassword,
        },
        body: JSON.stringify({ itemId, url: "" }),
      })

      if (res.ok) {
        const updatedMap = await res.json()
        setImageMap(updatedMap)
        setDrafts((prev) => ({ ...prev, [itemId]: { ...DEFAULT_DRAFT } }))
      }
    } catch (err) {
      console.error("Failed to remove:", err)
    } finally {
      setSaving(null)
    }
  }

  if (!authenticated) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <Lock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter the admin password to continue.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {authError && (
                <p className="text-sm text-red-500 mt-2">{authError}</p>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading ? "Verifying..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 border-b pb-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Item Images</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set display image URLs and adjust how they appear.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No items found.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {items.map((item) => {
            const draft = drafts[item.item_id] || DEFAULT_DRAFT
            const saved = imageMap[item.item_id]
            const isSaving = saving === item.item_id
            const changed = hasChanged(item.item_id)

            return (
              <Card key={item.item_id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold leading-snug">
                    {item.name}
                  </CardTitle>
                  <CardDescription className="text-xs truncate">
                    ID: {item.item_id}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  {/* Live preview */}
                  <div className="aspect-video rounded-md border bg-muted overflow-hidden">
                    {draft.url ? (
                      <img
                        src={draft.url}
                        alt={item.name}
                        className="w-full h-full"
                        style={{
                          objectFit: "cover",
                          objectPosition: `${draft.posX}% ${draft.posY}%`,
                          transform: `scale(${draft.scale})`,
                          transformOrigin: `${draft.posX}% ${draft.posY}%`,
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* URL input */}
                  <div className="grid gap-1.5">
                    <Label htmlFor={`url-${item.item_id}`} className="text-xs">
                      Image URL
                    </Label>
                    <Input
                      id={`url-${item.item_id}`}
                      placeholder="https://example.com/image.jpg"
                      value={draft.url}
                      onChange={(e) => updateDraft(item.item_id, { url: e.target.value })}
                      className="text-sm h-8"
                    />
                  </div>

                  {/* Controls — only show when there's a URL */}
                  {draft.url && (
                    <div className="space-y-3 pt-1">
                      <div className="grid gap-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Zoom</Label>
                          <span className="text-xs text-muted-foreground tabular-nums">{draft.scale.toFixed(2)}×</span>
                        </div>
                        <Slider
                          value={[draft.scale]}
                          onValueChange={([v]) => updateDraft(item.item_id, { scale: v })}
                          min={0.5}
                          max={3}
                          step={0.05}
                          className="w-full"
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Pan X</Label>
                          <span className="text-xs text-muted-foreground tabular-nums">{draft.posX}%</span>
                        </div>
                        <Slider
                          value={[draft.posX]}
                          onValueChange={([v]) => updateDraft(item.item_id, { posX: v })}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Pan Y</Label>
                          <span className="text-xs text-muted-foreground tabular-nums">{draft.posY}%</span>
                        </div>
                        <Slider
                          value={[draft.posY]}
                          onValueChange={([v]) => updateDraft(item.item_id, { posY: v })}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="gap-2 pt-0">
                  <Button
                    size="sm"
                    className="flex-1 h-8 text-sm"
                    onClick={() => handleSave(item.item_id)}
                    disabled={!changed || isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Save className="h-3 w-3 mr-1" />
                    )}
                    Save
                  </Button>
                  {changed && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-sm"
                      onClick={() => resetDraft(item.item_id)}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  )}
                  {saved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-sm"
                      onClick={() => handleRemove(item.item_id)}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
