import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import ExpedienteDicriCreate from './pages/ExpedienteDicriCreate';
import ExpedienteDicriDetail from './pages/ExpedienteDicriDetail';
import ExpedientesDicriList from './pages/ExpedientesDicriList';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function App() {

  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/expedientes-dicri" element={<ProtectedRoute><ExpedientesDicriList /></ProtectedRoute>} />
        <Route path="/expedientes-dicri/nuevo" element={<ProtectedRoute><ExpedienteDicriCreate /></ProtectedRoute>} />
        <Route path="/expedientes-dicri/:id" element={<ProtectedRoute><ExpedienteDicriDetail /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
