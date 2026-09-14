# BookSwap — Mock Server

Implementação local do [contrato de API](../API-CONTRACT.md), pra o front
poder ser desenvolvido sem depender do back-end real estar pronto.

Zero dependências externas (usa só o módulo `http` nativo do Node) — não
precisa de `npm install`.

## Como rodar

```bash
cd mock-server
node server.js
```

Sobe em `http://localhost:4000`. Aponte o front pra ele criando um `.env`
na raiz do projeto (veja `.env.example`).

## Usuários de teste

| Email | Senha |
|---|---|
| ana@fiap.com.br | 123456 |
| bruno@fiap.com.br | 123456 |

## Testes

```bash
node --test
```

24 testes usando `node:test` (nativo do Node, zero dependências). Sobem o
servidor de verdade numa porta dedicada (4055) e testam os endpoints via
`fetch`, incluindo autenticação, filtros/busca/paginação, CRUD de anúncios
com checagem de autorização por dono do recurso, e upload de imagem.

## O que já está implementado

- `POST /auth/login`
- `GET /catalog/disciplines`
- `GET /listings` (com filtros `q`, `disciplineId`, `type`, `minPrice`,
  `maxPrice` e paginação `page`/`pageSize`)
- `GET /listings/:id`
- `GET /listings/mine` 🔒
- `POST /listings` 🔒
- `PUT /listings/:id` 🔒 (só o autor pode editar — retorna `403` senão)
- `DELETE /listings/:id` 🔒 (só o autor pode excluir — retorna `403` senão)
- `POST /uploads` 🔒 — recebe imagem em base64/JSON, salva em
  `mock-server/uploads/` e devolve a URL pra usar em `imageUrl`.
- `GET /uploads/:filename` — serve o arquivo salvo.
- `GET /favorites` 🔒, `POST /favorites/:id` 🔒, `DELETE /favorites/:id` 🔒
  — favoritar/desfavoritar anúncios, isolado por usuário.

## Dados de exemplo

3 anúncios pré-cadastrados (`seed.js`), de dois usuários diferentes, em
disciplinas diferentes, com um deles já com status "Reservado" — bom pra
testar que a listagem pública só mostra os "Disponível".

## Limitações (é só um mock)

- Estado em memória — reinicia toda vez que você reinicia o servidor.
- Token fake (`mock-token-<userId>`), sem expiração nem verificação
  criptográfica de verdade. **Não usar essa lógica de auth no back-end real.**
- Sem persistência em banco de dados.

Quando o back-end de verdade estiver pronto, é só trocar o `VITE_API_URL`
no `.env` do front — a interface (`services/*.ts`) já está escrita contra o
contrato, então não deve precisar mudar nada no front além da URL.
