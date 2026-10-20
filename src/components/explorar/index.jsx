
import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import "./index.css";

export default function Explorar() {
  const [termo, setTermo] = useState("");
  const [livros, setLivros] = useState([]);

  const buscar = (event) => {
    // Impede o formulário de recarregar a página
    event.preventDefault();

    axios
      .get(`${API_URL}/api/books/search`, { params: { q: termo } })
      .then((res) => setLivros(res.data.results))
      .catch((error) => console.log(error));
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
              {livro.title} - {livro.authors.join(", ")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}