import { useLocation, useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

interface PaymentSuccessState {
  reservationId: string;
  seats: string[];
  quantity: number;
  subtotal: number;
  payment?: {
    id: string;
    reservationId: string;
    amount: string | number;
    status: string;
    transactionId?: string | null;
  };
  tickets?: Array<{
    id: string;
    codeHash: string;
    status: string;
  }>;
}

export function PaymentSuccess() {
  const navigate = useNavigate();
  const { reservationId } = useParams();
  const location = useLocation();

  const state = location.state as PaymentSuccessState | null;

  if (!state?.reservationId) {
    return (
      <main className="details-page">
        <div className="details-state error">
          <h2>Informações do pagamento não encontradas.</h2>

          <button className="back-button" onClick={() => navigate("/")}>
            Voltar para eventos
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="reservation-page">
      <div className="container">
        <div className="reservation-header">
          <span className="section-label">PAGAMENTO APROVADO</span>

          <h1>Reserva confirmada!</h1>

          <p>Seu pagamento foi aprovado e seus ingressos foram gerados.</p>
        </div>

        <section className="reservation-card">
          <div className="reservation-event">
            <span className="section-label">RESERVA</span>

            <h2>Festival Elite Dev</h2>

            <div className="reservation-info">
              <div>
                <span>RESERVA</span>
                <strong>{reservationId?.slice(0, 8)}...</strong>
              </div>

              <div>
                <span>ASSENTOS</span>
                <strong>{state.seats.join(", ")}</strong>
              </div>

              <div>
                <span>TOTAL</span>
                <strong>
                  R$ {state.subtotal.toFixed(2).replace(".", ",")}
                </strong>
              </div>
            </div>
          </div>

          <div className="reservation-purchase">
            <span className="section-label">SEUS INGRESSOS</span>

            <div className="tickets-grid">
              {state.tickets && state.tickets.length > 0 ? (
                state.tickets.map((ticket, index) => (
                  <article className="ticket-card" key={ticket.id}>
                    <div className="ticket-top">
                      <div>
                        <span className="ticket-label">INGRESSO</span>

                        <h3>#{String(index + 1).padStart(2, "0")}</h3>
                      </div>

                      <span className="ticket-status">{ticket.status}</span>
                    </div>

                    <div className="ticket-divider" />

                    <div className="ticket-qr-wrapper">
                      <div className="ticket-qr">
                        <QRCodeSVG value={ticket.id} size={190} level="H" />
                      </div>
                    </div>

                    <div className="ticket-footer">
                      <strong>Apresente este QR Code</strong>

                      <span>na portaria do evento</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="details-state error">
                  <p>
                    Os ingressos foram processados, mas não foram encontrados
                    nesta tela.
                  </p>
                </div>
              )}
            </div>

            <button className="reserve-button" onClick={() => navigate("/")}>
              Voltar para eventos
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
