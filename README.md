# projeto3-front-progefic

Frontend do **BookSpace**, app para descobrir livros e organizar leituras. Projeto 3 de Programação Eficaz.

## Funcionalidades

- **Explorar:** assuntos fixos (ex.: fantasia, mistério) e busca por título, autor ou assunto.
- **Detalhes:** informações do livro e opções para marcar como lido, adicionar ou remover da lista e favoritar.
- **Minha biblioteca:** livros em "Quero ler", "Lendo" e "Lido", com nota e anotação privada.
- **Favoritos:** livros favoritos reunidos em uma estante no perfil.
- **Login:** cada usuário tem a própria biblioteca.

## Regras

- Todos os dados vêm da API Flask ([projeto3-back-progefic](https://github.com/brendalima7/projeto3-back-progefic)); o frontend não acessa a Open Library diretamente.
- Nota: inteira de 1 a 5, disponível apenas para livros com status "Lido".
- Endereço da API em variável de ambiente, nunca fixo no código.

## Planejamento geral (front)

1. Criar o projeto React com Vite.
2. Telas Explorar, Detalhes e Minha biblioteca.
3. Cadastro e login, com o token enviado nas requisições.
4. Integração com todas as rotas da API.
5. Deploy na AWS.
