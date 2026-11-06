# Backend Spring Boot + Neon

Requisitos: Java 21 e as credenciais do Neon no `.env.local` da raiz do
repositório. O Spring carrega esse arquivo tanto ao iniciar na raiz quanto
na pasta `backend`.

```dotenv
DATABASE_URL=postgresql://USUARIO:SENHA@HOST-pooler/neondb?sslmode=require&channel_binding=require
DATABASE_URL_UNPOOLED=postgresql://USUARIO:SENHA@HOST/neondb?sslmode=require&channel_binding=require
MARS_JWT_SECRET=SEGREDO_BASE64_DE_PELO_MENOS_32_BYTES
```

Use os valores reais exportados pelo Neon. Não faça commit do `.env.local`.
`MARS_JWT_SECRET` também pode ser fornecido pelo ambiente do sistema/IDE.

## Executar

No PowerShell, na pasta `backend`:

```powershell
.\mvnw.cmd spring-boot:run
```

O backend atende em `http://localhost:8081`. A URL PostgreSQL é convertida
para JDBC, preservando SSL e separando usuário/senha da URL JDBC. O pool
Hikari usa até cinco conexões. Deploys também podem fornecer as variáveis
padrão `SPRING_DATASOURCE_URL` (formato JDBC),
`SPRING_DATASOURCE_USERNAME` e `SPRING_DATASOURCE_PASSWORD`.

## Preparar as tabelas

Execute explicitamente, depois de revisar as entidades JPA:

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=init-db"
```

O perfil `init-db` usa `DATABASE_URL_UNPOOLED` para criar/atualizar as tabelas
`users`, `properties`, `property_details` e `property_images`, seus índices
e relacionamentos. Aguarde a mensagem de inicialização e encerre com Ctrl+C.
Depois execute normalmente, sem o perfil. A execução normal usa a conexão
com pool e apenas **valida** o schema; não altera as tabelas automaticamente.

O schema é gerenciado pelo Hibernate a partir das entidades existentes.
`update` não substitui migrações versionadas para mudanças destrutivas,
renomeações ou transformações de dados. Valide mudanças em uma branch Neon
antes de aplicar ao banco principal. Não use `create` ou `create-drop` no
banco principal.

## Testar

Use credenciais de uma branch Neon de teste nas variáveis de ambiente
`DATABASE_URL` e `DATABASE_URL_UNPOOLED`; elas têm prioridade sobre o arquivo.

```powershell
# Prepara o schema na branch de teste e verifica os repositórios.
.\mvnw.cmd test "-Dspring.profiles.active=init-db"
# Verifica novamente sem alterações automáticas no schema.
.\mvnw.cmd test
```

O teste de persistência faz rollback das linhas criadas. O perfil `init-db`
mantém o schema criado na branch. `/api/status` informa que a aplicação está
online; `/api/public/properties` também executa uma consulta ao banco.
