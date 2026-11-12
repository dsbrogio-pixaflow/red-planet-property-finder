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
  o backend. Para usar a Groq:

```dotenv
MARS_AI_BASE_URL=https://api.groq.com/openai/v1
MARS_AI_API_KEY=SUA_CHAVE_DA_GROQ
MARS_AI_MODEL=openai/gpt-oss-120b
```

A chave é lida somente pelo backend. Não use prefixo `VITE_` nem faça commit
do `.env.local`. Após salvar, encerre o backend com Ctrl+C e execute novamente
`.\mvnw.cmd spring-boot:run` dentro de `backend`.

Na página inicial, abra **Fale Conosco** e pergunte, por exemplo, “Quantos imóveis
há em Tharsis?”. Quando a interpretação por IA funcionar, o chat exibirá
**IA conectada ao catálogo**. Preços, quantidades e detalhes continuam sendo
calculados a partir dos anúncios publicados. Se a Groq estiver indisponível,
o chat continua no modo de consulta ao catálogo.

A integração usa a [API compatível com Chat Completions da Groq](https://console.groq.com/docs/openai).
Você pode trocar o modelo por outro habilitado na sua conta, consultando a
[lista de modelos da Groq](https://console.groq.com/docs/models).

## Deploy: frontend na Vercel e backend Java

O caminho das consultas é **site na Vercel → API Spring Boot → PostgreSQL no Neon**.
Publicar o frontend não inicia o backend da pasta `backend`. A API precisa estar
em execução em uma hospedagem com Java 21, acessível por HTTPS.
O `.env.local` da sua máquina não é enviado pelo Git nem configura a hospedagem.

No serviço que hospeda o backend, configure:

```dotenv
DATABASE_URL=URL_POSTGRESQL_COM_POOL_DO_NEON
MARS_JWT_SECRET=SEU_SEGREDO_BASE64
MARS_CORS_ALLOWED_ORIGINS=https://red-planet-property-finder.vercel.app
```

Use a URL completa do Neon com `sslmode=require`. Mantenha os segredos somente
no ambiente do backend. A variável `PORT` da hospedagem é respeitada; sem ela,
a API usa a porta 8081. Para o chatbot com IA, configure também `MARS_AI_BASE_URL`,
`MARS_AI_API_KEY` e `MARS_AI_MODEL` nesse serviço.

Na Vercel, em **Settings → Environment Variables**, configure para Production:

```dotenv
VITE_API_URL=https://DOMINIO_PUBLICO_DO_BACKEND
```

Essa variável aponta para a API, sem `/api` no final; não recebe a URL PostgreSQL.
Faça um novo deploy do frontend após alterá-la. Para permitir mais de um domínio
no backend, separe as origens de `MARS_CORS_ALLOWED_ORIGINS` por vírgulas, sem
caminhos nem barra final. Inclua explicitamente as URLs de preview que utilizar.

Confira `https://DOMINIO_PUBLICO_DO_BACKEND/api/status` e
`https://DOMINIO_PUBLICO_DO_BACKEND/api/public/properties`. O primeiro verifica a
API; o segundo também consulta o banco. Se o primeiro funciona e o segundo
falha, confira os logs do backend, as credenciais do Neon e o schema existente.
Não habilite `init-db` automaticamente em produção.

### Publicar o backend no Render

O `backend/Dockerfile` compila a API com Java 21 e inicia o JAR. Ele não inclui
o `.env.local` na imagem. Uma opção de hospedagem é um
[Web Service Docker no Render](https://render.com/docs/docker):

1. Envie as alterações deste projeto para o seu repositório GitHub.
2. No Render, escolha **New → Web Service** e conecte o repositório.
3. Selecione a branch com as alterações, informe **Root Directory: `backend`**
   e escolha o runtime **Docker**. O Dockerfile é `Dockerfile`, relativo a essa pasta.
4. Adicione as variáveis do backend listadas acima. Use os valores reais do seu
   `.env.local`, sem aspas extras. Não precisa criar outro banco no Render.
5. Configure **Health Check Path: `/api/status`** e inicie o deploy.
6. Quando a API estiver disponível, teste `/api/status` e `/api/public/properties`
   na URL HTTPS fornecida pelo Render.
7. Copie essa URL para `VITE_API_URL` na Vercel, no ambiente Production, e faça
   um novo deploy do frontend.

O build da imagem não consulta o banco; a conexão e a validação das tabelas
acontecem quando a API inicia. Selecione o plano da hospedagem conforme os
recursos necessários e os preços apresentados no painel.

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
