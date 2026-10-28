import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import { GENEROS } from "../../generos";
import "./index.css";

// Sorteia um item da lista
const sortearItem = (lista) => lista[Math.floor(Math.random() * lista.length)];

// A descrição às vezes vem com links e separadores em Markdown; deixa só o texto
const limparDescricao = (texto) => {
  if (!texto) return "";
  return texto
    .split(/-{3,}/)[0] // corta tudo depois de uma linha "-----"
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // [texto](link) vira só texto
    .replace(/\\/g, "")
    .trim();
};

export default function Destaque(props) {
  const [livro, setLivro] = useState(null);
  const [erro, setErro] = useState("");
  // Muda a cada clique em "Outro": faz o useEffect sortear de novo
  const [sorteio, setSorteio] = useState(0);

  // Sorteia um gênero e uma página e escolhe um livro com capa
  useEffect(() => {
    // Ignora respostas de sorteios antigos (só o último conta)
    let atual = true;

    const genero = sortearItem(GENEROS);
    const pagina = Math.floor(Math.random() * 5) + 1;

    axios
      .get(`${API_URL}/api/books/search`, {
        params: { q: genero.valor, type: "subject", page: pagina },
      })
      .then((res) => {
        if (!atual) return;

        // Só livros com capa, pro banner não ficar vazio
        const escolhido = sortearItem(res.data.results.filter((l) => l.cover_id));
        if (!escolhido) {
          setErro("Não foi possível carregar o destaque");
          return;
        }

        // Mostra o banner já com os dados da busca (capa, título, autor, ano)
        setLivro({ ...escolhido, genero: genero.nome });

        // A descrição só vem nos detalhes, que podem demorar: entra quando chegar
        axios
          .get(`${API_URL}/api/books/${escolhido.id}`)
          .then((detalhes) => {
            if (atual) {
              setLivro((anterior) => ({ ...anterior, description: detalhes.data.description }));
            }
          })
          // Se os detalhes falharem, o banner continua, só sem descrição
          .catch(() => {});
      })
      .catch(() => {
        if (atual) setErro("Não foi possível carregar o destaque");
      });

    return () => {
      atual = false;
    };
  }, [sorteio]);

  // "↻ Outro": apaga o atual (mostra o esqueleto) e sorteia de novo
  const outro = () => {
    setLivro(null);
    setErro("");
    setSorteio(sorteio + 1);
  };

  const descricao = livro ? limparDescricao(livro.description) : "";

  return (
    <section className="destaque">
      {erro && <p className="erro">{erro}</p>}

      {/* Retângulo piscando enquanto carrega (a animação "piscar" está na Fileira) */}
      {!livro && !erro && <div className="destaque-esqueleto" />}

      {livro && (
        <div className="destaque-conteudo">
          {/* Fundo: a própria capa ampliada, desfocada e escurecida */}
          <div
            className="destaque-fundo"
            style={{
              backgroundImage: `url(https://covers.openlibrary.org/b/id/${livro.cover_id}-L.jpg)`,
            }}
          />

          <img
            className="destaque-capa"
            src={`https://covers.openlibrary.org/b/id/${livro.cover_id}-L.jpg`}
            alt={livro.title}
          />

          <div className="destaque-texto">
            <span className="destaque-etiqueta">Destaque em {livro.genero}</span>
            <h2>{livro.title}</h2>

            <p className="destaque-info">
              {livro.authors.join(", ")}
              {livro.year && ` · ${livro.year}`}
            </p>

            {descricao && <p className="destaque-descricao">{descricao}</p>}

            <div className="destaque-botoes">
              {/* abrirLivro vem do App (sem login, vai pro Login) */}
              <button className="destaque-principal" onClick={() => props.abrirLivro(livro.id)}>
                Ver detalhes
              </button>
              <button className="destaque-outro" onClick={outro}>
                ↻ Outro
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
