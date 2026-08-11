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

export function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await api.get<Event[]>("/events");
        setEvents(response.data);
      } catch (error) {
        console.error("ERRO AO BUSCAR EVENTOS:", error);
        setError("Não foi possível carregar os eventos.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (error) {
        console.error("TOKEN INVÁLIDO:", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    }

    loadUser();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  }

  const filteredEvents = events.filter((event) => {
    const searchText = search.toLowerCase();

    return (
      event.title.toLowerCase().includes(searchText) ||
      event.location.toLowerCase().includes(searchText)
    );
  });

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

  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <button
            className="logo"
            onClick={() => navigate("/")}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <span className="logo-mark">E</span>
            <span>
              ELITE<span>DEV</span>
            </span>
          </button>

          <nav className="nav">
            <a href="#eventos">Eventos</a>
            <a href="#sobre">Sobre</a>

            {user ? (
              <>
                <span className="login-user">Olá, {user.name}</span>

                <button className="login-button" onClick={handleLogout}>
                  Sair
                </button>
              </>
            ) : (
              <button
                className="login-button"
                onClick={() => navigate("/login")}
              >
                Entrar
              </button>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-content">
            <div className="hero-text">
              <span className="hero-badge">EVENTOS AO VIVO</span>

              <h1>
                Viva experiências
                <br />
                <span>inesquecíveis.</span>
              </h1>

              <p>
                Encontre shows, festivais e experiências que combinam com você.
                Reserve seu ingresso de forma simples e segura.
              </p>

              <a href="#eventos" className="hero-button">
                Explorar eventos
              </a>
            </div>
          </div>
        </section>

        <section className="events-section" id="eventos">
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-label">AGENDA</span>
                <h2>Próximos eventos</h2>
              </div>

              <div className="search-box">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Buscar eventos..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            {loading && (
              <div className="state-message">
                <div className="spinner" />
                <p>Carregando eventos...</p>
              </div>
            )}

            {error && (
              <div className="state-message error">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && filteredEvents.length === 0 && (
              <div className="empty-state">
                <span>⌕</span>
                <h3>Nenhum evento encontrado</h3>
                <p>Tente buscar por outro nome ou localização.</p>
              </div>
            )}

            {!loading && !error && filteredEvents.length > 0 && (
              <div className="events-grid">
                {filteredEvents.map((event) => (
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

                      {event.description && (
                        <p className="event-description">{event.description}</p>
                      )}

                      <div className="event-footer">
                        <div>
                          <span className="price-label">A partir de</span>

                          <strong>{formatPrice(event.price)}</strong>
                        </div>

                        <button
                          className="event-button"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          Ver evento
                        </button>
                      </div>

                      <div className="availability">
                        <span>
                          {event.capacity - event.soldQuantity} ingressos
                          disponíveis
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="about-section" id="sobre">
          <div className="container about-content">
            <span className="section-label">ELITE DEV</span>

            <h2>Seu próximo evento começa aqui.</h2>

            <p>
              Uma experiência simples para descobrir eventos, reservar seus
              ingressos e aproveitar o momento.
            </p>
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
