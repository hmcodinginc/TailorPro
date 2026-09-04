import { describe, it, expect } from "vitest"
import { findGarmentTemplate, getGarmentsByGender, MEN_GARMENTS, WOMEN_GARMENTS } from "../lib/garments"
import {
  getGarmentVisualConfig,
  getMeasurementImageUrl,
  normalizeGender,
  DEFAULT_VISUAL_CONFIG,
} from "../config/garmentMeasurementMap"

describe("Garment & Gender Dynamic Specification Logic", () => {
  describe("findGarmentTemplate", () => {
    it("returns Men's Shirt template when gender is Men", () => {
      const template = findGarmentTemplate("Shirt", "Men")
      expect(template).not.toBeNull()
      expect(template?.gender).toBe("Men")
      expect(template?.fields.some((f) => f.key === "chest")).toBe(true)
    })

    it("returns Women's Shirt template when gender is Women", () => {
      const template = findGarmentTemplate("Shirt", "Women")
      expect(template).not.toBeNull()
      expect(template?.gender).toBe("Women")
      expect(template?.fields.some((f) => f.key === "bust")).toBe(true)
    })

    it("returns Men's Pant template for Men", () => {
      const template = findGarmentTemplate("Pant", "Men")
      expect(template).not.toBeNull()
      expect(template?.gender).toBe("Men")
    })

    it("returns Women's Salwar template for Women", () => {
      const template = findGarmentTemplate("Salwar", "Women")
      expect(template).not.toBeNull()
      expect(template?.gender).toBe("Women")
    })
  })

  describe("getGarmentVisualConfig (Dynamic Visualizer Logic)", () => {
    it("resolves Men's Shirt visual config", () => {
      const config = getGarmentVisualConfig("Men", "Shirt")
      expect(config.title).toBe("Men's Shirt")
      expect(config.gender).toBe("Men")
      expect(config.lines.chest).toBeDefined()
      expect(config.lines.shoulder).toBeDefined()
      expect(config.renderSVG).toBeTypeOf("function")
    })

    it("resolves Women's Shirt visual config", () => {
      const config = getGarmentVisualConfig("Women", "Shirt")
      expect(config.title).toBe("Women's Shirt / Button-Down")
      expect(config.gender).toBe("Women")
      expect(config.lines.bust).toBeDefined()
      expect(config.renderSVG).toBeTypeOf("function")
    })

    it("resolves Men's Pant vs Women's Salwar & Pant", () => {
      const menPant = getGarmentVisualConfig("Men", "Pant")
      expect(menPant.gender).toBe("Men")
      expect(menPant.title).toBe("Men's Pant / Trouser")

      const womenSalwar = getGarmentVisualConfig("Women", "Salwar")
      expect(womenSalwar.gender).toBe("Women")
      expect(womenSalwar.title).toBe("Women's Salwar / Patiala")
    })

    it("resolves Suit, Blazer, Kurta for both genders", () => {
      const menSuit = getGarmentVisualConfig("Men", "Suit")
      expect(menSuit.gender).toBe("Men")

      const womenSuit = getGarmentVisualConfig("Women", "Suit")
      expect(womenSuit.gender).toBe("Women")

      const menKurta = getGarmentVisualConfig("Men", "Kurta")
      expect(menKurta.gender).toBe("Men")

      const womenKurta = getGarmentVisualConfig("Women", "Kurta")
      expect(womenKurta.gender).toBe("Women")
    })

    it("gracefully falls back to default visual config for unknown garment without breaking", () => {
      const unknown = getGarmentVisualConfig("Men", "UnknownSpaceSuit")
      expect(unknown).toBeDefined()
      expect(unknown.title).toBe(DEFAULT_VISUAL_CONFIG.title)
      expect(unknown.renderSVG).toBeTypeOf("function")
    })
  })

  describe("getMeasurementImageUrl helper", () => {
    it("generates correct dynamic image filenames", () => {
      expect(getMeasurementImageUrl("Men", "Shirt")).toBe("/images/measurements/mens-shirt-measurement.png")
      expect(getMeasurementImageUrl("Women", "Shirt")).toBe("/images/measurements/womens-shirt-measurement.png")
      expect(getMeasurementImageUrl("Men", "Pant")).toBe("/images/measurements/mens-pant-measurement.png")
      expect(getMeasurementImageUrl("Women", "Salwar")).toBe("/images/measurements/womens-salwar-measurement.png")
    })
  })
})
