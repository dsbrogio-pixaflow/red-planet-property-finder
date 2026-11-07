
## Requisitos
Instale antes de executar o projeto:
- Java JDK 21;
- Node.js e npm;
- PostgreSQL;
- Git.
O backend inclui o Maven Wrapper (mvnw.cmd), portanto não é necessário instalar o Maven separadamente.

## Estrutura do projeto
red-planet-property-finder/
├── backend/                 # API Java / Spring Boot
├── src/                     # Frontend React / TypeScript
├── package.json
└── README.md

## Requisitos
1. Clonar o repositório
git clone <URL_DO_REPOSITORIO>
cd red-planet-property-finder

## utilizar o  PostgreSQL Neon
Confira as credenciais do Neon no `.env.local` da raiz do
repositório. O Spring carrega esse arquivo tanto ao iniciar na raiz quanto
na pasta `backend`.
Verifique as configurações de JPA em backend/src/main/resources/application.properties (ou application.yml). A criação/atualização das tabelas depende da configuração de schema definida pelo projeto.
Use os valores reais exportados pelo Neon. Não faça commit do `.env.local`.
`MARS_JWT_SECRET` também pode ser fornecido pelo ambiente do sistema/IDE.

## Configurar o backend
O backend utiliza a variável MARS_JWT_SECRET para a chave de assinatura dos tokens JWT. Defina uma chave forte no ambiente; não coloque segredos no GitHub.
No PowerShell, por exemplo:
$env:MARS_JWT_SECRET = "SUBSTITUA_POR_UMA_CHAVE_FORTE"
Confira em backend/src/main/resources/application.properties se a aplicação está configurada para usar a porta 8081 e se o CORS permite a origem do frontend (http://localhost:8080).

## Executar o backend
Abra um terminal na pasta backend:
cd backend
.\mvnw.cmd spring-boot:run
A API fica disponível, por padrão neste ambiente de desenvolvimento, em:
http://localhost:8081
Para conferir se a API pública está respondendo, acesse:
http://localhost:8081/api/public/properties
Mantenha esse terminal aberto enquanto utilizar o frontend.


## Configurar e executar o frontend
Em outro terminal, na pasta raiz do projeto, instale as dependências:
npm install
Crie um arquivo .env na raiz do projeto com o endereço da API:
VITE_API_URL=http://localhost:8081
Inicie o frontend:
npm run dev
Acesse no navegador o endereço informado pelo Vite. Na configuração de desenvolvimento utilizada no projeto, o frontend é executado em:
http://localhost:8080
Se o Vite iniciar em outra porta, ajuste a origem permitida no CORS do backend (SecurityConfig.java) e utilize o endereço correto no navegador.
