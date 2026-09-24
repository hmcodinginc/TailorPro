import * as THREE from "three"

export type FabricType = "cotton" | "wool" | "linen" | "silk" | "denim"

// Cache generated textures so we don't recreate them every render
const textureCache: Record<string, THREE.CanvasTexture> = {}

/**
 * Generates procedural canvas textures for real fabric weaves at zero cost.
 * Zero external downloads, runs offline, fast and lightweight.
 */
export function getProceduralFabricTexture(
  type: FabricType,
  baseColorHex: number,
  scale: number = 8
): { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture } {
  const cacheKey = `${type}_${baseColorHex.toString(16)}_${scale}`
  const normalCacheKey = `normal_${type}_${scale}`

  // 1. Generate or retrieve Normal / Bump Map (for realistic microscopic weave depth)
  let normalMap = textureCache[normalCacheKey]
  if (!normalMap) {
    const canvas = document.createElement("canvas")
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext("2d")!

    // Base neutral normal color (RGB 128, 128, 255 = pointing straight out)
    ctx.fillStyle = "rgb(128, 128, 255)"
    ctx.fillRect(0, 0, 128, 128)

    if (type === "cotton" || type === "linen") {
      // Plain woven grid pattern
      const step = type === "linen" ? 6 : 4
      for (let y = 0; y < 128; y += step) {
        for (let x = 0; x < 128; x += step) {
          const isOver = ((x / step) + (y / step)) % 2 === 0
          const bump = isOver ? 160 : 96
          ctx.fillStyle = `rgb(${bump}, 128, 230)`
          ctx.fillRect(x, y, step - 1, step - 1)
        }
      }
    } else if (type === "wool" || type === "denim") {
      // 45-degree diagonal twill weave
      const step = 4
      for (let y = 0; y < 128; y += step) {
        for (let x = 0; x < 128; x += step) {
          const diag = Math.floor((x + y) / step) % 3
          const bump = diag === 0 ? 175 : diag === 1 ? 135 : 100
          ctx.fillStyle = `rgb(${bump}, ${bump}, 240)`
          ctx.fillRect(x, y, step, step)
        }
      }
    } else if (type === "silk") {
      // Ultra-fine satin weave
      const step = 2
      for (let y = 0; y < 128; y += step) {
        for (let x = 0; x < 128; x += step) {
          const v = 120 + Math.sin(x * 0.4) * 15 + Math.cos(y * 0.4) * 15
          ctx.fillStyle = `rgb(${v}, 128, 250)`
          ctx.fillRect(x, y, step, step)
        }
      }
    }

    normalMap = new THREE.CanvasTexture(canvas)
    normalMap.wrapS = THREE.RepeatWrapping
    normalMap.wrapT = THREE.RepeatWrapping
    normalMap.repeat.set(scale, scale)
    textureCache[normalCacheKey] = normalMap
  }

  // 2. Generate Diffuse/Albedo Map with subtle weave tone variations
  let map = textureCache[cacheKey]
  if (!map) {
    const canvas = document.createElement("canvas")
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext("2d")!

    const color = new THREE.Color(baseColorHex)
    const r = Math.round(color.r * 255)
    const g = Math.round(color.g * 255)
    const b = Math.round(color.b * 255)

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
    ctx.fillRect(0, 0, 128, 128)

    // Add subtle micro-fiber variation
    const imgData = ctx.getImageData(0, 0, 128, 128)
    const data = imgData.data

    for (let i = 0; i < data.length; i += 4) {
      const px = (i / 4) % 128
      const py = Math.floor((i / 4) / 128)

      let noise = (Math.random() - 0.5) * 8
      if (type === "denim") {
        // Diagonal twill highlights (white warp threads)
        if ((px + py) % 6 === 0) noise += 18
      } else if (type === "linen") {
        // Slub yarn irregularities
        if (px % 14 === 0 || py % 18 === 0) noise += (Math.random() - 0.5) * 22
      } else if (type === "wool") {
        // Soft matte twill
        if ((px + py) % 4 === 0) noise += 8
      } else if (type === "silk") {
        // Smooth minimal noise
        noise = (Math.random() - 0.5) * 3
      }

      data[i] = Math.min(255, Math.max(0, r + noise))
      data[i + 1] = Math.min(255, Math.max(0, g + noise))
      data[i + 2] = Math.min(255, Math.max(0, b + noise))
    }
    ctx.putImageData(imgData, 0, 0)

    map = new THREE.CanvasTexture(canvas)
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.repeat.set(scale, scale)
    textureCache[cacheKey] = map
  }

  return { map, normalMap }
}

/**
 * Creates high-fidelity realistic fabric materials based on real tailoring textiles
 */
export function createRealisticFabricMaterial(
  fabricType: FabricType = "cotton",
  colorHex: number = 0x2563eb,
  opacity: number = 1.0,
  isTransparent: boolean = false
): THREE.MeshStandardMaterial {
  const { map, normalMap } = getProceduralFabricTexture(fabricType, colorHex, 10)

  let roughness = 0.75
  let metalness = 0.05

  switch (fabricType) {
    case "silk":
      roughness = 0.28
      metalness = 0.15
      break
    case "wool":
      roughness = 0.88
      metalness = 0.02
      break
    case "linen":
      roughness = 0.82
      metalness = 0.04
      break
    case "denim":
      roughness = 0.85
      metalness = 0.05
      break
    case "cotton":
    default:
      roughness = 0.72
      metalness = 0.04
      break
  }

  return new THREE.MeshStandardMaterial({
    color: colorHex,
    map,
    normalMap,
    normalScale: new THREE.Vector2(0.6, 0.6),
    roughness,
    metalness,
    transparent: isTransparent,
    opacity,
    side: THREE.DoubleSide,
  })
}
