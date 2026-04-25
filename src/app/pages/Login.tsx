import { useState } from "react";
import { Eye, EyeOff, Anchor } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

type Mode = "login" | "signup";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const field = (
    label: string,
    type: string,
    key: keyof typeof form,
    placeholder: string,
    show?: boolean,
    toggle?: () => void,
    helper?: string,
  ) => (
    <div>
      <label className="block text-[12px] font-medium text-[#CBD5F1] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={toggle ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full h-12 bg-[#111640] border border-[#1E2D5A] rounded-lg px-4 text-[14px] text-white placeholder-[#4B5380] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
        />
        {toggle && (
          <button
            type="button"
            onClick={toggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5380] hover:text-[#CBD5F1] transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {helper && <p className="mt-1 text-[11px] text-[#4B5380]">{helper}</p>}
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (mode === "signup") {
      if (!form.username) { toast.error("Username is required"); return; }
      if (form.username.length < 3) { toast.error("Username must be at least 3 characters"); return; }
      if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
      if (form.password !== form.confirm) { toast.error("Passwords do not match"); return; }
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body: Record<string, string> = { email: form.email, password: form.password };
      if (mode === "signup") body.username = form.username;

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      // Persist token & user info for the rest of the app
      localStorage.setItem("harbor_token", data.token);
      localStorage.setItem(
        "harbor_auth",
        JSON.stringify({ username: data.user.username, email: data.user.email }),
      );

      toast.success(mode === "login" ? "Welcome back!" : "Account created successfully!");
      // Full reload so FinanceProvider remounts with the new user's token.
      // navigate() would keep old user's data in memory.
      window.location.href = "/";
    } catch {
      toast.error("Cannot connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05071A] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <Anchor className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <span className="text-[28px] font-bold text-white tracking-[-0.3px]">Harbor</span>
          </div>
          <p className="text-[13px] text-[#CBD5F1]">Your finances, anchored.</p>
        </div>

        {/* Card */}
        <div className="bg-[#0B0F2E] border border-[#1E2D5A] rounded-2xl p-10">
          {/* Mode toggle */}
          <div className="flex bg-[#111640] rounded-lg p-1 mb-6">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-all ${mode === m ? "bg-primary text-white" : "text-[#CBD5F1] hover:text-white"
                  }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" &&
              field("Username", "text", "username", "e.g. alex_fintrack", undefined, undefined, "This will be displayed on your profile")}
            {field("Email Address", "email", "email", "you@example.com")}
            {field("Password", "password", "password", "Enter your password", showPassword, () => setShowPassword((v) => !v))}
            {mode === "signup" &&
              field("Confirm Password", "password", "confirm", "Repeat your password", showConfirm, () => setShowConfirm((v) => !v))}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:opacity-90 disabled:opacity-60 text-white text-[14px] font-medium rounded-lg transition-opacity mt-2"
            >
              {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-[13px] text-[#CBD5F1] text-center">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-primary hover:opacity-80 font-medium transition-opacity"
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
