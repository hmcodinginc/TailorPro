import jsPDF from "jspdf"
import { findGarmentTemplate } from "./garments"

export interface DownloadPdfParams {
  measurement: any
  customer: any
  businessName?: string
}

export function generateMeasurementPDF({
  measurement,
  customer,
  businessName = "TailorPro Boutique",
}: DownloadPdfParams) {
  const doc = new jsPDF()

  // Determine gender & template
  const gender = measurement.gender || "Not specified"
  const template = findGarmentTemplate(measurement.garment_type, gender)
  const garmentLabel = template ? `${template.emoji} ${template.label}` : (measurement.garment_type || "Custom Garment")

  // Color Palette
  const primaryColor: [number, number, number] = [30, 41, 59] // Slate 800
  const accentColor: [number, number, number] = [79, 70, 229] // Indigo 600
  const textColor: [number, number, number] = [51, 65, 85] // Slate 700
  const lightBgColor: [number, number, number] = [248, 250, 252] // Slate 50

  let y = 15

  // Header Banner Accent Line
  doc.setFillColor(...accentColor)
  doc.rect(0, 0, 210, 5, "F")

  // Header Titles
  doc.setTextColor(...primaryColor)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.text(businessName.toUpperCase(), 14, y + 10)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text("GARMENT MEASUREMENT SPECIFICATION SHEET", 14, y + 17)

  // Date on top right
  const formattedDate = measurement.created_at
    ? new Date(measurement.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  doc.setFontSize(9)
  doc.text(`Date: ${formattedDate}`, 196, y + 10, { align: "right" })
  doc.text(`Ref ID: #${measurement.id || "000"}`, 196, y + 16, { align: "right" })

  y += 24

  // Divider line
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.line(14, y, 196, y)

  y += 8

  // Customer Information Card Box
  doc.setFillColor(...lightBgColor)
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(14, y, 182, 34, 3, 3, "FD")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(...primaryColor)
  doc.text("CUSTOMER DETAILS", 20, y + 8)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...textColor)

  const custName = customer?.name || "Guest Customer"
  const custPhone = customer?.phone || "N/A"
  const custEmail = customer?.email || "N/A"
  const custAddress = customer?.address || "N/A"

  doc.text(`Name: ${custName}`, 20, y + 16)
  doc.text(`Phone: ${custPhone}`, 20, y + 23)
  doc.text(`Email: ${custEmail}`, 20, y + 30)

  doc.setFont("helvetica", "bold")
  doc.text(`Gender: ${gender === "Men" ? "Men (Male)" : gender === "Women" ? "Women (Female)" : gender}`, 110, y + 16)
  doc.setFont("helvetica", "normal")
  doc.text(`Garment: ${garmentLabel.replace(/[\u1F600-\u1F6FF]/g, "")}`, 110, y + 23)
  doc.text(`Address: ${custAddress.length > 28 ? custAddress.substring(0, 25) + "..." : custAddress}`, 110, y + 30)

  y += 42

  // Measurement Table Header
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(...primaryColor)
  doc.text("MEASUREMENT DETAILS", 14, y)

  y += 6

  // Collect active non-empty fields
  const activeFields: { label: string; value: string }[] = []

  if (template) {
    template.fields.forEach((field) => {
      const val = measurement[field.key]
      if (val !== undefined && val !== null && val !== "") {
        activeFields.push({ label: field.label, value: `${val}"` })
      }
    })
  } else {
    // Fallback: iterate over keys
    const knownKeys = [
      "chest", "bust", "upper_chest", "under_bust", "waist", "hip", "hips",
      "shoulder", "armhole", "sleeve_length", "sleeve_round", "sleeve", "length",
      "neck_depth", "neck_width", "collar", "neck", "thigh", "knee", "calf",
      "ankle", "bottom_width", "rise", "inseam", "flare"
    ]
    knownKeys.forEach((key) => {
      const val = measurement[key]
      if (val !== undefined && val !== null && val !== "") {
        const readableLabel = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        activeFields.push({ label: readableLabel, value: `${val}"` })
      }
    })
  }

  if (activeFields.length === 0) {
    doc.setFont("helvetica", "italic")
    doc.setFontSize(10)
    doc.setTextColor(148, 163, 184)
    doc.text("No specific measurement dimensions entered.", 14, y + 10)
    y += 20
  } else {
    // Render 2-column balanced grid table
    const halfLen = Math.ceil(activeFields.length / 2)
    const col1 = activeFields.slice(0, halfLen)
    const col2 = activeFields.slice(halfLen)

    const rowHeight = 9
    const tableTop = y
    const col1X = 14
    const col2X = 108
    const colWidth = 88

    // Table Table Header Rows
    doc.setFillColor(...accentColor)
    doc.rect(col1X, tableTop, colWidth, 8, "F")
    doc.rect(col2X, tableTop, colWidth, 8, "F")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text("PARAMETER", col1X + 4, tableTop + 5.5)
    doc.text("VALUE (INCHES)", col1X + colWidth - 4, tableTop + 5.5, { align: "right" })

    doc.text("PARAMETER", col2X + 4, tableTop + 5.5)
    doc.text("VALUE (INCHES)", col2X + colWidth - 4, tableTop + 5.5, { align: "right" })

    let rowY = tableTop + 8

    const maxRows = Math.max(col1.length, col2.length)
    for (let i = 0; i < maxRows; i++) {
      const bg = i % 2 === 0 ? [255, 255, 255] : lightBgColor
      doc.setFillColor(bg[0], bg[1], bg[2])

      // Col 1 Row
      if (i < col1.length) {
        doc.rect(col1X, rowY, colWidth, rowHeight, "F")
        doc.setDrawColor(241, 245, 249)
        doc.line(col1X, rowY + rowHeight, col1X + colWidth, rowY + rowHeight)

        doc.setFont("helvetica", "normal")
        doc.setTextColor(...textColor)
        doc.text(col1[i].label, col1X + 4, rowY + 6)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...primaryColor)
        doc.text(col1[i].value, col1X + colWidth - 4, rowY + 6, { align: "right" })
      }

      // Col 2 Row
      if (i < col2.length) {
        doc.rect(col2X, rowY, colWidth, rowHeight, "F")
        doc.setDrawColor(241, 245, 249)
        doc.line(col2X, rowY + rowHeight, col2X + colWidth, rowY + rowHeight)

        doc.setFont("helvetica", "normal")
        doc.setTextColor(...textColor)
        doc.text(col2[i].label, col2X + 4, rowY + 6)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...primaryColor)
        doc.text(col2[i].value, col2X + colWidth - 4, rowY + 6, { align: "right" })
      }

      rowY += rowHeight
    }

    y = rowY + 8
  }

  // Notes Section
  if (measurement.notes) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(...primaryColor)
    doc.text("SPECIAL INSTRUCTIONS & NOTES", 14, y)

    y += 4
    doc.setFillColor(254, 243, 199) // Light amber/yellow
    doc.setDrawColor(251, 191, 36)
    doc.roundedRect(14, y, 182, 18, 2, 2, "FD")

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)
    doc.setTextColor(120, 53, 15)
    doc.text(measurement.notes, 18, y + 11)

    y += 24
  }

  // Tailor Signature Box / Footer
  const footerY = Math.max(y + 10, 260)

  doc.setDrawColor(203, 213, 225)
  doc.line(14, footerY, 70, footerY)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text("Tailor Signature", 14, footerY + 5)

  doc.line(140, footerY, 196, footerY)
  doc.text("Customer Signature", 140, footerY + 5)

  // Bottom Footer Notice
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text("Generated by TailorPro Management System • Thank you for your business!", 105, 285, {
    align: "center",
  })

  // Sanitize filename
  const cleanName = (customer?.name || "Customer").replace(/[^a-zA-Z0-9]/g, "_")
  const cleanGarment = (measurement.garment_type || "Measurement").replace(/[^a-zA-Z0-9]/g, "_")

  doc.save(`${cleanName}_${cleanGarment}_Measurement.pdf`)
}
