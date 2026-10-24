
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import Fileira from "../fileira";
import "./index.css";

// Nome na tela e valor que a Open Library entende
const ASSUNTOS = [
  { nome: "Fantasia", valor: "fantasy" },
  { nome: "Mistério", valor: "mystery" },
  { nome: "Romance", valor: "romance" },
  { nome: "Ficção científica", valor: "science fiction" },
  { nome: "Terror", valor: "horror" },
  { nome: "Biografia", valor: "biography" },
];

// Gêneros que podem ser sorteados para as fileiras
const GENEROS = [
  { nome: "Fantasia", valor: "fantasy" },
  { nome: "Mistério", valor: "mystery" },
  { nome: "Romance", valor: "romance" },
  { nome: "Ficção científica", valor: "science fiction" },
  { nome: "Terror", valor: "horror" },
  { nome: "Biografia", valor: "biography" },
  { nome: "Aventura", valor: "adventure" },
  { nome: "História", valor: "history" },
  { nome: "Poesia", valor: "poetry" },
  { nome: "Infantil", valor: "juvenile fiction" },
];

// Embaralha a lista e pega os primeiros n (sem repetir)
const sortear = (lista, n) => [...lista].sort(() => Math.random() - 0.5).slice(0, n);

// Página aleatória dos resultados (de 3 a 12, pra não repetir as páginas 1 e 2)
const paginaAleatoria = () => Math.floor(Math.random() * 10) + 3;

