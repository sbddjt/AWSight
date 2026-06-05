import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./pages/DashboardPage";
import { AccountsPage } from "./pages/AccountsPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { CostsPage } from "./pages/CostsPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/costs" element={<CostsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
