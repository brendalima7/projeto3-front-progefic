import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import "./index.css";

export default function Fileira(props) {
  const [livros, setLivros] = useState([]);
  // Começa true porque a fileira já abre buscando os livros
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  // Aponta pra faixa de capas, pra as setas conseguirem rolar ela
  const faixa = useRef(null);

  // Busca os livros do assunto quando a fileira aparece
  useEffect(() => {
    axios
      .get(`${API_URL}/api/books/search`, {
        params: { q: props.assunto, type: "subject", page: props.pagina || 1 },
      })
      .then((res) => setLivros(res.data.results))
      .catch((error) => {
        // A API manda o motivo em {"erro": "..."}
        setErro(error.response?.data?.erro || "Não foi possível carregar os livros");
      })
      .finally(() => setCarregando(false));
  }, [props.assunto, props.pagina]);

  // direcao: -1 = esquerda, 1 = direita; anda 2 capas (120px + 12px de espaço cada)
  const rolar = (direcao) => {
    faixa.current.scrollBy({
      left: direcao * 2 * (120 + 12),
      behavior: "smooth",
    });
  };

  return (
    <section className="fileira">
      <h3>{props.titulo}</h3>

      {carregando && <p>Carregando...</p>}

      {erro && <p className="erro">{erro}</p>}

      <div className="fileira-carrossel">
        <button className="seta seta-esquerda" onClick={() => rolar(-1)}>
          ‹
        </button>

        <div className="fileira-livros" ref={faixa}>
          {livros.map((livro) => (
            // abrirLivro vem da Explorar (que recebe do App)
            <div
              key={livro.id}
              className="fileira-livro"
              onClick={() => props.abrirLivro(livro.id)}
            >
              {livro.cover_id && (
                <img
                  src={`https://covers.openlibrary.org/b/id/${livro.cover_id}-M.jpg`}
                  alt={livro.title}
                />
              )}
              <p>{livro.title}</p>
            </div>
          ))}
        </div>

        <button className="seta seta-direita" onClick={() => rolar(1)}>
          ›
        </button>
      </div>
    </section>
  );
}