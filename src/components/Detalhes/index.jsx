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
  const [itemBiblioteca, setItemBiblioteca] = useState(null);
  const [favorito, setFavorito] = useState(false);
  const [carregandoFavorito, setCarregandoFavorito] = useState(true);
  const [salvandoFavorito, setSalvandoFavorito] = useState(false);
  const [erroFavorito, setErroFavorito] = useState("");
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
