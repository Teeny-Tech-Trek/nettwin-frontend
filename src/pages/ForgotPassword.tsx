import { FormEvent, ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2, Mail, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/api.service";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast({
        title: "Recovery email sent",
        description: "Check your inbox for a secure reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Could not send recovery email",
        description: error?.response?.data?.message || error?.message || "Please try again.",
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
              {sent ? <CheckCircle2 className="h-7 w-7 text-cyan-200" /> : <Shield className="h-7 w-7 text-cyan-200" />}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Recover your password</h1>
            <p className="mt-2 text-sm leading-6 text-white/60">
              {sent
                ? "If that email belongs to a NetTwin account, a secure reset link is on its way."
                : "Enter your account email and we will send a secure recovery link."}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-white/90">Email address</span>
                <span className="relative block">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-full border border-violet-400/25 bg-[#0f0a26]/70 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-300/60"
                  />
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 font-bold text-white shadow-[0_12px_34px_rgba(59,130,246,0.38)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Send recovery link
              </button>
            </form>
          ) : (
            <div className="mt-7">
              <Link
                to="/login"
                className="flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 font-bold text-white shadow-[0_12px_34px_rgba(59,130,246,0.38)]"
              >
                Return to sign in
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </AuthShell>
  );
};

const AuthShell = ({ children }: { children: ReactNode }) => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05050f] px-4 py-28">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -right-40 -top-28 h-[560px] w-[680px] rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute -left-40 top-32 h-[480px] w-[520px] rounded-full bg-cyan-400/14 blur-3xl" />
    </div>
    <div className="relative z-10 w-full max-w-md">{children}</div>
  </div>
);

export default ForgotPassword;
