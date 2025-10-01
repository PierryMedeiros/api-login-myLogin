# API de Login e Cotação de Ações

Esta é uma API Node.js que fornece funcionalidades de gerenciamento de usuários e cotação de ações, com integração com a B3 e a API BRAPI.

## Tecnologias Utilizadas

*   **Node.js**
*   **Express.js**
*   **MySQL**
*   **Knex.js**
*   **JSON Web Token (JWT)**
*   **bcrypt**
*   **Docker**

## Endpoints da API

### Usuários

*   `POST /user`: Cria um novo usuário.
*   `GET /user`: Lista todos os usuários.
*   `GET /user/:id`: Busca um usuário pelo ID.
*   `GET /users/:email`: Busca um usuário pelo email.
*   `PUT /user`: Edita um usuário (requer autenticação de administrador).
*   `DELETE /user/:id`: Remove um usuário (requer autenticação de administrador).
*   `POST /recoverpassword`: Envia um email de recuperação de senha.
*   `POST /changepassword`: Altera a senha do usuário.
*   `POST /login`: Realiza o login do usuário.

### Ações

*   `POST /b3request`: (Descrição a ser adicionada)
*   `GET /getequeties/:id`: Busca as ações de um usuário.
*   `POST /brapiStocks`: (Descrição a ser adicionada)
*   `GET /brapiStocks`: (Descrição a ser adicionada)
*   `POST /getStockHistory`: (Descrição a ser adicionada)
*   `GET /getEquitiesHistory/:cpf`: Busca o histórico de ações de um usuário.

## Como Executar

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    ```
2.  **Instale as dependências:**
    ```bash
    cd api-login-myLogin/APIs
    npm install
    ```
3.  **Inicie o ambiente com Docker:**
    ```bash
    cd ..
    docker-compose up -d
    ```
4.  **Inicie a API:**
    ```bash
    cd APIs
    node index.js
    ```
