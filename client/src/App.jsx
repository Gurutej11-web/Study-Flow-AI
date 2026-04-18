import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import WorkspacePage from "./pages/WorkspacePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
      </Routes>
    </BrowserRouter>
  );
}
