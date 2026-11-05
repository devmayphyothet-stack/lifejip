// Supabase Edge Function: analyze-document
// Summarizes Korean utility bills (관리비), housing contracts (임대차계약서), and prescriptions (처방전/약봉투) into Burmese (Myanmar)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { documentType, koreanText, imageBase64 } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: 'GEMINI_API_KEY not configured on Supabase Edge Function',
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const systemInstruction = `You are LifeJip AI, a Korean-to-Burmese (Myanmar) translator and administrative/medical guide for Burmese residents in South Korea.
Analyze the provided Korean ${documentType || 'document'} and return a JSON object with:
- titleKo: Korean document title
- titleMm: Burmese document title
- summaryMm: Clear Burmese summary of what this document is and what action to take
- keyItems: Array of { termKo, valueKo, meaningMm }
- cautionMm: Important warning or deadline in Burmese`;

    const contents: unknown[] = [
      {
        role: 'user',
        parts: [
          { text: `${systemInstruction}\n\nDocument text: ${koreanText || ''}` },
          ...(imageBase64
            ? [
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64,
                  },
                },
              ]
            : []),
        ],
      },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    const result = await response.json();
    const rawJson =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

    return new Response(rawJson, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

