import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Code2, Copy, Loader2, Sparkles, ArrowRightLeft } from "lucide-react";
import { programmingLanguages } from "@/lib/promptLibrary";
import { useJobs } from "@/context/JobsContext";

interface Props {
  prompt: string;
  setPrompt: (s: string) => void;
}

const stripFences = (s: string) => {
  if (!s) return "";
  const m = s.match(/```[a-zA-Z0-9+#-]*\n([\s\S]*?)```/);
  return m ? m[1].trim() : s.trim();
};

const SLOT_GEN = "code:generate";
const SLOT_CONV = "code:convert";

const CodeGenerator = ({ prompt, setPrompt }: Props) => {
  const { runJob, isRunning, results } = useJobs();
  const [language, setLanguage] = useState("JavaScript");

  const [mode, setMode] = useState<"generate" | "convert">("generate");
  const [sourceLang, setSourceLang] = useState("JavaScript");
  const [targetLang, setTargetLang] = useState("Python");
  const [sourceCode, setSourceCode] = useState("");

  const loading = isRunning(SLOT_GEN);
  const convLoading = isRunning(SLOT_CONV);
  const output = stripFences(results[SLOT_GEN]?.text ?? "");
  const convOutput = stripFences(results[SLOT_CONV]?.text ?? "");

  const generate = () => {
    if (!prompt.trim()) return toast.error("Enter a prompt");
    runJob({
      kind: "code",
      label: `${language}: ${prompt.slice(0, 30)}${prompt.length > 30 ? "…" : ""}`,
      slot: SLOT_GEN,
      body: { type: "code", prompt, language },
    });
    toast("Generating in background");
  };

  const convert = () => {
    if (!sourceCode.trim()) return toast.error("Paste source code");
    if (sourceLang === targetLang) return toast.error("Pick a different target language");
    runJob({
      kind: "convert",
      label: `${sourceLang} → ${targetLang}`,
      slot: SLOT_CONV,
      body: { type: "code", prompt: "", sourceCode, sourceLanguage: sourceLang, language: targetLang },
    });
    toast("Converting in background");
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      generate();
    }
  };

  const copy = (s: string) => {
    navigator.clipboard.writeText(s);
    toast.success("Copied");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Code2 className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold tracking-tight">Code Generator</h2>
        <span className="ml-2 text-xs text-muted-foreground">Runs in background — switch tabs anytime</span>
      </div>

      <div className="inline-flex rounded-lg border border-border bg-secondary/50 p-1">
        <button
          onClick={() => setMode("generate")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${mode === "generate" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Generate
        </button>
        <button
          onClick={() => setMode("convert")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${mode === "convert" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          Convert
        </button>
      </div>

      {mode === "generate" ? (
        <>
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Language:</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-44 bg-secondary/60"><SelectValue /></SelectTrigger>
              <SelectContent>
                {programmingLanguages.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-border bg-[hsl(232_50%_5%)/0.7] p-1">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={onKey}
              placeholder="What do you want to build?"
              className="min-h-[160px] resize-none border-0 bg-transparent text-base focus-visible:ring-0"
            />
            <div className="flex items-center justify-between px-3 pb-2 pt-1">
              <span className="text-xs text-muted-foreground">Ctrl+Enter to generate</span>
              <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating…</> : <><Sparkles className="h-4 w-4" />Generate</>}
              </Button>
            </div>
          </div>

          {output && (
            <div className="rounded-xl border border-border bg-[hsl(232_50%_5%)] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-accent">{language}</span>
                <Button variant="ghost" size="sm" onClick={() => copy(output)}><Copy className="h-3.5 w-3.5" />Copy</Button>
              </div>
              <pre className="overflow-x-auto text-xs leading-relaxed text-foreground"><code>{output}</code></pre>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">From</label>
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger className="bg-secondary/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {programmingLanguages.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="hidden pb-2 text-muted-foreground sm:block">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">To</label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger className="bg-secondary/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {programmingLanguages.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-[hsl(232_50%_5%)/0.7] p-1">
            <Textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder={`Paste your ${sourceLang} code here...`}
              className="min-h-[180px] resize-none border-0 bg-transparent font-mono text-xs focus-visible:ring-0"
            />
            <div className="flex justify-end px-3 pb-2 pt-1">
              <Button onClick={convert} disabled={convLoading} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                {convLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Converting…</> : <><ArrowRightLeft className="h-4 w-4" />Convert</>}
              </Button>
            </div>
          </div>

          {convOutput && (
            <div className="rounded-xl border border-border bg-[hsl(232_50%_5%)] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-accent">{targetLang}</span>
                <Button variant="ghost" size="sm" onClick={() => copy(convOutput)}><Copy className="h-3.5 w-3.5" />Copy</Button>
              </div>
              <pre className="overflow-x-auto text-xs leading-relaxed text-foreground"><code>{convOutput}</code></pre>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CodeGenerator;
