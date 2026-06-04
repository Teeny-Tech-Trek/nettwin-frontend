// src/components/ProfileMatchingLeads.tsx
//
// Owner dashboard section for "AI Profile Matching & Opportunity Analysis".
// Self-contained: fetches its own data via profileMatchService so it can be
// dropped onto the dashboard without threading props through the large
// presentational DashboardView. Shows the submitted leads + the AI analysis
// (NO scores/percentages — business value only).
import { useEffect, useState } from "react";
import { Sparkles, ExternalLink, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { profileMatchService } from "@/services/api.service";
import { IMAGE_BASE_URL } from "@/axios.config";

interface PMLead {
  _id: string;
  name: string;
  email: string;
  resumeFileUrl?: string | null;
  resumeFileName?: string | null;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  status: string;
  processingStatus: string;
  createdAt: string;
  lastAnalyzedAt?: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  contacted: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  qualified: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  closed: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

const PROC_STYLES: Record<string, string> = {
  queued: "text-amber-300",
  processing: "text-cyan-300",
  analyzed: "text-emerald-300",
  failed: "text-red-300",
};

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" }) : "—";

const resumeHref = (url?: string | null) =>
  url ? (url.startsWith("http") ? url : `${IMAGE_BASE_URL}${url}`) : null;

export default function ProfileMatchingLeads({ twinId }: { twinId: string }) {
  const [leads, setLeads] = useState<PMLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await profileMatchService.getByTwinId(twinId);
        if (!cancelled) setLeads(res?.data || []);
      } catch {
        if (!cancelled) setLeads([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [twinId]);

  const toggle = async (leadId: string) => {
    if (expanded === leadId) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(leadId);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await profileMatchService.getDetail(leadId);
      setDetail(res?.data || null);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const onStatusChange = async (leadId: string, status: string) => {
    try {
      await profileMatchService.updateStatus(leadId, status);
      setLeads((prev) => prev.map((l) => (l._id === leadId ? { ...l, status } : l)));
    } catch {
      /* best-effort */
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-3 sm:px-5 pb-10">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
          <Sparkles className="w-4.5 h-4.5 text-fuchsia-400" />
          <h2 className="text-white font-semibold text-base sm:text-lg">Profile Matching Leads</h2>
          <span className="ml-auto text-xs text-slate-400">{leads.length} total</span>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-400">Loading…</div>
        ) : leads.length === 0 ? (
          <div className="p-6 text-sm text-slate-400">
            No profile-analysis submissions yet. Visitors who use “Get Personalized Profile
            Analysis” on your twin page will appear here.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {leads.map((lead) => (
              <div key={lead._id}>
                <div className="grid grid-cols-12 gap-2 items-center px-5 py-3 text-sm">
                  <div className="col-span-12 sm:col-span-3 min-w-0">
                    <div className="text-white font-medium truncate">{lead.name}</div>
                    <div className="text-slate-400 text-xs truncate">{lead.email}</div>
                  </div>
                  <div className="col-span-6 sm:col-span-3 flex flex-wrap gap-2 text-xs">
                    {resumeHref(lead.resumeFileUrl) && (
                      <a href={resumeHref(lead.resumeFileUrl)!} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200">
                        <FileText className="w-3.5 h-3.5" /> Resume
                      </a>
                    )}
                    {lead.websiteUrl && (
                      <a href={lead.websiteUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-slate-300 hover:text-white">
                        <ExternalLink className="w-3.5 h-3.5" /> Website
                      </a>
                    )}
                    {lead.linkedinUrl && (
                      <a href={lead.linkedinUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#0a66c2] hover:opacity-80">
                        <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                      </a>
                    )}
                  </div>
                  <div className="col-span-3 sm:col-span-2 text-xs text-slate-400">{fmtDate(lead.createdAt)}</div>
                  <div className="col-span-3 sm:col-span-2">
                    <select
                      value={lead.status}
                      onChange={(e) => onStatusChange(lead._id, e.target.value)}
                      className={`text-[11px] px-2 py-1 rounded-full border bg-transparent ${STATUS_STYLES[lead.status] || STATUS_STYLES.new}`}
                    >
                      <option value="new">new</option>
                      <option value="contacted">contacted</option>
                      <option value="qualified">qualified</option>
                      <option value="closed">closed</option>
                    </select>
                    <div className={`text-[10px] mt-1 ${PROC_STYLES[lead.processingStatus] || "text-slate-400"}`}>
                      {lead.processingStatus}
                    </div>
                  </div>
                  <div className="col-span-12 sm:col-span-2 sm:text-right">
                    <button
                      onClick={() => toggle(lead._id)}
                      className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white"
                    >
                      {expanded === lead._id ? (
                        <>Hide <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Analysis <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </div>
                </div>

                {expanded === lead._id && (
                  <div className="px-5 pb-5 pt-1 text-sm bg-black/20">
                    {detailLoading ? (
                      <div className="text-slate-400 text-xs py-3">Loading analysis…</div>
                    ) : !detail?.analysis ? (
                      <div className="text-slate-400 text-xs py-3">
                        {lead.processingStatus === "analyzed"
                          ? "Analysis unavailable."
                          : "Analysis is still processing — check back shortly."}
                      </div>
                    ) : (
                      <AnalysisView analysis={detail.analysis} emails={detail.emails} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-[11px] uppercase tracking-wider text-fuchsia-300/80 mb-1">{title}</div>
      {children}
    </div>
  );
}

function RecList({ items }: { items: { name: string; why: string }[] }) {
  if (!items?.length) return <div className="text-slate-500 text-xs">—</div>;
  return (
    <ul className="space-y-1.5">
      {items.map((r, i) => (
        <li key={i} className="text-slate-200">
          <span className="font-medium">{r.name}</span>
          {r.why ? <span className="text-slate-400"> — {r.why}</span> : null}
        </li>
      ))}
    </ul>
  );
}

function AnalysisView({ analysis, emails }: { analysis: any; emails?: any[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 pt-2">
      <div className="sm:col-span-2">
        <Block title="Professional Summary">
          <p className="text-slate-200 leading-relaxed">{analysis.professionalSummary || "—"}</p>
        </Block>
      </div>
      <Block title="Recommended Services">
        <RecList items={analysis.recommendedServices} />
      </Block>
      <Block title="Recommended Products">
        <RecList items={analysis.recommendedProducts} />
      </Block>
      <div className="sm:col-span-2">
        <Block title="Opportunity Analysis">
          <p className="text-slate-200 leading-relaxed">{analysis.opportunityAnalysis || "—"}</p>
        </Block>
      </div>
      {analysis.businessRecommendations?.length > 0 && (
        <div className="sm:col-span-2">
          <Block title="Business Recommendations">
            <ul className="list-disc pl-5 space-y-1 text-slate-200">
              {analysis.businessRecommendations.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </Block>
        </div>
      )}
      {analysis.meetingRecommendation && (
        <div className="sm:col-span-2">
          <Block title="Meeting Recommendation">
            <p className="text-slate-200 leading-relaxed">{analysis.meetingRecommendation}</p>
          </Block>
        </div>
      )}
      {emails?.length ? (
        <div className="sm:col-span-2">
          <Block title="Email Status">
            <div className="flex flex-wrap gap-2 text-xs">
              {emails.map((e: any) => (
                <span key={e._id} className="px-2 py-0.5 rounded-full border border-white/10 text-slate-300">
                  {e.kind}: {e.status}
                </span>
              ))}
            </div>
          </Block>
        </div>
      ) : null}
    </div>
  );
}
