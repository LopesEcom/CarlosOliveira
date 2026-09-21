import { Route, Routes } from 'react-router-dom'

import Landing from './pages/Landing'

/**
 * Uma página só. A rota curinga devolve a própria landing, e não uma página
 * de erro: link colado em conversa chega torto com frequência (uma barra a
 * mais, um parâmetro estranho), e "não encontrado" é pior que abrir a página
 * certa.
 */
function App() {
  return (
    <Routes>
      <Route path="*" element={<Landing />} />
    </Routes>
  )
}

export default App
