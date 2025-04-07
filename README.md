# 🐦 Twitter Clone

Um projeto fullstack inspirado no Twitter, com funcionalidades modernas, autenticação via JWT, e uma interface bonita e responsiva. Código limpo e tecnologias atuais.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** React + TailwindCSS + SCSS
- **Backend:** FastAPI
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT (JSON Web Token)
- **Infraestrutura:** Docker
- **Estilo de Código:** Clean Code, organização por responsabilidade
- **Gerenciamento de Pacotes Backend:** Poetry

---

## ✅ Funcionalidades Implementadas

### 🔐 Autenticação

- Cadastro de usuário com nome, e-mail e senha
- Login com geração de token JWT
- Proteção de rotas autenticadas
- Logout removendo token do localStorage

### 🐦 Tweets

- Criação de tweets (autenticado)
- Listagem de todos os tweets
- Edição de tweets (apenas pelo autor)
- Exclusão de tweets (apenas pelo autor)
- Curtir e descurtir tweets
- Contador de curtidas por tweet

### 👤 Área do Usuário

- Visualização de dados do usuário logado (nome e e-mail)
- Botão para seguir e deixar de seguir usuários (armazenado em localStorage por enquanto)

---

## 🧱 Estrutura

