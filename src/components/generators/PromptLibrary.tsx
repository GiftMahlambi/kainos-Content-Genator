import { useMemo, useState } from "react";
import { promptLibrary, type PromptCategory, type PromptTemplate } from "@/lib/promptLibrary";
import { BookOpen, Search, Pencil, Play, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  onUse: (category: PromptCategory, prompt: string) => void;
}

const labels: Record<PromptCategory, string> = {
  text: "Text",
  code: "Code",
  image: "Image",
};

const ALL: PromptCategory[] = ["text", "code", "image"];

const PromptLibrary = ({ onUse }: Props) => {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<PromptCategory | "all">("all");
  const [editing, setEditing] = useState<{ cat: PromptCategory; tpl: PromptTemplate } | null>(null);
  const [draft, setDraft] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out: Record<PromptCategory, PromptTemplate[]> = { text: [], code: [], image: [] };
    for (const cat of ALL) {
      if (activeCat !== "all" && activeCat !== cat) continue;
      out[cat] = promptLibrary[cat].filter((p) => {
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.prompt.toLowerCase().includes(q) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
        );
      });
    }
    return out;
  }, [query, activeCat]);

  const totalCount = ALL.reduce((n, c) => n + filtered[c].length, 0);

  const openEdit = (cat: PromptCategory, tpl: PromptTemplate) => {
    setEditing({ cat, tpl });
    setDraft(tpl.prompt);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <BookOpen className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold tracking-tight">Prompt Library</h2>
        <span className="ml-auto text-xs text-muted-foreground">{totalCount} prompt{totalCount === 1 ? "" : "s"}</span>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, content or tag (social, marketing, anime, sql…)"
            className="bg-secondary/40 pl-9"
          />
        </div>
        <div className="inline-flex rounded-lg border border-border bg-secondary/40 p-1">
          {(["all", ...ALL] as const).map((c) => {
            const active = activeCat === c;
            return (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
                  active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c === "all" ? "All" : labels[c]}
              </button>
            );
          })}
        </div>
      </div>

      {totalCount === 0 && (
        <div className="rounded-xl border border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
          No prompts match "{query}". Try a different keyword.
        </div>
      )}

      {ALL.map((cat) =>
        filtered[cat].length === 0 ? null : (
          <section key={cat} className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {labels[cat]} prompts
            </h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filtered[cat].map((p) => (
                <div
                  key={p.title}
                  className="group flex flex-col rounded-xl border border-border bg-secondary/40 p-4 transition hover:border-primary/50"
                >
                  <div className="text-sm font-medium text-foreground">{p.title}</div>
                  <div className="mt-1.5 line-clamp-3 flex-1 text-xs text-muted-foreground">{p.prompt}</div>
                  {p.tags && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <span key={t} className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onUse(cat, p.prompt)}
                      className="h-7 flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    >
                      <Play className="h-3 w-3" /> Use
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openEdit(cat, p)}
                      className="h-7"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur"
          onClick={() => setEditing(null)}
        >
          <div
            className="glass-panel w-full max-w-xl space-y-4 rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{labels[editing.cat]} prompt</div>
                <h3 className="text-lg font-semibold text-foreground">{editing.tpl.title}</h3>
              </div>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-h-[160px] bg-secondary/40"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              <Button
                onClick={() => {
                  onUse(editing.cat, draft);
                  setEditing(null);
                }}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                <Play className="h-4 w-4" /> Use in {labels[editing.cat]}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptLibrary;