export default function Explorar(props) {
  // Sorteia 4 gêneros uma vez só, quando a tela abre
  const [sorteados] = useState(() => sortear(GENEROS, 4));
  // Página aleatória da fileira "Descubra", pra mudar a cada visita
  const [paginaDescubra] = useState(() => Math.floor(Math.random() * 10) + 1);

  const [termo, setTermo] = useState("");
  const [livros, setLivros] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  // Só mostra "nenhum livro" depois da primeira busca
  const [buscou, setBuscou] = useState(false);
  // Gênero escolhido nas pílulas; vazio = mostra as fileiras sorteadas
  const [assuntoAtual, setAssuntoAtual] = useState("");
  // Página aleatória da fileira "Descubra em <gênero>"
  const [paginaGenero, setPaginaGenero] = useState(1);
  // true = mostra os resultados da busca pelo campo
  const [buscaAtiva, setBuscaAtiva] = useState(false);
  // Sugestões que aparecem embaixo do campo enquanto a pessoa digita
  const [sugestoes, setSugestoes] = useState([]);
  const [buscandoSugestoes, setBuscandoSugestoes] = useState(false);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  // Só mexe no estado quando a resposta chega
  const carregarLivros = (q, tipo) => {
    axios
      .get(`${API_URL}/api/books/search`, { params: { q: q, type: tipo } })
      .then((res) => {
        setLivros(res.data.results);
        setBuscou(true);
      })
      .catch((error) => {
        // A API manda o motivo em {"erro": "..."}
        setErro(error.response?.data?.erro || "Não foi possível buscar os livros");
        setLivros([]);
      })
      .finally(() => setCarregando(false));
  };

  const buscar = (event) => {
    event.preventDefault();
    setMostrarSugestoes(false);
    setAssuntoAtual("");
    setBuscaAtiva(true);
    setCarregando(true);
    setErro("");
    carregarLivros(termo, "all");
  };

  // Volta pras fileiras sorteadas
  const voltarAoInicio = () => {
    setAssuntoAtual("");
    setBuscaAtiva(false);
  };

  // Clicar na pílula que já está ativa desmarca e volta pro início
  const escolherAssunto = (valor) => {
    if (valor === assuntoAtual) {
      voltarAoInicio();
      return;
    }
    setAssuntoAtual(valor);
    setBuscaAtiva(false);
    setPaginaGenero(paginaAleatoria());
  };

  // Nome do gênero escolhido, pros títulos das fileiras
  const nomeAtual = ASSUNTOS.find((assunto) => assunto.valor === assuntoAtual)?.nome;

  const digitar = (texto) => {
    setTermo(texto);
    setMostrarSugestoes(true);
    setBuscandoSugestoes(true);
  };

  // A Open Library só aceita buscas com pelo menos 3 letras
  const poucoTexto = termo.trim().length < 3;

  // Sugestões: espera meio segundo sem digitar antes de buscar
  useEffect(() => {
    if (termo.trim().length < 3) {
      return;
    }

    // Ignora respostas de buscas antigas (se a pessoa continuou digitando)
    let atual = true;

    const espera = setTimeout(() => {
      axios
        .get(`${API_URL}/api/books/search`, { params: { q: termo } })
        .then((res) => {
          if (atual) setSugestoes(res.data.results.slice(0, 6));
        })
        .catch(() => {
          if (atual) setSugestoes([]);
        })
        .finally(() => {
          if (atual) setBuscandoSugestoes(false);
        });
    }, 500);

    // Roda quando o termo muda de novo: cancela a espera e a busca anterior
    return () => {
      atual = false;
      clearTimeout(espera);
    };
  }, [termo]);

  return (
    <div className="explorar">
      <h2>Explorar</h2>

      <div className="busca">
        <form onSubmit={buscar}>
          <input
            value={termo}
            onChange={(e) => digitar(e.target.value)}
            onFocus={() => setMostrarSugestoes(true)}
            // Clicar fora do campo fecha as sugestões
            onBlur={() => setMostrarSugestoes(false)}
            placeholder="Título, autor ou assunto"
          />
          <button type="submit">Buscar</button>
        </form>

        {mostrarSugestoes && termo.trim() && (
          <ul className="sugestoes">
            {poucoTexto && <li className="sugestao-info">Continue digitando...</li>}

            {!poucoTexto && buscandoSugestoes && (
              <li className="sugestao-info">Buscando...</li>
            )}

            {!poucoTexto && !buscandoSugestoes && sugestoes.length === 0 && (
              <li className="sugestao-info">Nenhuma sugestão</li>
            )}

            {!poucoTexto &&
              !buscandoSugestoes &&
              sugestoes.map((livro) => (
                // onMouseDown (e não onClick) roda antes do campo perder o foco
                <li
                  key={livro.id}
                  className="sugestao"
                  onMouseDown={() => props.abrirLivro(livro.id)}
                >
                  {livro.cover_id && (
                    <img
                      src={`https://covers.openlibrary.org/b/id/${livro.cover_id}-S.jpg`}
                      alt={livro.title}
                    />
                  )}
                  <div>
                    <strong>{livro.title}</strong>
                    {livro.authors.length > 0 && <span>{livro.authors.join(", ")}</span>}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="assuntos">
        <button
          className={!assuntoAtual && !buscaAtiva ? "assunto ativo" : "assunto"}
          onClick={voltarAoInicio}
        >
          Início
        </button>

        {ASSUNTOS.map((assunto) => (
          <button
            key={assunto.valor}
            className={assunto.valor === assuntoAtual ? "assunto ativo" : "assunto"}
            onClick={() => escolherAssunto(assunto.valor)}
          >
            {assunto.nome}
          </button>
        ))}
      </div>

      {/* Início: 4 fileiras sorteadas */}
      {!assuntoAtual && !buscaAtiva && (
        <>
          {/* O primeiro gênero sorteado vira "Descubra", com uma página aleatória */}
          <Fileira
            titulo="Descubra"
            assunto={sorteados[0].valor}
            pagina={paginaDescubra}
            abrirLivro={props.abrirLivro}
          />

          {sorteados.slice(1).map((genero) => (
            <Fileira
              key={genero.valor}
              titulo={genero.nome}
              assunto={genero.valor}
              abrirLivro={props.abrirLivro}
            />
          ))}
        </>
      )}

      {/* Gênero escolhido: só fileiras daquele gênero */}
      {/* key muda junto com o gênero, pra fileira recomeçar do zero */}
      {assuntoAtual && (
        <>
          <Fileira
            key={`${assuntoAtual}-populares`}
            titulo={`Populares em ${nomeAtual}`}
            assunto={assuntoAtual}
            pagina={1}
            abrirLivro={props.abrirLivro}
          />
          <Fileira
            key={`${assuntoAtual}-mais`}
            titulo={`Mais de ${nomeAtual}`}
            assunto={assuntoAtual}
            pagina={2}
            abrirLivro={props.abrirLivro}
          />
          <Fileira
            key={`${assuntoAtual}-descubra`}
            titulo={`Descubra em ${nomeAtual}`}
            assunto={assuntoAtual}
            pagina={paginaGenero}
            abrirLivro={props.abrirLivro}
          />
        </>
      )}

      {/* Busca pelo campo: resultados em grade de capas */}
      {buscaAtiva && (
        <>
          {carregando && <p>Carregando...</p>}

          {erro && <p className="erro">{erro}</p>}

          {buscou && !carregando && !erro && livros.length === 0 && (
            <p>Nenhum livro encontrado</p>
          )}

          <ul className="lista-livros">
            {livros.map((livro) => (
              <li key={livro.id} onClick={() => props.abrirLivro(livro.id)}>
                {livro.cover_id && (
                  <img
                    src={`https://covers.openlibrary.org/b/id/${livro.cover_id}-S.jpg`}
                    alt={livro.title}
                  />
                )}
                <span>
                  {livro.title}
                  {livro.authors.length > 0 && ` - ${livro.authors.join(", ")}`}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}