// Tela de cadastro: cria a conta e já entra com o token devolvido

import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import "./index.css";

export default function Cadastro(props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");

  const cadastrar = (event) => {
    // Impede o formulário de recarregar a página
    event.preventDefault();
    setErro("");

    // Confere aqui mesmo: o back só recebe uma senha
    if (senha !== confirmacao) {
      setErro("As senhas não são iguais");
      return;
    }

    axios
      .post(`${API_URL}/api/auth/register`, { name: nome, email: email, password: senha })
      .then((res) => {
        // O cadastro já devolve o token, então a pessoa entra direto
        localStorage.setItem("token", res.data.token);
        props.onLogin(res.data.token);
      })
      .catch((error) => {
        // Ex.: "Já existe uma conta com esse e-mail" ou "A senha deve ter pelo menos 6 caracteres"
        setErro(error.response?.data?.erro || "Não foi possível criar a conta");
      });
  };

  return (
    <div className="cadastro">
      <div className="cadastro-caixa">
        <h1>BookSpace</h1>

        <form onSubmit={cadastrar}>
          <label>
            Nome:
            <input value={nome} onChange={(e) => setNome(e.target.value)} />
          </label>
          <label>
            E-mail:
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Senha:
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </label>
          <label>
            Confirme a senha:
            <input
              type="password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
            />
          </label>
          <button type="submit">Cadastrar</button>
        </form>

        {erro && <p className="erro">{erro}</p>}
      </div>
    </div>
  );
}
