// Tela de perfil: foto, nome, e-mail e senha em linhas (com opção de editar o nome e mudar a senha)
// e, embaixo, os livros da biblioteca separados em estantes e as anotações

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import Estante from "../estante";
// Reaproveita o visual dos post-its dos Detalhes
import "../Detalhes/index.css";
import "./index.css";

// A foto é guardada quadrada, nesse tamanho, pra caber no banco
const TAMANHO_FOTO = 256;

// Recorta o centro da imagem, reduz e devolve como data URL
const reduzirFoto = async (arquivo) => {
  const imagem = await createImageBitmap(arquivo);
  const lado = Math.min(imagem.width, imagem.height);

  const canvas = document.createElement("canvas");
  canvas.width = TAMANHO_FOTO;
  canvas.height = TAMANHO_FOTO;

  const contexto = canvas.getContext("2d");
  // JPEG não tem transparência: sem isso, o fundo de um PNG ficaria preto
  contexto.fillStyle = "white";
  contexto.fillRect(0, 0, TAMANHO_FOTO, TAMANHO_FOTO);
  contexto.drawImage(
    imagem,
    (imagem.width - lado) / 2,
    (imagem.height - lado) / 2,
    lado,
    lado,
    0,
    0,
    TAMANHO_FOTO,
    TAMANHO_FOTO
  );
  imagem.close();

  return canvas.toDataURL("image/jpeg", 0.85);
};

export default function Perfil(props) {
  const [usuario, setUsuario] = useState(null);
  // Todos os livros salvos na biblioteca; as estantes filtram daqui
  const [livros, setLivros] = useState([]);
  const [erro, setErro] = useState("");
  // Anotações de todos os livros; null = ainda carregando
  const [anotacoes, setAnotacoes] = useState(null);
  const [erroAnotacoes, setErroAnotacoes] = useState("");

  // Foto: o botão "Trocar foto" abre o seletor de arquivo, que fica escondido
  const seletorFoto = useRef(null);
  const [salvandoFoto, setSalvandoFoto] = useState(false);
  const [mensagemFoto, setMensagemFoto] = useState({ texto: "", erro: false });

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

  // Separado do resto: os títulos podem depender da Open Library, que às vezes demora
  useEffect(() => {
    let atual = true;

    axios
      .get(`${API_URL}/api/books/notes`, {
        headers: { Authorization: `Bearer ${props.token}` },
      })
      .then((res) => {
        if (atual) setAnotacoes(res.data);
      })
      .catch((error) => {
        if (atual) setErroAnotacoes(motivo(error, "Não foi possível carregar as anotações"));
      });

    return () => {
      atual = false;
    };
  }, [props.token]);

  // Envia a foto nova, ou null pra remover
  const salvarFoto = async (foto) => {
    setSalvandoFoto(true);
    setMensagemFoto({ texto: "", erro: false });

    try {
      const res = await axios.patch(`${API_URL}/api/auth/me`, { photo: foto }, cabecalho);
      setUsuario(res.data);
    } catch (error) {
      setMensagemFoto({ texto: motivo(error, "Não foi possível salvar a foto"), erro: true });
    } finally {
      setSalvandoFoto(false);
    }
  };

  const escolherFoto = async (event) => {
    const arquivo = event.target.files[0];
    // Limpa o seletor, pra escolher o mesmo arquivo de novo funcionar
    event.target.value = "";
    if (!arquivo) return;

    let foto;
    try {
      foto = await reduzirFoto(arquivo);
    } catch {
      // Ex.: arquivo que não é imagem, ou formato que o navegador não abre
      setMensagemFoto({ texto: "Não foi possível abrir essa imagem", erro: true });
      return;
    }
    salvarFoto(foto);
  };

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
        <div className="perfil-foto-area">
          {usuario.photo ? (
            <img className="perfil-foto" src={usuario.photo} alt={`Foto de ${usuario.name}`} />
          ) : (
            // Sem foto: mostra a inicial do nome
            <div className="perfil-foto perfil-foto-vazia" aria-hidden="true">
              {usuario.name[0].toUpperCase()}
            </div>
          )}

          <div>
            <input
              ref={seletorFoto}
              type="file"
              accept="image/*"
              onChange={escolherFoto}
              aria-label="Escolher foto de perfil"
              hidden
            />
            <button
              className="perfil-acao"
              onClick={() => seletorFoto.current.click()}
              disabled={salvandoFoto}
            >
              {salvandoFoto ? "Salvando..." : usuario.photo ? "Trocar foto" : "Adicionar foto"}
            </button>
            {usuario.photo && (
              <button className="perfil-acao" onClick={() => salvarFoto(null)} disabled={salvandoFoto}>
                Remover
              </button>
            )}

            {mensagemFoto.texto && <p className="erro">{mensagemFoto.texto}</p>}
          </div>
        </div>
      )}

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
            mostrarAvaliacao
          />
          <Estante
            titulo="Favoritos"
            livros={livros.filter((l) => l.favorite)}
            abrirLivro={props.abrirLivro}
          />

          {/* Mesmo cabeçalho das estantes; clicar num post-it abre o livro dele */}
          <section className="fileira">
            <h3>
              Anotações{" "}
              {anotacoes && <span className="estante-quantidade">{anotacoes.length}</span>}
            </h3>

            {erroAnotacoes && <p className="erro">{erroAnotacoes}</p>}
            {!anotacoes && !erroAnotacoes && <p className="estante-vazia">Carregando...</p>}
            {anotacoes?.length === 0 && <p className="estante-vazia">Nenhuma anotação ainda</p>}

            {anotacoes?.length > 0 && (
              <div className="perfil-anotacoes">
                {anotacoes.map((anotacao) => (
                  <article
                    key={anotacao.id}
                    className={`detalhes-postit detalhes-postit-${anotacao.color} perfil-anotacao`}
                    onClick={() => props.abrirLivro(anotacao.openlibrary_id)}
                  >
                    {anotacao.book_title && (
                      <span className="perfil-anotacao-livro">{anotacao.book_title}</span>
                    )}
                    <h4>{anotacao.title || "Sem título"}</h4>
                    <p>{anotacao.text}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
