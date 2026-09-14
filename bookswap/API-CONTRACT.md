# BookSwap — Contrato de API (v1)

Documento de alinhamento entre front-end e back-end. Enquanto o back-end
real não está pronto, este contrato é implementado por um mock server local
(`mock-server/`), então o front pode ser desenvolvido em paralelo.

## Convenções gerais

- Base URL: definida em `VITE_API_URL` (ex: `http://localhost:4000`).
- Todas as respostas de sucesso vêm envelopadas em `{ "data": ... }`.
  Listagens paginadas também trazem `"meta"`.
- Erros vêm no formato:
  ```json
  { "error": { "code": "NOT_FOUND", "message": "Anúncio não encontrado." } }
  ```
- Autenticação: header `Authorization: Bearer <token>` em todas as rotas
  protegidas (marcadas com 🔒 abaixo).
- Datas em ISO 8601 (`createDate`, `updateDate`).
- IDs são strings (`_id`).

## Códigos de status usados

| Código | Quando |
|---|---|
| 200 | sucesso em GET/PUT |
| 201 | sucesso em POST (criação) |
| 204 | sucesso em DELETE (sem corpo) |
| 400 | payload inválido (campos faltando/mal formatados) |
| 401 | token ausente ou inválido |
| 403 | usuário autenticado mas não é dono do recurso |
| 404 | recurso não encontrado |
| 409 | conflito (ex: tentar editar anúncio já trocado) |

---

## Auth

### `POST /auth/login`
Não requer autenticação.

**Request**
```json
{ "email": "aluno@fiap.com.br", "password": "123456" }
```

**Response `200`**
```json
{
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "u1",
      "name": "Ana Souza",
      "username": "ana.souza",
      "email": "aluno@fiap.com.br",
      "role": "ALUNO"
    }
  }
}
```

**Response `401`** — credenciais inválidas.

---

## Catálogo

### `GET /catalog/disciplines`
Não requer autenticação.

**Response `200`**
```json
{
  "data": [
    { "_id": "d1", "label": "Front-End Design", "order": 1, "isActive": true },
    { "_id": "d2", "label": "Banco de Dados", "order": 2, "isActive": true }
  ]
}
```

---

## Anúncios (Listings)

### `GET /listings`
Não requer autenticação. Lista pública de anúncios disponíveis.

**Query params (todos opcionais)**

| Param | Tipo | Descrição |
|---|---|---|
| `q` | string | busca por título/descrição |
| `disciplineId` | string | filtra por disciplina |
| `type` | `troca` \| `venda` \| `doacao` | filtra por tipo |
| `minPrice`, `maxPrice` | number | filtra por faixa de preço (só aplica a `venda`) |
| `page` | number | padrão `1` |
| `pageSize` | number | padrão `12` |

**Response `200`**
```json
{
  "data": [
    {
      "_id": "l1",
      "title": "Cálculo I - Stewart, 7ª edição",
      "description": "Livro em bom estado, com anotações a lápis.",
      "condition": "usado",
      "type": "venda",
      "price": 45.0,
      "imageUrl": "https://.../calculo.jpg",
      "discipline": { "_id": "d1", "label": "Cálculo I", "order": 1 },
      "author": { "_id": "u1", "name": "Ana Souza", "username": "ana.souza", "email": "ana@fiap.com.br" },
      "status": { "_id": "s1", "label": "Disponível", "order": 1 },
      "createDate": "2026-08-20T14:00:00.000Z",
      "updateDate": "2026-08-20T14:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 12, "total": 1 }
}
```

### `GET /listings/:id`
Não requer autenticação.

**Response `200`** — mesmo shape de um item acima.
**Response `404`** — anúncio não existe.

### `GET /listings/mine` 🔒
Lista os anúncios do usuário autenticado (qualquer status, não só "Disponível").

**Response `200`** — mesmo shape de `GET /listings`, sem paginação (`meta` omitido).

### `POST /listings` 🔒

**Request**
```json
{
  "title": "Cálculo I - Stewart, 7ª edição",
  "description": "Livro em bom estado, com anotações a lápis.",
  "condition": "usado",
  "type": "venda",
  "price": 45.0,
  "imageUrl": "https://.../calculo.jpg",
  "discipline": { "_id": "d1" }
}
```
- `price` obrigatório apenas quando `type === "venda"`.
- `author` e `status` são definidos pelo servidor (autor = usuário do token;
  status inicial = "Disponível").

**Response `201`** — anúncio criado, mesmo shape do `GET /listings/:id`.
**Response `400`** — payload inválido.

### `PUT /listings/:id` 🔒
Somente o autor pode editar (ver seção de autorização abaixo).

