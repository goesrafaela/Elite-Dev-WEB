import { QRCodeSVG } from "qrcode.react";

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { api } from "../services/api";

interface PaymentState {
  reservationId: string;
  seats: string[];
  quantity: number;
  subtotal: number;
}

interface PaymentResponse {
  payment?: {
    id: string;
    status: string;
    amount: string | number;
    transactionId?: string | null;
  };
  reservation?: {
    id: string;
    status: string;
  };
  tickets?: Array<{
    id: string;
    codeHash: string;
    status: string;
  }>;
}

export function Payment() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as PaymentState | null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!state?.reservationId) {
    return (
      <main className="details-page">
        <div className="details-state error">
          <h2>Reserva não encontrada.</h2>

          <button
            className="back-button"
            onClick={() => navigate(`/events/${eventId}`)}
          >
            Voltar para o evento
          </button>
        </div>
      </main>
    );
  }

  async function handlePayment(simulate: "APPROVED" | "DECLINED") {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("ENVIANDO PAGAMENTO:", {
        reservationId: state.reservationId,
        simulate,
      });

      const response = await api.post<PaymentResponse>("/payments", {
        reservationId: state.reservationId,
        simulate,
      });

      console.log("PAGAMENTO RECEBIDO:", response.data);

      if (simulate === "APPROVED") {
        navigate(`/pagamento/sucesso/${state.reservationId}`, {
          state: {
            reservationId: state.reservationId,
            seats: state.seats,
            quantity: state.quantity,
            subtotal: state.subtotal,
            payment: response.data.payment,
            reservation: response.data.reservation,
            tickets: response.data.tickets,
          },
        });

        return;
      }

      setError("Pagamento recusado.");
    } catch (error: unknown) {
      console.error("ERRO AO PROCESSAR PAGAMENTO:", error);

      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: {
              message?: string | string[];
            };
          };
        };

        console.error("STATUS:", axiosError.response?.status);

        console.error("RESPOSTA DO BACKEND:", axiosError.response?.data);

        const message = axiosError.response?.data?.message;

        if (Array.isArray(message)) {
          setError(message.join("\n"));
        } else if (message) {
          setError(message);
        } else {
          setError(
            `Erro ${axiosError.response?.status ?? ""} ao processar pagamento.`,
          );
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Não foi possível processar o pagamento.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="reservation-page">
      <div className="container">
        <button className="back-link" onClick={() => navigate(-1)}>
          ← Voltar
        </button>

        <div className="reservation-header">
          <span className="section-label">PAGAMENTO</span>

          <h1>Finalize sua reserva</h1>

          <p>Confira seus ingressos e confirme o pagamento.</p>
        </div>

        <section className="reservation-card">
          <div className="reservation-event">
            <span className="section-label">RESUMO DA RESERVA</span>

            <h2>Festival Elite Dev</h2>

            <div className="reservation-info">
              <div>
                <span>ASSENTOS</span>
                <strong>{state.seats.join(", ")}</strong>
              </div>

              <div>
                <span>QUANTIDADE</span>
                <strong>{state.quantity} ingresso(s)</strong>
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
            <span className="section-label">PAGAMENTO</span>

            <div className="reservation-summary">
              <div>
                <span>Reserva</span>
                <strong>{state.reservationId.slice(0, 8)}...</strong>
              </div>

              <div>
                <span>Assentos</span>
                <strong>{state.seats.join(", ")}</strong>
              </div>

              <div>
                <span>Total</span>
                <strong>
                  R$ {state.subtotal.toFixed(2).replace(".", ",")}
                </strong>
              </div>
            </div>

            {error && (
              <div className="details-state error">
                <p>{error}</p>
              </div>
            )}

            <button
              className="reserve-button"
              disabled={loading}
              onClick={() => handlePayment("APPROVED")}
            >
              {loading ? "Processando..." : "Simular pagamento aprovado"}
            </button>

            <button
              className="back-button"
              disabled={loading}
              onClick={() => handlePayment("DECLINED")}
              style={{
                width: "100%",
                marginTop: "12px",
              }}
            >
              Simular pagamento recusado
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
