import { useEffect, useState } from 'react'
import './App.css'
import Topo from './components/topo'
import Explorar from './components/explorar'
import Detalhes from './components/Detalhes'
import Login from './components/login'
import Cadastro from './components/cadastro'
import Perfil from './components/perfil'

function App() {
  // id do livro aberto; vazio = mostra a Explorar
  const [livroAberto, setLivroAberto] = useState('')
  // Token salvo no navegador: continua logado ao recarregar a página
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  // true = mostra a tela de login
  const [mostrarLogin, setMostrarLogin] = useState(false)
  // true = mostra o cadastro no lugar do login
  const [criandoConta, setCriandoConta] = useState(false)
  // Livro clicado por quem não fez login; abre depois que a pessoa entrar
  const [livroPendente, setLivroPendente] = useState('')
  // O que a Explorar mostra: '' = início, um gênero (ex.: 'fantasy') ou 'busca'
  const [secao, setSecao] = useState('')
  // Texto buscado pela lupa (usado quando secao = 'busca')
  const [termoBusca, setTermoBusca] = useState('')
  // Tema do site: 'escuro' ou 'claro' (fica salvo no navegador)
  const [tema, setTema] = useState(localStorage.getItem('tema') || 'escuro')
  // true = mostra a tela de perfil
  const [mostrarPerfil, setMostrarPerfil] = useState(false)

  // Aplica o tema na página: o index.css troca as cores pelo data-tema
  useEffect(() => {
    document.documentElement.dataset.tema = tema
    localStorage.setItem('tema', tema)
  }, [tema])

  const trocarTema = () => {
    setTema(tema === 'escuro' ? 'claro' : 'escuro')
  }

  // Trocar de seção pelo topo fecha o livro e o perfil, se estiverem abertos
  const mudarSecao = (novaSecao) => {
    setSecao(novaSecao)
    setLivroAberto('')
    setMostrarPerfil(false)
  }

  // Chamado pelo item "Perfil" do menu ☰
  const abrirPerfil = () => {
    setMostrarPerfil(true)
    setLivroAberto('')
  }

  // Chamado pela lupa do topo quando a pessoa aperta Enter
  const buscar = (termo) => {
    setTermoBusca(termo)
    mudarSecao('busca')
  }

  // Sem login, clicar num livro leva pro Login
  const abrirLivro = (id) => {
    if (token) {
      // O perfil continua "aberto" por trás: "Voltar" nos Detalhes volta pra ele
      setLivroAberto(id)
    } else {
      setLivroPendente(id)
      setMostrarLogin(true)
    }
  }

  // Chamado pelo Login ou pelo Cadastro quando dá certo: abre o livro que estava esperando (se tiver)
  const entrou = (novoToken) => {
    setToken(novoToken)
    setMostrarLogin(false)
    setCriandoConta(false)
    setLivroAberto(livroPendente)
    setLivroPendente('')
  }

  // No cadastro, volta pro login; no login, volta pra Explorar
  const voltarDoLogin = () => {
    if (criandoConta) {
      setCriandoConta(false)
      return
    }
    setMostrarLogin(false)
    setLivroPendente('')
  }

  // Apaga o token e volta pra Explorar
  const sair = () => {
    localStorage.removeItem('token')
    setToken('')
    setLivroAberto('')
    setMostrarPerfil(false)
  }

  if (mostrarLogin) {
    return (
      <>
        <button onClick={voltarDoLogin}>Voltar</button>
        {criandoConta ? (
          <Cadastro onLogin={entrou} />
        ) : (
          <Login onLogin={entrou} irParaCadastro={() => setCriandoConta(true)} />
        )}
      </>
    )
  }

  return (
    <>
      <Topo
        // No perfil, nenhum gênero fica destacado no topo
        secao={mostrarPerfil ? null : secao}
        mudarSecao={mudarSecao}
        buscar={buscar}
        abrirLivro={abrirLivro}
        logado={token !== ''}
        entrar={() => setMostrarLogin(true)}
        sair={sair}
        tema={tema}
        trocarTema={trocarTema}
        abrirPerfil={abrirPerfil}
      />

      {/* Livro aberto aparece por cima de tudo; "Voltar" volta pra tela de antes */}
      {livroAberto && <Detalhes id={livroAberto} voltar={() => setLivroAberto('')} />}

      {!livroAberto && mostrarPerfil && <Perfil token={token} abrirLivro={abrirLivro} />}

      {!livroAberto && !mostrarPerfil && (
        <Explorar secao={secao} termoBusca={termoBusca} abrirLivro={abrirLivro} />
      )}
    </>
  )
}

export default App
