/**
 * SuccessScreen — shown by DigitalTwinWizard after a successful creation.
 *
 * Previously this was an inline 75-line block inside the wizard component
 * that dumped a monospace persona prompt and a raw JSON blob into two
 * cards. It looked like a developer tool, not a finished SaaS product.
 *
 * Redesign goals:
 *   • Hero card with twin's avatar (initials), name, role, tagline.
 *   • Quick stats row (businesses, experiences, skills, links) — immediate
 *     proof that the wizard captured the user's input.
 *   • Three clear next-step actions: Go to Dashboard, View Live Twin,
 *     and Edit Twin (single-twin model — no "Create Another" path).
 *   • Developer payload (persona prompt + JSON) moved behind a collapsed
 *     "Advanced details" accordion so the polished view stays clean.
 *   • Framer-motion entrance staggers each section so the screen feels
 *     intentional rather than abrupt.
 *   • Breadcrumbs above the hero so the user knows where they are.
 *
 * Mobile responsiveness: every card stacks on <md, action bar wraps,
 * stats grid collapses 4→2 cols, text sizes step down.
 */

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Crown,
  Download,
  ExternalLink,
  Pencil,
  Sparkles,
  Copy,
  Briefcase,
  GraduationCap,
  Award,
  LinkIcon,
  Loader2,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { digitalTwinService } from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { DigitalTwinProfile } from '@/types/digitalTwin';

interface SuccessScreenProps {
  /** The fully-saved twin payload. Used for stats, persona generation, and JSON dump. */
  data: DigitalTwinProfile;
  /** The MongoDB _id of the saved twin — used to build the "View Live" public link. */
  twinId?: string;
  /**
   * Called when the user clicks "Edit Twin" — reopens the wizard with the
   * current data pre-filled. The wizard handles re-hydration; this prop
   * just lets the parent decide whether to reset state in place or push
   * a fresh /wizard navigation.
   */
  onEditTwin: () => void;
}

