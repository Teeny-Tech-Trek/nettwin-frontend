// src/components/SourcesPanel.tsx
//
// "Sources" panel — feeds the AI engine with unstructured data the wizard
// form can't capture: the user's resume file and a website URL to crawl.
// Plus a live status block so the user can see when each source is indexed
// and ready for the public chatbot.
//
// Mount this anywhere a user has already created a twin (typically the
// dashboard). The component is fully self-contained — it queries
// `digitalTwinService.ingestionStatus()` on mount and polls every 4s while
// any job is still running.
//
// It deliberately does NOT take the twin doc as a prop. The backend
// scopes everything by the authenticated user's twin, so the frontend
// just needs to be logged in.

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Globe, RefreshCw, CheckCircle2, Loader2, AlertCircle, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { digitalTwinService } from "@/services/api.service";

type SourceState = "empty" | "queued" | "running" | "ready" | "failed" | string;

interface SourceBlock {
  state: SourceState;
  chunks?: number;
  updated_at?: string;
  pages_crawled?: number;
}

interface IngestionStatus {
  tenant_id: string;
  overall_status: "empty" | "partial" | "ready";
  resume?: SourceBlock;
  website?: SourceBlock;
  profile?: SourceBlock;
  ready_sources: string[];
}

interface ActiveJob {
  jobId: string;
  kind: "resume" | "website" | "profile";
  stage: string;
  progress_pct: number;
}

const POLL_INTERVAL_MS = 4_000;
const ACCEPTED_RESUME_TYPES = ".pdf,.docx,.doc,.txt,.md";

const stateLabel = (state?: SourceState): string => {
  if (!state) return "Not uploaded";
  if (state === "ready") return "Ready";
  if (state === "running" || state === "queued") return "Indexing…";
  if (state === "failed") return "Failed";
  return String(state);
};

const stateColor = (state?: SourceState): string => {
  if (state === "ready") return "text-teal-400";
  if (state === "failed") return "text-red-400";
  if (state === "running" || state === "queued") return "text-cyan-300";
  return "text-slate-500";
};

const StatusIcon = ({ state }: { state?: SourceState }) => {
  if (state === "ready") return <CheckCircle2 className="w-4 h-4 text-teal-400" />;
  if (state === "failed") return <AlertCircle className="w-4 h-4 text-red-400" />;
  if (state === "running" || state === "queued")
    return <Loader2 className="w-4 h-4 text-cyan-300 animate-spin" />;
  return <FileText className="w-4 h-4 text-slate-500" />;
};

