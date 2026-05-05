import fs from "fs/promises"
import path from "path"

const DATA_DIR = process.env.IMAGE_MAP_DIR || path.join(process.cwd(), "data")
const MAP_FILE = path.join(DATA_DIR, "image-map.json")

export type ImageEntry = {
  url: string
  scale: number
  posX: number
  posY: number
}

export type ImageMap = Record<string, ImageEntry>

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch {
    // directory already exists
  }
}

export async function getImageMap(): Promise<ImageMap> {
  try {
    const data = await fs.readFile(MAP_FILE, "utf-8")
    const raw = JSON.parse(data)
    const map: ImageMap = {}
    for (const [id, value] of Object.entries(raw)) {
      if (typeof value === "string") {
        map[id] = { url: value, scale: 1, posX: 50, posY: 50 }
      } else {
        map[id] = value as ImageEntry
      }
    }
    return map
  } catch {
    return {}
  }
}

export async function setImageEntry(itemId: string, entry: ImageEntry): Promise<void> {
  await ensureDataDir()
  const map = await getImageMap()
  map[itemId] = entry
  await fs.writeFile(MAP_FILE, JSON.stringify(map, null, 2))
}

export async function removeImageEntry(itemId: string): Promise<void> {
  await ensureDataDir()
  const map = await getImageMap()
  delete map[itemId]
  await fs.writeFile(MAP_FILE, JSON.stringify(map, null, 2))
}
