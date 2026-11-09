# Red Planet Property Finder

Aplicação demonstrativa de anúncios fictícios em Marte, com frontend React +
TanStack + Vite e backend Java 21 + Spring Boot + PostgreSQL no Neon.

## Executar localmente

Requisitos: **Git**, **Node.js 22.12 ou superior com npm**, **JDK 21** e um banco
**PostgreSQL no Neon**. O Maven é baixado pelo wrapper do projeto.

No PowerShell:

```powershell
git clone https://github.com/dsbrogio-pixaflow/red-planet-property-finder.git
cd red-planet-property-finder
npm.cmd ci
```

Siga o [guia de instalação e execução](backend/README.md) para configurar o
`.env.local`, gerar o segredo JWT e preparar as tabelas na primeira execução.

Depois da configuração, mantenha dois terminais abertos:

**Terminal 1 — na pasta `backend`:**

```powershell
.\mvnw.cmd spring-boot:run
```

**Terminal 2 — na raiz do projeto:**

```powershell
npm.cmd run dev -- --host localhost --port 8080 --strictPort
```

- Site: http://localhost:8080
- Status do backend: http://localhost:8081/api/status

Para encerrar, pressione **Ctrl+C nos dois terminais**.

## Lovable

Este projeto é conectado ao [Lovable](https://lovable.dev).

- [Aplicação publicada](https://red-planet-property-finder.lovable.app)
- [Editor do projeto](https://lovable.dev/projects/fbda85bb-a54c-4fed-9431-650fa15c9bb0)

Evite reescrever o histórico publicado, pois os commits da branch conectada
sincronizam com o Lovable.
