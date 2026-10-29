// Tela de perfil: nome, e-mail e senha em linhas (com opção de editar o nome e mudar a senha)
// e, embaixo, os livros da biblioteca separados em estantes

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

  // Editar nome: a linha só vira campo depois de clicar em "Editar"
  const [editandoNome, setEditandoNome] = useState(false);
  const [nome, setNome] = useState("");
  const [mensagemNome, setMensagemNome] = useState({ texto: "", erro: false });

  // Mudar senha: os campos só aparecem depois de clicar em "Mudar"
  const [mudandoSenha, setMudandoSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mensagemSenha, setMensagemSenha] = useState({ texto: "", erro: false });

  const cabecalho = { headers: { Authorization: `Bearer ${props.token}` } };

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

  const abrirNome = () => {
    setNome(usuario.name);
    setMensagemNome({ texto: "", erro: false });
    setEditandoNome(true);
  };

  const salvarNome = (event) => {
    // Impede o formulário de recarregar a página
    event.preventDefault();

    axios
      .patch(`${API_URL}/api/auth/me`, { name: nome }, cabecalho)
      .then((res) => {
        setUsuario(res.data);
        setEditandoNome(false);
        setMensagemNome({ texto: "Nome atualizado", erro: false });
      })
      .catch((error) => {
        setMensagemNome({ texto: motivo(error, "Não foi possível salvar o nome"), erro: true });
      });
  };

  const abrirSenha = () => {
    setMensagemSenha({ texto: "", erro: false });
    setMudandoSenha(true);
  };

  // Fecha os campos de senha e limpa o que foi digitado
  const fecharSenha = () => {
    setMudandoSenha(false);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmacao("");
  };

  const salvarSenha = (event) => {
    event.preventDefault();

    // Confere aqui mesmo: o back só recebe a senha nova uma vez
    if (novaSenha !== confirmacao) {
      setMensagemSenha({ texto: "As senhas novas não são iguais", erro: true });
      return;
    }

    axios
      .patch(
        `${API_URL}/api/auth/password`,
        { current_password: senhaAtual, new_password: novaSenha },
        cabecalho
      )
      .then(() => {
        fecharSenha();
        setMensagemSenha({ texto: "Senha alterada", erro: false });
      })
      .catch((error) => {
        // Ex.: "Senha atual incorreta" ou "A senha deve ter pelo menos 6 caracteres"
        setMensagemSenha({ texto: motivo(error, "Não foi possível mudar a senha"), erro: true });
      });
  };

  return (
    <div className="perfil">
      <h2>Perfil</h2>

      {erro && <p className="erro">{erro}</p>}

      {!usuario && !erro && <p>Carregando...</p>}

      {usuario && (
        <div className="perfil-caixa">
          {/* Linha do nome: vira campo ao clicar em "Editar" */}
          <div className="perfil-linha">
            <span className="perfil-rotulo">Nome</span>

            {editandoNome ? (
              <form className="perfil-form" onSubmit={salvarNome}>
                <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} />
                <div className="perfil-botoes">
                  <button type="button" onClick={() => setEditandoNome(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="perfil-salvar">
                    Salvar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <span className="perfil-valor">{usuario.name}</span>
                <button className="perfil-acao" onClick={abrirNome}>
                  Editar
                </button>
              </>
            )}

            {mensagemNome.texto && (
              <p className={mensagemNome.erro ? "erro perfil-mensagem" : "perfil-aviso perfil-mensagem"}>
                {mensagemNome.texto}
              </p>
            )}
          </div>

          {/* O e-mail é o login, então não dá pra mudar */}
          <div className="perfil-linha">
            <span className="perfil-rotulo">E-mail</span>
            <span className="perfil-valor">{usuario.email}</span>
          </div>

          {/* Linha da senha: os campos aparecem ao clicar em "Mudar" */}
          <div className="perfil-linha">
            <span className="perfil-rotulo">Senha</span>

            {mudandoSenha ? (
              <form className="perfil-form" onSubmit={salvarSenha}>
                <input
                  autoFocus
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="Senha atual"
                />
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Nova senha (mínimo 6 caracteres)"
                />
                <input
                  type="password"
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  placeholder="Confirme a nova senha"
                />
                <div className="perfil-botoes">
                  <button type="button" onClick={fecharSenha}>
                    Cancelar
                  </button>
                  <button type="submit" className="perfil-salvar">
                    Salvar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <span className="perfil-valor">••••••••</span>
                <button className="perfil-acao" onClick={abrirSenha}>
                  Mudar
                </button>
              </>
            )}

            {mensagemSenha.texto && (
              <p className={mensagemSenha.erro ? "erro perfil-mensagem" : "perfil-aviso perfil-mensagem"}>
                {mensagemSenha.texto}
              </p>
            )}
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
