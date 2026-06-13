// ─────────────────────────────────────────────────────────────────────────
// DashboardView.tsx  —  PRESENTATIONAL ("dumb") component
//
// This file owns ZERO business logic. It does not call APIs, does not touch
// hooks, does not manage app state. It simply renders whatever data and
// handlers the logic container (Dashboard.tsx) passes down via props.
// ─────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Menu, X, ChevronDown, ChevronRight, FileText, Briefcase, User, CreditCard,
  LogOut, Camera, Sparkles, Plus, ArrowRight, PlayCircle, Pencil, Trash2,
  ExternalLink, Download, Users, UserPlus, BadgeCheck, TrendingUp, Mail,
  Phone, Calendar, Filter, Hexagon, Building2, MessageSquare, AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import type { DigitalTwin, Lead, UserProfile, StatusCounts } from '../types/Dashboard';

export interface DashboardViewProps {
  isLoading: boolean;
  isLoadingLeads: boolean;
  isUploading: boolean;
  digitalTwin: DigitalTwin | null;
  twins: DigitalTwin[];
  leads: Lead[];
  filteredLeads: Lead[];
  statusCounts: StatusCounts;
  userProfile: UserProfile | null;
  avatarSrc: string | null;
  activeFilter: string;
  userMenuOpen: boolean;
  mobileMenuOpen: boolean;
  isProfileModalOpen: boolean;
  // Inline upload error shown inside the profile-picture modal (null = none).
  uploadError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  twinPublicUrl: (id: string) => string;
  onToggleUserMenu: () => void;
  onCloseUserMenu: () => void;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
  onOpenProfileModal: () => void;
  onCloseProfileModal: () => void;
  onUpdatePhoto: () => void;
  onChoosePhoto: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectFilter: (filter: string) => void;
  onCreateTwin: () => void;
  onEditTwin: () => void;
  onDeleteTwin: () => void;
  onDownloadQR: (id: string) => void;
  onLeadStatusChange: (leadId: string, status: string) => void;
  onLogout: () => void;
  onLearnMore?: () => void;
  // Re-pushes the structured profile to the AI engine. Used by the
  // out-of-sync banner inside TwinCard; no-op when the dashboard is rendered
  // without a wired handler (legacy callers).
  onResync?: () => void;
  isResyncing?: boolean;
}

// ─── Pure helpers ────────────────────────────────────────────────────────
const getInitials = (name?: string | null): string => {
  if (!name || typeof name !== 'string') return 'U';
  return (
    name.trim().split(/\s+/).filter(Boolean).map((n) => n[0]).join('').toUpperCase() || 'U'
  );
};

const STATUS_STYLES: Record<string, { pill: string; dot: string; gradient: string }> = {
  new:       { pill: 'bg-blue-500/20 text-blue-200 border-blue-400/30',       dot: 'bg-blue-400',    gradient: 'from-blue-500 to-cyan-400' },
  contacted: { pill: 'bg-violet-500/20 text-violet-200 border-violet-400/30', dot: 'bg-violet-400',  gradient: 'from-violet-500 to-purple-400' },
  qualified: { pill: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30', dot: 'bg-emerald-400', gradient: 'from-emerald-500 to-green-400' },
  converted: { pill: 'bg-teal-500/20 text-teal-200 border-teal-400/30',       dot: 'bg-teal-400',    gradient: 'from-teal-500 to-cyan-400' },
};
const getStatus = (s: string) => STATUS_STYLES[s] ?? { pill: 'bg-slate-500/20 text-slate-200 border-slate-400/30', dot: 'bg-slate-400', gradient: 'from-slate-500 to-slate-400' };

// Glass card base
const glass = 'bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]';

// ─── Background ──────────────────────────────────────────────────────────
const Background = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden">
    {/* deep navy base */}
    <div className="absolute inset-0 bg-[#050d1a]" />
    {/* top cyan glow */}
    <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full bg-cyan-500/[0.08] blur-[160px]" />
    {/* right teal accent */}
    <div className="absolute top-1/4 -right-48 w-[600px] h-[600px] rounded-full bg-teal-400/[0.06] blur-[160px]" />
    {/* bottom blue */}
    <div className="absolute -bottom-20 -left-48 w-[600px] h-[600px] rounded-full bg-blue-600/[0.05] blur-[160px]" />
    {/* subtle grid */}
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(56,189,248,0.06) 1px, transparent 0)',
        backgroundSize: '48px 48px',
      }}
    />
  </div>
);

