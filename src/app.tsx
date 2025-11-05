import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Navbar from "./components/shared/navbar";
import LoginPage from "./pages/login";
import { AuthRefresh } from "./bootstrap/auth-refresh";
import { RoleRoute } from "./routes/role-route";

function App() {
  return (
    <>
      <AuthRefresh>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login sahifa */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin route */}
          <Route
            path="/admin"
            element={
              <RoleRoute roles={["admin"]}>
                <Navbar />
                <Outlet />
              </RoleRoute>
            }
          >
            <Route index element={<Home />} />
          </Route>

          {/* Unauthorized sahifa */}
          <Route
            path="/unauthorized"
            element={
              <div className="text-center p-10 text-red-500">
                Sizga ruxsat yo‘q!
              </div>
            }
          />

          {/* 404 sahifa */}
          <Route
            path="*"
            element={
              <div className="text-center p-10 text-gray-500">
                Sahifa topilmadi
              </div>
            }
          />
        </Routes>
      </AuthRefresh>
    </>
  );
}

export default App;
