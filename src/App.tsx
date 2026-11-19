import "./App.css";
import { MainPage } from "./components/MainPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PomoCode } from "./components/PomoCode";
import { MintRoad } from "./components/MintRoad";
import { CedhNexus } from "./components/CedhNexus";
import { AuthProvider } from "./lib/AuthContext";
import { LoginPage } from "./pages/billing/LoginPage";
import { AdminPage } from "./pages/billing/AdminPage";
import { PortalPage } from "./pages/billing/PortalPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/pomocode" element={<PomoCode />} />
          <Route path="/mintroad" element={<MintRoad />} />
          <Route path="/cedhnexus" element={<CedhNexus />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/portal" element={<PortalPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
