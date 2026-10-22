import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import "./index.css";

export default function Detalhes(props) {
  const [livro, setLivro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/books/${props.id}`)
      .then((res) => setLivro(res.data))
      .catch((error) => {
        setErro(error.response?.data?.erro || "Não foi possível carregar o livro");
      })
      .finally(() => setCarregando(false));
  }, [props.id]);

  return (
    <div className="detalhes">
      <button onClick={props.voltar}>Voltar</button>

      {carregando && <p>Carregando...</p>}

      {erro && <p className="erro">{erro}</p>}

      {livro && (
        <div className="detalhes-conteudo">
          {livro.cover_id && (
            <img
              src={`https://covers.openlibrary.org/b/id/${livro.cover_id}-L.jpg`}
              alt={livro.title}
            />
          )}

          <div>
            <h2>{livro.title}</h2>
            {livro.authors.length > 0 && <p>{livro.authors.join(", ")}</p>}
            {livro.year && <p>Publicado em {livro.year}</p>}
            {livro.description && <p className="descricao">{livro.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
