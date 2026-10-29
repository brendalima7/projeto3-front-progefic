// Tela de perfil: nome e e-mail em linhas e, embaixo, os livros da biblioteca separados em estantes

import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import Estante from "../estante";
import "./index.css";

export default function Perfil(props) {
  const [usuario, setUsuario] = useState(null);
  // Todos os livros salvos na biblioteca; as estantes filtram daqui
  const [livros, setLivros] = useState([]);
  const [erro, setErro] = useState("");

  // A API manda o motivo em {"erro": "..."}
  const motivo = (error, padrao) => error.response?.data?.erro || padrao;

  // Busca os dados de quem está logado e os livros dela ao mesmo tempo
  useEffect(() => {
    let atual = true;
    const comToken = { headers: { Authorization: `Bearer ${props.token}` } };

    Promise.all([
      axios.get(`${API_URL}/api/auth/me`, comToken),
      axios.get(`${API_URL}/api/library`, comToken),
    ])
      .then(([resUsuario, resLivros]) => {
        if (!atual) return;
        setUsuario(resUsuario.data);
        setLivros(resLivros.data);
      })
      .catch((error) => {
        if (!atual) return;
        setErro(
          error.response?.status === 401
            ? "Sua sessão expirou, entre de novo"
            : motivo(error, "Não foi possível carregar o perfil")
        );
      });

    return () => {
      atual = false;
    };
  }, [props.token]);

  return (
    <div className="perfil">
      <h2>Perfil</h2>

      {erro && <p className="erro">{erro}</p>}

      {!usuario && !erro && <p>Carregando...</p>}

      {usuario && (
        <div className="perfil-caixa">
          <div className="perfil-linha">
            <span className="perfil-rotulo">Nome</span>
            <span className="perfil-valor">{usuario.name}</span>
          </div>

          {/* O e-mail é o login, então não dá pra mudar */}
          <div className="perfil-linha">
            <span className="perfil-rotulo">E-mail</span>
            <span className="perfil-valor">{usuario.email}</span>
          </div>
        </div>
      )}

      {/* Livros da biblioteca separados por status (abrirLivro vem do App) */}
      {usuario && (
        <>
          <Estante
            titulo="Lendo"
            livros={livros.filter((l) => l.status === "reading")}
            abrirLivro={props.abrirLivro}
          />
          <Estante
            titulo="Quero ler"
            livros={livros.filter((l) => l.status === "want_to_read")}
            abrirLivro={props.abrirLivro}
          />
          <Estante
            titulo="Lidos"
            livros={livros.filter((l) => l.status === "read")}
            abrirLivro={props.abrirLivro}
          />
          <Estante
            titulo="Favoritos"
            livros={livros.filter((l) => l.favorite)}
            abrirLivro={props.abrirLivro}
          />
        </>
      )}
    </div>
  );
}
