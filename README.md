🐦 **Twitter Clone**

Um projeto fullstack inspirado no Twitter, com funcionalidades modernas, autenticação via JWT, e uma interface bonita e responsiva. Código limpo e tecnologias atuais.

---

🚀 **Tecnologias Utilizadas**
- **Frontend**: React + TailwindCSS + SCSS
- **Backend**: FastAPI + Uvicorn
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Token)
- **Estilo de Código**: Clean Code, organização por responsabilidade

---

✅ **Funcionalidades Implementadas**

🔐 **Autenticação**
- Cadastro de usuário com nome, e-mail e senha
- Login com geração de token JWT
- Proteção de rotas autenticadas
- Logout removendo token do localStorage

🐦 **Tweets**
- Criação de tweets (autenticado)
- Listagem de todos os tweets
- Edição de tweets (apenas pelo autor)
- Exclusão de tweets (apenas pelo autor)
- Curtir e descurtir tweets
- Contador de curtidas por tweet

👤 **Área do Usuário**
- Visualização de dados do usuário logado (nome e e-mail)
- Botão para seguir e deixar de seguir usuários (armazenado em localStorage por enquanto)

---

🧱 **Estrutura do Projeto**

### Frontend
- O frontend é desenvolvido utilizando React, com TailwindCSS para estilização e SCSS para customização de estilos.
- Responsividade garantida para diferentes tamanhos de tela.
- O frontend consome as APIs do backend, realizando autenticação com JWT e enviando/recebendo dados de tweets.

### Backend
- O backend é implementado com FastAPI, sendo servido pelo Uvicorn.
- O backend fornece endpoints para criação, edição, listagem e exclusão de tweets, além da gestão de usuários (login e cadastro).
- A comunicação entre o backend e o banco de dados PostgreSQL é feita com SQLAlchemy.
- O uso de JWT garante a segurança na autenticação dos usuários.

### Banco de Dados
- Utilização do PostgreSQL como banco de dados para armazenar informações dos usuários e dos tweets.
- Tabelas separadas para usuários, tweets e interações (curtidas e seguidores).

---

🔧 **Instruções para Rodar o Projeto**

 Clone este repositório para sua máquina:
   ```bash
   git clone https://github.com/seu-usuario/twitter-clone.git
   cd twitter-clone

   ```
 ```bash
   pip install -r requirements.txt
   
   ```
   
 ```bash
   uvicorn main:app --reload
   ```

### Frontend

 ```bash
   npm install
   ```
```bash
  npm run dev
```
O frontend estará disponível em http://localhost:3000.

