import { ExtractionResponseSchema } from './validate-extraction'
const SYSTEM_PROMPT = `You are a carbon footprint extraction system.

Analyze receipts, invoices, utility bills and tickets.
Extract ONLY activities relevant to carbon emissions.
Return ONLY valid JSON.

Schema:
{
  "document_type": "receipt | utility_bill | fuel_receipt | transport_invoice | unknown",
  "activities": [
    {
      "category": "Transport | Food | Energy | Shopping | Waste | Other",
      "description": "string",
      "amount": number,
      "unit": "string"
    }
  ]
}

Rules:
- Electricity bills → Energy
- kWh usage should be extracted as amount
- Fuel purchases → Transport
- Flights → Transport
- Food orders → Food
- Ignore taxes and totals
- Return an empty activities array if no carbon-related activity exists

Do not return markdown.
Do not explain.
Return only JSON.
`

export async function analyzeDocument(dataUrl: string) {
  if (!process.env.NVIDIA_NIM_API_KEY) {
    throw new Error("NVIDIA_NIM_API_KEY is not configured")
  }

  // Validate the payload before attempting the request
  if (!dataUrl.startsWith("data:image")) {
    throw new Error("Invalid image format for NVIDIA Vision. Expected data URL.")
  }

  console.log("NVIDIA Payload Prefix:", dataUrl.substring(0, 50))
  console.log("NVIDIA Payload Length:", dataUrl.length)



  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_NIM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.2-90b-vision-instruct',
        temperature: 0.1,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${SYSTEM_PROMPT}\n\nExtract the activities from this document. Ensure you output exactly one valid JSON object.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl
                }
              }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("========== NVIDIA ERROR ==========")
      console.error(errorText)
      console.error("==================================")
      throw new Error(`NVIDIA API responded with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log(
  "RAW NVIDIA RESPONSE:",
  JSON.stringify(data, null, 2)
)
    const text = data.choices?.[0]?.message?.content || ''
    console.log(
  "MODEL OUTPUT:",
  data.choices?.[0]?.message?.content
)

    // Parse the generated text into an object
    // Strip out potential markdown code blocks
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const object = JSON.parse(cleanText)

    if (!Array.isArray(object.activities)) {
      throw new Error('Invalid response shape: activities array is missing')
    }

    return object
  } catch (error) {
    console.error("NIM extraction error:", error)
    throw new Error("Failed to extract data from document")
  }
}
