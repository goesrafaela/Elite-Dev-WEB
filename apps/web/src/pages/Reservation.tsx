import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

const seats = [
  ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08"],
  ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08"],
  ["C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08"],
  ["D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08"],
  ["E01", "E02", "E03", "E04", "E05", "E06", "E07", "E08"],
  ["F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08"],
];

export function Reservation() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Temporariamente mantemos estes dados.
  // Depois podemos buscar o evento pela API.
  const event = {
    title: "Festival Elite Dev",
    date: "20/12/2026 às 20:00",
    location: "São Paulo - SP",
    price: 89.9,
  };

  function toggleSeat(seat: string) {
    setSelectedSeats((current) => {
      if (current.includes(seat)) {
        return current.filter((item) => item !== seat);
      }

      return [...current, seat];
    });
  }

  const subtotal = event.price * selectedSeats.length;

  async function handleContinue() {
    if (selectedSeats.length === 0 || !eventId) {
      return;
    }

    try {
      const response = await api.post("/reservations", {
        eventId,
        seats: selectedSeats,
      });

      const reservation = response.data;

      console.log("Reserva criada:", reservation);

      navigate(`/pagamento/${eventId}`, {
        state: {
          reservationId: reservation.id,
          seats: selectedSeats,
          quantity: selectedSeats.length,
          subtotal,
        },
      });
    } catch (error: any) {
      console.error("ERRO AO CRIAR RESERVA:", error);

      const message =
        error?.response?.data?.message || "Não foi possível criar a reserva.";

      alert(Array.isArray(message) ? message.join("\n") : message);
    }
  }

  return (
    <main className="reservation-page">
      <div className="container">
        <button className="back-link" onClick={() => navigate(-1)}>
          ← Voltar
        </button>

        <div className="reservation-header">
          <span className="section-label">RESERVA</span>

          <h1>Escolha seus assentos</h1>

          <p>Selecione os lugares onde você deseja assistir ao evento.</p>
        </div>

        <section className="reservation-card">
          <div className="reservation-event">
            <span className="section-label">EVENTO</span>

            <h2>{event.title}</h2>

            <div className="reservation-info">
              <div>
                <span>DATA</span>
                <strong>{event.date}</strong>
              </div>

              <div>
                <span>LOCAL</span>
                <strong>{event.location}</strong>
              </div>

              <div>
                <span>INGRESSO</span>
                <strong>R$ {event.price.toFixed(2).replace(".", ",")}</strong>
              </div>
            </div>
          </div>

          <div className="reservation-purchase">
            <span className="section-label">MAPA DE ASSENTOS</span>

            <div className="seat-stage">PALCO</div>

            <div className="seat-map">
              {seats.map((row) => (
                <div className="seat-row" key={row[0]}>
                  {row.map((seat) => {
                    const isSelected = selectedSeats.includes(seat);

                    return (
                      <button
                        key={seat}
                        className={`seat ${
                          isSelected ? "seat-selected" : "seat-available"
                        }`}
                        onClick={() => toggleSeat(seat)}
                        title={
                          isSelected ? "Remover seleção" : "Selecionar assento"
                        }
                      >
                        {seat}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="seat-legend">
              <div>
                <span className="legend-box available" />
                Disponível
              </div>

              <div>
                <span className="legend-box selected" />
                Selecionado
              </div>

              <div>
                <span className="legend-box occupied" />
                Ocupado
              </div>
            </div>

            <div className="selected-seats">
              <span>SEUS ASSENTOS</span>

              {selectedSeats.length === 0 ? (
                <strong>Nenhum assento selecionado</strong>
              ) : (
                <strong>{selectedSeats.join(", ")}</strong>
              )}
            </div>

            <div className="reservation-summary">
              <div>
                <span>Quantidade</span>
                <strong>{selectedSeats.length} ingresso(s)</strong>
              </div>

              <div>
                <span>Subtotal</span>
                <strong>R$ {subtotal.toFixed(2).replace(".", ",")}</strong>
              </div>
            </div>

            <button
              className="reserve-button"
              disabled={selectedSeats.length === 0}
              onClick={handleContinue}
            >
              {selectedSeats.length === 0
                ? "Selecione um assento"
                : "Continuar para pagamento"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
