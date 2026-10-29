// Tela Detalhes: capa de um lado e as informações do livro do outro

import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import "./index.css";

// Sinopses maiores que isso começam cortadas, com "Ler mais"
const LIMITE_SINOPSE = 500;

export default function Detalhes(props) {
  const [livro, setLivro] = useState(null);
  // Começa true porque a tela já abre buscando o livro
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  // true = mostra a sinopse inteira
  const [sinopseAberta, setSinopseAberta] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/books/${props.id}`)
      .then((res) => setLivro(res.data))
      .catch((error) => {
        setErro(error.response?.data?.erro || "Não foi possível carregar o livro");
      })
      .finally(() => setCarregando(false));
  }, [props.id]);

  // "Autor · 1971": junta só o que existir
  const info = livro ? [livro.authors.join(", "), livro.year].filter(Boolean).join(" · ") : "";

  const sinopseLonga = livro?.description?.length > LIMITE_SINOPSE;

  return (
    <div className="detalhes">
      {/* voltar vem do App: fecha os detalhes */}
      <button className="detalhes-voltar" onClick={props.voltar}>
        ‹ Voltar
      </button>

      {carregando && (
        <div className="detalhes-conteudo">
          <div className="detalhes-esqueleto"></div>
        </div>
      )}

      {erro && <p className="erro">{erro}</p>}

      {livro && (
        <div className="detalhes-conteudo">
          {livro.cover_id && (
            <img
              className="detalhes-capa"
              src={`https://covers.openlibrary.org/b/id/${livro.cover_id}-L.jpg`}
              alt={livro.title}
            />
          )}

          <div className="detalhes-texto">
            {/* Os dois primeiros assuntos viram a etiqueta azul */}
            {livro.subjects.length > 0 && (
              <p className="detalhes-etiqueta">{livro.subjects.slice(0, 2).join(" · ")}</p>
            )}
            <h2>{livro.title}</h2>
            {info && <p className="detalhes-info">{info}</p>}

            {livro.description && (
              <section className="detalhes-secao">
                <h3>Sinopse</h3>
                <p className={sinopseLonga && !sinopseAberta ? "descricao cortada" : "descricao"}>
                  {livro.description}
                </p>
                {sinopseLonga && (
                  <button className="detalhes-ler-mais" onClick={() => setSinopseAberta(!sinopseAberta)}>
                    {sinopseAberta ? "Ler menos ▴" : "Ler mais ▾"}
                  </button>
                )}
              </section>
            )}

            {livro.subjects.length > 0 && (
              <section className="detalhes-secao">
                <h3>Assuntos</h3>
                <ul className="detalhes-assuntos">
                  {livro.subjects.slice(0, 6).map((assunto) => (
                    <li key={assunto}>{assunto}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
