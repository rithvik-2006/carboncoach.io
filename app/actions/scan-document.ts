'use server'

import { createClient } from '@/lib/supabase/server'
import { analyzeDocument } from '@/lib/ai/nim-client'
import { validateExtraction } from '@/lib/ai/validate-extraction'
import { calculateCarbonImpact } from '@/lib/carbon/carbon-engine'
import { calculateAndStoreGlobalReduction } from '@/lib/carbon/global-reduction-engine'

export async function scanDocumentAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const file = formData.get('file') as File
  if (!file) {
    throw new Error('No file provided')
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit')
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WEBP are allowed.')
  }

  // 1. Upload to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('uploads')
    .upload(filePath, file)

  if (uploadError) {
    console.error("Storage upload error:", uploadError)
    throw new Error('Failed to upload file')
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath)

  // 2. Insert Upload Record (Pending)
  const { data: dbUpload, error: dbUploadError } = await supabase
    .from('uploads')
    .insert({
      user_id: user.id,
      image_url: publicUrl,
      processing_status: 'analyzing',
      document_type: 'unknown'
    })
    .select()
    .single()

  if (dbUploadError) {
    console.error("Failed to insert upload record", dbUploadError)
    throw new Error("Database error")
  }

  try {
    // 3. Convert Image to Base64 Data URL directly from File buffer
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log(`[Base64] Converted image of size ${Math.round(file.size / 1024)} KB in memory`)

    // 4. Analyze Document via NIM
    const rawExtraction = await analyzeDocument(dataUrl)

    // 5. Validate Extraction
    const validatedData = validateExtraction(rawExtraction)

    // 6. Calculate Carbon Impact
    const activitiesWithCarbon = calculateCarbonImpact(validatedData.activities)

    // 7. Update Upload Record
    await supabase.from('uploads').update({
      processing_status: 'completed',
      document_type: validatedData.document_type,
      extracted_json: validatedData
    }).eq('id', dbUpload.id)

    // 8. Try to calculate and store reduction globally
    // (In a full implementation, we'd do this after they *confirm* the scan, but for the demo we'll do it here)
    if (activitiesWithCarbon.length > 0) {
      // Just track the first activity as the primary reduction for simplicity in this demo flow
      const act = activitiesWithCarbon[0]
      // We don't have an activity_id yet because it's not confirmed, so we'll pass null
      await calculateAndStoreGlobalReduction(user.id, null, act.category, act.co2_kg, act.description)
    }

    // Return uncommitted activities for review
    return {
      uploadId: dbUpload.id,
      documentType: validatedData.document_type,
      activities: activitiesWithCarbon
    }

  } catch (error) {
    // Update Upload Record to failed
    await supabase.from('uploads').update({
      processing_status: 'failed',
    }).eq('id', dbUpload.id)

    console.error("Processing failed:", error)
    throw new Error("Failed to process document")
  }
}
