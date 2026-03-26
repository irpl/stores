import fs from "fs/promises"
import path from "path"

const DATA_DIR = process.env.IMAGE_MAP_DIR || path.join(process.cwd(), "data")
const MAP_FILE = path.join(DATA_DIR, "image-map.json")

export type ImageMap = Record<string, string>

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
    return JSON.parse(data)
  } catch {
    return {}
  }
}

export async function setImageUrl(itemId: string, url: string): Promise<void> {
  await ensureDataDir()
  const map = await getImageMap()
  map[itemId] = url
  await fs.writeFile(MAP_FILE, JSON.stringify(map, null, 2))
}

export async function removeImageUrl(itemId: string): Promise<void> {
  await ensureDataDir()
  const map = await getImageMap()
  delete map[itemId]
  await fs.writeFile(MAP_FILE, JSON.stringify(map, null, 2))
}
