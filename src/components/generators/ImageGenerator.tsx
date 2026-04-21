import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2, Sparkles, Download, Zap, Crown, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useJobs } from "@/context/JobsContext";

const SLOT = "image:default";

interface Props {
  prompt: string;
  setPrompt: (s: string) => void;
}

type Quality = "draft" | "standard" | "high";

const qualityCards: { id: Quality; title: string; size: string; desc: string; eta: string; Icon: any }[] = [
  { id: "draft", title: "Draft", size: "512×512", desc: "Fast preview · simplified detail", eta: "~5s", Icon: Zap },
  { id: "standard", title: "Standard", size: "1024×1024", desc: "Balanced quality & speed", eta: "~15s", Icon: Sparkles },
  { id: "high", title: "High Quality", size: "1024×1024+", desc: "Photorealistic · intricate detail", eta: "~30s", Icon: Crown },
];

const styles = ["Photorealistic", "Digital Art", "3D Render", "Anime", "Sketch", "Oil Painting", "Illustration"];
const stylePreview: Record<string, string> = {
  "Photorealistic": "Lifelike, camera-accurate rendering with real-world detail.",
  "Digital Art": "Stylized digital painting with bold colors and clean shapes.",
  "3D Render": "CGI render look with depth, shading and material highlights.",
  "Anime": "Japanese animation style — clean lines, expressive eyes.",
  "Sketch": "Hand-drawn pencil sketch with soft shading.",
  "Oil Painting": "Classical oil-painting texture with rich brush strokes.",
  "Illustration": "Editorial illustration style, flat or semi-flat shading.",
};

const lightings = ["Default", "Cinematic", "Soft", "Dark & Moody", "Vibrant", "Golden Hour"];
const lightingPreview: Record<string, string> = {
  "Default": "Neutral, balanced lighting.",
  "Cinematic": "Dramatic film-like lighting with strong contrast.",
  "Soft": "Diffused, gentle lighting with low contrast.",
  "Dark & Moody": "Low-key shadows, deep blacks, atmospheric mood.",
  "Vibrant": "Bright, saturated, energetic lighting.",
  "Golden Hour": "Warm sunset glow with long soft shadows.",
};

const ImageGenerator = ({ prompt, setPrompt }: Props) => {
  const [quality, setQuality] = useState<Quality>("standard");
  const [style, setStyle] = useState("Photorealistic");
  const [lighting, setLighting] = useState("Cinematic");
  const [fullColor, setFullColor] = useState(true);

  const { runJob, isRunning, results } = useJobs();
  const loading = isRunning(SLOT);
  const imgUrl = results[SLOT]?.imageUrl ?? null;

  const generate = () => {
    if (!prompt.trim()) return toast.error("Describe the image");
    runJob({
      kind: "image",
      label: `Image (${quality}): ${prompt.slice(0, 30)}${prompt.length > 30 ? "…" : ""}`,
      slot: SLOT,
      body: { type: "image", prompt, quality, style, lighting, fullColor },
    });
    toast("Generating in background", { description: "Switch tabs anytime — we'll ping you when done." });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      generate();
    }
  };

  const download = () => {
    if (!imgUrl) return;
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = `kainos-gen-${Date.now()}.png`;
    a.click();
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-accent/15 p-2 text-accent"><ImageIcon className="h-5 w-5" /></div>
          <h2 className="text-xl font-semibold tracking-tight">Image Generator</h2>
          <span className="ml-2 text-xs text-muted-foreground">Runs in background — switch tabs anytime</span>
        </div>

        {/* QUALITY */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quality</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {qualityCards.map(({ id, title, size, desc, eta, Icon }) => {
              const active = quality === id;
              return (
                <button
                  key={id}
                  onClick={() => setQuality(id)}
                  className={`relative rounded-xl border p-4 text-left transition ${active
                    ? "border-primary/60 bg-primary/10 shadow-[0_0_30px_hsl(250_85%_70%/0.2)]"
                    : "border-border bg-secondary/40 hover:border-primary/30 hover:bg-secondary/60"}`}
                >
                  <span className="absolute right-3 top-3 text-xs text-muted-foreground">{eta}</span>
                  <div className={`mb-2 flex items-center gap-2 text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                    <Icon className="h-4 w-4" />
                    {title}
                  </div>
                  <div className="text-xs text-muted-foreground">{size}</div>
                  <div className="mt-2 text-xs text-foreground/80">{desc}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* STYLE */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Style</h3>
          <div className="flex flex-wrap gap-2">
            {styles.map((s) => {
              const active = style === s;
              return (
                <Tooltip key={s}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setStyle(s)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${active
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border bg-secondary/40 text-foreground/80 hover:border-primary/30 hover:text-foreground"}`}
                    >
                      {s}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{stylePreview[s]}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </section>

        {/* LIGHTING */}
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lighting & Mood</h3>
          <div className="flex flex-wrap gap-2">
            {lightings.map((l) => {
              const active = lighting === l;
              return (
                <Tooltip key={l}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setLighting(l)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${active
                        ? "border-accent/60 bg-accent/15 text-accent"
                        : "border-border bg-secondary/40 text-foreground/80 hover:border-accent/30 hover:text-foreground"}`}
                    >
                      {l}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{lightingPreview[l]}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </section>

        {/* COLOR TOGGLE */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch checked={fullColor} onCheckedChange={setFullColor} id="fullColor" />
            <label htmlFor="fullColor" className="cursor-pointer text-sm font-medium text-foreground">
              {fullColor ? "Full Color" : "Black & White"}
            </label>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            Hover any chip for a preview of how it shapes the result
          </div>
        </div>

        {/* PROMPT */}
        <div className="rounded-xl border border-border bg-[hsl(232_50%_5%)/0.7] p-1">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKey}
            placeholder="Describe the image you want to generate..."
            className="min-h-[120px] resize-none border-0 bg-transparent text-base focus-visible:ring-0"
          />
          <div className="flex items-center justify-between px-3 pb-2 pt-1">
            <span className="text-xs text-muted-foreground">Ctrl+Enter to generate</span>
            <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating…</> : <><Sparkles className="h-4 w-4" />Generate</>}
            </Button>
          </div>
        </div>

        {imgUrl && (
          <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-3">
            <img src={imgUrl} alt={prompt} className="w-full rounded-md" />
            <Button variant="secondary" onClick={download} className="w-full"><Download className="h-4 w-4" />Download</Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ImageGenerator;
