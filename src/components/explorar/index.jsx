import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import { GENEROS } from "../../generos";
import Fileira from "../fileira";
import "./index.css";

// Embaralha a lista e pega os primeiros n (sem repetir)
const sortear = (lista, n) => [...lista].sort(() => Math.random() - 0.5).slice(0, n);

export default function Explorar(props) {
  // Sorteia 4 gêneros uma vez só, quando a tela abre
  const [sorteados] = useState(() => sortear(GENEROS, 4));
  // Resultado da busca e o termo a que ele pertence
  const [resultado, setResultado] = useState({ termo: "", livros: [], erro: "" });

  // Busca os resultados quando chega um termo novo da lupa do topo
  useEffect(() => {
    if (props.secao !== "busca") {
      return;
    }

    // Ignora respostas de buscas antigas (só a última conta)
    let atual = true;

    axios
      .get(`${API_URL}/api/books/search`, { params: { q: props.termoBusca } })
      .then((res) => {
        if (atual) setResultado({ termo: props.termoBusca, livros: res.data.results, erro: "" });
      })
      .catch((error) => {
        // A API manda o motivo em {"erro": "..."}
        const erro = error.response?.data?.erro || "Não foi possível buscar os livros";
        if (atual) setResultado({ termo: props.termoBusca, livros: [], erro: erro });
      });

    return () => {
      atual = false;
    };
  }, [props.secao, props.termoBusca]);

  // Ainda não chegou a resposta do termo buscado
  const carregando = resultado.termo !== props.termoBusca;

  // Nome do gênero escolhido no topo, pros títulos das fileiras
  const nomeGenero = GENEROS.find((genero) => genero.valor === props.secao)?.nome;

  return (
    <div className="explorar">
      {/* Início: 4 fileiras sorteadas */}
      {props.secao === "" && (
        <>
          {/* O primeiro gênero sorteado vira "Descubra", com uma página aleatória */}
          <Fileira
            titulo="Descubra"
            assunto={sorteados[0].valor}
            pagina="aleatoria"
            abrirLivro={props.abrirLivro}
          />

          {sorteados.slice(1).map((genero) => (
            <Fileira
              key={genero.valor}
              titulo={genero.nome}
              assunto={genero.valor}
              abrirLivro={props.abrirLivro}
            />
          ))}
        </>
      )}

      {/* Gênero escolhido no topo: só fileiras daquele gênero */}
      {/* key muda junto com o gênero, pra fileira recomeçar do zero */}
      {nomeGenero && (
        <>
          <Fileira
            key={`${props.secao}-populares`}
            titulo={`Populares em ${nomeGenero}`}
            assunto={props.secao}
            pagina={1}
            abrirLivro={props.abrirLivro}
          />
          <Fileira
            key={`${props.secao}-mais`}
            titulo={`Mais de ${nomeGenero}`}
            assunto={props.secao}
            pagina={2}
            abrirLivro={props.abrirLivro}
          />
          <Fileira
            key={`${props.secao}-descubra`}
            titulo={`Descubra em ${nomeGenero}`}
            assunto={props.secao}
            pagina="aleatoria"
            abrirLivro={props.abrirLivro}
          />
        </>
      )}

      {/* Busca pela lupa do topo: resultados em grade de capas */}
      {props.secao === "busca" && (
        <>
          <h3>Resultados para "{props.termoBusca}"</h3>

          {carregando && <p>Carregando...</p>}

          {!carregando && resultado.erro && <p className="erro">{resultado.erro}</p>}

          {!carregando && !resultado.erro && resultado.livros.length === 0 && (
            <p>Nenhum livro encontrado</p>
          )}

          {!carregando && (
            <div className="grade-livros">
              {resultado.livros.map((livro) => (
                <div
                  key={livro.id}
                  className="grade-livro"
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
          )}
        </>
      )}
    </div>
  );
}
