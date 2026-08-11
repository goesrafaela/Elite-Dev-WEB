import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Home } from "./pages/Home";
import { EventDetails } from "./pages/EventDetails";
import { Reservation } from "./pages/Reservation";
import { Payment } from "./pages/Payment";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { Login } from "./pages/Login";
import { OrganizerDashboard } from "./pages/OrganizerDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/reservas/:eventId" element={<Reservation />} />
        <Route path="/pagamento/:eventId" element={<Payment />} />
        <Route
          path="/pagamento/sucesso/:reservationId"
          element={<PaymentSuccess />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/organizador" element={<OrganizerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
