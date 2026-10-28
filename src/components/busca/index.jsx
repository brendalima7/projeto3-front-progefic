
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import "./index.css";

export default function Busca(props) {
  // true = campo de texto aberto ao lado da lupa
  const [aberta, setAberta] = useState(false);
  const [termo, setTermo] = useState("");
  // Sugestões que aparecem embaixo do campo enquanto a pessoa digita
  const [sugestoes, setSugestoes] = useState([]);
  const [buscandoSugestoes, setBuscandoSugestoes] = useState(false);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const digitar = (texto) => {
    setTermo(texto);
    setMostrarSugestoes(true);
    setBuscandoSugestoes(true);
  };

  // Enter: avisa o App, que mostra os resultados em grade
  const enviar = (event) => {
    event.preventDefault();
    if (!termo.trim()) return;
    setMostrarSugestoes(false);
    props.buscar(termo.trim());
  };

  // Sair do campo vazio fecha a busca de novo
  const sairDoCampo = () => {
    setMostrarSugestoes(false);
    if (!termo.trim()) setAberta(false);
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
    <div className={aberta ? "busca aberta" : "busca"}>
      <button className="busca-lupa" onClick={() => setAberta(true)} aria-label="Buscar">
        {/* Desenho da lupa */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="10" cy="10" r="7" />
          <line x1="15" y1="15" x2="21" y2="21" />
        </svg>
      </button>

      {aberta && (
        <form onSubmit={enviar}>
          <input
            autoFocus
            value={termo}
            onChange={(e) => digitar(e.target.value)}
            onFocus={() => setMostrarSugestoes(true)}
            onBlur={sairDoCampo}
            placeholder="Título, autor ou assunto"
          />
        </form>
      )}

      {mostrarSugestoes && termo.trim() && (
        <ul className="sugestoes">
          {poucoTexto && <li className="sugestao-info">Continue digitando...</li>}

          {!poucoTexto && buscandoSugestoes && <li className="sugestao-info">Buscando...</li>}

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
  );
}
