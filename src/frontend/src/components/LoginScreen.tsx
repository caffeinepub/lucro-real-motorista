import { useState } from "react";
import type { User } from "../types";

interface Props {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regBirthdate, setRegBirthdate] = useState("");
  const [regError, setRegError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginEmail || !loginPassword) {
      setLoginError("Preencha todos os campos.");
      return;
    }
    const saved = localStorage.getItem("lucro_user");
    if (saved) {
      const user: User = JSON.parse(saved);
      if (user.email === loginEmail) {
        onLogin(user);
        return;
      }
    }
    // Allow any login with stored data, or create guest
    const user: User = { name: loginEmail.split("@")[0], email: loginEmail };
    localStorage.setItem("lucro_user", JSON.stringify(user));
    onLogin(user);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!regName || !regEmail || !regPassword) {
      setRegError("Preencha nome, e-mail e senha.");
      return;
    }
    const user: User = {
      name: regName,
      email: regEmail,
      birthdate: regBirthdate,
    };
    localStorage.setItem("lucro_user", JSON.stringify(user));
    onLogin(user);
  };

  const handleGoogle = () => {
    const user: User = { name: "Usuário Google", email: "usuario@google.com" };
    localStorage.setItem("lucro_user", JSON.stringify(user));
    onLogin(user);
  };

  const inputStyle: React.CSSProperties = {
    background: "oklch(0.14 0.02 240)",
    border: "1px solid oklch(0.26 0.025 245)",
    borderRadius: "12px",
    color: "oklch(0.94 0.01 240)",
    padding: "12px 16px",
    fontSize: "15px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-8"
      style={{ background: "oklch(0.10 0.015 240)" }}
      data-ocid="login.page"
    >
      {/* Pug mascot */}
      <div className="mb-4 flex flex-col items-center">
        <img
          src="/assets/generated/pug-mascot-transparent.dim_400x400.png"
          alt="Pug mascot"
          style={{ width: 160, height: 160, objectFit: "contain" }}
        />
        <div className="text-center mt-2">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "oklch(0.94 0.01 240)" }}
          >
            Lucro Real
          </h1>
          <p
            className="text-base font-semibold tracking-widest uppercase mt-0.5"
            style={{ color: "#1a73e8" }}
          >
            Motorista
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div
        className="flex rounded-xl p-1 mb-6 w-full max-w-sm"
        style={{ background: "oklch(0.16 0.022 242)" }}
        data-ocid="login.tab"
      >
        <button
          type="button"
          onClick={() => setMode("login")}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: mode === "login" ? "#1a73e8" : "transparent",
            color: mode === "login" ? "#fff" : "oklch(0.68 0.025 225)",
          }}
          data-ocid="login.entrar.tab"
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: mode === "register" ? "#1a73e8" : "transparent",
            color: mode === "register" ? "#fff" : "oklch(0.68 0.025 225)",
          }}
          data-ocid="login.cadastrar.tab"
        >
          Cadastrar
        </button>
      </div>

      <div className="w-full max-w-sm">
        {mode === "login" ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="E-mail"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={inputStyle}
              data-ocid="login.email.input"
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Senha"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={inputStyle}
              data-ocid="login.password.input"
              autoComplete="current-password"
            />
            {loginError && (
              <p
                className="text-xs text-center"
                style={{ color: "oklch(0.65 0.22 22)" }}
                data-ocid="login.error_state"
              >
                {loginError}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-95 mt-1"
              style={{ background: "#1a73e8", color: "#fff" }}
              data-ocid="login.submit_button"
            >
              Entrar
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Nome completo"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              style={inputStyle}
              data-ocid="register.name.input"
              autoComplete="name"
            />
            <input
              type="email"
              placeholder="E-mail"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              style={inputStyle}
              data-ocid="register.email.input"
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Senha"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              style={inputStyle}
              data-ocid="register.password.input"
              autoComplete="new-password"
            />
            <div className="flex flex-col gap-1">
              <label
                htmlFor="reg-birthdate"
                className="text-xs font-medium pl-1"
                style={{ color: "oklch(0.68 0.025 225)" }}
              >
                Data de Nascimento
              </label>
              <input
                id="reg-birthdate"
                type="date"
                value={regBirthdate}
                onChange={(e) => setRegBirthdate(e.target.value)}
                style={{ ...inputStyle, colorScheme: "dark" }}
                data-ocid="register.birthdate.input"
              />
            </div>
            {regError && (
              <p
                className="text-xs text-center"
                style={{ color: "oklch(0.65 0.22 22)" }}
                data-ocid="register.error_state"
              >
                {regError}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-95 mt-1"
              style={{ background: "#1a73e8", color: "#fff" }}
              data-ocid="register.submit_button"
            >
              Criar Conta
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div
            className="flex-1 h-px"
            style={{ background: "oklch(0.26 0.025 245)" }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: "oklch(0.50 0.02 240)" }}
          >
            ou
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "oklch(0.26 0.025 245)" }}
          />
        </div>

        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-95"
          style={{
            background: "oklch(0.16 0.022 242)",
            border: "1px solid oklch(0.26 0.025 245)",
            color: "oklch(0.94 0.01 240)",
          }}
          data-ocid="login.google.button"
        >
          {/* Google G icon */}
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          Continuar com Google
        </button>
      </div>

      {/* Footer */}
      <p
        className="text-xs mt-8 text-center"
        style={{ color: "oklch(0.40 0.015 240)" }}
      >
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "oklch(0.50 0.02 240)" }}
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