export const SourcesPanel = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<IngestionStatus | null>(null);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isQueueingWebsite, setIsQueueingWebsite] = useState(false);
  const [isResyncing, setIsResyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ────────────── status fetch + polling loop ──────────────
  // The `notice` field is set by the backend the FIRST time a status
  // poll observes ready→ and successfully sends the welcome email.
  // We surface it as a one-shot toast.
  const fetchStatus = useCallback(async () => {
    try {
      const result = await digitalTwinService.ingestionStatus();
      setStatus(result.data);
      if (result.notice === "sent") {
        toast({
          title: "Your twin is ready",
          description: "We sent you an email with the details. Visitors can scan your QR now.",
        });
      }
      return result.data;
    } catch (error: any) {
      // 404 just means the twin doesn't exist yet or the AI backend hasn't
      // seen this tenant — both fine, render the empty state.
      if (error?.response?.status === 404) {
        setStatus(null);
        return null;
      }
      console.warn("[SourcesPanel] status fetch failed:", error?.message);
      return null;
    } finally {
      setIsLoadingStatus(false);
    }
  }, [toast]);

  // Auto-poll status while the twin is still indexing — covers the case
  // where the user lands on the dashboard immediately after wizard save
  // (profile sync is queued and runs ~10-30s later). Without this the
  // panel would just show "Empty" until the user did something.
  useEffect(() => {
    if (!status) return;
    if (status.overall_status === "ready") return;
    const interval = window.setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [status?.overall_status, fetchStatus]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Live ref so the polling closure always sees the *current* set of jobs.
  // Without this, a second job added while the first is still running gets
  // dropped because the original setInterval closes over the original
  // (single-item) activeJobs array.
  const activeJobsRef = useRef<ActiveJob[]>([]);
  useEffect(() => { activeJobsRef.current = activeJobs; }, [activeJobs]);

  // Poll the AI engine while ANY job we kicked off is still running.
  // The interval lifecycle is driven by whether there are jobs at all
  // (length transition 0 → 1 starts it, 1 → 0 stops it), not by the
  // contents of the array — we read the live contents via the ref.
  const hasActiveJobs = activeJobs.length > 0;
  useEffect(() => {
    if (!hasActiveJobs) return;

    const interval = window.setInterval(async () => {
      const jobs = activeJobsRef.current;
      if (jobs.length === 0) return; // race-window guard

      const updated = await Promise.all(
        jobs.map(async (job) => {
          try {
            const res = await digitalTwinService.jobStatus(job.jobId);
            return { job, snapshot: res.data };
          } catch {
            return { job, snapshot: null };
          }
        })
      );

      let anyFinished = false;
      const stillRunning: ActiveJob[] = [];
      updated.forEach(({ job, snapshot }) => {
        if (!snapshot) {
          stillRunning.push(job);
          return;
        }
        if (snapshot.status === "queued" || snapshot.status === "running") {
          stillRunning.push({
            jobId: job.jobId,
            kind: job.kind,
            stage: snapshot.stage,
            progress_pct: snapshot.progress_pct,
          });
        } else {
          anyFinished = true;
          if (snapshot.status === "done") {
            toast({
              title: `${labelForKind(job.kind)} indexed`,
              description: "Your chatbot will use it on the next message.",
            });
          } else if (snapshot.status === "failed") {
            toast({
              title: `${labelForKind(job.kind)} ingestion failed`,
              description: snapshot.error || "Try again in a moment.",
              variant: "destructive",
            });
          }
        }
      });

      // Merge: keep any NEW jobs that were enqueued during this tick.
      const seenIds = new Set(updated.map(({ job }) => job.jobId));
      const newlyAdded = activeJobsRef.current.filter((j) => !seenIds.has(j.jobId));
      setActiveJobs([...stillRunning, ...newlyAdded]);
      if (anyFinished) fetchStatus();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [hasActiveJobs, fetchStatus, toast]);

  // ────────────── handlers ──────────────
  const handleResumePick = () => fileInputRef.current?.click();

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Resume must be 15 MB or smaller.",
        variant: "destructive",
      });
      return;
    }
    setIsUploadingResume(true);
    try {
      const result = await digitalTwinService.ingestResume(file);
      toast({
        title: "Resume queued",
        description: "We're extracting and indexing it now (~1-2 minutes).",
      });
      setActiveJobs((prev) => [
        ...prev,
        { jobId: result.jobId, kind: "resume", stage: "queued", progress_pct: 0 },
      ]);
      fetchStatus();
    } catch (error: any) {
      toast({
        title: "Resume upload failed",
        description: error?.response?.data?.message || error?.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleWebsiteSubmit = async () => {
    if (!websiteUrl.trim()) return;
    setIsQueueingWebsite(true);
    try {
      const result = await digitalTwinService.ingestWebsite({ url: websiteUrl.trim() });
      toast({
        title: "Website queued",
        description: `Crawling ${result.url} — this can take a few minutes.`,
      });
      setActiveJobs((prev) => [
        ...prev,
        { jobId: result.jobId, kind: "website", stage: "queued", progress_pct: 0 },
      ]);
      setWebsiteUrl("");
      fetchStatus();
    } catch (error: any) {
      toast({
        title: "Website ingestion failed",
        description: error?.response?.data?.message || error?.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setIsQueueingWebsite(false);
    }
  };

  const handleResync = async () => {
    setIsResyncing(true);
    try {
      const result = await digitalTwinService.resync();
      toast({
        title: "Profile re-sync queued",
        description: "The AI engine will rebuild your chatbot's index.",
      });
      setActiveJobs((prev) => [
        ...prev,
        { jobId: result.jobId, kind: "profile", stage: "queued", progress_pct: 0 },
      ]);
      fetchStatus();
    } catch (error: any) {
      toast({
        title: "Re-sync failed",
        description: error?.response?.data?.message || error?.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setIsResyncing(false);
    }
  };

  // ────────────── render ──────────────
  return (
    <Card className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-cyan-500/20 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white">AI Knowledge Sources</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Feed your chatbot with your resume and website so it answers from real context, not just the form.
          </p>
        </div>
        {status && (
          <span
            className={`text-xs font-medium rounded-full px-3 py-1 border ${
              status.overall_status === "ready"
                ? "border-teal-500/30 bg-teal-500/10 text-teal-300"
                : status.overall_status === "partial"
                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                : "border-slate-500/30 bg-slate-500/10 text-slate-300"
            }`}
          >
            {status.overall_status === "ready"
              ? "Ready"
              : status.overall_status === "partial"
              ? "Partial"
              : "Empty"}
          </span>
        )}
      </div>

      {/* Generating banner — shown while the AI engine is still indexing.
          Surfaces the email-on-completion promise the user was told about
          right after wizard save, so the dashboard doesn't feel silent. */}
      {status && status.overall_status !== "ready" && (
        <div className="mb-5 p-3 sm:p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-start gap-3">
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 animate-spin flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-cyan-100">
            <div className="font-semibold mb-0.5 text-white">Generating your AI twin…</div>
            <div className="text-cyan-200/90 flex items-center gap-1.5 flex-wrap">
              <Mail className="w-3.5 h-3.5" />
              We'll email you the moment it's ready. You can keep adding sources below in the meantime.
            </div>
          </div>
        </div>
      )}

      {/* Source rows */}
      <div className="space-y-3">
        <SourceRow
          icon={<FileText className="w-4 h-4 text-cyan-300" />}
          title="Resume"
          subtitle={status?.resume ? `${status.resume.chunks ?? 0} chunks` : "PDF or DOCX"}
          state={status?.resume?.state}
        />
        <SourceRow
          icon={<Globe className="w-4 h-4 text-cyan-300" />}
          title="Website"
          subtitle={
            status?.website
              ? `${status.website.pages_crawled ?? 0} pages • ${status.website.chunks ?? 0} chunks`
              : "Personal or business site"
          }
          state={status?.website?.state}
        />
        <SourceRow
          icon={<RefreshCw className="w-4 h-4 text-cyan-300" />}
          title="Structured profile"
          subtitle={
            status?.profile
              ? `${status.profile.chunks ?? 0} chunks from the wizard form`
              : "From the wizard form"
          }
          state={status?.profile?.state}
        />
      </div>

      {/* Active jobs */}
      {activeJobs.length > 0 && (
        <div className="mt-5 space-y-3">
          {activeJobs.map((job) => (
            <div key={job.jobId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>
                  {labelForKind(job.kind)} — {job.stage}
                </span>
                <span>{job.progress_pct}%</span>
              </div>
              <Progress value={job.progress_pct} className="h-1.5 bg-white/10" />
            </div>
          ))}
        </div>
      )}

      {/* Upload controls */}
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept={ACCEPTED_RESUME_TYPES}
            onChange={handleResumeUpload}
            className="hidden"
          />
          <Button
            type="button"
            onClick={handleResumePick}
            disabled={isUploadingResume}
            className="w-full justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-600 hover:to-teal-500 border-0 text-white font-semibold"
          >
            {isUploadingResume ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload Resume
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://your-website.com"
            className="bg-white/5 border-cyan-500/30 text-white placeholder:text-slate-500 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && websiteUrl.trim()) handleWebsiteSubmit();
            }}
          />
          <Button
            type="button"
            onClick={handleWebsiteSubmit}
            disabled={!websiteUrl.trim() || isQueueingWebsite}
            variant="outline"
            className="border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10 rounded-xl"
          >
            {isQueueingWebsite ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crawl"}
          </Button>
        </div>
      </div>

      {/* Resync — small, secondary */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {isLoadingStatus ? "Loading status…" : status ? `Tenant: ${status.tenant_id}` : ""}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResync}
          disabled={isResyncing}
          className="text-cyan-300 hover:text-cyan-100 hover:bg-white/5"
        >
          {isResyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <RefreshCw className="w-3.5 h-3.5 mr-2" />}
          Re-sync profile
        </Button>
      </div>
    </Card>
  );
};

const SourceRow = ({
  icon,
  title,
  subtitle,
  state,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  state?: SourceState;
}) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-cyan-500/10">
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <div className="text-sm text-white font-medium">{title}</div>
        <div className="text-xs text-slate-400">{subtitle}</div>
      </div>
    </div>
    <div className={`flex items-center gap-1.5 text-xs font-medium ${stateColor(state)}`}>
      <StatusIcon state={state} />
      <span>{stateLabel(state)}</span>
    </div>
  </div>
);

const labelForKind = (kind: "resume" | "website" | "profile") =>
  kind === "resume" ? "Resume" : kind === "website" ? "Website" : "Profile";

export default SourcesPanel;
