import { useState } from 'react'
import './App.css'
import Explorar from './components/explorar'
import Detalhes from './components/Detalhes'

function App() {
  const [livroAberto, setLivroAberto] = useState('')

  return (
    <>
      <h1>BookSpace</h1>

      {livroAberto ? (
        <Detalhes id={livroAberto} voltar={() => setLivroAberto('')} />
      ) : (
        <Explorar abrirLivro={setLivroAberto} />
      )}
    </>
  )
}

export default App
