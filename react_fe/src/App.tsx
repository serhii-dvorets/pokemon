import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { CreatePokemonListPage } from './pages/CreatePokemonListPage'
import { PokemonListDetailsPage } from './pages/PokemonListDetailsPage'
import { PokemonListsPage } from './pages/PokemonListsPage'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate replace to="/pokemon-lists" />} />
        <Route path="/pokemon-lists" element={<PokemonListsPage />} />
        <Route path="/pokemon-lists/new" element={<CreatePokemonListPage />} />
        <Route path="/pokemon-lists/:id" element={<PokemonListDetailsPage />} />
      </Routes>
    </AppLayout>
  )
}

export default App
