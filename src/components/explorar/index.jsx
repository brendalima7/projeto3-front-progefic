
import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import "./index.css";

export default function Explorar() {
  const [termo, setTermo] = useState("");
  const [livros, setLivros] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  // Só mostra "nenhum livro" depois da primeira busca
  const [buscou, setBuscou] = useState(false);

  const buscar = (event) => {
    // Impede o formulário de recarregar a página
    event.preventDefault();
    setCarregando(true);
    setErro("");

    axios
      .get(`${API_URL}/api/books/search`, { params: { q: termo } })
      .then((res) => {
        setLivros(res.data.results);
        setBuscou(true);
      })
      .catch((error) => {
        // A API manda o motivo em {"erro": "..."}
        setErro(error.response?.data?.erro || "Não foi possível buscar os livros");
        setLivros([]);
      })
      // Roda no fim, dando certo ou errado
      .finally(() => setCarregando(false));
  };

  return (
    <div className="explorar">
      <h2>Explorar</h2>

      <form onSubmit={buscar}>
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Título, autor ou assunto"
        />
        <button type="submit">Buscar</button>
      </form>

      {carregando && <p>Carregando...</p>}

      {erro && <p className="erro">{erro}</p>}

      {buscou && !carregando && !erro && livros.length === 0 && (
        <p>Nenhum livro encontrado</p>
      )}

      <ul className="lista-livros">
        {livros.map((livro) => (
          <li key={livro.id}>
            {/* Nem todo livro tem capa */}
            {livro.cover_id && (
              <img
                src={`https://covers.openlibrary.org/b/id/${livro.cover_id}-S.jpg`}
                alt={livro.title}
              />
            )}
            <span>
              {livro.title}
              {/* Alguns livros não têm autor */}
              {livro.authors.length > 0 && ` - ${livro.authors.join(", ")}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}