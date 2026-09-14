# BookSwap

Scaffold inicial do front-end do BookSwap — marketplace de troca/venda/doação
de livros e materiais didáticos entre alunos.

Estrutura adaptada do EduBlog: React 19 + TypeScript + Vite + Tailwind +
Context API + Axios.

> 📄 Este README é o guia rápido de desenvolvimento (rodar, testar, Docker,
> CI). Para a documentação completa de entrega — arquitetura do sistema,
> guia de uso da aplicação e relato de experiências da equipe — veja
> **[`DOCUMENTACAO.md`](./DOCUMENTACAO.md)**.

## O que já está pronto

- `interfaces/IListing.ts` — modelo de dados do anúncio.
- `services/listingService.ts` — chamadas REST (get/create/update/delete).
- `routes/RequireOwner.tsx` — guarda de rota por posse do recurso (substitui
  o `RequireRole` do EduBlog, que era por papel fixo).
- `pages/Home.tsx`, `ListingView.tsx`, `ListingCreate.tsx`, `ListingEdit.tsx`,
  `MyListings.tsx` — páginas principais, com formulário compartilhado em
  `components/listing/ListingForm.tsx`.
- `components/layout/Header.tsx` — busca adaptada para anúncios/disciplinas.

Reaproveitados do EduBlog sem alteração: `AuthContext`, `ToastContext`,
`RequireAuth`, `api.ts` (interceptor JWT), `catalogService.ts`, `Footer`,
`UserMenu`, `Layout`.

## Próximos passos

- [x] ~~Definir com o back-end o contrato de `/listings`~~ — feito, ver
      `API-CONTRACT.md`.
- [x] ~~Upload de imagem do material~~ — feito. `POST /uploads` no mock
      server + `uploadService.ts` no front. Decisão de arquitetura pro
      back-end real documentada em `API-CONTRACT.md`.
- [x] ~~Filtros na Home~~ — feito. Busca, disciplina, tipo e faixa de preço,
      com paginação (`ListingFilters.tsx`).
- [x] ~~Docker + CI~~ — feito, ver seções abaixo.
- [x] ~~Testes automatizados~~ — feito. Front (Vitest) + mock server
      (`node:test`), rodando no CI.
- [x] ~~Páginas `/perfil` e `/favoritos`~~ — feito. Favoritos é uma feature
      completa (endpoints no mock server + `favoritesService.ts` + botão de
      coração na página do anúncio), não só uma tela vazia.
- [x] ~~Páginas institucionais do Footer~~ — feito (`/sobre`,
      `/como-funciona`, `/termos`, `/privacidade`). Aproveitei e limpei o
      `Footer.tsx`, que tinha um link "Metodologia" (não fazia sentido no
      domínio) e uma seção "Contato" com texto fake (Email/Telefone/
      Endereço sem link nenhum) herdados do EduBlog.
- [x] ~~Tratamento de erro de rede~~ — `Home`, `ListingView` e `MyListings`
      antes falhavam silenciosamente se a API caísse (ficavam com estado
      vazio, sem avisar o usuário). Agora mostram mensagem + "Tentar
      novamente". Adicionado também um `ErrorBoundary` global.
- [x] ~~Responsividade~~ — grids de 2 colunas do `ListingForm` e a linha de
      `MyListings` agora empilham em telas pequenas. Não substitui um teste
      manual em dispositivo real antes da entrega.
- [ ] Decidir se a listagem pública exige login ou fica aberta — as páginas
      institucionais (`/sobre`, `/termos`, etc.) ficaram atrás do login
      junto com o resto por consistência, mas o ideal seria elas serem
      públicas; isso exige o `Header`/`UserMenu` suportarem estado
      deslogado, que hoje não suportam.
- [ ] Avaliar comentários/perguntas no anúncio (opcional, conforme o
      enunciado do Tech Challenge).
- [ ] Gerar e commitar `package-lock.json` (rodando `npm install` local) e
      trocar `npm install` por `npm ci` no `Dockerfile` e no CI.

## Rodando localmente

```bash
cp .env.example .env
npm install
npm run dev
```

Em outro terminal, suba o mock server (veja `mock-server/README.md`):

```bash
cd mock-server && node server.js
```

## Rodando com Docker

Sobe o front-end (Nginx servindo o build de produção) e o mock server juntos:

```bash
docker compose up --build
```

- Front-end: http://localhost:8080
- Mock server: http://localhost:4000

Pra rodar só uma das imagens manualmente:

```bash
# front-end
docker build -t bookswap-web --build-arg VITE_API_URL=http://localhost:4000 .
docker run -p 8080:80 bookswap-web

# mock server
docker build -t bookswap-mock-server ./mock-server
docker run -p 4000:4000 bookswap-mock-server
```

> Quando o back-end real existir, é só trocar `VITE_API_URL` (no `--build-arg`
> ou no `docker-compose.yml`) e remover o serviço `mock-server` do compose.

## Testes

Front-end (Vitest + React Testing Library):

```bash
npm run test        # roda uma vez
npm run test:watch  # modo watch
```

Cobrem: `utils/discipline` (normalização de texto), `uploadService`
(validação de arquivo), `useDebouncedValue`, `ListingFilters`, a página
`Home` (com o `listingService` mockado) e o `AuthContext` (login, logout,
persistência de sessão).

Mock server (`node:test`, zero dependências):

```bash
cd mock-server
node --test
```

24 testes cobrindo auth, listagem/busca/filtros/paginação, CRUD de anúncios
com checagem de autorização por dono do recurso, upload de imagem e
favoritos.

## CI/CD

`.github/workflows/ci.yml` roda a cada push/PR na `main`:

1. **frontend** — lint (`eslint`), type-check (`tsc --noEmit`), testes
   (`vitest`) e build (`vite build`).
2. **mock-server** — roda a suíte de testes real (`node --test`) contra o
   servidor.
3. **docker-build** — builda as duas imagens Docker (só roda se os dois
   jobs acima passarem), garantindo que os `Dockerfile`s não quebraram.
