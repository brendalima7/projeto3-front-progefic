import { useState } from 'react'
import './App.css'
import Explorar from './components/explorar'
import Detalhes from './components/Detalhes'
import Login from './components/login'

function App() {
  // id do livro aberto; vazio = mostra a Explorar
  const [livroAberto, setLivroAberto] = useState('')
  // Token salvo no navegador: continua logado ao recarregar a página
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  // true = mostra a tela de login
  const [mostrarLogin, setMostrarLogin] = useState(false)
  // Livro clicado por quem não fez login; abre depois que a pessoa entrar
  const [livroPendente, setLivroPendente] = useState('')

  // Sem login, clicar num livro leva pro Login
  const abrirLivro = (id) => {
    if (token) {
      setLivroAberto(id)
    } else {
      setLivroPendente(id)
      setMostrarLogin(true)
    }
  }

  // Chamado pelo Login quando dá certo: abre o livro que estava esperando (se tiver)
  const entrou = (novoToken) => {
    setToken(novoToken)
    setMostrarLogin(false)
    setLivroAberto(livroPendente)
    setLivroPendente('')
  }

  // Sai da tela de login sem entrar
  const voltarDoLogin = () => {
    setMostrarLogin(false)
    setLivroPendente('')
  }

  // Apaga o token e volta pra Explorar
  const sair = () => {
    localStorage.removeItem('token')
    setToken('')
    setLivroAberto('')
  }

  if (mostrarLogin) {
    return (
      <>
        <button onClick={voltarDoLogin}>Voltar</button>
        <Login onLogin={entrou} />
      </>
    )
  }

  return (
    <>
      <header className="topo">
        <h1>BookSpace</h1>
        {/* Por enquanto botões simples; depois vão pro menu ☰ */}
        {token ? (
          <button onClick={sair}>Sair</button>
        ) : (
          <button onClick={() => setMostrarLogin(true)}>Entrar</button>
        )}
      </header>

      {livroAberto ? (
        <Detalhes id={livroAberto} voltar={() => setLivroAberto('')} />
      ) : (
        <Explorar abrirLivro={abrirLivro} />
      )}
    </>
  )
}

export default App
