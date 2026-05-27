import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, Globe, Pencil, Loader2, Check, AlertCircle, Sparkles, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { digitalTwinService } from "@/services/api.service";
import { DigitalTwinProfile } from "@/types/digitalTwin";

interface Step0UploadProps {
  /** Called when user is ready to proceed (with extracted profile if any) OR chose to skip. */
  onComplete: (extracted: Partial<DigitalTwinProfile> | null) => void;
}

type SourceState = "idle" | "uploading" | "processing" | "done" | "error";

interface SourceTracker {
  state: SourceState;
  progress: number;
  stage: string;
  error: string | null;
}

const STAGE_LABELS: Record<string, string> = {
  uploading: "Uploading",
  queued: "Queued",
  extracting: "Reading the document",
  sectioning: "Organizing sections",
  crawling: "Crawling your site",
  chunking: "Breaking it down",
  embedding: "Teaching the AI",
  indexing: "Building the index",
  graph: "Connecting the dots",
  profile_extract: "Extracting your profile",
  done: "Ready",
};

const POLL_INTERVAL_MS = 5000;
const POLL_MAX_INTERVAL_MS = 20000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes per source

const initialTracker: SourceTracker = { state: "idle", progress: 0, stage: "", error: null };

export const Step0Upload = ({ onComplete }: Step0UploadProps) => {
  const [resume, setResume] = useState<SourceTracker>(initialTracker);
  const [website, setWebsite] = useState<SourceTracker>(initialTracker);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteInputOpen, setWebsiteInputOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelled = useRef(false);

  useEffect(() => () => { cancelled.current = true; }, []);

  const pollJob = async (jobId: string, setTracker: (t: SourceTracker) => void) => {
    const startedAt = Date.now();
    let delayMs = POLL_INTERVAL_MS;
    console.debug(`[Step0Upload] polling started for job=${jobId}`);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (cancelled.current) {
        console.debug(`[Step0Upload] polling stopped on unmount for job=${jobId}`);
        return null;
      }
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        console.debug(`[Step0Upload] polling timed out for job=${jobId}`);
        throw new Error("Taking too long — please try again or skip for now.");
      }
      try {
        const res = await digitalTwinService.jobStatus(jobId);
        const job = res?.data;
        if (job) {
          console.debug(
            `[Step0Upload] job=${jobId} status=${job.status} stage=${job.stage} progress=${job.progress_pct ?? 0}`
          );
          setTracker({
            state: "processing",
            progress: job.progress_pct || 0,
            stage: job.stage || "running",
            error: null,
          });
          delayMs = POLL_INTERVAL_MS;
          if (job.status === "done" || job.status === "completed") {
            console.debug(`[Step0Upload] polling completed for job=${jobId}`);
            return true;
          }
          if (job.status === "failed" || job.status === "cancelled") {
            console.debug(`[Step0Upload] polling hit terminal failure for job=${jobId}`);
            throw new Error(job.error || "Ingestion failed");
          }
        }
      } catch (err: any) {
        if (err?.response?.status === 429) {
          delayMs = Math.min(delayMs * 2, POLL_MAX_INTERVAL_MS);
          console.debug(`[Step0Upload] polling backoff for job=${jobId} nextDelay=${delayMs}`);
        } else {
          console.debug(`[Step0Upload] polling failed for job=${jobId}: ${err?.message || err}`);
          throw err;
        }
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  };

  const handleResume = async (file: File) => {
    setResume({ state: "uploading", progress: 5, stage: "uploading", error: null });
    try {
      const ack = await digitalTwinService.ingestResume(file);
      if (!ack?.jobId) throw new Error("Upload accepted but no job id returned.");
      await pollJob(ack.jobId, setResume);
      setResume({ state: "done", progress: 100, stage: "done", error: null });
      toast.success("Resume processed!", { description: "Profile extracted — add a website too or continue." });
    } catch (err: any) {
      console.error(err);
      setResume({ state: "error", progress: 0, stage: "", error: err?.response?.data?.message || err?.message || "Something went wrong." });
    }
  };

  const handleWebsite = async () => {
    const url = websiteUrl.trim();
    if (!url) {
      setWebsite({ ...website, error: "Enter a website URL first." });
      return;
    }
    setWebsite({ state: "processing", progress: 5, stage: "crawling", error: null });
    try {
      const ack = await digitalTwinService.ingestWebsite({ url });
      if (!ack?.jobId) throw new Error("Crawl accepted but no job id returned.");
      await pollJob(ack.jobId, setWebsite);
      setWebsite({ state: "done", progress: 100, stage: "done", error: null });
      setWebsiteInputOpen(false);
      toast.success("Website indexed!", { description: "Profile enriched from your site." });
    } catch (err: any) {
      console.error(err);
      setWebsite({ state: "error", progress: 0, stage: "", error: err?.response?.data?.message || err?.message || "Something went wrong." });
    }
  };

  const fetchAndContinue = async () => {
    setFinalizing(true);
    try {
      // Fetch the merged extracted profile + the current twin data, prefer
      // extracted fields (which were filled by Claude) over Mongo placeholders.
      const twinRes = await digitalTwinService.get();
      const twin = twinRes?.data;

      let extracted: any = {};
      try {
        const profRes = await digitalTwinService.extractedProfile();
        extracted = profRes?.data?.profile || {};
      } catch {
        // ignore — fall back to twin
      }

      const merged = mergeProfiles(
        twin ? stripPlaceholders(twin) : {},
        extracted
      );
      onComplete(merged);
    } catch (err) {
      console.error(err);
      onComplete(null);
    }
  };

  const anyDone = resume.state === "done" || website.state === "done";
  const anyProcessing = resume.state === "processing" || resume.state === "uploading" ||
                        website.state === "processing" || website.state === "uploading";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-cyan-500 to-teal-400 rounded-2xl shadow-lg mb-4">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
          Let's give your twin a head start
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Add a resume, a website URL, or both — we'll auto-fill the rest of the form. Everything stays editable.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {/* RESUME CARD */}
        <SourceCard
          icon={<FileText className="w-6 h-6 text-cyan-600" />}
          iconBg="bg-cyan-50"
          title="Upload Resume"
          subtitle="PDF, DOCX, or TXT — up to 15 MB"
          tracker={resume}
          onClick={() => {
            if (resume.state === "idle" || resume.state === "error") fileInputRef.current?.click();
          }}
          onReset={() => setResume(initialTracker)}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleResume(f);
              e.target.value = "";
            }}
          />
        </SourceCard>

        {/* WEBSITE CARD */}
        <SourceCard
          icon={<Globe className="w-6 h-6 text-teal-600" />}
          iconBg="bg-teal-50"
          title="Paste Website URL"
          subtitle="Portfolio, LinkedIn, personal site"
          tracker={website}
          onClick={() => {
            if (website.state === "idle" || website.state === "error") setWebsiteInputOpen((v) => !v);
          }}
          onReset={() => { setWebsite(initialTracker); setWebsiteInputOpen(false); }}
        />

        {/* MANUAL CARD */}
        <Card
          className="p-6 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-2 border-slate-200 hover:border-slate-400"
          onClick={() => !anyProcessing && onComplete(null)}
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-50 rounded-xl mb-3">
              <Pencil className="w-6 h-6 text-slate-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Fill Manually</h3>
            <p className="text-xs text-slate-500">I'll type everything myself</p>
          </div>
        </Card>
      </div>

      {/* Inline website URL input (appears when the website card is clicked). */}
      {websiteInputOpen && website.state !== "done" && (
        <div className="max-w-xl mx-auto flex gap-2 animate-in fade-in duration-300">
          <Input
            placeholder="https://yourwebsite.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleWebsite(); }}
            className="flex-1"
            disabled={website.state === "processing"}
          />
          <Button onClick={handleWebsite} disabled={website.state === "processing"}>
            <Upload className="w-4 h-4 mr-2" />
            Crawl
          </Button>
        </div>
      )}

      {/* Continue / skip footer */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <Button
          size="lg"
          className="px-8"
          disabled={anyProcessing || finalizing}
          onClick={() => (anyDone ? fetchAndContinue() : onComplete(null))}
        >
          {finalizing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading your profile…</>
          ) : anyDone ? (
            <>Continue with auto-filled form <Check className="w-4 h-4 ml-2" /></>
          ) : (
            <>Skip and fill manually</>
          )}
        </Button>
        <p className="text-xs text-slate-500">
          Your data stays private and is only used to power your twin.
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Per-source card with its own state badge + progress bar.
// ─────────────────────────────────────────────────────────────────────────────
interface SourceCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  tracker: SourceTracker;
  onClick: () => void;
  onReset: () => void;
  children?: React.ReactNode;
}

