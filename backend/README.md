# Executar o projeto: backend e frontend

Este guia usa **Windows e PowerShell**. O frontend fica em `http://localhost:8080`
e o backend em `http://localhost:8081`.

## 1. Dependências necessárias

Instale antes de começar:

- **Git** para clonar o repositório.
- **Node.js 22.12 ou superior**, com **npm**, para o frontend.
- **JDK 21**, com `JAVA_HOME` apontando para a instalação do JDK.
- Um **projeto PostgreSQL no Neon**, com as URLs de conexão com pool e sem pool.
- Acesso à internet para baixar as dependências e conectar ao Neon.

Não é necessário instalar PostgreSQL localmente nem Maven: o banco fica no Neon
e o Maven Wrapper (`mvnw.cmd`) baixa o Maven. O cliente `psql` só é necessário
para os scripts opcionais de administração e dados de demonstração.

Confira as instalações em um novo terminal:

```powershell
git --version
node --version
npm.cmd --version
java -version
javac -version
```

## 2. Clonar e instalar o frontend

Na pasta em que deseja guardar o projeto:

```powershell
git clone https://github.com/dsbrogio-pixaflow/red-planet-property-finder.git
cd red-planet-property-finder
npm.cmd ci
```

O comando instala as dependências do frontend, incluindo React, TanStack e Vite,
nas versões do `package-lock.json`. Não instale essas bibliotecas separadamente.

## 3. Configurar o ambiente

Crie um arquivo chamado **`.env.local` na raiz do repositório**, ao lado de
`package.json`. Preencha com os dados do seu projeto Neon:

```dotenv
DATABASE_URL=postgresql://USUARIO:SENHA@HOST_COM_POOL/neondb?sslmode=require&channel_binding=require
DATABASE_URL_UNPOOLED=postgresql://USUARIO:SENHA@HOST_SEM_POOL/neondb?sslmode=require&channel_binding=require
MARS_JWT_SECRET=COLE_AQUI_O_SEGREDO_GERADO
VITE_API_URL=http://localhost:8081
```

Copie as URLs reais fornecidas pelo Neon, sem os placeholders acima. A URL com
pool normalmente tem `-pooler` no host; a outra é a conexão direta ao mesmo banco.

Gere o segredo JWT com este comando e copie o resultado para `MARS_JWT_SECRET`:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Mantenha esse segredo entre as execuções. Não publique o `.env.local` nem use
prefixo `VITE_` para senhas ou chaves: variáveis com esse prefixo ficam acessíveis
no frontend. O arquivo já é ignorado pelo Git.

## 4. Preparar o banco na primeira execução

Na raiz do projeto, entre na pasta `backend` e execute:

```powershell
cd backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=init-db"
```

O Maven baixa as dependências Java automaticamente, incluindo Spring Boot,
Spring Security, JPA/Hibernate e o driver PostgreSQL.

O perfil `init-db` usa a conexão direta para criar ou atualizar as tabelas.
Quando aparecer **`Started MarsBackendApplication`**, encerre com **Ctrl+C**.

Execute essa preparação em um banco de desenvolvimento. Em um banco existente,
revise as alterações antes de usar `init-db`; ele não substitui migrações
versionadas. Não use `create` ou `create-drop` no banco principal.

## 5. Iniciar o backend

No mesmo terminal, dentro da pasta `backend`:

```powershell
.\mvnw.cmd spring-boot:run
```

Aguarde **`Started MarsBackendApplication`** e mantenha o terminal aberto.
A execução normal valida as tabelas, sem alterá-las automaticamente.

## 6. Iniciar o frontend

Abra **outro terminal**, na raiz `red-planet-property-finder`, e execute:

```powershell
npm.cmd run dev -- --host localhost --port 8080 --strictPort
```

Mantenha esse terminal aberto e acesse **http://localhost:8080**.
O frontend consulta o backend configurado em `VITE_API_URL`.

## 7. Conferir o funcionamento

Com os dois terminais em execução, abra estes endereços:

