import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Eye, EyeOff } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch {
      setError("Connexion impossible. Vérifiez votre email et mot de passe.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-primary-foreground/20"
              style={{
                width: `${200 + i * 120}px`,
                height: `${200 + i * 120}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm mb-6">
            <Home className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground mb-3">SmartHome</h1>
          <p className="text-primary-foreground/80 max-w-sm">
            Surveillez votre maison en temps réel. Sécurité, confort et contrôle total.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SmartHome</span>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Connexion</h2>
            <p className="mt-2 text-sm text-muted-foreground">Accédez à votre tableau de bord</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                className="h-11"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 gradient-primary text-primary-foreground font-semibold shadow-md hover:opacity-90 transition-opacity"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">ou</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-11"
            onClick={() => navigate("/signup")}
          >
            Créer un compte
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Pas de compte ?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
