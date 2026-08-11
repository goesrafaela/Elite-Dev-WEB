import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

interface Event {
  id: string;
  title: string;
  description?: string;
  posterUrl?: string | null;
  date: string;
  location: string;
  capacity: number;
  soldQuantity: number;
  price: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function OrganizerDashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const userResponse = await api.get<User>("/auth/me");

        setUser(userResponse.data);

        if (userResponse.data.role !== "ORGANIZER") {
          navigate("/", { replace: true });
          return;
        }

        const eventsResponse = await api.get<Event[]>("/events");

        setEvents(eventsResponse.data);
      } catch (error) {
        console.error("ERRO AO CARREGAR DASHBOARD:", error);

        localStorage.removeItem("token");

        setError("Não foi possível carregar o painel.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatPrice(price: string) {
    return Number(price).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (loading) {
    return (
      <main className="details-page">
        <div className="details-state">
          <div className="spinner" />
          <p>Carregando painel...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="details-page">
        <div className="details-state error">
          <h2>{error}</h2>

          <button className="back-button" onClick={() => navigate("/login")}>
            Ir para login
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <button
            type="button"
            className="logo"
            onClick={() => navigate("/organizador")}
          >
            <span className="logo-mark">E</span>

            <span>
              ELITE<span>DEV</span>
            </span>
          </button>

          <nav className="nav">
            <button type="button" onClick={() => navigate("/organizador")}>
              Eventos
            </button>

            <button
              type="button"
              onClick={() => navigate("/organizador/eventos/novo")}
            >
              Criar evento
            </button>

            <button
              type="button"
              className="login-button"
              onClick={handleLogout}
            >
              Sair
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="events-section organizer-dashboard">
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-label">PAINEL DO ORGANIZADOR</span>

                <h1>Olá, {user?.name || "Organizador"}.</h1>

                <p>Gerencie seus eventos e acompanhe suas vendas.</p>
              </div>

              <button
                type="button"
                className="reserve-button"
                onClick={() => navigate("/organizador/eventos/novo")}
              >
                + Criar novo evento
              </button>
            </div>

            <div className="organizer-stats">
              <div className="organizer-stat-card">
                <span>EVENTOS</span>
                <strong>{events.length}</strong>
                <p>Eventos cadastrados</p>
              </div>

              <div className="organizer-stat-card">
                <span>INGRESSOS VENDIDOS</span>
                <strong>
                  {events.reduce(
                    (total, event) => total + event.soldQuantity,
                    0,
                  )}
                </strong>
                <p>Total de ingressos vendidos</p>
              </div>

              <div className="organizer-stat-card">
                <span>DISPONÍVEIS</span>
                <strong>
                  {events.reduce(
                    (total, event) =>
                      total + (event.capacity - event.soldQuantity),
                    0,
                  )}
                </strong>
                <p>Ingressos disponíveis</p>
              </div>
            </div>

            <div className="organizer-events-header">
              <div>
                <span className="section-label">SEUS EVENTOS</span>
                <h2>Eventos publicados</h2>
              </div>
            </div>

            {events.length === 0 ? (
              <div className="empty-state">
                <span>+</span>

                <h3>Nenhum evento cadastrado</h3>

                <p>Comece criando seu primeiro evento.</p>

                <button
                  type="button"
                  className="reserve-button"
                  onClick={() => navigate("/organizador/eventos/novo")}
                >
                  Criar primeiro evento
                </button>
              </div>
            ) : (
              <div className="events-grid">
                {events.map((event) => {
                  const available = event.capacity - event.soldQuantity;

                  return (
                    <article className="event-card" key={event.id}>
                      <div className="event-image">
                        {event.posterUrl ? (
                          <img src={event.posterUrl} alt={event.title} />
                        ) : (
                          <div className="event-placeholder">
                            <span>ELITE</span>
                            <strong>DEV</strong>
                          </div>
                        )}

                        <div className="event-date">
                          <strong>{new Date(event.date).getDate()}</strong>

                          <span>
                            {new Date(event.date)
                              .toLocaleDateString("pt-BR", {
                                month: "short",
                              })
                              .replace(".", "")}
                          </span>
                        </div>
                      </div>

                      <div className="event-content">
                        <span className="event-location">{event.location}</span>

                        <h3>{event.title}</h3>

                        <p className="event-description">
                          {formatDate(event.date)}
                        </p>

                        <div className="event-footer">
                          <div>
                            <span className="price-label">Ingresso</span>

                            <strong>{formatPrice(event.price)}</strong>
                          </div>

                          <button
                            type="button"
                            className="event-button"
                            onClick={() =>
                              navigate(`/organizador/eventos/${event.id}`)
                            }
                          >
                            Gerenciar
                          </button>
                        </div>

                        <div className="availability">
                          <span>{event.soldQuantity} vendidos</span>

                          <span>{available} disponíveis</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <span className="logo footer-logo">
            <span className="logo-mark">E</span>

            <span>
              ELITE<span>DEV</span>
            </span>
          </span>

          <p>© 2026 Elite Dev. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
