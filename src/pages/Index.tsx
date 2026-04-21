import { useState } from "react";
import MoonScene from "@/components/MoonScene";
import CodeGenerator from "@/components/generators/CodeGenerator";
import TextGenerator from "@/components/generators/TextGenerator";
import ImageGenerator from "@/components/generators/ImageGenerator";
import PromptLibrary from "@/components/generators/PromptLibrary";
import JobsPanel from "@/components/JobsPanel";
import { Code2, FileText, Image as ImageIcon, BookOpen, Sparkles } from "lucide-react";
import type { PromptCategory } from "@/lib/promptLibrary";

type Tab = "code" | "text" | "image" | "library";

const tabs: { id: Tab; label: string; Icon: any }[] = [
  { id: "code", label: "Code", Icon: Code2 },
  { id: "text", label: "Text", Icon: FileText },
  { id: "image", label: "Image", Icon: ImageIcon },
  { id: "library", label: "Prompt Library", Icon: BookOpen },
];

const Index = () => {
  const [tab, setTab] = useState<Tab>("code");

  // Lifted prompt state per category so library prompts can populate them
  const [textPrompt, setTextPrompt] = useState("");
  const [codePrompt, setCodePrompt] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");

  const usePrompt = (cat: PromptCategory, p: string) => {
    if (cat === "text") { setTextPrompt(p); setTab("text"); }
    else if (cat === "code") { setCodePrompt(p); setTab("code"); }
    else { setImagePrompt(p); setTab("image"); }
  };

  return (
    <>
      <MoonScene />
      <main className="relative min-h-screen px-4 py-8 md:px-8">
        {/* Hero */}
        <header className="mx-auto mb-8 max-w-5xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Kainos Gen
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-5xl">
            <span className="text-gradient-aurora">Kainos</span>
            <span className="text-foreground"> Gen</span>
          </h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground md:text-base">
            Generate text, code, and images under a midnight sky.
          </p>
        </header>

        {/* Tab bar */}
        <nav className="mx-auto mb-6 flex max-w-5xl items-center justify-between gap-3">
          <div className="glass-panel inline-flex flex-wrap gap-1 rounded-xl p-1.5">
            {tabs.map(({ id, label, Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${active
                    ? "bg-primary/20 text-primary shadow-[0_0_20px_hsl(250_85%_70%/0.25)]"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
          <JobsPanel />
        </nav>

        {/* Panel */}
        <section className="mx-auto max-w-5xl">
          <div className="glass-panel rounded-2xl p-6 md:p-8">
            {tab === "code" && <CodeGenerator prompt={codePrompt} setPrompt={setCodePrompt} />}
            {tab === "text" && <TextGenerator prompt={textPrompt} setPrompt={setTextPrompt} />}
            {tab === "image" && <ImageGenerator prompt={imagePrompt} setPrompt={setImagePrompt} />}
            {tab === "library" && <PromptLibrary onUse={usePrompt} />}
          </div>
        </section>

        <footer className="mx-auto mt-10 max-w-5xl text-center text-xs text-muted-foreground">
          Kainos Gen
        </footer>
      </main>
    </>
  );
};

export default Index;
