import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In production, this would fetch from the actual API
    const response = await fetch('https://zoho-invoice-api.onrender.com/api/v1/items')
    const data = await response.json()

    // For development, return mock data that matches the expected API response
    const mockData = {
      items: [
        {
          item_id: "3470598000000442026",
          name: "Barrel Jack Connector",
          description: "Standard 5.5mm x 2.1mm barrel power connector",
          rate: 20.0,
          unit: "piece",
          status: "active",
        },
        {
          item_id: "3470598000000442027",
          name: "Arduino Nano",
          description: "Arduino Nano V3.0 with ATmega328P microcontroller",
          rate: 350.0,
          unit: "piece",
          status: "active",
        },
        {
          item_id: "3470598000000442028",
          name: "10K Ohm Resistor",
          description: "1/4 Watt 5% tolerance carbon film resistor",
          rate: 2.5,
          unit: "piece",
          status: "active",
        },
        {
          item_id: "3470598000000442029",
          name: "LED 5mm Red",
          description: "5mm red LED with 20mA current rating",
          rate: 5.0,
          unit: "piece",
          status: "active",
        },
        {
          item_id: "3470598000000442030",
          name: "Breadboard 830 Points",
          description: "Solderless breadboard with 830 tie points",
          rate: 120.0,
          unit: "piece",
          status: "active",
        },
        {
          item_id: "3470598000000442031",
          name: "Jumper Wire Kit",
          description: "Set of 65 multi-colored jumper wires",
          rate: 80.0,
          unit: "kit",
          status: "active",
        },
      ],
    }

    // Return the mock data directly instead of trying to use the API response
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching items:", error)
    // Return an empty items array to prevent undefined errors
    return NextResponse.json({ items: [] }, { status: 500 })
  }
}
