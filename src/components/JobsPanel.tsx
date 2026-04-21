import { useState } from "react";
import { useJobs } from "@/context/JobsContext";
import { Bell, CheckCircle2, Loader2, X, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const JobsPanel = () => {
  const { jobs, clear } = useJobs();
  const [open, setOpen] = useState(false);
  const running = jobs.filter((j) => j.status === "running").length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary/60 text-foreground hover:border-primary/50 hover:text-primary">
          <Bell className="h-4 w-4" />
          {running > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {running}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Background jobs
        </div>
        <div className="max-h-80 overflow-y-auto">
          {jobs.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              No jobs yet — kick something off!
            </div>
          )}
          {jobs.map((j) => (
            <div key={j.id} className="flex items-start gap-2 border-b border-border/60 px-3 py-2 last:border-0">
              <div className="mt-0.5">
                {j.status === "running" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {j.status === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                {j.status === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-foreground">{j.label}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {j.status === "running" ? "Running…" : j.status === "done" ? "Completed" : j.error}
                </div>
              </div>
              {j.status !== "running" && (
                <button onClick={() => clear(j.id)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default JobsPanel;
