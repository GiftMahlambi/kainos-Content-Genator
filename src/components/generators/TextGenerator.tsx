import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, Copy, Loader2, Sparkles } from "lucide-react";
import { useJobs } from "@/context/JobsContext";

interface Props {
  prompt: string;
  setPrompt: (s: string) => void;
}

const SLOT = "text:default";

const TextGenerator = ({ prompt, setPrompt }: Props) => {
  const { runJob, isRunning, results } = useJobs();
  const loading = isRunning(SLOT);
  const output = results[SLOT]?.text ?? "";

  const generate = () => {
    if (!prompt.trim()) return toast.error("Enter a prompt");
    runJob({
      kind: "text",
      label: `Text: ${prompt.slice(0, 40)}${prompt.length > 40 ? "…" : ""}`,
      slot: SLOT,
      body: { type: "text", prompt },
    });
    toast("Generating in background", { description: "Switch tabs anytime — we'll ping you." });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      generate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold tracking-tight">Text Generator</h2>
        <span className="ml-2 text-xs text-muted-foreground">Runs in background — switch tabs anytime</span>
      </div>

      <div className="rounded-xl border border-border bg-[hsl(232_50%_5%)/0.7] p-1">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={onKey}
          placeholder="What do you want to write?"
          className="min-h-[180px] resize-none border-0 bg-transparent text-base focus-visible:ring-0"
        />
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <span className="text-xs text-muted-foreground">Ctrl+Enter to generate</span>
          <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating…</> : <><Sparkles className="h-4 w-4" />Generate</>}
          </Button>
        </div>
      </div>

      {output && (
        <div className="rounded-xl border border-border bg-secondary/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Output</span>
            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}><Copy className="h-3.5 w-3.5" />Copy</Button>
          </div>
          <pre className="whitespace-pre-wrap break-words font-sans text-sm text-foreground">{output}</pre>
        </div>
      )}
    </div>
  );
};

export default TextGenerator;