const SourceCard = ({ icon, iconBg, title, subtitle, tracker, onClick, onReset, children }: SourceCardProps) => {
  const { state, progress, stage, error } = tracker;
  const ring =
    state === "done" ? "border-emerald-500 ring-2 ring-emerald-200" :
    state === "error" ? "border-rose-400" :
    state === "processing" || state === "uploading" ? "border-cyan-500 ring-2 ring-cyan-200" :
    "border-slate-200 hover:border-cyan-300";

  const clickable = state === "idle" || state === "error";

  return (
    <Card
      className={`p-6 transition-all ${clickable ? "cursor-pointer hover:shadow-lg hover:-translate-y-1" : ""} border-2 ${ring}`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-12 h-12 ${iconBg} rounded-xl mb-3 relative`}>
          {state === "done" ? (
            <Check className="w-6 h-6 text-emerald-600" />
          ) : state === "processing" || state === "uploading" ? (
            <Loader2 className="w-6 h-6 text-cyan-600 animate-spin" />
          ) : (
            icon
          )}
        </div>
        <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 mb-3">{subtitle}</p>

        {state === "processing" || state === "uploading" ? (
          <div className="mt-2">
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500"
                style={{ width: `${Math.max(5, progress)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{STAGE_LABELS[stage] || stage}</p>
          </div>
        ) : state === "done" ? (
          <div className="flex items-center justify-center gap-2 text-emerald-700 text-sm font-medium">
            <span>Imported</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="text-xs text-slate-500 underline hover:text-slate-700"
            >
              redo
            </button>
          </div>
        ) : state === "error" ? (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-rose-600 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span className="line-clamp-2">{error}</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="text-xs text-slate-500 underline hover:text-slate-700"
            >
              try again
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </Card>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function isEmpty(v: any): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
}

function stripPlaceholders(twin: any): Partial<DigitalTwinProfile> {
  const out = { ...twin };
  if (out.identity?.name === "Draft Twin") out.identity = { ...out.identity, name: "" };
  if (out.identity?.role === "Draft") out.identity = { ...out.identity, role: "" };
  if (out.identity?.bio?.startsWith("This twin is being created")) {
    out.identity = { ...out.identity, bio: "" };
  }
  delete out._id;
  delete out.user;
  delete out.isActive;
  delete out.createdAt;
  delete out.updatedAt;
  delete out.lastUpdated;
  delete out.aiReadyEmailedAt;
  return out;
}

function mergeProfiles(
  twin: Partial<DigitalTwinProfile>,
  extracted: Partial<DigitalTwinProfile>
): Partial<DigitalTwinProfile> {
  const merged: Partial<DigitalTwinProfile> = { ...twin };

  for (const [key, value] of Object.entries(extracted)) {
    if (Array.isArray(value)) {
      (merged as any)[key] = value.length ? value : (merged as any)[key];
      continue;
    }

    if (value && typeof value === "object") {
      (merged as any)[key] = {
        ...((merged as any)[key] || {}),
        ...value,
      };
      continue;
    }

    if (!isEmpty(value)) {
      (merged as any)[key] = value;
    }
  }

  return merged;
}
