import "../App.css";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await api.get<Event[]>(`/events`);

        const foundEvent = response.data.find((item) => item.id === id);

        if (!foundEvent) {
          setError("Evento não encontrado.");
          return;
        }

        setEvent(foundEvent);
      } catch (error) {
        console.error("ERRO AO BUSCAR EVENTO:", error);
        setError("Não foi possível carregar o evento.");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  function formatPrice(price: string) {
    return Number(price).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="details-page">
        <div className="details-state">
          <div className="spinner" />
          <p>Carregando evento...</p>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="details-page">
        <div className="details-state error">
          <h2>{error || "Evento não encontrado."}</h2>

          <button className="back-button" onClick={() => navigate("/")}>
            Voltar para eventos
          </button>
        </div>
      </main>
    );
  }

  const availableTickets = event.capacity - event.soldQuantity;

  return (
    <main className="details-page">
      <div className="container">
        <button className="back-link" onClick={() => navigate("/")}>
          ← Voltar para eventos
        </button>

        <section className="details-card">
          <div className="details-image">
            {event.posterUrl ? (
              <img src={event.posterUrl} alt={event.title} />
            ) : (
              <div className="details-placeholder">
                <span>ELITE</span>
                <strong>DEV</strong>
              </div>
            )}
          </div>

          <div className="details-content">
            <span className="section-label">EVENTO PUBLICADO</span>

            <h1>{event.title}</h1>

            {event.description && (
              <p className="details-description">{event.description}</p>
            )}

            <div className="details-info">
              <div className="info-item">
                <span>DATA</span>
                <strong>{formatDate(event.date)}</strong>
              </div>

              <div className="info-item">
                <span>LOCAL</span>
                <strong>{event.location}</strong>
              </div>

              <div className="info-item">
                <span>INGRESSOS DISPONÍVEIS</span>
                <strong>{availableTickets}</strong>
              </div>
            </div>

            <div className="details-purchase">
              <div>
                <span className="price-label">Ingresso a partir de</span>

                <strong className="details-price">
                  {formatPrice(event.price)}
                </strong>
              </div>

              <button
                className="reserve-button"
                disabled={availableTickets <= 0}
                onClick={() => navigate(`/reservas/${event.id}`)}
              >
                {availableTickets > 0 ? "Reservar ingresso" : "Evento esgotado"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
