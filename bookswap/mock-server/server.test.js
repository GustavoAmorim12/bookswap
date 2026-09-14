import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4055; // porta dedicada a testes, não conflita com o dev (4000)
const BASE_URL = `http://localhost:${PORT}`;

let serverProcess;

function waitForServer(url, attempts = 30) {
  return new Promise((resolve, reject) => {
    const tryOnce = (remaining) => {
      fetch(url)
        .then(() => resolve())
        .catch((err) => {
          if (remaining <= 0) return reject(err);
          setTimeout(() => tryOnce(remaining - 1), 100);
        });
    };
    tryOnce(attempts);
  });
}

before(async () => {
  serverProcess = spawn("node", ["server.js"], {
    cwd: __dirname,
    env: { ...process.env, PORT: String(PORT) },
    stdio: "pipe",
  });
  await waitForServer(`${BASE_URL}/catalog/disciplines`);
});

after(() => {
  serverProcess.kill();
});

async function login(email = "ana@fiap.com.br", password = "123456") {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  return body.data.token;
}

// ---------- Auth ----------

test("POST /auth/login com credenciais válidas retorna 200 e token", async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ana@fiap.com.br", password: "123456" }),
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.match(body.data.token, /^mock-token-/);
  assert.equal(body.data.user.email, "ana@fiap.com.br");
});

test("POST /auth/login com senha errada retorna 401", async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ana@fiap.com.br", password: "errada" }),
  });
  const body = await res.json();

  assert.equal(res.status, 401);
  assert.equal(body.error.code, "INVALID_CREDENTIALS");
});

// ---------- Catálogo ----------

test("GET /catalog/disciplines retorna a lista de disciplinas", async () => {
  const res = await fetch(`${BASE_URL}/catalog/disciplines`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.length > 0);
  assert.ok(body.data.every((d) => typeof d.label === "string"));
});

// ---------- Listagem pública ----------

test("GET /listings só retorna anúncios com status Disponível", async () => {
  const res = await fetch(`${BASE_URL}/listings`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.ok(body.data.every((l) => l.status.label === "Disponível"));
});

test("GET /listings busca ignora acentuação", async () => {
  const comAcento = await fetch(`${BASE_URL}/listings?q=c%C3%A1lculo`).then((r) => r.json());
  const semAcento = await fetch(`${BASE_URL}/listings?q=calculo`).then((r) => r.json());

  assert.equal(comAcento.meta.total, semAcento.meta.total);
  assert.ok(semAcento.meta.total >= 1);
});

test("GET /listings filtra por disciplina", async () => {
  const disciplinas = await fetch(`${BASE_URL}/catalog/disciplines`).then((r) => r.json());
  const alvo = disciplinas.data[0];

  const res = await fetch(`${BASE_URL}/listings?disciplineId=${alvo._id}`);
  const body = await res.json();

  assert.ok(body.data.every((l) => l.discipline._id === alvo._id));
});

test("GET /listings pagina corretamente", async () => {
  const res = await fetch(`${BASE_URL}/listings?pageSize=1&page=1`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.data.length, 1);
  assert.equal(body.meta.page, 1);
  assert.equal(body.meta.pageSize, 1);
});

test("GET /listings/:id inexistente retorna 404", async () => {
  const res = await fetch(`${BASE_URL}/listings/nao-existe`);
  const body = await res.json();

  assert.equal(res.status, 404);
  assert.equal(body.error.code, "NOT_FOUND");
});

// ---------- Escrita e autorização ----------

test("POST /listings sem token retorna 401", async () => {
  const res = await fetch(`${BASE_URL}/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 401);
});

test("POST /listings com campos faltando retorna 400", async () => {
  const token = await login();
  const res = await fetch(`${BASE_URL}/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: "só título" }),
  });
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.error.code, "INVALID_PAYLOAD");
});

test("POST /listings tipo venda sem preço retorna 400", async () => {
  const token = await login();
  const res = await fetch(`${BASE_URL}/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: "x",
      description: "y",
      type: "venda",
      discipline: { _id: "d1" },
    }),
  });
  assert.equal(res.status, 400);
});

test("fluxo completo: criar, editar (dono) e excluir (dono) um anúncio", async () => {
  const token = await login("bruno@fiap.com.br");

  const created = await fetch(`${BASE_URL}/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title: "Anúncio de teste",
      description: "Descrição de teste",
      type: "troca",
      discipline: { _id: "d1" },
    }),
  }).then((r) => r.json());

  assert.ok(created.data._id);
  assert.equal(created.data.status.label, "Disponível");

  const updated = await fetch(`${BASE_URL}/listings/${created.data._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: "Título atualizado" }),
  }).then((r) => r.json());

  assert.equal(updated.data.title, "Título atualizado");

  const deleteRes = await fetch(`${BASE_URL}/listings/${created.data._id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(deleteRes.status, 204);

  const afterDelete = await fetch(`${BASE_URL}/listings/${created.data._id}`);
  assert.equal(afterDelete.status, 404);
});

