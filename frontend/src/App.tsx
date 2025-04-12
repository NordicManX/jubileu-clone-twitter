import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PasswordForgot from "./pages/PasswordForgot";
import CreateTweet from "./pages/CreateTweet";
import Timeline from "./pages/Timeline";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      {/* Toast global para toda a aplicação */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      
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
