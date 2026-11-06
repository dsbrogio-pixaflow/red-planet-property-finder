# Backend Spring Boot + Neon

Requisitos: Java 21 e as credenciais do Neon no `.env.local` da raiz do
repositório. O Spring carrega esse arquivo tanto ao iniciar na raiz quanto
na pasta `backend`.

Use os valores reais exportados pelo Neon. Não faça commit do `.env.local`.
`MARS_JWT_SECRET` também pode ser fornecido pelo ambiente do sistema/IDE.

## Executar

No PowerShell, dentro da pasta "backend`:

.\mvnw.cmd spring-boot:run

O backend atende em http://localhost:8081. 

## Frontend

sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
