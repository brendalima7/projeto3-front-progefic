// Estante: fileira com livros da biblioteca da pessoa (mesmo visual da Fileira do Início)

import { useRef } from "react";
// Reaproveita o visual da Fileira (capas, setas, hover)
import "../fileira/index.css";
import "./index.css";

// Tamanho de cada capa (o espaço entre elas é 12px)
const LARGURA_CAPA = 180;

export default function Estante(props) {
  // Aponta pra faixa de capas, pra as setas conseguirem rolar ela
  const faixa = useRef(null);

  // direcao: -1 = esquerda, 1 = direita; anda 2 capas
  const rolar = (direcao) => {
    faixa.current.scrollBy({
      left: direcao * 2 * (LARGURA_CAPA + 12),
      behavior: "smooth",
    });
  };

  return (
    <section className="fileira">
      <h3>
        {props.titulo} <span className="estante-quantidade">{props.livros.length}</span>
      </h3>

      {props.livros.length === 0 ? (
        <p className="estante-vazia">Nenhum livro aqui ainda</p>
      ) : (
        <div className="fileira-carrossel">
          <button className="seta seta-esquerda" onClick={() => rolar(-1)}>
            ‹
          </button>

          <div className="fileira-livros" ref={faixa}>
            {props.livros.map((livro) => (
              // abrirLivro vem do App; o livro é aberto pelo id da Open Library
              <div
                key={livro.id}
                className="fileira-livro"
                onClick={() => props.abrirLivro(livro.openlibrary_id)}
              >
                {livro.cover_id ? (
                  <img
                    src={`https://covers.openlibrary.org/b/id/${livro.cover_id}-M.jpg`}
                    alt={livro.title}
                  />
                ) : (
                  // Sem capa: um quadro com o título, do mesmo tamanho
                  <div className="estante-sem-capa">{livro.title}</div>
                )}
                <p>{livro.title}</p>
                {props.mostrarAvaliacao && (
                  <div
                    className="estante-avaliacao"
                    role="img"
                    aria-label={
                      livro.rating
                        ? `Avaliação: ${livro.rating} de 5 estrelas`
                        : "Sem avaliação"
                    }
                  >
                    {Array.from({ length: 5 }, (_, indice) => (
                      <span
                        className={indice < (livro.rating || 0) ? "selecionada" : ""}
                        key={indice}
                        aria-hidden="true"
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="seta seta-direita" onClick={() => rolar(1)}>
            ›
          </button>
        </div>
      )}
    </section>
  );
}
