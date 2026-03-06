import './index.css'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Lobby from './pages/Lobby'
import GameSession from './pages/GameSession'
import ResultsPage from './pages/ResultsPage'
import HostPage from './pages/HostPage'
import AddLocation from './pages/AddLocation'
import 'leaflet/dist/leaflet.css';
function App() {

  return (
    <>

    <Routes>
      <Route path="/lobby/:code" element={<Lobby />} />
      <Route path="/game/:code" element={<GameSession />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/host" element={<HostPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/add-location" element={<AddLocation />} />
    </Routes>

    </>
  )
}

export default App
