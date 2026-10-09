import { useState, type FormEvent } from "react";

type Report = {
  repository: {
    name: string;
    url: string;
    description: string;
    license: string | null;
  };
  metrics: Record<string, number | null>;
  checks: Record<string, boolean>;
  languages: { name: string; bytes: number }[];
  contributors: { login: string; contributions: number; url: string }[];
  commits: { sha: string; message: string; at: string; url: string }[];
  coverage: { observedAt: string };
};
export default function App() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState(false);
  const [repository, setRepository] = useState(
    "brunnojob/vercel-home-telemetry-api",
  );
  const [report, setReport] = useState<Report | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function request(path: string, body: unknown) {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Operação indisponível");
    return data;
  }
  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const data = await request("/api/session", {
        email,
        password,
        action: signup ? "signup" : "login",
      });
      setPassword("");
      if (data.confirmationRequired)
        setNotice("Confirme seu e-mail antes de entrar.");
      else {
        setToken(data.accessToken);
        setNotice("Conta conectada.");
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Falha ao entrar");
    } finally {
      setBusy(false);
    }
  }
  async function analyze(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice("Consultando o repositório e registrando o relatório...");
    try {
      const data = await request("/api/insights", {
        repository: repository
          .trim()
          .replace(/^https:\/\/github.com\//, "")
          .replace(/\/$/, ""),
      });
      setReport(data.report);
      setNotice("Relatório persistido na sua conta.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Falha ao analisar");
    } finally {
      setBusy(false);
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "repository-report.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <main>
      <header>
        <p>BRUNNODEV / ENGINEERING</p>
        <h1>Repository Insights</h1>
        <p>
          Dados públicos do GitHub, critérios verificáveis e histórico na sua
          conta.
        </p>
      </header>
      <p role="status" aria-live="polite">
        {notice}
      </p>
      {!token ? (
        <section>
          <h2>Acesse seu histórico</h2>
          <form onSubmit={login}>
            <label>
              E-mail
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={signup}
                onChange={(event) => setSignup(event.target.checked)}
              />
              Criar conta
            </label>
            <button disabled={busy}>Continuar</button>
          </form>
        </section>
      ) : (
        <>
          <button
            onClick={() => {
              setToken("");
              setReport(null);
            }}
          >
            Sair
          </button>
          <section>
            <h2>Analisar repositório público</h2>
            <form onSubmit={analyze}>
              <label>
                Proprietário/repositório
                <input
                  required
                  value={repository}
                  onChange={(event) => setRepository(event.target.value)}
                />
              </label>
              <button disabled={busy}>Analisar e salvar</button>
            </form>
          </section>
        </>
      )}
      {report && (
        <>
          <section>
            <h2>
              <a href={report.repository.url} target="_blank" rel="noreferrer">
                {report.repository.name}
              </a>
            </h2>
            <p>{report.repository.description}</p>
            <p>Licença: {report.repository.license ?? "Não identificada"}</p>
            <div className="metrics">
              {Object.entries(report.metrics).map(([name, value]) => (
                <article key={name}>
                  <small>{name}</small>
                  <strong>{value ?? "Sem dados"}</strong>
                </article>
              ))}
            </div>
          </section>
          <section>
            <h2>Estrutura observada</h2>
            {Object.entries(report.checks).map(([name, value]) => (
              <p key={name}>
                {name}: {value ? "identificado" : "não identificado na raiz"}
              </p>
            ))}
          </section>
          <section>
            <h2>Linguagens</h2>
            {report.languages.map((row) => (
              <p key={row.name}>
                {row.name}: {row.bytes.toLocaleString("pt-BR")} bytes
              </p>
            ))}
          </section>
          <section>
            <h2>Contribuidores</h2>
            {report.contributors.map((row) => (
              <p key={row.login}>
                <a href={row.url}>{row.login}</a> · {row.contributions}{" "}
                contribuições
              </p>
            ))}
          </section>
          <section>
            <h2>Commits recentes</h2>
            {report.commits.map((row) => (
              <p key={row.sha}>
                <a href={row.url}>{row.sha.slice(0, 8)}</a> · {row.message}
              </p>
            ))}
          </section>
          <button onClick={download}>Exportar JSON</button>
          <p>
            Consulta limitada a 100 registros por coleção. Dados observados em{" "}
            {report.coverage.observedAt}.
          </p>
        </>
      )}
      <footer>
        <a href="https://vercel-home-telemetry-api.vercel.app/laboratory.html?project=fuckup">
          Consultar histórico salvo
        </a>{" "}
        · <a href="https://github.com/brunnojob/fuckup">Código-fonte</a>
      </footer>
    </main>
  );
}
