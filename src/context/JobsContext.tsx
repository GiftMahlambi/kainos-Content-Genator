import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";

export type JobKind = "text" | "code" | "image" | "convert";
export type JobStatus = "running" | "done" | "error";

export interface Job {
  id: string;
  kind: JobKind;
  label: string;
  status: JobStatus;
  startedAt: number;
  finishedAt?: number;
  result?: { text?: string; imageUrl?: string };
  error?: string;
  slot: string;
}

interface RunOpts {
  kind: JobKind;
  label: string;
  slot: string;
  body: any;
}

interface Ctx {
  jobs: Job[];
  results: Record<string, { text?: string; imageUrl?: string }>;
  runJob: (opts: RunOpts) => Promise<Job>;
  clear: (id: string) => void;
  isRunning: (slot: string) => boolean;
}

const NVIDIA_KEY = import.meta.env.VITE_NVIDIA_API_KEY as string;
const CHAT_URL = "/nvidia-api/v1/chat/completions";

async function nvidiaChat(messages: { role: string; content: string }[]): Promise<string> {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NVIDIA_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen3.5-122b-a10b",
      messages,
      max_tokens: 16384,
      temperature: 0.6,
      top_p: 0.95,
      stream: false,
      chat_template_kwargs: { enable_thinking: false },
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`NVIDIA API error ${resp.status}: ${t}`);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGenerate(body: any): Promise<{ text: string; imageUrl: string | null }> {
  if (body.type === "text") {
    const text = await nvidiaChat([
      { role: "system", content: "You are a helpful, creative writing assistant. Produce well-formatted responses." },
      { role: "user", content: body.prompt },
    ]);
    return { text, imageUrl: null };
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
    const text = await nvidiaChat(messages);
    return { text, imageUrl: null };
  }

  if (body.type === "image") {
    const qualityHint = body.quality === "high"
      ? " photorealistic, intricate detail, professional quality"
      : body.quality === "draft"
      ? " simplified detail, fast"
      : " high definition, balanced quality";
    const styleHint = body.style ? `, ${body.style} style` : "";
    const lightingHint = body.lighting && body.lighting !== "Default" ? `, ${body.lighting} lighting` : "";
    const colorHint = body.fullColor === false ? ", black and white" : "";
    const imagePrompt = encodeURIComponent(`${body.prompt}${qualityHint}${styleHint}${lightingHint}${colorHint}`);
    const width = body.quality === "draft" ? 512 : 1024;
    const height = body.quality === "draft" ? 512 : 1024;
    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
    return { text: "", imageUrl };
  }

  throw new Error("Invalid generation type");
}

const JobsContext = createContext<Ctx | null>(null);

export const JobsProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [results, setResults] = useState<Record<string, { text?: string; imageUrl?: string }>>({});

  const runJob = useCallback(async (opts: RunOpts) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const job: Job = { id, kind: opts.kind, label: opts.label, status: "running", startedAt: Date.now(), slot: opts.slot };
    setJobs((j) => [job, ...j].slice(0, 20));

    try {
      const res = await callGenerate(opts.body);
      const finished: Job = { ...job, status: "done", finishedAt: Date.now(), result: res };
      setJobs((j) => j.map((x) => (x.id === id ? finished : x)));
      setResults((r) => ({ ...r, [opts.slot]: res }));
      toast.success(`${opts.label} ready`, { description: "Open the tab to view it." });
      return finished;
    } catch (e: any) {
      const msg = e?.message || "Generation failed";
      const failed: Job = { ...job, status: "error", finishedAt: Date.now(), error: msg };
      setJobs((j) => j.map((x) => (x.id === id ? failed : x)));
      toast.error(`${opts.label} failed`, { description: msg });
      return failed;
    }
  }, []);

  const clear = useCallback((id: string) => setJobs((j) => j.filter((x) => x.id !== id)), []);
  const isRunning = useCallback(
    (slot: string) => jobs.some((j) => j.slot === slot && j.status === "running"),
    [jobs],
  );

  return (
    <JobsContext.Provider value={{ jobs, results, runJob, clear, isRunning }}>
      {children}
    </JobsContext.Provider>
  );
};

export const useJobs = () => {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs must be used inside JobsProvider");
  return ctx;
};