**Request** — mesmo shape do `POST`, mais um campo opcional de status:
```json
{
  "title": "...",
  "description": "...",
  "condition": "usado",
  "type": "venda",
  "price": 40.0,
  "imageUrl": "...",
  "discipline": { "_id": "d1" },
  "status": { "_id": "s2" }
}
```

**Response `200`** — anúncio atualizado.
**Response `403`** — usuário autenticado não é o autor.
**Response `404`** — anúncio não existe.

### `DELETE /listings/:id` 🔒
Somente o autor pode excluir.

**Response `204`** — sem corpo.
**Response `403` / `404`** — mesma lógica do `PUT`.

---

## Upload de imagem

### `POST /uploads` 🔒

**Implementação atual (mock):** recebe o arquivo como base64 dentro de um
JSON, pra evitar lidar com `multipart/form-data` sem dependências externas.

**Request**
```json
{
  "filename": "livro-calculo.png",
  "contentType": "image/png",
  "dataBase64": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```
- `contentType` aceito: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
- Limite de tamanho: 5MB (arquivo decodificado).

**Response `201`**
```json
{ "data": { "url": "http://localhost:4000/uploads/7616d2d3-....png" } }
```

**Response `400`** — `INVALID_PAYLOAD`, `UNSUPPORTED_MEDIA_TYPE` ou
`FILE_TOO_LARGE`.
**Response `401`** — sem token.

O `url` retornado é salvo em `IListing.imageUrl` normalmente (nenhum outro
endpoint muda por causa disso).

### ⚠️ Decisão para o time de back-end

O formato acima (base64 em JSON) é uma conveniência do **mock**, não uma
recomendação de arquitetura. Para o back-end real, avaliem uma destas opções:

1. **Multipart tradicional** — `POST /uploads` recebe
   `multipart/form-data`, back-end salva em disco/S3 e devolve `{ data: { url } }`
   no mesmo formato. Muda a implementação do `uploadService.ts` no front, mas
   não muda o contrato de resposta nem o resto da aplicação.
2. **Presigned URL** — front pede uma URL assinada
   (`POST /uploads/presign` → `{ uploadUrl, fileUrl }`), sobe o arquivo
   direto pro S3/Cloudinary, e só salva `fileUrl` no anúncio. Mais escalável
   (não sobrecarrega o back-end com upload de binário), mas exige mais setup
   de infra.
3. **Manter base64 em JSON** — mais simples de implementar, mas ineficiente
   pra arquivos grandes (aumenta ~33% o tamanho da requisição) e não deve ser
   usado em produção.

Recomendação: começar com a opção 1 (multipart) pro MVP, migrar pra opção 2
se o volume de anúncios/imagens justificar.

---

---

## Favoritos

### `GET /favorites` 🔒
Retorna os anúncios que o usuário autenticado marcou como favorito.

**Response `200`**
```json
{ "data": [ /* array de IListing, mesmo shape de GET /listings/:id */ ] }
```

### `POST /favorites/:id` 🔒
Marca o anúncio `:id` como favorito do usuário autenticado. Idempotente
(chamar duas vezes não duplica).

**Response `201`**
```json
{ "data": { "favorited": true } }
```
**Response `404`** — anúncio não existe.

### `DELETE /favorites/:id` 🔒
Remove o anúncio dos favoritos do usuário autenticado.

**Response `204`** — sem corpo (mesmo que o anúncio não estivesse
favoritado — operação idempotente).

---

## Regras de autorização

- **Leitura** (`GET /listings`, `GET /listings/:id`, `GET /catalog/disciplines`):
  pública, sem necessidade de token — a decidir se isso muda no futuro.
- **Escrita** (`POST`, `PUT`, `DELETE` em `/listings`): sempre requer token
  válido.
- **Edição/exclusão**: o back-end **deve validar** que
  `listing.author._id === token.userId`, independente do que o front envie.
  O front confia visualmente nisso (`RequireOwner.tsx`), mas a validação que
  importa é sempre no servidor.

## Status possíveis de um anúncio

| `_id` | `label` | `order` |
|---|---|---|
| `s1` | Disponível | 1 |
| `s2` | Reservado | 2 |
| `s3` | Trocado | 3 |

## Em aberto (decisões pendentes com o time de back-end)

- [ ] Quem pode mudar o status para "Reservado"/"Trocado" — só o autor, ou
      também o interessado confirma de algum lado?
- [ ] Existe necessidade de um endpoint de contato/mensagem entre interessado
      e autor, ou isso fica fora do MVP (contato combinado por fora)?
- [ ] Ver seção "Upload de imagem" acima — decidir entre multipart,
      presigned URL, ou manter base64 (não recomendado pra produção).
