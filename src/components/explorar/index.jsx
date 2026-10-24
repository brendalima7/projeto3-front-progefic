
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import Fileira from "../fileira";
import "./index.css";

const ASSUNTOS = [
  { nome: "Fantasia", valor: "fantasy" },
  { nome: "Mistério", valor: "mystery" },
  { nome: "Romance", valor: "romance" },
  { nome: "Ficção científica", valor: "science fiction" },
  { nome: "Terror", valor: "horror" },
  { nome: "Biografia", valor: "biography" },
];

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

const sortear = (lista, n) => [...lista].sort(() => Math.random() - 0.5).slice(0, n);

export default function Explorar(props) {

  const [sorteados] = useState(() => sortear(GENEROS, 4));

  const [paginaDescubra] = useState(() => Math.floor(Math.random() * 10) + 1);

  const [termo, setTermo] = useState("");
  const [livros, setLivros] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const [buscou, setBuscou] = useState(false);
  const [assuntoAtual, setAssuntoAtual] = useState("");

  const [sugestoes, setSugestoes] = useState([]);
  const [buscandoSugestoes, setBuscandoSugestoes] = useState(false);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

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
    setCarregando(true);
    setErro("");
    carregarLivros(termo, "all");
  };

  const escolherAssunto = (valor) => {
    setAssuntoAtual(valor);
    setCarregando(true);
    setErro("");
    carregarLivros(valor, "subject");
  };

  const digitar = (texto) => {
    setTermo(texto);
    setMostrarSugestoes(true);
    setBuscandoSugestoes(true);
  };

  const poucoTexto = termo.trim().length < 3;

  useEffect(() => {
    if (termo.trim().length < 3) {
      return;
    }

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
    </div>
  );
}