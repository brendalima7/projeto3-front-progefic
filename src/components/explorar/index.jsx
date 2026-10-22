import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../api";
import "./index.css";

const ASSUNTOS = [
  { nome: "Fantasia", valor: "fantasy" },
  { nome: "Mistério", valor: "mystery" },
  { nome: "Romance", valor: "romance" },
  { nome: "Ficção científica", valor: "science fiction" },
  { nome: "Terror", valor: "horror" },
  { nome: "Biografia", valor: "biography" },
];

export default function Explorar() {
  const [termo, setTermo] = useState("");
  const [livros, setLivros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [buscou, setBuscou] = useState(false);
  const [assuntoAtual, setAssuntoAtual] = useState("fantasy");

  
  const carregarLivros = (q, tipo) => {
    axios
      .get(`${API_URL}/api/books/search`, { params: { q: q, type: tipo } })
      .then((res) => {
        setLivros(res.data.results);
        setBuscou(true);
      })
      .catch((error) => {
        
        setErro(error.response?.data?.erro || "Não foi possível buscar os livros");
        setLivros([]);
      })
      
      .finally(() => setCarregando(false));
  };

  const buscar = (event) => {
    
    event.preventDefault();
    setAssuntoAtual("");
    setCarregando(true);
    setErro("");
    carregarLivros(termo, "all");
  };

  const escolherAssunto = (valor) => {
    setAssuntoAtual(valor);
    setCarregando(true);
    setErro("");
    carregarLivros(valor, "subject");
  };

  
  useEffect(() => {
    carregarLivros("fantasy", "subject");
  }, []);

  return (
    <div className="explorar">
      <h2>Explorar</h2>

      <form onSubmit={buscar}>
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Título, autor ou assunto"
        />
        <button type="submit">Buscar</button>
      </form>

      <div className="assuntos">
        {ASSUNTOS.map((assunto) => (
          <button
            key={assunto.valor}
            className={assunto.valor === assuntoAtual ? "assunto ativo" : "assunto"}
            onClick={() => escolherAssunto(assunto.valor)}
          >
            {assunto.nome}
          </button>
        ))}
      </div>

      {carregando && <p>Carregando...</p>}

      {erro && <p className="erro">{erro}</p>}

      {buscou && !carregando && !erro && livros.length === 0 && (
        <p>Nenhum livro encontrado</p>
      )}

      <ul className="lista-livros">
        {livros.map((livro) => (
          <li key={livro.id}>
            {/* Nem todo livro tem capa */}
            {livro.cover_id && (
              <img
                src={`https://covers.openlibrary.org/b/id/${livro.cover_id}-S.jpg`}
                alt={livro.title}
              />
            )}
            <span>
              {livro.title}
              {/* Alguns livros não têm autor */}
              {livro.authors.length > 0 && ` - ${livro.authors.join(", ")}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
