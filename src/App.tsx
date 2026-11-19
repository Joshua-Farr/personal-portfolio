import "./App.css";
import { MainPage } from "./components/MainPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PomoCode } from "./components/PomoCode";
import { MintRoad } from "./components/MintRoad";
import { CedhNexus } from "./components/CedhNexus";
import { AuthProvider } from "./lib/AuthContext";
import { LoginPage } from "./pages/billing/LoginPage";
import { PortalLayout } from "./pages/billing/portal/PortalLayout";
import { PortalOverview } from "./pages/billing/portal/PortalOverview";
import { PortalInvoices } from "./pages/billing/portal/PortalInvoices";
import { PortalInvoiceDetail } from "./pages/billing/portal/PortalInvoiceDetail";
import { PortalBilling } from "./pages/billing/portal/PortalBilling";
import { AdminLayout } from "./pages/billing/admin/AdminLayout";
import { AdminOverview } from "./pages/billing/admin/AdminOverview";
import { AdminClients } from "./pages/billing/admin/AdminClients";
import { AdminClientDetail } from "./pages/billing/admin/AdminClientDetail";
import { AdminProjects } from "./pages/billing/admin/AdminProjects";
import { AdminProjectDetail } from "./pages/billing/admin/AdminProjectDetail";
import { AdminInvoices } from "./pages/billing/admin/AdminInvoices";
import { AdminSubscriptions } from "./pages/billing/admin/AdminSubscriptions";
import { AdminAuditLog } from "./pages/billing/admin/AdminAuditLog";

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

          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<PortalOverview />} />
            <Route path="invoices" element={<PortalInvoices />} />
            <Route path="invoices/:id" element={<PortalInvoiceDetail />} />
            <Route path="billing" element={<PortalBilling />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="clients/:id" element={<AdminClientDetail />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/:id" element={<AdminProjectDetail />} />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="audit" element={<AdminAuditLog />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
