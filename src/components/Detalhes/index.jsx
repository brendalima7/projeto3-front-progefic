// Tela Detalhes: capa de um lado e as informações do livro do outro

import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import "./index.css";

// Sinopses maiores que isso começam cortadas, com "Ler mais"
const LIMITE_SINOPSE = 500;

function IconeLendo() {
  return (
    <svg
      className="detalhes-status-icone-lendo"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 10a4 4 0 1 1 6 0c-.7.8-1 1.4-1 2H10c0-.6-.3-1.2-1-2Z" />
      <path d="M10 14h4M10.5 16h3M11 18h2" />
      <path d="M2.5 14.5c3.4-.8 6.2-.3 9.5 2v5c-3.3-2.3-6.1-2.8-9.5-2v-5ZM21.5 14.5c-3.4-.8-6.2-.3-9.5 2v5c3.3-2.3 6.1-2.8 9.5-2v-5Z" />
    </svg>
  );
}

export default function Detalhes(props) {
  const [livro, setLivro] = useState(null);
  // Começa true porque a tela já abre buscando o livro
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [itemBiblioteca, setItemBiblioteca] = useState(null);
  const [favorito, setFavorito] = useState(false);
  const [carregandoFavorito, setCarregandoFavorito] = useState(true);
  const [salvandoFavorito, setSalvandoFavorito] = useState(false);
  const [erroFavorito, setErroFavorito] = useState("");
  const [erroStatus, setErroStatus] = useState("");
  const [menuStatusAberto, setMenuStatusAberto] = useState(false);
  // true = mostra a sinopse inteira
  const [sinopseAberta, setSinopseAberta] = useState(false);

  useEffect(() => {
    let atual = true;
    const comToken = { headers: { Authorization: `Bearer ${props.token}` } };

    axios
      .get(`${API_URL}/api/books/${props.id}`)
      .then((res) => {
        if (atual) setLivro(res.data);
      })
      .catch((error) => {
        if (atual) setErro(error.response?.data?.erro || "Não foi possível carregar o livro");
      })
      .finally(() => {
        if (atual) setCarregando(false);
      });

    axios
      .get(`${API_URL}/api/library`, {
        ...comToken,
        params: { openlibrary_id: props.id },
      })
      .then((res) => {
        if (!atual) return;
        const item = res.data[0] || null;
        setItemBiblioteca(item);
        setFavorito(Boolean(item?.favorite));
      })
      .catch((error) => {
        if (atual) {
          setErroFavorito(
            error.response?.data?.erro || "Não foi possível verificar se o livro está nos favoritos"
          );
        }
      })
      .finally(() => {
        if (atual) setCarregandoFavorito(false);
      });

    return () => {
      atual = false;
    };
  }, [props.id, props.token]);

  const alternarFavorito = async () => {
    if (!livro || carregandoFavorito || salvandoFavorito) return;

    setSalvandoFavorito(true);
    setErroFavorito("");
    const comToken = { headers: { Authorization: `Bearer ${props.token}` } };

    try {
      if (itemBiblioteca) {
        const res = await axios.patch(
          `${API_URL}/api/library/${itemBiblioteca.id}`,
          { favorite: !favorito },
          comToken
        );
        setItemBiblioteca(res.data);
        setFavorito(res.data.favorite);
      } else {
        const criado = await axios.post(
          `${API_URL}/api/library`,
          {
            openlibrary_id: livro.id,
            title: livro.title,
            author: livro.authors?.join(", ") || null,
            cover_id: livro.cover_id,
            subjects: livro.subjects || [],
          },
          comToken
        );
        setItemBiblioteca(criado.data);

        const atualizado = await axios.patch(
          `${API_URL}/api/library/${criado.data.id}`,
          { favorite: true },
          comToken
        );
        setItemBiblioteca(atualizado.data);
        setFavorito(atualizado.data.favorite);
      }
    } catch (error) {
      setErroFavorito(error.response?.data?.erro || "Não foi possível atualizar os favoritos");
    } finally {
      setSalvandoFavorito(false);
    }
  };

  const alterarStatus = async (status, removerSeAtivo = false) => {
    if (!livro || carregandoFavorito || salvandoFavorito) return;

    const novoStatus =
      removerSeAtivo && itemBiblioteca?.status === status ? null : status;
    if (itemBiblioteca?.status === novoStatus) return;

    setSalvandoFavorito(true);
    setErroStatus("");
    const comToken = { headers: { Authorization: `Bearer ${props.token}` } };

    try {
      if (itemBiblioteca) {
        const res = await axios.patch(
          `${API_URL}/api/library/${itemBiblioteca.id}`,
          { status: novoStatus },
          comToken
        );
        setItemBiblioteca(res.data);
      } else {
        const res = await axios.post(
          `${API_URL}/api/library`,
          {
            openlibrary_id: livro.id,
            title: livro.title,
            author: livro.authors?.join(", ") || null,
            cover_id: livro.cover_id,
            subjects: livro.subjects || [],
            status: novoStatus,
          },
          comToken
        );
        setItemBiblioteca(res.data);
      }
    } catch (error) {
      setErroStatus(error.response?.data?.erro || "Não foi possível atualizar o status do livro");
    } finally {
      setSalvandoFavorito(false);
    }
  };

  // "Autor · 1971": junta só o que existir
  const info = livro ? [livro.authors.join(", "), livro.year].filter(Boolean).join(" · ") : "";

  const sinopseLonga = livro?.description?.length > LIMITE_SINOPSE;

  return (
    <div className="detalhes">
      {/* voltar vem do App: fecha os detalhes */}
      <button className="detalhes-voltar" onClick={props.voltar}>
        ‹ Voltar
      </button>

      {livro && (
        <button
          className={`detalhes-favorito${favorito ? " ativo" : ""}`}
          type="button"
          onClick={alternarFavorito}
          disabled={carregandoFavorito || salvandoFavorito}
          aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={favorito}
          aria-busy={salvandoFavorito || carregandoFavorito}
          title={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          {favorito ? "★" : "☆"}
        </button>
      )}

      {erroFavorito && <p className="erro detalhes-favorito-erro" role="status">{erroFavorito}</p>}
      {erroStatus && <p className="erro detalhes-status-erro" role="status">{erroStatus}</p>}

      {carregando && (
        <div className="detalhes-conteudo">
          <div className="detalhes-esqueleto"></div>
        </div>
      )}

      {erro && <p className="erro">{erro}</p>}

      {livro && (
        <div className="detalhes-conteudo">
          <div className="detalhes-capa-coluna">
            {livro.cover_id && (
              <img
                className="detalhes-capa"
                src={`https://covers.openlibrary.org/b/id/${livro.cover_id}-L.jpg`}
                alt={livro.title}
              />
            )}

            <div className="detalhes-acoes-livro">
              <div
                className="detalhes-status-wrapper"
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setMenuStatusAberto(false);
                  }
                }}
              >
                <button
                  className={`detalhes-status${itemBiblioteca?.status ? " ativo" : ""}${itemBiblioteca?.status === "reading" ? " lendo" : ""}`}
                  type="button"
                  onClick={() => setMenuStatusAberto((aberto) => !aberto)}
                  disabled={carregandoFavorito || salvandoFavorito}
                  aria-haspopup="true"
                  aria-expanded={menuStatusAberto}
                  aria-controls="detalhes-status-opcoes"
                  aria-busy={carregandoFavorito || salvandoFavorito}
                >
                  {itemBiblioteca?.status === "read" ? (
                    <>
                      <span aria-hidden="true">✓</span> Lido
                    </>
                  ) : itemBiblioteca?.status === "reading" ? (
                    <>
                      <IconeLendo /> Lendo
                    </>
                  ) : (
                    "Status"
                  )}
                  <span className="detalhes-status-seta" aria-hidden="true">▾</span>
                </button>

                {menuStatusAberto && (
                  <div className="detalhes-status-opcoes" id="detalhes-status-opcoes">
                    <button
                      className={`detalhes-status-opcao${itemBiblioteca?.status === "reading" ? " lendo selecionado" : ""}`}
                      type="button"
                      aria-pressed={itemBiblioteca?.status === "reading"}
                      onClick={() => {
                        alterarStatus("reading", true);
                        setMenuStatusAberto(false);
                      }}
                    >
                      <IconeLendo />
                      Lendo
                      {itemBiblioteca?.status === "reading" && (
                        <span className="detalhes-status-opcao-selecionado" aria-label="Selecionado"></span>
                      )}
                    </button>
                    <button
                      className={`detalhes-status-opcao${itemBiblioteca?.status === "read" ? " lido selecionado" : ""}`}
                      type="button"
                      aria-pressed={itemBiblioteca?.status === "read"}
                      onClick={() => {
                        alterarStatus("read", true);
                        setMenuStatusAberto(false);
                      }}
                    >
                      <span className="detalhes-status-check" aria-hidden="true">✓</span>
                      Lido
                      {itemBiblioteca?.status === "read" && (
                        <span className="detalhes-status-opcao-selecionado" aria-label="Selecionado"></span>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="detalhes-adicionar-wrapper">
                <button
                  className={`detalhes-adicionar${itemBiblioteca?.status === "want_to_read" ? " ativo" : ""}`}
                  type="button"
                  onClick={() => alterarStatus("want_to_read", true)}
                  disabled={carregandoFavorito || salvandoFavorito}
                  aria-label={
                    itemBiblioteca?.status === "want_to_read"
                      ? "Remover da minha lista"
                      : "Adicionar à minha lista"
                  }
                  aria-pressed={itemBiblioteca?.status === "want_to_read"}
                  aria-busy={carregandoFavorito || salvandoFavorito}
                >
                  {itemBiblioteca?.status === "want_to_read" ? "✓" : "+"}
                </button>
                <span className="detalhes-adicionar-tooltip">
                  {itemBiblioteca?.status === "want_to_read"
                    ? "Remover da minha lista"
                    : "Adicionar à minha lista"}
                </span>
              </div>
            </div>
          </div>

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
