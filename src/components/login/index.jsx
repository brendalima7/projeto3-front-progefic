// Tela de login: entra com e-mail e senha e guarda o token

import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import "./index.css";

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const entrar = (event) => {
    // Impede o formulário de recarregar a página
    event.preventDefault();
    setErro("");

    axios
      .post(`${API_URL}/api/auth/login`, { email: email, password: senha })
      .then((res) => {
        // Guarda o token no navegador: continua logado ao recarregar a página
        localStorage.setItem("token", res.data.token);
        // onLogin vem do App: avisa que o login deu certo
        props.onLogin(res.data.token);
      })
      .catch((error) => {
        // A API manda o motivo em {"erro": "..."}, ex.: "E-mail ou senha inválidos"
        setErro(error.response?.data?.erro || "Não foi possível entrar");
      });
  };

  return (
    <div className="login">
      <div className="login-caixa">
        <h1>BookSpace</h1>

        <form onSubmit={entrar}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
          />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
          />
          <button type="submit">Entrar</button>
        </form>

        {erro && <p className="erro">{erro}</p>}

        {/* A tela de cadastro vem no passo 6 */}
        <p className="cadastre-se">Cadastre-se</p>
      </div>
    </div>
  );
}
