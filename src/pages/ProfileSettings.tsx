/**
 * ProfileSettings.tsx
 * ───────────────────
 * Authenticated user settings surface: display-name edit, password change,
 * profile-photo upload, profile-photo remove. Routed at /profile under
 * AuthenticatedLayout (no public navbar/footer).
 *
 * Notes on UX choices:
 *   • Optimistic update on name change is intentionally NOT used — the
 *     server normalizes/trims the value and we want to show exactly what
 *     was stored. The roundtrip is fast and the loading state covers it.
 *   • Password change triggers a server-side refresh-token revocation
 *     (see authService.changePassword on the backend). We do a clean
 *     client logout afterwards so the user is forced to re-authenticate
 *     with the new password — this matches the security contract the
 *     backend signals by clearing the refresh cookie.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2, Trash2, User as UserIcon, Lock, Save } from 'lucide-react';
import { authService } from '@/services/api.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { IMAGE_BASE_URL, API_BASE_URL } from '@/axios.config';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string | null;
  avatar?: string | null;
  // Public S3 URL set by POST /api/upload/avatar. Preferred over the legacy
  // local-disk profilePicture/avatar when present.
  avatarUrl?: string | null;
}

const MAX_AVATAR_BYTES = 100 * 1024;

// Mirrors backend Joi rule in authValidators.js — keeps client errors in
// line with server rejections so the user never sees "invalid request"
// after a green client-side check.
const isStrongPassword = (p: string) =>
  p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p);

const getInitials = (name?: string | null) => {
  if (!name) return 'U';
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U'
  );
};

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { logout, updateUser } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Name
  const [name, setName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  // Photo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  // Inline (in-UI) upload error — shown in red under the photo controls in
  // addition to the toast, so the user sees why an upload was rejected.
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Bumped after every successful upload so the <img> refetches even when
  // the path string is identical (server may overwrite the same filename).
  const [avatarCacheKey, setAvatarCacheKey] = useState(0);

  // Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authService.getProfile();
        const u = res?.user ?? res;
        if (!cancelled) {
          setProfile(u);
          setName(u?.name ?? '');
        }
      } catch (err: any) {
        toast({
          title: 'Failed to load profile',
          description: err?.response?.data?.message || err?.message || 'Please try again.',
          variant: 'destructive',
        });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const avatarSrc = (() => {
    if (!profile) return null;
    // New S3 upload — absolute, already-public URL. Unique filename per upload,
    // so no cache-bust needed.
    if (profile.avatarUrl) return profile.avatarUrl;
    if (profile.profilePicture) {
      const sep = profile.profilePicture.includes('?') ? '&' : '?';
      return `${IMAGE_BASE_URL}${profile.profilePicture}${sep}v=${avatarCacheKey}`;
    }
    if (profile.avatar) {
      return /^https?:\/\//i.test(profile.avatar)
        ? profile.avatar
        : `${IMAGE_BASE_URL}${profile.avatar}`;
    }
    return null;
  })();

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast({
        title: 'Name too short',
        description: 'Please enter at least 2 characters.',
        variant: 'destructive',
      });
      return;
    }
    if (trimmed === profile?.name) return;

    setIsSavingName(true);
    try {
      const res = await authService.updateProfile({ name: trimmed });
      const u = res?.user ?? res;
      const nextName = u?.name ?? trimmed;
      setProfile((prev) => (prev ? { ...prev, name: nextName } : prev));
      updateUser({ name: nextName });
      toast({ title: 'Profile updated', description: 'Your name has been saved.' });
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err?.response?.data?.message || err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingName(false);
    }
  };

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    // Clear any previous inline error before re-validating.
    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      const msg = 'Please choose an image (JPG, PNG, WebP, or GIF).';
      setUploadError(msg);
      toast({ title: 'Unsupported file', description: msg, variant: 'destructive' });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      const kb = (file.size / 1024).toFixed(1);
      const msg = `Image size should not be more than 100 KB — yours is ${kb} KB.`;
      setUploadError(msg);
      toast({ title: 'File too large', description: msg, variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      // Upload to the S3-backed endpoint (POST /api/upload/avatar). multer-s3
      // stores the object and the handler returns the public URL as `avatarUrl`,
      // persisting it to User.avatarUrl. We use API_BASE_URL (which already
      // includes /api) so this resolves to the API origin in prod, not the FE
      // host. Content-Type is left unset so the browser sets the multipart
      // boundary itself.
      const formData = new FormData();
      formData.append('avatar', file);

      const resp = await fetch(`${API_BASE_URL}/upload/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      if (!resp.ok) {
        if (resp.status === 413) {
          throw new Error('The server rejected the file as too large. Try a smaller image.');
        }
        const errBody = await resp.json().catch(() => null);
        throw new Error(errBody?.error || errBody?.message || 'Failed to upload photo.');
      }

      const { avatarUrl } = await resp.json();
      setProfile((prev) => (prev ? { ...prev, avatarUrl } : prev));
      setUploadError(null);
      // Sync into AuthContext + localStorage so the Dashboard header and any
      // other surface reading `user` from context updates instantly and
      // survives a refresh.
      updateUser({ avatarUrl });
      toast({ title: 'Photo updated', description: 'Profile picture saved.' });
    } catch (err: any) {
      const msg = err?.message || 'Failed to upload photo.';
      setUploadError(msg);
      toast({ title: 'Upload failed', description: msg, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!profile?.avatarUrl && !profile?.profilePicture) return;
    setIsRemoving(true);
    try {
      // DELETE /api/upload/avatar clears both the S3 avatarUrl and the legacy
      // profilePicture server-side.
      const resp = await fetch(`${API_BASE_URL}/upload/avatar`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => null);
        throw new Error(errBody?.error || errBody?.message || 'Failed to remove photo.');
      }
      setProfile((prev) =>
        prev ? { ...prev, avatarUrl: null, profilePicture: null } : prev,
      );
      setAvatarCacheKey(Date.now());
      // Clear from auth cache too so the avatar slot reverts to initials
      // everywhere and a refresh doesn't reload the deleted image.
      updateUser({ avatarUrl: null, profilePicture: null as unknown as undefined });
      toast({ title: 'Photo removed', description: 'Profile picture cleared.' });
    } catch (err: any) {
      toast({
        title: 'Remove failed',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast({
        title: 'Missing fields',
        description: 'Both current and new password are required.',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'New password and confirmation must be identical.',
        variant: 'destructive',
      });
      return;
    }
    if (!isStrongPassword(newPassword)) {
      toast({
        title: 'Weak password',
        description: 'Use at least 8 characters with upper, lower, and a digit.',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      toast({
        title: 'Password updated',
        description: 'Please sign in again with your new password.',
      });
      // Server revoked all refresh tokens — force a clean re-auth.
      await logout();
      navigate('/login', { replace: true });
    } catch (err: any) {
      toast({
        title: 'Change failed',
        description: err?.response?.data?.message || err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#0D2137] to-[#0A1929] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>

        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            Manage your account information and security.
          </p>
        </header>

        {/* Profile picture card */}
        <section className="bg-white/5 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            Profile Photo
          </h2>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={profile?.name ?? 'Profile'}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-2 ring-cyan-500/40"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-white text-2xl font-semibold shadow-lg shadow-cyan-500/20">
                  {getInitials(profile?.name)}
                </div>
              )}
            </div>

            <div className="flex-1 w-full">
              <p className="text-sm text-slate-300 mb-4 text-center sm:text-left">
                JPG, PNG, WebP, or GIF. Max 100 KB.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={handlePickFile}
                  disabled={isUploading || isLoading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-white font-medium hover:from-cyan-600 hover:to-teal-500 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      {profile?.avatarUrl || profile?.profilePicture ? 'Change Photo' : 'Upload Photo'}
                    </>
                  )}
                </button>
                {(profile?.avatarUrl || profile?.profilePicture) && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={isRemoving || isUploading}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isRemoving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Remove
                  </button>
                )}
              </div>

              {/* Inline upload error (e.g. file too large). */}
              {uploadError && (
                <p className="mt-3 text-sm text-red-400 text-center sm:text-left" role="alert">
                  {uploadError}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Name card */}
        <section className="bg-white/5 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-cyan-400" />
            Account Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                value={profile?.email ?? ''}
                readOnly
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-cyan-500/10 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Display name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading || isSavingName}
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-cyan-500/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition disabled:opacity-60"
                placeholder="Your name"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveName}
                disabled={
                  isLoading ||
                  isSavingName ||
                  name.trim().length < 2 ||
                  name.trim() === profile?.name
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSavingName ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Password card */}
        <section className="bg-white/5 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            Change Password
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Current password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={isChangingPassword}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-cyan-500/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">New password</label>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isChangingPassword}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-cyan-500/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition disabled:opacity-60"
              />
              <p className="text-xs text-slate-500 mt-1">
                At least 8 characters with uppercase, lowercase, and a number.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm new password</label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isChangingPassword}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-cyan-500/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition disabled:opacity-60"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleChangePassword}
                disabled={
                  isChangingPassword || !oldPassword || !newPassword || !confirmPassword
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
