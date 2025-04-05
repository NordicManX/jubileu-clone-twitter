import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PasswordForgot from "./pages/PasswordForgot";
import CreateTweet from "./pages/CreateTweet";
import Timeline from "./pages/Timeline";
import PrivateRoute from "./components/PrivateRoute"; // ou onde você salvar

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Signup />} />
        <Route path="/recuperar-senha" element={<PasswordForgot />} />

        <Route
          path="/timeline"
          element={
            <PrivateRoute>
              <Timeline />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/criar-tweet"
          element={
            <PrivateRoute>
              <CreateTweet />
            </PrivateRoute>
          }
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
