import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthPanel from "./components/AuthPanel";
import UploadPage from "./components/Upload/UploadPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import History from "./pages/History";
import Report from "./pages/Report";
import PlantCareLanding from "./pages/PlantCareLanding";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<AuthPanel />} />
        {/* public landing if you want */}
        <Route path="/landing" element={<PlantCareLanding />} />

        {/* protected routes */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/knowledge-base"
          element={
            <ProtectedRoute>
              <KnowledgeBasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:id"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div className="p-6">Page not found</div>} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;