| Endereço                                    | Resultado esperado                               |
| ------------------------------------------- | ------------------------------------------------ |
| http://localhost:8080                       | Página inicial do site                           |
| http://localhost:8081/api/status            | JSON com `"status": "ONLINE"`                    |
| http://localhost:8081/api/public/properties | Lista de anúncios; `[]` se o banco estiver vazio |

Também pode conferir o backend em um terceiro terminal:

```powershell
Invoke-RestMethod http://localhost:8081/api/status
```

Crie uma conta pelo site para cadastrar anúncios. Um banco novo começa sem
usuários e sem anúncios; as contas e os dados de outro banco não vêm com o clone.

## Nas próximas execuções

Não precisa clonar, gerar outro segredo ou preparar as tabelas novamente.

**Terminal 1 — pasta `backend`:**

```powershell
.\mvnw.cmd spring-boot:run
```

**Terminal 2 — raiz do projeto:**

```powershell
npm.cmd run dev -- --host localhost --port 8080 --strictPort
```

Para encerrar, pressione **Ctrl+C em cada terminal**. Se alterar o `.env.local`,
reinicie os dois processos.

## Recursos opcionais

- **Administração:** cadastre primeiro a conta `Master@master.com` pelo site.
  Com `psql` no PATH, na raiz, execute
  `.\backend\scripts\Apply-AdminMigration.ps1` e entre novamente nessa conta.
  O script promove a conta existente e mantém sua senha. Valide a migração em
  uma branch Neon de teste antes de aplicá-la ao banco principal.
- **Anúncios de demonstração:** os scripts estão em `backend/scripts`.
  `Seed-DemoListings.ps1 -InspectOnly` e `-VerifyOnly` apenas consultam os dados.
  Executar sem opções cria até 20 anúncios por usuário comum; `-TrimToTen` remove
  aleatoriamente o excedente desse lote até restarem 10 por conta.
- **Chatbot:** funciona sem chave de IA, consultando o catálogo. Para habilitar
  interpretação por IA, acrescente ao `.env.local` as variáveis abaixo e reinicie
  o backend. Use os valores de um provedor compatível com Chat Completions:

```dotenv
MARS_AI_BASE_URL=https://HOST_DO_PROVEDOR/v1
MARS_AI_API_KEY=SUA_CHAVE_DO_PROVEDOR
MARS_AI_MODEL=ID_DO_MODELO_HABILITADO
```

## Problemas comuns

| Problema                                   | O que conferir                                                                                                              |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `npm` bloqueado pelo PowerShell            | Use `npm.cmd`, como nos comandos deste guia.                                                                                |
| Java não encontrado ou versão incompatível | Instale o JDK 21 e confira `JAVA_HOME`, `java -version` e `javac -version`.                                                 |
| Erro em `MARS_JWT_SECRET`                  | Gere um segredo Base64 com o comando do passo 3 e reinicie o backend.                                                       |
| Erro ao conectar ao banco                  | Confira as URLs do Neon, as credenciais, a internet e variáveis de ambiente antigas, que têm prioridade sobre o arquivo.    |
| Tabela ou coluna não encontrada            | Prepare o schema com `init-db` no banco de desenvolvimento correto.                                                         |
| Porta 8080 ou 8081 em uso                  | Encerre a execução anterior com Ctrl+C antes de iniciar outra.                                                              |
| O site abre, mas não carrega anúncios      | Confira o backend na porta 8081 e `VITE_API_URL`. Use `localhost` na URL do frontend para corresponder ao CORS configurado. |

## Testes e build

Na raiz do projeto:

```powershell
npm.cmd test
npm.cmd run build
```

Para um teste do backend que não acessa o banco, dentro de `backend`:

```powershell
.\mvnw.cmd test "-Dtest=DatabaseConfigTests"
```

A suíte completa do backend usa o banco: execute `.\mvnw.cmd test` somente com
credenciais de uma branch Neon de teste. O teste de integração administrativa
exige a conta Master já cadastrada e promovida nessa branch.
