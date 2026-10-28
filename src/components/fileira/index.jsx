import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import "./index.css";

// Tamanho de cada capa (o espaço entre elas é 12px)
const LARGURA_CAPA = 180;

export default function Fileira(props) {
  // pagina="aleatoria": sorteia uma página de 3 a 12 uma vez, quando a fileira aparece
  const [pagina] = useState(() =>
    props.pagina === "aleatoria" ? Math.floor(Math.random() * 10) + 3 : props.pagina || 1
  );
  const [livros, setLivros] = useState([]);
  // Começa true porque a fileira já abre buscando os livros
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  // Aponta pra faixa de capas, pra as setas conseguirem rolar ela
  const faixa = useRef(null);

  // Busca os livros do assunto quando a fileira aparece
  useEffect(() => {
    // Ignora a resposta de buscas antigas (só a última conta)
    let atual = true;

    // Se falhar na 1ª tentativa, espera 1 segundo e tenta mais uma vez
    const carregar = (tentativa) => {
      axios
        .get(`${API_URL}/api/books/search`, {
          params: { q: props.assunto, type: "subject", page: pagina },
        })
        .then((res) => {
          if (!atual) return;
          setLivros(res.data.results);
          // Deu certo: apaga erro de alguma tentativa anterior
          setErro("");
          setCarregando(false);
        })
        .catch((error) => {
          if (!atual) return;
          if (tentativa === 1) {
            setTimeout(() => carregar(2), 1000);
            return;
          }
          // A API manda o motivo em {"erro": "..."}
          setErro(error.response?.data?.erro || "Não foi possível carregar os livros");
          setCarregando(false);
        });
    };

    carregar(1);

    // Roda quando a fileira sai da tela ou o assunto muda: descarta esta busca
    return () => {
      atual = false;
    };
  }, [props.assunto, pagina]);

  // direcao: -1 = esquerda, 1 = direita; anda 2 capas
  const rolar = (direcao) => {
    faixa.current.scrollBy({
      left: direcao * 2 * (LARGURA_CAPA + 12),
      behavior: "smooth",
    });
  };

  return (
    <section className="fileira">
      <h3>{props.titulo}</h3>

      {erro && <p className="erro">{erro}</p>}

      <div className="fileira-carrossel">
        <button className="seta seta-esquerda" onClick={() => rolar(-1)}>
          ‹
        </button>

        <div className="fileira-livros" ref={faixa}>
          {/* Enquanto carrega: 8 retângulos piscando no lugar das capas */}
          {carregando &&
            [1, 2, 3, 4, 5, 6, 7, 8].map((n) => <div key={n} className="capa-esqueleto" />)}

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
