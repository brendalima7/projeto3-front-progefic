import { useState } from "react";
import Busca from "../busca";
import { GENEROS } from "../../generos";
import "./index.css";

export default function Topo(props) {
  const [menuAberto, setMenuAberto] = useState(false);

  // Clicar no gênero que já está ativo volta pro início
  const escolherGenero = (valor) => {
    props.mudarSecao(valor === props.secao ? "" : valor);
  };

  // Fecha o menu e faz a ação do item
  const clicarNoMenu = (acao) => {
    setMenuAberto(false);
    acao();
  };

  return (
    <header className="topo">
      <h1 className="logo" onClick={() => props.mudarSecao("")}>
        BookSpace
      </h1>

      {/* Os gêneros que não couberem na linha ficam escondidos (os menos importantes) */}
      <nav className="topo-generos">
        <button
          className={props.secao === "" ? "topo-genero ativo" : "topo-genero"}
          onClick={() => props.mudarSecao("")}
        >
          Início
        </button>

        {GENEROS.map((genero) => (
          <button
            key={genero.valor}
            className={genero.valor === props.secao ? "topo-genero ativo" : "topo-genero"}
            onClick={() => escolherGenero(genero.valor)}
          >
            {genero.nome}
          </button>
        ))}
      </nav>

      <Busca buscar={props.buscar} abrirLivro={props.abrirLivro} />

      <div className="menu">
        <button className="menu-botao" onClick={() => setMenuAberto(!menuAberto)}>
          ☰
        </button>

        {menuAberto && (
          <>
            {/* Fundo invisível: clicar fora do menu fecha ele */}
            <div className="menu-fundo" onClick={() => setMenuAberto(false)} />

            <ul className="menu-itens">
              <li>
                <button onClick={() => clicarNoMenu(props.trocarTema)}>
                  {props.tema === "escuro" ? "Tema claro" : "Tema escuro"}
                </button>
              </li>

              {props.logado ? (
                <>
                  {/* A página de perfil vem depois */}
                  <li>
                    <button onClick={() => setMenuAberto(false)}>Perfil</button>
                  </li>
                  <li>
                    <button onClick={() => clicarNoMenu(props.sair)}>Sair</button>
                  </li>
                </>
              ) : (
                <li>
                  <button onClick={() => clicarNoMenu(props.entrar)}>Entrar</button>
                </li>
              )}
            </ul>
          </>
        )}
      </div>
    </header>
  );
}
