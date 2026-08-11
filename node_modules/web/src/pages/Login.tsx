import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

interface LoginResponse {
  access_token?: string;
  accessToken?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
  message?: string;
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      /*
       * CADASTRO
       */
      if (isRegistering) {
        await api.post("/auth/register", {
          name,
          email,
          password,
        });
      }

      /*
       * LOGIN
       */
      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      console.log("RESPOSTA DO LOGIN:", response.data);

      const token =
        response.data?.access_token ||
        response.data?.accessToken ||
        response.data?.token;

      if (!token) {
        throw new Error("Token não retornado pelo servidor.");
      }

      /*
       * SALVA O TOKEN
       */
      localStorage.setItem("token", token);

      /*
       * USUÁRIO RETORNADO PELO LOGIN
       */
      const user = response.data?.user;

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      /*
       * DESTINO SOLICITADO ANTES DO LOGIN
       *
       * Exemplo:
       * /login?redirect=/events/123
       */
      const params = new URLSearchParams(location.search);

      const redirect = params.get("redirect");

      /*
       * Compatibilidade com navigate(..., {
       *   state: { from: "..." }
       * })
       */
      const state = location.state as {
        from?: string;
      } | null;

      /*
       * ORGANIZADOR
       *
       * Organizador sempre entra no painel.
       */
      if (user?.role === "ORGANIZER") {
        navigate("/organizador", {
          replace: true,
        });

        return;
      }

      /*
       * CLIENTE
       *
       * Se ele estava tentando acessar um evento,
       * volta para aquele evento.
       *
       * Caso contrário, vai para a Home.
       */
      const destination = redirect || state?.from || "/";

      navigate(destination, {
        replace: true,
      });
    } catch (error: unknown) {
      console.error("ERRO DE AUTENTICAÇÃO:", error);

      const apiError = error as ApiErrorResponse;

      const message =
        apiError?.response?.data?.message ||
        apiError?.message ||
        "Não foi possível realizar a operação.";

      if (Array.isArray(message)) {
        setError(message.join("\n"));
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="section-label">ELITE DEV</span>

          <h1>{isRegistering ? "Crie sua conta" : "Entrar"}</h1>

          <p>
            {isRegistering
              ? "Crie sua conta para comprar ingressos e acompanhar suas reservas."
              : "Entre para continuar sua compra ou acessar sua área."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <label>
              <span>Nome</span>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Seu nome"
                required
              />
            </label>
          )}

          <label>
            <span>E-mail</span>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              required
            />
          </label>

          <label>
            <span>Senha</span>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              required
              minLength={6}
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="reserve-button auth-submit"
            disabled={loading}
          >
            {loading ? "Aguarde..." : isRegistering ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <div className="auth-switch">
          {isRegistering
            ? "Já possui uma conta?"
            : "Ainda não possui uma conta?"}

          <button
            type="button"
            onClick={() => {
              setIsRegistering((current) => !current);

              setError("");
            }}
          >
            {isRegistering ? "Entrar" : "Criar conta"}
          </button>
        </div>

        <button
          type="button"
          className="back-link auth-back"
          onClick={() => navigate("/")}
        >
          ← Voltar para eventos
        </button>
      </div>
    </main>
  );
}
