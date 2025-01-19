import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CallbackPage from './pages/CallbackPage';
import Result from './pages/Result';
function App() {
  return (
    <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                 <Route path="/callback" element={<CallbackPage />} />
                <Route path="/result" element={<Result />} />
            </Routes>
        </Router>
  );
}

export default App;
