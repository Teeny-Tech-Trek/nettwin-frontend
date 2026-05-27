import { FormEvent, ReactNode, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Lock, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/api.service";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const token = useMemo(() => params.token || searchParams.get("token") || "", [params.token, searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      toast({
        title: "Invalid reset link",
        description: "Please request a new password recovery email.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please enter the same password twice.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      setComplete(true);
      toast({
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });
    } catch (error: any) {
      toast({
        title: "Reset link failed",
        description: error?.response?.data?.message || error?.message || "Please request a new reset link.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl p-6 sm:p-8 border border-violet-400/30 bg-[#120e2d]/85 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-cyan-200/80 hover:text-cyan-100">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>

          <div className="mt-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10">
              {complete ? <CheckCircle2 className="h-7 w-7 text-cyan-200" /> : <ShieldAlert className="h-7 w-7 text-cyan-200" />}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {complete ? "Password updated" : "Create a new password"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/60">
              {complete
                ? "Your account is secure. Sign in again to continue."
                : "Choose a strong password with uppercase, lowercase, and a number."}
            </p>
          </div>

          {!complete ? (
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <PasswordInput
                label="New password"
                value={password}
                show={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
                onChange={setPassword}
              />
              <PasswordInput
                label="Confirm password"
                value={confirmPassword}
                show={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
                onChange={setConfirmPassword}
              />

              <button
                type="submit"
                disabled={isLoading || !token}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 font-bold text-white shadow-[0_12px_34px_rgba(59,130,246,0.38)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Update password
              </button>

              {!token && (
                <p className="text-center text-xs leading-5 text-rose-200/90">
                  This reset link is missing a token. Please request a new recovery email.
                </p>
              )}
            </form>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-7 flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 font-bold text-white shadow-[0_12px_34px_rgba(59,130,246,0.38)]"
            >
              Sign in
            </button>
          )}
        </div>
      </motion.div>
    </AuthShell>
  );
};

const PasswordInput = ({
  label,
  value,
  show,
  onToggle,
  onChange,
}: {
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-white/90">{label}</span>
    <span className="relative block">
      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Enter password"
        className="h-12 w-full rounded-full border border-violet-400/25 bg-[#0f0a26]/70 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-300/60"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/55 transition hover:bg-white/5 hover:text-white"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </span>
  </label>
);

const AuthShell = ({ children }: { children: ReactNode }) => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05050f] px-4 py-28">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -right-40 -top-28 h-[560px] w-[680px] rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute -left-40 top-32 h-[480px] w-[520px] rounded-full bg-cyan-400/14 blur-3xl" />
    </div>
    <div className="relative z-10 w-full max-w-md">{children}</div>
  </div>
);

export default ResetPassword;