// ─── Nav ─────────────────────────────────────────────────────────────────
const NavSoon = ({ icon: Icon, label }: { icon: typeof FileText; label: string }) => (
  <div className="flex items-center gap-2 text-slate-400/80 text-sm font-medium cursor-default select-none">
    <Icon className="w-4 h-4" />
    <span>{label}</span>
    <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300/70 border border-cyan-500/20 uppercase">
      Soon
    </span>
  </div>
);

const DashboardHeader = (props: DashboardViewProps) => {
  const { avatarSrc, userProfile, userMenuOpen, mobileMenuOpen,
    onToggleUserMenu, onCloseUserMenu, onToggleMobileMenu, onCloseMobileMenu,
    onUpdatePhoto, onLogout } = props;

  const AvatarBubble = ({ size = 36 }: { size?: number }) =>
    avatarSrc ? (
      <img
        src={avatarSrc}
        alt={userProfile?.name ?? 'Profile'}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0"
      />
    ) : (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex-shrink-0"
      >
        {userProfile ? getInitials(userProfile.name) : 'U'}
      </div>
    );

  return (
    <header className="sticky top-0 z-40 bg-[#050d1a]/90 backdrop-blur-2xl border-b border-white/[0.07]">
      <div className="w-full px-6 sm:px-8 lg:px-10 h-[68px] flex items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center">
            <img
              src="https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/logoImg.webp"
              alt="NetTwin"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="text-[16px] font-bold text-white leading-none font-syne-bold">NetTwin</div>
            <div className="text-[11px] text-cyan-300/60 leading-none mt-0.5">Your AI. Your Identity.</div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <NavSoon icon={FileText} label="Resume" />
          <NavSoon icon={Briefcase} label="Portfolio" />
          <Link to="/dashboard" className="relative text-white text-[15px] font-bold pb-[2px]">
            Dashboard
            <span className="absolute left-0 -bottom-[26px] right-0 h-[3px] bg-gradient-to-r from-cyan-400 to-teal-300 rounded-full" />
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Desktop user pill */}
          <div className="relative hidden sm:block">
            <button
              onClick={onToggleUserMenu}
              className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] hover:border-cyan-500/30 transition-all duration-200"
            >
              <AvatarBubble size={34} />
              <div className="hidden md:block text-left">
                <div className="text-[13px] font-medium text-white/90 truncate max-w-[160px] leading-none">
                  {userProfile?.email ?? <Skeleton className="h-3 w-28 bg-white/10 mt-0.5" />}
                </div>
                <div className="text-[11px] text-cyan-300/70 mt-1 leading-none">Professional Plan</div>
              </div>
              <ChevronDown className={`hidden md:block w-4 h-4 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-60 bg-[#0c1e30]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/[0.08] overflow-hidden z-50"
                >
                  <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center gap-3">
                    {/* Avatar inside the dropdown header so the user has
                        immediate visual confirmation that the uploaded
                        picture is in fact the one bound to this account. */}
                    <AvatarBubble size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-white/90 truncate">{userProfile?.email}</div>
                      <div className="text-[11px] text-cyan-300/70 mt-0.5">Professional Plan</div>
                    </div>
                  </div>
                  <div className="p-1.5">
                    {[
                    //   { icon: Camera, label: 'Update Photo', action: onUpdatePhoto },
                    ].map(({ icon: Icon, label, action }) => (
                      <button key={label} onClick={action}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-300/80 hover:text-white hover:bg-white/[0.06] transition text-[13px]">
                        <Icon className="w-4 h-4 flex-shrink-0" />{label}
                      </button>
                    ))}
                    {[
                      { to: '/profile', icon: User, label: 'Profile Settings' },
                      { to: '/billing', icon: CreditCard, label: 'Billing & Plan' },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link key={to} to={to} onClick={onCloseUserMenu}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-300/80 hover:text-white hover:bg-white/[0.06] transition text-[13px]">
                        <Icon className="w-4 h-4 flex-shrink-0" />{label}
                      </Link>
                    ))}
                  </div>
                  <div className="p-1.5 border-t border-white/[0.06]">
                    <button onClick={onLogout}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400/90 hover:text-red-300 hover:bg-red-500/10 transition text-[13px]">
                      <LogOut className="w-4 h-4 flex-shrink-0" />Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile avatar */}
          <button onClick={onToggleUserMenu} className="sm:hidden">
            <AvatarBubble size={32} />
          </button>

          {/* Mobile hamburger */}
          <button onClick={onToggleMobileMenu} className="lg:hidden p-1.5 text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/[0.06] overflow-hidden">
            <nav className="px-4 py-4 flex flex-col gap-2">
              <div className="px-2 py-2"><NavSoon icon={FileText} label="Resume" /></div>
              <div className="px-2 py-2"><NavSoon icon={Briefcase} label="Portfolio" /></div>
              <Link to="/dashboard" onClick={onCloseMobileMenu}
                className="px-3 py-2.5 text-cyan-300 font-semibold text-sm bg-cyan-500/10 rounded-xl">
                Dashboard
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile user menu */}
      <AnimatePresence>
        {userMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-t border-white/[0.06] overflow-hidden">
            <div className="px-4 py-4 space-y-1">
              <div className="px-3 py-2.5 mb-3 bg-white/[0.04] rounded-xl flex items-center gap-3">
                <AvatarBubble size={36} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-white/90 truncate">{userProfile?.email}</div>
                  <div className="text-[11px] text-cyan-300/70 mt-0.5">Professional Plan</div>
                </div>
              </div>
              <button onClick={onUpdatePhoto} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-300/80 hover:text-white hover:bg-white/[0.06] transition text-[13px]">
                <Camera className="w-4 h-4" />Update Photo
              </button>
              <Link to="/profile" onClick={onCloseUserMenu} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-300/80 hover:text-white hover:bg-white/[0.06] transition text-[13px]">
                <User className="w-4 h-4" />Profile Settings
              </Link>
              <Link to="/billing" onClick={onCloseUserMenu} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-300/80 hover:text-white hover:bg-white/[0.06] transition text-[13px]">
                <CreditCard className="w-4 h-4" />Billing &amp; Plan
              </Link>
              <button onClick={onLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400/90 hover:text-red-300 hover:bg-red-500/10 transition text-[13px] border-t border-white/[0.06] mt-2 pt-3">
                <LogOut className="w-4 h-4" />Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// ─── Profile modal ────────────────────────────────────────────────────────
const ProfilePictureModal = ({
  isOpen, isUploading, uploadError, fileInputRef, onFileSelect, onChoosePhoto, onClose,
}: Pick<DashboardViewProps, 'isUploading' | 'uploadError' | 'fileInputRef' | 'onFileSelect' | 'onChoosePhoto'> & {
  isOpen: boolean; onClose: () => void;
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="bg-[#0c1e30] rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/[0.08]">
          <div className="text-center">
            <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 ring-1 ring-cyan-500/20">
              <Camera className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Add Profile Picture</h3>
            <p className="text-sm text-slate-300/80 mb-7 leading-relaxed">
              Make your profile stand out with a professional photo
              <span className="block mt-1 text-xs text-slate-400">JPG, PNG, WebP, or GIF · Max 100 KB</span>
            </p>
            <input type="file" ref={fileInputRef} onChange={onFileSelect} accept="image/*" className="hidden" />
            <button onClick={onChoosePhoto} disabled={isUploading}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 text-white py-3.5 rounded-2xl font-semibold hover:from-cyan-400 hover:to-teal-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-3 shadow-lg shadow-cyan-500/20 text-sm">
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading…
                </span>
              ) : 'Choose Photo'}
            </button>
            {uploadError && (
              <p className="text-sm text-red-400 mb-3 -mt-1" role="alert">
                {uploadError}
              </p>
            )}
            <button onClick={onClose} disabled={isUploading}
              className="w-full text-slate-300/70 py-3.5 rounded-2xl font-medium hover:bg-white/[0.05] transition border border-white/[0.08] text-sm">
              Skip for now
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────
const DashboardSkeleton = () => (
  <div className="relative min-h-screen">
    <Background />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4"><Skeleton className="h-6 w-36 bg-white/5" /><Skeleton className="h-14 w-4/5 bg-white/5" /><Skeleton className="h-5 w-2/3 bg-white/5" /></div>
        <Skeleton className="h-56 rounded-3xl bg-white/5" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[0,1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-2xl bg-white/5" />)}</div>
      <Skeleton className="h-72 rounded-3xl bg-white/5" />
    </div>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────
const EmptyState = ({ onCreateTwin, onLearnMore }: Pick<DashboardViewProps, 'onCreateTwin' | 'onLearnMore'>) => (
  <div className="relative min-h-[calc(100dvh-68px)] flex flex-col items-center justify-center px-4 py-12">

    {/* Ambient glow behind content */}
    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />

    {/* WELCOME label */}
    <motion.p
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="text-[11px] font-bold tracking-[0.35em] text-cyan-300/60 uppercase mb-7">
      Welcome to NetTwin
    </motion.p>

    {/* Big hero heading */}
    <motion.h1
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
      className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white text-center leading-[1.05] mb-5 font-syne-bold">
      Let&apos;s build your
      <br />
      Digital{' '}
      <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent font-syne-bold">
        Presence
      </span>
    </motion.h1>

    {/* Subtitle */}
    <motion.p
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
      className="text-base sm:text-lg text-slate-400/80 text-center  leading-relaxed mb-12">
      Create your AI Net Twin to capture leads, showcase your skills,<br className="hidden sm:block" /> and grow your professional brand.
    </motion.p>

    {/* Card */}
    <motion.div
      initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="relative w-full max-w-md">

      {/* Subtle glow rim around card */}
      <div className="absolute -inset-[1px] rounded-[28px] bg-gradient-to-b from-cyan-500/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative rounded-[26px] overflow-hidden bg-[#0c1f33]/80 backdrop-blur-xl border border-white/[0.07] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)]">

        {/* Card inner top glow */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-cyan-500/[0.07] to-transparent pointer-events-none" />

        <div className="relative px-8 pt-10 pb-8 text-center">

          {/* Hexagon icon */}
          <div className="relative w-12 h-12 mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-xl" />
             <img src="https://o8mdvprl6egud6jt.public.blob.vercel-storage.com/logoImg.webp" alt="logo" />
          </div>

          <h2 className="text-[22px] font-bold text-white mb-3 tracking-tight font-syne-bold">No Net Twin Yet</h2>
          <p className="text-slate-400/70 text-sm leading-relaxed mb-7 max-w-[280px] mx-auto">
            You haven&apos;t created your Net Twin yet. Get started by creating your personal AI assistant that represents you and your work.
          </p>

          {/* CTA button */}
          <button
            type="button"
            onClick={onCreateTwin}
            className="group relative w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 text-white font-semibold text-[15px] py-3.5 px-6 rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/35 transition-all duration-200"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            {/* <Plus className="w-5 h-5 relative z-10 flex-shrink-0" /> */}
            <span className="relative z-10">Create Your First Twin</span>
            <ArrowRight className="w-5 h-5 relative z-10 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          {/* Learn more */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => onLearnMore?.()}
              className="inline-flex items-center gap-2 text-slate-400/70 hover:text-cyan-300 text-sm font-medium transition-colors duration-200"
            >
              <PlayCircle className="w-4 h-4" />
              Learn how it works
            </button>
          </div>

        </div>
      </div>
    </motion.div>

  </div>
);

// ─── Active state components ──────────────────────────────────────────────

const TwinAvatar = ({ src, name }: { src: string | null; name: string }) =>
  src ? (
    <img src={src} alt={name}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      className="w-16 h-20 flex-shrink-0" />
  ) : (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
      {getInitials(name)}
    </div>
  );

const TwinCard = ({ twin, avatarSrc, twinPublicUrl, onEditTwin, onDeleteTwin, onDownloadQR, onResync, isResyncing }:
  { twin: DigitalTwin; avatarSrc: string | null; twinPublicUrl: (id: string) => string; onEditTwin: () => void; onDeleteTwin: () => void; onDownloadQR: (id: string) => void; onResync?: () => void; isResyncing?: boolean; }
) => {
  const [expanded, setExpanded] = useState(false);
  const bio = twin.identity?.bio ?? '';
  const isLong = bio.length > 120;
  const syncState = twin.aiSyncStatus?.state ?? 'never';
  const outOfSync = syncState !== 'synced';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="rounded-2xl overflow-hidden bg-[#0c1f33]/90 backdrop-blur-xl border border-white/[0.07] shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
    >
      {/* Card header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
        <span className="text-[11px] font-bold tracking-[0.15em] text-slate-400/70 uppercase">Your Net Twin</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-300">{twin.isActive === false ? 'Inactive' : 'Active'}</span>
          </div>
          <span className="hidden sm:block text-[11px] text-slate-500">
            Updated {new Date(twin.lastUpdated).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Out-of-sync banner — your chatbot's knowledge is stale until a sync runs.
          Copy is intentionally visitor-neutral ("your chatbot"), no AI-engine jargon. */}
      {outOfSync && (
        <div className="px-6 py-3 border-b border-amber-400/20 bg-amber-500/[0.07]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-amber-100 leading-tight">
                {syncState === 'failed'
                  ? "Your chatbot couldn't load your latest profile. Tap Sync to try again."
                  : "Your chatbot hasn't loaded your profile yet. Tap Sync to enable rich answers."}
              </p>
            </div>
            {onResync && (
              <button
                type="button"
                onClick={onResync}
                disabled={isResyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-100 text-[12px] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResyncing ? 'animate-spin' : ''}`} />
                {isResyncing ? 'Syncing…' : 'Sync'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Card body */}
      <div className="px-6 py-5 flex flex-col sm:flex-row gap-5">
        {/* Avatar + info */}
        <div className="flex gap-4 sm:gap-5 flex-1 min-w-0">
          <TwinAvatar src={avatarSrc} name={twin.identity?.name} />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white leading-tight">{twin.identity?.name}</h2>
            <p className="text-cyan-400 text-sm font-medium mt-0.5">{twin.identity?.role}</p>
            <p className={`text-slate-400/70 text-sm leading-relaxed mt-2 ${expanded ? '' : 'line-clamp-3'}`}>{bio}</p>
            {isLong && (
              <button onClick={() => setExpanded(v => !v)} className="text-cyan-400 hover:text-cyan-300 text-xs font-medium mt-1 transition-colors">
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>

        {/* QR code */}
        <div className="flex w-full sm:w-auto flex-col items-center gap-2 flex-shrink-0">
          <div className="p-3 bg-white rounded-xl shadow-md">
            <QRCode id={`qr-${twin._id}`} value={twinPublicUrl(twin._id)} size={132} />
          </div>
          <button onClick={() => onDownloadQR(twin._id)}
            className="flex items-center gap-1 text-cyan-400/80 hover:text-cyan-300 text-[11px] font-medium transition-colors">
            <Download className="w-3 h-3" />Download QR
          </button>
        </div>
      </div>

      {/* Card footer actions */}
      <div className="px-6 py-4 border-t border-white/[0.05] flex items-center gap-2">
        <Link to={`/chatbot/${twin._id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.10] text-white/80 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-150 text-sm font-medium">
          <ExternalLink className="w-3.5 h-3.5" />View Live
        </Link>
        <button onClick={onEditTwin}
          className="p-2 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-150">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDeleteTwin}
          className="p-2 rounded-xl border border-white/[0.08] text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-150">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

const WelcomeHero = ({ userProfile }: { userProfile: UserProfile | null }) => {
  const firstName = userProfile?.name?.trim().split(/\s+/)[0];
  return (
    <div className="flex flex-col justify-center">
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="text-slate-400 text-sm mb-3 font-medium">
        Welcome back{firstName ? `, ${firstName}` : ''} 👋
      </motion.p>
      <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="text-4xl sm:text-5xl lg:text-[3.2rem] font-extrabold text-white leading-[1.07] tracking-tight font-syne-bold">
        Your Digital Presence,
        <span className="block bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent mt-1">
          Reimagined
        </span>
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
        className="text-slate-400/70 text-base mt-5 max-w-sm leading-relaxed">
        Manage your AI Digital Twin, capture leads, and grow your professional brand — all in one place.
      </motion.p>
    </div>
  );
};

const StatsCards = ({ statusCounts, activeFilter, onSelectFilter }:
  Pick<DashboardViewProps, 'statusCounts' | 'activeFilter' | 'onSelectFilter'>
) => {
  const stats = [
    { key: 'all',       label: 'Total Leads',    short: 'LEADS',     val: statusCounts.all,       Icon: Users,     iconBg: 'bg-cyan-500/10',    iconText: 'text-cyan-300',    border: 'border-cyan-500/30',    ring: 'ring-cyan-500/40' },
    { key: 'new',       label: 'New Leads',       short: 'NEW',       val: statusCounts.new,       Icon: UserPlus,  iconBg: 'bg-blue-500/10',    iconText: 'text-blue-300',    border: 'border-blue-500/20',    ring: 'ring-blue-500/40' },
    { key: 'qualified', label: 'Qualified Leads', short: 'QUALIFIED', val: statusCounts.qualified, Icon: BadgeCheck,iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-300', border: 'border-emerald-500/20', ring: 'ring-emerald-500/40' },
    { key: 'converted', label: 'Converted Leads', short: 'CONVERTED', val: statusCounts.converted, Icon: TrendingUp,iconBg: 'bg-teal-500/10',   iconText: 'text-teal-300',    border: 'border-teal-500/20',    ring: 'ring-teal-500/40' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s, i) => {
        const active = activeFilter === s.key;
        return (
          <motion.button key={s.key} type="button" onClick={() => onSelectFilter(s.key)}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
            className={`relative text-left rounded-2xl p-5 transition-all duration-200 bg-[#0c1f33]/80 backdrop-blur-xl border hover:brightness-110 hover:-translate-y-0.5 ${active ? `${s.border} ring-1 ${s.ring}` : 'border-white/[0.06]'}`}>
            <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-4 border border-white/[0.06]`}>
              <s.Icon className={`w-5 h-5 ${s.iconText}`} />
            </div>
            <div className="text-[10px] font-bold tracking-[0.15em] text-slate-500 mb-1.5">{s.short}</div>
            <div className="text-3xl font-extrabold text-white leading-none mb-1">{s.val}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </motion.button>
        );
      })}
    </div>
  );
};

const StatusSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const s = getStatus(value);
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={`appearance-none cursor-pointer rounded-full border px-3 py-1 pr-6 text-xs font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-cyan-500/40 bg-no-repeat ${s.pill}`}
      style={{
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='none' stroke='%2394a3b8' stroke-width='2' viewBox='0 0 24 24'><path d='M6 9l6 6 6-6'/></svg>\")",
        backgroundPosition: 'right 0.4rem center',
        backgroundSize: '10px',
      }}>
      <option value="new" className="bg-[#0c1e30] text-white">New</option>
      <option value="contacted" className="bg-[#0c1e30] text-white">Contacted</option>
      <option value="qualified" className="bg-[#0c1e30] text-white">Qualified</option>
      <option value="converted" className="bg-[#0c1e30] text-white">Converted</option>
    </select>
  );
};

// Visitor leads come from the backend Lead schema where the field is
// `userEmail`. Older code paths and the chatbot form also send `email`,
// so we read whichever is present. Centralizing the lookup here avoids
// the "email column is blank for new leads" regression we hit when the
// FE table read `lead.email` directly.
const getLeadEmail = (lead: Lead): string => lead.userEmail || lead.email || '—';

const LeadsSection = ({ filteredLeads, isLoadingLeads, activeFilter, onSelectFilter, onLeadStatusChange, onViewLead }:
  Pick<DashboardViewProps, 'filteredLeads' | 'isLoadingLeads' | 'activeFilter' | 'onSelectFilter' | 'onLeadStatusChange'> & { onViewLead: (lead: Lead) => void }
) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
    className="rounded-2xl overflow-hidden bg-[#0c1f33]/80 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.4)]">

    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-white/[0.05]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/15 flex-shrink-0">
          <Users className="w-4.5 h-4.5 text-cyan-300" />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-white">Recent Leads</h2>
          <p className="text-slate-500 text-xs mt-0.5">Track and manage leads captured by your Net Twin.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        <select value={activeFilter} onChange={e => onSelectFilter(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/70 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 min-w-[110px]">
          <option value="all" className="bg-[#0c1f33]">All Leads</option>
          <option value="new" className="bg-[#0c1f33]">New</option>
          <option value="contacted" className="bg-[#0c1f33]">Contacted</option>
          <option value="qualified" className="bg-[#0c1f33]">Qualified</option>
          <option value="converted" className="bg-[#0c1f33]">Converted</option>
        </select>
      </div>
    </div>

    {/* Body */}
    {isLoadingLeads ? (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-7 h-7 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading leads…</p>
      </div>
    ) : filteredLeads.length === 0 ? (
      <div className="text-center py-20 px-4">
        <div className="w-14 h-14 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/[0.05]">
          <Mail className="w-6 h-6 text-slate-600" />
        </div>
        <p className="text-slate-500 text-sm">
          {activeFilter === 'all' ? 'No leads yet. Share your Net Twin to start generating leads!' : `No ${activeFilter} leads found.`}
        </p>
      </div>
    ) : (
      <>
        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['Lead', 'Status', 'Email', 'Phone', 'Created', 'Action'].map((h, i) => (
                  <th key={h} className={`py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 ${i === 0 ? 'pl-6 pr-4 text-left' : i === 5 ? 'pl-4 pr-6 text-right' : 'px-4 text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, idx) => {
                const s = getStatus(lead.status);
                return (
                  <motion.tr key={lead._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.035 }}
                    className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {getInitials(lead.name || 'Unknown')}
                        </div>
                        <span className="text-sm font-semibold text-white/90 whitespace-nowrap">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusSelect value={lead.status} onChange={v => onLeadStatusChange(lead._id, v)} />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400/70 whitespace-nowrap">{getLeadEmail(lead)}</td>
                    <td className="px-4 py-4 text-sm text-slate-400/70 whitespace-nowrap">{lead.phone || '—'}</td>
                    <td className="px-4 py-4 text-sm text-slate-500/70 whitespace-nowrap">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4 pr-6 text-right">
                      <button
                        type="button"
                        onClick={() => onViewLead(lead)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400/80 hover:text-cyan-300 transition-colors whitespace-nowrap"
                      >
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden p-4 space-y-3">
          {filteredLeads.map((lead, idx) => {
            const s = getStatus(lead.status);
            return (
              <motion.div
                key={lead._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onViewLead(lead)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onViewLead(lead);
                  }
                }}
                className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.05] hover:bg-white/[0.04] hover:border-cyan-500/20 transition cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {getInitials(lead.name || 'Unknown')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-white/90 text-sm truncate">{lead.name}</h3>
                      <StatusSelect value={lead.status} onChange={v => onLeadStatusChange(lead._id, v)} />
                    </div>
                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-2 truncate"><Mail className="w-3 h-3 flex-shrink-0" /><span className="truncate">{getLeadEmail(lead)}</span></div>
                      {lead.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3 flex-shrink-0" />{lead.phone}</div>}
                      <div className="flex items-center gap-2"><Calendar className="w-3 h-3 flex-shrink-0" />{new Date(lead.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </>
    )}
  </motion.div>
);

// ─── Lead Details Modal ──────────────────────────────────────────────────
// UI-only state: the modal-open/close + selected lead are view concerns
// (no APIs, no global state) so we keep them here instead of leaking them
// into Dashboard.tsx. The status dropdown inside still routes through
// `onLeadStatusChange` so the real DB write goes through the container.
const LeadDetailsModal = ({
  lead,
  onClose,
  onLeadStatusChange,
}: {
  lead: Lead | null;
  onClose: () => void;
  onLeadStatusChange: (leadId: string, status: string) => void;
}) => {
  // ESC key closes the modal — matches the Dialog primitive UX users
  // already see elsewhere in the app.
  useEffect(() => {
    if (!lead) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    // Lock body scroll while modal is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lead, onClose]);

  return (
    <AnimatePresence>
      {lead && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0c1f33]/95 backdrop-blur-2xl rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/[0.05]">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getStatus(lead.status).gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {getInitials(lead.name || 'Unknown')}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold truncate">{lead.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Captured {new Date(lead.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <DetailRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={getLeadEmail(lead)} />
                <DetailRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={lead.phone || '—'} />
                <DetailRow icon={<Building2 className="w-3.5 h-3.5" />} label="Company" value={lead.company || '—'} />
                <DetailRow icon={<Sparkles className="w-3.5 h-3.5" />} label="Interest" value={lead.interest || '—'} />
              </div>

              {lead.message && (
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-sm text-slate-300 whitespace-pre-wrap break-words">
                    {lead.message}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Status</div>
                <StatusSelect
                  value={lead.status}
                  onChange={(v) => onLeadStatusChange(lead._id, v)}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/[0.05] flex justify-end gap-2">
              {getLeadEmail(lead) !== '—' && (
                <a
                  href={`mailto:${getLeadEmail(lead)}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-sm text-slate-200 border border-white/[0.06] transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </a>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="min-w-0">
    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
      {icon} {label}
    </div>
    <div className="text-sm text-slate-200 break-words">{value}</div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────
const DashboardView = (props: DashboardViewProps) => {
  // Modal-open state for the lead details panel. View-local (no API call,
  // no app state) so it lives here rather than in the logic container.
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  if (props.isLoading) return <DashboardSkeleton />;
  const hasTwin = props.twins.length > 0;

  // Keep the modal's `lead` in sync with the latest leads list. After the
  // user changes the status inside the modal, the parent updates the
  // `leads` array and we want the modal to reflect that new status
  // without forcing a re-open.
  const liveSelectedLead =
    selectedLead && props.leads.find((l) => l._id === selectedLead._id)
      ? props.leads.find((l) => l._id === selectedLead._id) ?? null
      : selectedLead;

  return (
    <div className="relative min-h-screen">
      <Background />

      <ProfilePictureModal
        isOpen={props.isProfileModalOpen}
        isUploading={props.isUploading}
        uploadError={props.uploadError}
        fileInputRef={props.fileInputRef}
        onFileSelect={props.onFileSelect}
        onChoosePhoto={props.onChoosePhoto}
        onClose={props.onCloseProfileModal}
      />

      <LeadDetailsModal
        lead={liveSelectedLead}
        onClose={() => setSelectedLead(null)}
        onLeadStatusChange={props.onLeadStatusChange}
      />

      <DashboardHeader {...props} />

      {!hasTwin ? (
        <EmptyState onCreateTwin={props.onCreateTwin} onLearnMore={props.onLearnMore} />
      ) : (
        <main className="relative px-6 sm:px-8 lg:px-10 py-8 pb-16">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Row 1: welcome hero (left) + twin card (right) */}
            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 lg:gap-8 items-center">
              <WelcomeHero userProfile={props.userProfile} />
              {props.twins.map(twin => (
                <TwinCard key={twin._id} twin={twin} avatarSrc={props.avatarSrc}
                  twinPublicUrl={props.twinPublicUrl} onEditTwin={props.onEditTwin}
                  onDeleteTwin={props.onDeleteTwin} onDownloadQR={props.onDownloadQR}
                  onResync={props.onResync} isResyncing={props.isResyncing} />
              ))}
            </div>

            {/* Row 2: 4 stat cards */}
            <StatsCards statusCounts={props.statusCounts} activeFilter={props.activeFilter} onSelectFilter={props.onSelectFilter} />

            {/* Row 3: leads table */}
            <LeadsSection filteredLeads={props.filteredLeads} isLoadingLeads={props.isLoadingLeads}
              activeFilter={props.activeFilter} onSelectFilter={props.onSelectFilter}
              onLeadStatusChange={props.onLeadStatusChange}
              onViewLead={(lead) => setSelectedLead(lead)} />

          </div>
        </main>
      )}
    </div>
  );
};

export default DashboardView;