/** Extract initials for the avatar block, capped at 2 chars. */
function getInitials(name: string | undefined): string {
  if (!name) return 'DT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Build the same persona prompt the old success screen produced. Identical output. */
function generatePersona(data: DigitalTwinProfile): string {
  return `You are the net twin of ${data.identity.name}, ${data.identity.role}${
    data.businesses?.[0]?.name ? ` at ${data.businesses[0].name}` : ''
  }.

${data.identity.bio}

You understand their entire ecosystem including:
${(data.businesses || [])
  .map((b) => `- ${b.name} (${b.role}): ${b.description}`)
  .join('\n')}

Personality: ${data.personality?.traits?.join(', ') ?? ''} | ${data.personality?.tone ?? ''} tone
Leadership: ${data.personality?.leadership_style ?? ''}
Values: ${data.personality?.values?.join(', ') ?? ''}

Mission: ${data.story?.mission ?? ''}

You represent them professionally in conversations, staying authentic, strategic, and human.`;
}

type ReadyState = "indexing" | "ready" | "timeout";

export function SuccessScreen({ data, twinId, onEditTwin }: SuccessScreenProps) {
  const navigate = useNavigate();

  // Live poll of the AI-backend ingestion status so the user sees
  // "indexing → ready" without refreshing. The endpoint is also the one
  // that fires the welcome email (idempotent), so polling here is what
  // actually triggers delivery once the FastAPI worker finishes.
  const [readyState, setReadyState] = useState<ReadyState>("indexing");
  const [emailNotice, setEmailNotice] = useState<"sent" | "previously-sent" | null>(null);
  const pollingCancelled = useRef(false);

  useEffect(() => {
    pollingCancelled.current = false;
    const startedAt = Date.now();
    const POLL_EVERY = 4000;
    const TIMEOUT_MS = 5 * 60 * 1000;

    const tick = async () => {
      if (pollingCancelled.current) return;
      try {
        const res = await digitalTwinService.ingestionStatus();
        const overall = res?.data?.overall_status;
        if (overall === "ready") {
          setReadyState("ready");
          if (res?.notice === "sent" || res?.notice === "previously-sent") {
            setEmailNotice(res.notice);
          }
          return; // stop polling
        }
      } catch (err) {
        // Network blip — keep polling unless we've timed out.
        console.debug("[ready-poll] transient error", err);
      }
      if (Date.now() - startedAt > TIMEOUT_MS) {
        setReadyState("timeout");
        return;
      }
      setTimeout(tick, POLL_EVERY);
    };
    tick();
    return () => { pollingCancelled.current = true; };
  }, []);

  // Stat counts — falsy-safe in case any section came back partially populated.
  const stats = [
    { icon: Briefcase, label: 'Businesses', value: data.businesses?.length ?? 0 },
    { icon: Award, label: 'Experience', value: data.experience?.length ?? 0 },
    { icon: GraduationCap, label: 'Education', value: data.education?.length ?? 0 },
    { icon: Sparkles, label: 'Skills', value: data.skills?.list?.length ?? 0 },
  ];

  const downloadJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital-twin-${data.identity.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Profile downloaded', { description: 'JSON file saved to your device.' });
  };

  const copyPersona = async () => {
    try {
      await navigator.clipboard.writeText(generatePersona(data));
      toast.success('Persona prompt copied', {
        description: 'Paste it into your favorite AI tool.',
      });
    } catch {
      toast.error('Copy failed', { description: 'Your browser blocked clipboard access.' });
    }
  };

  // ──────────────────────────────────────────────────────────────────────
  // Animation staggering. We use a parent variant that orchestrates the
  // child entries so the layout settles top→bottom rather than all-at-once.
  // ──────────────────────────────────────────────────────────────────────
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] py-6 sm:py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumbs — small but professional. Users always know where they are. */}
        <Breadcrumb className="mb-4 sm:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/dashboard"
                  className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-600" />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-slate-400">Create Twin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-600" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-cyan-300">Complete</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 sm:space-y-8">
          {/* ────────────────── HERO CARD ────────────────── */}
          <motion.div variants={item}>
            <Card className="relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-[#132F4C] via-[#0D2137] to-[#0A1929] text-white p-6 sm:p-10">
              {/* Decorative orb behind the avatar — purely visual, doesn't capture clicks. */}
              <div
                aria-hidden
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-cyan-500/30 to-teal-400/10 blur-3xl pointer-events-none"
              />

              {/* Success badge top-right — animated tick so the moment feels rewarded. */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 rounded-full px-3 py-1 text-emerald-300 text-xs sm:text-sm font-medium"
              >
                <Check className="w-3.5 h-3.5" />
                Created
              </motion.div>

              <div className="relative flex flex-col sm:flex-row gap-5 sm:gap-7 items-start sm:items-center">
                {/* Avatar — initials in a gradient circle. No image upload yet; this fills the slot. */}
                <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-lg shadow-cyan-500/30">
                  {getInitials(data.identity?.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs sm:text-sm font-medium text-cyan-300 uppercase tracking-wider">
                      Your Net Twin
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 break-words">
                    {data.identity?.name || 'Untitled Twin'}
                  </h1>
                  <p className="text-base sm:text-lg text-cyan-100/90 mb-2">
                    {data.identity?.role || 'Professional'}
                  </p>
                  {data.identity?.tagline && (
                    <p className="text-sm sm:text-base text-slate-300 italic leading-relaxed">
                      “{data.identity.tagline}”
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ────────────────── IN-PROGRESS / EMAIL NOTICE ──────────────────
              The structured twin is saved instantly, but the AI engine still
              has to embed + index the profile (and any resume/website you
              add) in the background. We tell the user right here that we'll
              email them when it's all ready, instead of letting them stare
              at a "ready" page and wonder why the chatbot is empty. */}
          <motion.div variants={item}>
            <Card
              className={`p-5 sm:p-6 backdrop-blur-sm ${
                readyState === "ready"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : readyState === "timeout"
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-cyan-500/10 border-cyan-500/30"
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    readyState === "ready"
                      ? "bg-emerald-500/20"
                      : readyState === "timeout"
                      ? "bg-amber-500/20"
                      : "bg-cyan-500/20"
                  }`}
                >
                  {readyState === "ready" ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
                  ) : readyState === "timeout" ? (
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                  ) : (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 animate-spin" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {readyState === "ready" ? (
                    <>
                      <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                        Your AI twin is ready
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed mb-2 sm:mb-3">
                        The chatbot is now answering from your real profile data.
                        {twinId && (
                          <> Try it at <Link to={`/chatbot/${twinId}`} className="underline text-emerald-200 hover:text-white">your public twin link</Link>.</>
                        )}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-emerald-200 font-medium">
                        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {emailNotice === "sent"
                          ? "Welcome email sent — check your inbox."
                          : "Welcome email already delivered."}
                      </div>
                    </>
                  ) : readyState === "timeout" ? (
                    <>
                      <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                        Still indexing — taking longer than usual
                      </h3>
                      <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed mb-2 sm:mb-3">
                        Your profile is saved and will finish indexing shortly. You can leave this page; we'll
                        email you as soon as it's done.
                      </p>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-amber-200 font-medium">
                        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Email will arrive when ready.
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                        Generating your AI twin in the background
                      </h3>
                      <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed mb-2 sm:mb-3">
                        Your profile is saved. We're indexing it now so the chatbot answers from your real data —
                        this usually takes 1–2 minutes. You can stay here or go to the dashboard.
                      </p>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-cyan-200 font-medium">
                        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        We'll email you the moment it's ready.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ────────────────── STATS GRID ────────────────── */}
          <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className="p-4 sm:p-5 bg-white/5 backdrop-blur-sm border-cyan-500/20 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xl sm:text-2xl font-bold text-white tabular-nums leading-none">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400 mt-1 truncate">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>

          {/* ────────────────── BIO PREVIEW ────────────────── */}
          {data.identity?.bio && (
            <motion.div variants={item}>
              <Card className="p-5 sm:p-7 bg-white/5 backdrop-blur-sm border-cyan-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">
                    About
                  </h2>
                </div>
                <p className="text-slate-200 leading-relaxed text-sm sm:text-base">
                  {data.identity.bio}
                </p>
                {data.personality?.traits && data.personality.traits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
                    {data.personality.traits.slice(0, 6).map((trait) => (
                      <Badge
                        key={trait}
                        variant="outline"
                        className="border-cyan-500/30 text-cyan-200 bg-cyan-500/5"
                      >
                        {trait}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* ────────────────── PRIMARY ACTIONS ────────────────── */}
          <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Go to Dashboard — the default "I'm done" path. */}
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="lg"
              className="border-cyan-500/30 bg-white/5 text-white hover:bg-white/10 hover:border-cyan-500/50 h-12 sm:h-14"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>

            {/* View Live Twin — only enabled if we have an _id from the API response. */}
            <Button
              onClick={() => twinId && navigate(`/chatbot/${twinId}`)}
              disabled={!twinId}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-600 hover:to-teal-500 text-white shadow-lg shadow-cyan-500/20 h-12 sm:h-14"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Live Twin
            </Button>

            {/* Edit Twin — reopens the wizard pre-filled with current values.
                Single-twin-per-user model: there is no "Create Another" path. */}
            <Button
              onClick={onEditTwin}
              variant="outline"
              size="lg"
              className="border-cyan-500/30 bg-white/5 text-white hover:bg-white/10 hover:border-cyan-500/50 h-12 sm:h-14"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Twin
            </Button>
          </motion.div>

          {/* ────────────────── ADVANCED (dev payload, collapsed) ────────────────── */}
          <motion.div variants={item}>
            <Accordion type="single" collapsible className="bg-white/5 backdrop-blur-sm border border-cyan-500/20 rounded-2xl px-4 sm:px-6">
              <AccordionItem value="advanced" className="border-none">
                <AccordionTrigger className="text-slate-300 hover:text-cyan-300 text-sm sm:text-base font-medium">
                  Advanced — AI persona prompt &amp; raw profile
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Persona prompt — for users who want to paste into ChatGPT/Claude */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-cyan-300">
                        AI Persona Initialization Prompt
                      </span>
                      <Button
                        onClick={copyPersona}
                        variant="ghost"
                        size="sm"
                        className="text-slate-300 hover:text-cyan-300 hover:bg-white/5"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy
                      </Button>
                    </div>
                    <pre className="bg-slate-900/60 border border-cyan-500/10 rounded-lg p-3 sm:p-4 text-xs text-slate-300 whitespace-pre-wrap break-words max-w-full font-mono max-h-64 overflow-y-auto">
                      {generatePersona(data)}
                    </pre>
                  </div>

                  {/* Raw JSON — for devs integrating downstream */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-cyan-300">
                        Profile JSON
                      </span>
                      <Button
                        onClick={downloadJSON}
                        variant="ghost"
                        size="sm"
                        className="text-slate-300 hover:text-cyan-300 hover:bg-white/5"
                      >
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        Download
                      </Button>
                    </div>
                    <pre className="bg-slate-900/60 border border-cyan-500/10 rounded-lg p-3 sm:p-4 text-xs text-slate-300 whitespace-pre-wrap break-words max-w-full font-mono max-h-64 overflow-y-auto">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>

                  {/* Quick link list if the user added any */}
                  {data.links && (data.links.linkedin || data.links.website || data.links.portfolio) && (
                    <div className="pt-2 border-t border-cyan-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-xs sm:text-sm font-semibold text-cyan-300">
                          Linked Profiles
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.links.linkedin && (
                          <a
                            href={data.links.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-cyan-300 underline-offset-2 hover:underline"
                          >
                            LinkedIn
                          </a>
                        )}
                        {data.links.website && (
                          <a
                            href={data.links.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-cyan-300 underline-offset-2 hover:underline"
                          >
                            Website
                          </a>
                        )}
                        {data.links.portfolio && (
                          <a
                            href={data.links.portfolio}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-cyan-300 underline-offset-2 hover:underline"
                          >
                            Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default SuccessScreen;
