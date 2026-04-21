const NVIDIA_API_KEY = Deno.env.get("NVIDIA_API_KEY");

interface Body {
  type: "text" | "code" | "image";
  prompt: string;
  language?: string;
  sourceCode?: string;
  sourceLanguage?: string;
  quality?: "draft" | "standard" | "high";
  style?: string;
  lighting?: string;
  fullColor?: boolean;
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function callChat(messages: { role: string; content: string }[]) {
  const resp = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-8b-instruct",
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`NVIDIA API error ${resp.status}: ${t}`);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callImage(prompt: string) {
  const resp = await fetch("https://ai.api.nvidia.com/v1/genai/stabilityai/sdxl-turbo", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt, weight: 1 }],
      sampler: "K_EULER_ANCESTRAL",
      steps: 4,
      seed: 0,
      cfg_scale: 2,
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`NVIDIA image API error ${resp.status}: ${t}`);
  }
  const data = await resp.json();
  const b64 = data.artifacts?.[0]?.base64;
  if (!b64) throw new Error("No image returned");
  return `data:image/png;base64,${b64}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    if (!NVIDIA_API_KEY) throw new Error("NVIDIA_API_KEY not configured");
    const body = (await req.json()) as Body;

    if (body.type === "text") {
      const text = await callChat([
        { role: "system", content: "You are a helpful, creative writing assistant. Produce well-formatted responses." },
        { role: "user", content: body.prompt },
      ]);
      return json({ text, imageUrl: null });
    }

    if (body.type === "code") {
      let messages;
      if (body.sourceCode && body.sourceLanguage && body.language) {
        messages = [
          { role: "system", content: `You are an expert polyglot programmer. Convert the user's ${body.sourceLanguage} code into idiomatic, working ${body.language}. Return ONLY a single fenced code block in ${body.language}, no prose.` },
          { role: "user", content: `Convert this ${body.sourceLanguage} code to ${body.language}:\n\n\`\`\`${body.sourceLanguage}\n${body.sourceCode}\n\`\`\`` },
        ];
      } else {
        messages = [
          { role: "system", content: `You are an expert ${body.language ?? "JavaScript"} developer. Produce clean, working code with brief inline comments. Return ONLY a single fenced code block in ${body.language ?? "javascript"}, no prose.` },
          { role: "user", content: body.prompt },
        ];
      }
      const text = await callChat(messages);
      return json({ text, imageUrl: null });
    }

    if (body.type === "image") {
      const qualityHint = body.quality === "high"
        ? " Ultra high resolution, photorealistic, intricate detail, professional quality."
        : body.quality === "draft"
        ? " Fast preview, clean composition, simplified detail."
        : " High definition, balanced quality and crisp detail.";

      const styleHint = body.style ? ` Rendered in ${body.style} style.` : "";
      const lightingHint = body.lighting && body.lighting !== "Default" ? ` ${body.lighting} lighting and mood.` : "";
      const colorHint = body.fullColor === false ? " Pure black and white monochrome." : " Vivid full color.";

      const fullPrompt = `${body.prompt}.${qualityHint}${styleHint}${lightingHint}${colorHint}`;
      const imageUrl = await callImage(fullPrompt);
      return json({ text: "", imageUrl });
    }

    return json({ error: "Invalid type" }, 400);
  } catch (e) {
    console.error("generate error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
