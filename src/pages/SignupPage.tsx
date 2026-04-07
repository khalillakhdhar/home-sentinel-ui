import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Eye, EyeOff } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setIsSubmitting(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const displayName = `${firstName} ${lastName}`.trim();

      if (displayName) {
        await updateProfile(credential.user, { displayName });
      }

      navigate("/dashboard");
    } catch {
      setError("Création du compte impossible. Vérifiez les informations saisies.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="flex items-center gap-3 justify-center mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">SmartHome</span>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Créer un compte</h2>
          <p className="mt-2 text-sm text-muted-foreground">Rejoignez SmartHome Monitoring</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-foreground">Prénom</Label>
              <Input
                placeholder="Ahmed"
                className="h-11"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Nom</Label>
              <Input
                placeholder="Hammadi"
                className="h-11"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Email</Label>
            <Input
              type="email"
              placeholder="vous@exemple.com"
              className="h-11"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Mot de passe</Label>
            <div className="relative">
              <Input
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
            {isSubmitting ? "Création..." : "Créer mon compte"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
