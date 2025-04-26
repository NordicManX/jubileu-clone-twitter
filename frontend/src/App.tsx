// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PasswordForgot from "./pages/PasswordForgot";
import CreateTweet from "./pages/CreateTweet";
import Timeline from "./pages/Timeline";
import PrivateRoute from "./components/PrivateRoute";
// Removido: import { ToastContainer } from "react-toastify";
// Removido: import "react-toastify/dist/ReactToastify.css";
import { Toaster } from 'react-hot-toast'; // <<< Importar o Toaster correto

function App() {
  return (
    <BrowserRouter>
      {/* Removido: <ToastContainer /> do react-toastify */}
      {/* Adicionado: <Toaster /> do react-hot-toast */}
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Rotas como antes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Signup />} />
        <Route path="/recuperar-senha" element={<PasswordForgot />} />

        <Route
          path="/timeline" // A rota correta para Timeline
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
         {/* Adicionar rota para /perfil se ela for diferente de /timeline */}
         {/* <Route path="/perfil" element={<PrivateRoute><AlgumComponenteDePerfil /></PrivateRoute>} /> */}

         {/* Rota catch-all (opcional) */}
         {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;