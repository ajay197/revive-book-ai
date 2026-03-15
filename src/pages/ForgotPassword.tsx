import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 items-center justify-center bg-gradient-primary lg:flex">
        <div className="max-w-md px-12 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10">
            <Phone className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary-foreground">Ryngr AI</h2>
          <p className="mt-3 text-primary-foreground/70">Turn old leads into booked appointments with AI-powered calling</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Phone className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">Lead Revival AI</span>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <strong className="text-foreground">{email}</strong>. Click the link in the email to set a new password.
              </p>
              <p className="text-xs text-muted-foreground">Didn't receive it? Check your spam folder or try again.</p>
              <Button variant="outline" className="mt-4" onClick={() => setSent(false)}>
                Try another email
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-foreground">Forgot password?</h1>
              <p className="mt-2 text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p>
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring focus:ring-2"
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          )}

          <Link to="/login" className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