test("PUT /listings/:id de outro usuário retorna 403", async () => {
  const anaToken = await login("ana@fiap.com.br");
  const brunoToken = await login("bruno@fiap.com.br");

  const created = await fetch(`${BASE_URL}/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${anaToken}` },
    body: JSON.stringify({
      title: "Anúncio da Ana",
      description: "desc",
      type: "doacao",
      discipline: { _id: "d1" },
    }),
  }).then((r) => r.json());

  const attempt = await fetch(`${BASE_URL}/listings/${created.data._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${brunoToken}` },
    body: JSON.stringify({ title: "hack" }),
  });

  assert.equal(attempt.status, 403);
});

test("DELETE /listings/:id de outro usuário retorna 403", async () => {
  const anaToken = await login("ana@fiap.com.br");
  const brunoToken = await login("bruno@fiap.com.br");

  const created = await fetch(`${BASE_URL}/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${anaToken}` },
    body: JSON.stringify({
      title: "Outro anúncio da Ana",
      description: "desc",
      type: "doacao",
      discipline: { _id: "d1" },
    }),
  }).then((r) => r.json());

  const attempt = await fetch(`${BASE_URL}/listings/${created.data._id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${brunoToken}` },
  });

  assert.equal(attempt.status, 403);
});

test("GET /listings/mine retorna só os anúncios do usuário autenticado", async () => {
  const anaToken = await login("ana@fiap.com.br");
  const res = await fetch(`${BASE_URL}/listings/mine`, {
    headers: { Authorization: `Bearer ${anaToken}` },
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.ok(body.data.every((l) => l.author.email === "ana@fiap.com.br"));
});

// ---------- Upload ----------

const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

test("POST /uploads sem token retorna 401", async () => {
  const res = await fetch(`${BASE_URL}/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 401);
});

test("POST /uploads com tipo não suportado retorna 400", async () => {
  const token = await login();
  const res = await fetch(`${BASE_URL}/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      filename: "arquivo.txt",
      contentType: "text/plain",
      dataBase64: TINY_PNG_BASE64,
    }),
  });
  assert.equal(res.status, 400);
});

test("POST /uploads salva o arquivo e GET /uploads/:file serve de volta", async () => {
  const token = await login();
  const uploadRes = await fetch(`${BASE_URL}/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      filename: "foto.png",
      contentType: "image/png",
      dataBase64: TINY_PNG_BASE64,
    }),
  });
  const uploadBody = await uploadRes.json();

  assert.equal(uploadRes.status, 201);
  assert.match(uploadBody.data.url, /\/uploads\/.+\.png$/);

  const fileRes = await fetch(uploadBody.data.url);
  assert.equal(fileRes.status, 200);
  assert.equal(fileRes.headers.get("content-type"), "image/png");
});

// ---------- Favoritos ----------

test("GET /favorites sem token retorna 401", async () => {
  const res = await fetch(`${BASE_URL}/favorites`);
  assert.equal(res.status, 401);
});

test("GET /favorites começa vazio para um usuário novo na sessão de teste", async () => {
  const token = await login("bruno@fiap.com.br");
  const res = await fetch(`${BASE_URL}/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body.data));
});

test("POST /favorites/:id adiciona e GET /favorites reflete a mudança", async () => {
  const token = await login("ana@fiap.com.br");

  const addRes = await fetch(`${BASE_URL}/favorites/l1`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(addRes.status, 201);

  const listRes = await fetch(`${BASE_URL}/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listBody = await listRes.json();

  assert.ok(listBody.data.some((l) => l._id === "l1"));
});

test("DELETE /favorites/:id remove o anúncio dos favoritos", async () => {
  const token = await login("ana@fiap.com.br");

  await fetch(`${BASE_URL}/favorites/l1`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const delRes = await fetch(`${BASE_URL}/favorites/l1`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(delRes.status, 204);

  const listRes = await fetch(`${BASE_URL}/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listBody = await listRes.json();

  assert.ok(!listBody.data.some((l) => l._id === "l1"));
});

test("favoritos são isolados por usuário", async () => {
  const anaToken = await login("ana@fiap.com.br");
  const brunoToken = await login("bruno@fiap.com.br");

  await fetch(`${BASE_URL}/favorites/l1`, {
    method: "POST",
    headers: { Authorization: `Bearer ${anaToken}` },
  });

  const brunoFavorites = await fetch(`${BASE_URL}/favorites`, {
    headers: { Authorization: `Bearer ${brunoToken}` },
  }).then((r) => r.json());

  assert.ok(!brunoFavorites.data.some((l) => l._id === "l1"));
});

test("POST /favorites/:id em anúncio inexistente retorna 404", async () => {
  const token = await login();
  const res = await fetch(`${BASE_URL}/favorites/nao-existe`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(res.status, 404);
});
