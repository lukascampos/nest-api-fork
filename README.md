# Nest Boilerplate 2025

Este é um boilerplate para projetos utilizando o framework [NestJS](https://nestjs.com/). Ele está em construção e será melhorado continuamente.

## Tecnologias Utilizadas

- **NestJS**: Framework para construção de aplicações Node.js eficientes e escaláveis.
- **PostgreSQL**: Banco de dados relacional utilizado para armazenamento de dados.
- **Prisma**: ORM Node.js e TypeScript.
- **Docker**: Plataforma para desenvolvimento, envio e execução de aplicações em containers.

## Scripts de Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Passos para Instalação

1. Clone o repositório:

    ```bash
    git clone https://github.com/seu-usuario/nest-ddd-boilerplate-2025.git
    cd nest-ddd-boilerplate-2025
    ```

2. Instale as dependências:

    ```bash
    npm install
    ```

3. Configure o banco de dados PostgreSQL utilizando Docker:

    ```bash
    docker-compose up -d
    ```

4. Configure o Prisma:

    ```bash
    npx prisma generate
    ```

5. Execute as migrações do banco de dados:

    ```bash
    npx prisma migrate dev
    ```

6. Inicie a aplicação:

    ```bash
    npm run start:dev
    ```

## Scripts Disponíveis

- `npm run build`: Compila o projeto.
- `npm run start`: Inicia a aplicação.
- `npm run start:dev`: Inicia a aplicação em modo de desenvolvimento.
- `npm run start:debug`: Inicia a aplicação em modo de depuração.
- `npm run start:prod`: Inicia a aplicação em modo de produção.
- `npm run lint`: Executa o ESLint para verificar problemas no código.

## Estrutura do Projeto

- **src/**: Contém o código-fonte da aplicação.
- **prisma/**: Contém o esquema do Prisma e as migrações do banco de dados.
- **docker-compose.yml**: Configuração do Docker Compose para o PostgreSQL.
- **.env**: Arquivo de variáveis de ambiente.

## Melhorias Futuras

Este boilerplate está em construção e será melhorado continuamente.
