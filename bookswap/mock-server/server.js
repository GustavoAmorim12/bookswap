import { createServer } from "node:http";
import crypto from "node:crypto";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { disciplines, listings as seedListings, statuses, users } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "uploads");
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

if (!existsSync(UPLOADS_DIR)) {
  await mkdir(UPLOADS_DIR, { recursive: true });
}

const PORT = process.env.PORT || 4000;

// Estado em memória (reseta a cada restart do servidor)
const db = {
  listings: structuredClone(seedListings),
  // Map<userId, Set<listingId>>
  favorites: new Map(),
};

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(body === undefined ? undefined : JSON.stringify(body));
}

function sendError(res, status, code, message) {
  sendJson(res, status, { error: { code, message } });
}

function getUserFromRequest(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.replace("Bearer ", "");
  const match = token.match(/^mock-token-(.+)$/);
  if (!match) return null;
  return users.find((u) => u.id === match[1]) ?? null;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("INVALID_JSON"));
      }
    });
    req.on("error", reject);
  });
}

// ---------- Handlers ----------

function handleLogin(body, res) {
  const { email, password } = body ?? {};
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return sendError(res, 401, "INVALID_CREDENTIALS", "E-mail ou senha inválidos.");
  }

  sendJson(res, 200, {
    data: {
      token: `mock-token-${user.id}`,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
  });
}

function handleGetDisciplines(res) {
  sendJson(res, 200, { data: disciplines });
}

function handleGetMyListings(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return sendError(res, 401, "UNAUTHORIZED", "Token ausente ou inválido.");

  const mine = db.listings.filter((l) => l.author._id === user.id);
  sendJson(res, 200, { data: mine });
}

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function handleGetListings(query, res) {
  const { q, disciplineId, type, minPrice, maxPrice, page = "1", pageSize = "12" } = query;

  let results = db.listings.filter((l) => l.status._id === statuses.disponivel._id);

  if (q) {
    const normalizedQuery = normalizeText(q);
    results = results.filter(
      (l) =>
        normalizeText(l.title).includes(normalizedQuery) ||
        normalizeText(l.description).includes(normalizedQuery)
    );
  }
  if (disciplineId) results = results.filter((l) => l.discipline._id === disciplineId);
  if (type) results = results.filter((l) => l.type === type);
  if (minPrice) results = results.filter((l) => (l.price ?? 0) >= Number(minPrice));
  if (maxPrice) results = results.filter((l) => (l.price ?? 0) <= Number(maxPrice));

  const total = results.length;
  const pageNum = Number(page);
  const pageSizeNum = Number(pageSize);
  const start = (pageNum - 1) * pageSizeNum;
  const paginated = results.slice(start, start + pageSizeNum);

  sendJson(res, 200, {
    data: paginated,
    meta: { page: pageNum, pageSize: pageSizeNum, total },
  });
}

function handleGetListingById(id, res) {
  const listing = db.listings.find((l) => l._id === id);
  if (!listing) return sendError(res, 404, "NOT_FOUND", "Anúncio não encontrado.");
  sendJson(res, 200, { data: listing });
}

function handleCreateListing(req, body, res) {
  const user = getUserFromRequest(req);
  if (!user) return sendError(res, 401, "UNAUTHORIZED", "Token ausente ou inválido.");

  if (!body.title || !body.description || !body.discipline?._id || !body.type) {
    return sendError(res, 400, "INVALID_PAYLOAD", "Campos obrigatórios ausentes.");
  }
  if (body.type === "venda" && !body.price) {
    return sendError(res, 400, "INVALID_PAYLOAD", "Preço é obrigatório para anúncios de venda.");
  }

  const discipline = disciplines.find((d) => d._id === body.discipline._id);
  if (!discipline) return sendError(res, 400, "INVALID_PAYLOAD", "Disciplina inválida.");

  const now = new Date().toISOString();
  const newListing = {
    _id: crypto.randomUUID(),
    title: body.title,
    description: body.description,
    condition: body.condition ?? "usado",
    type: body.type,
    price: body.type === "venda" ? Number(body.price) : undefined,
    imageUrl: body.imageUrl ?? "",
    discipline: { _id: discipline._id, label: discipline.label, order: discipline.order },
    author: {
      _id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
    },
    status: statuses.disponivel,
    createDate: now,
    updateDate: now,
  };

  db.listings.push(newListing);
  sendJson(res, 201, { data: newListing });
}

function handleUpdateListing(req, id, body, res) {
  const user = getUserFromRequest(req);
  if (!user) return sendError(res, 401, "UNAUTHORIZED", "Token ausente ou inválido.");

  const listing = db.listings.find((l) => l._id === id);
  if (!listing) return sendError(res, 404, "NOT_FOUND", "Anúncio não encontrado.");
  if (listing.author._id !== user.id) {
    return sendError(res, 403, "FORBIDDEN", "Você não é o autor deste anúncio.");
  }

  const discipline = body.discipline?._id
    ? disciplines.find((d) => d._id === body.discipline._id)
    : null;

  Object.assign(listing, {
    title: body.title ?? listing.title,
    description: body.description ?? listing.description,
    condition: body.condition ?? listing.condition,
    type: body.type ?? listing.type,
    price:
      (body.type ?? listing.type) === "venda"
        ? Number(body.price ?? listing.price)
        : undefined,
    imageUrl: body.imageUrl ?? listing.imageUrl,
    discipline: discipline
      ? { _id: discipline._id, label: discipline.label, order: discipline.order }
      : listing.discipline,
    status: body.status?._id
      ? Object.values(statuses).find((s) => s._id === body.status._id) ?? listing.status
      : listing.status,
    updateDate: new Date().toISOString(),
  });

  sendJson(res, 200, { data: listing });
}

function handleDeleteListing(req, id, res) {
  const user = getUserFromRequest(req);
  if (!user) return sendError(res, 401, "UNAUTHORIZED", "Token ausente ou inválido.");

  const index = db.listings.findIndex((l) => l._id === id);
  if (index === -1) return sendError(res, 404, "NOT_FOUND", "Anúncio não encontrado.");
  if (db.listings[index].author._id !== user.id) {
    return sendError(res, 403, "FORBIDDEN", "Você não é o autor deste anúncio.");
  }

  db.listings.splice(index, 1);
  sendJson(res, 204, undefined);
}

function handleGetFavorites(req, res) {
  const user = getUserFromRequest(req);
  if (!user) return sendError(res, 401, "UNAUTHORIZED", "Token ausente ou inválido.");

  const favoriteIds = db.favorites.get(user.id) ?? new Set();
  const favoritedListings = db.listings.filter((l) => favoriteIds.has(l._id));
  sendJson(res, 200, { data: favoritedListings });
}

function handleAddFavorite(req, listingId, res) {
  const user = getUserFromRequest(req);
  if (!user) return sendError(res, 401, "UNAUTHORIZED", "Token ausente ou inválido.");

  const listing = db.listings.find((l) => l._id === listingId);
  if (!listing) return sendError(res, 404, "NOT_FOUND", "Anúncio não encontrado.");

  if (!db.favorites.has(user.id)) db.favorites.set(user.id, new Set());
  db.favorites.get(user.id).add(listingId);

  sendJson(res, 201, { data: { favorited: true } });
}

function handleRemoveFavorite(req, listingId, res) {
  const user = getUserFromRequest(req);
  if (!user) return sendError(res, 401, "UNAUTHORIZED", "Token ausente ou inválido.");

  db.favorites.get(user.id)?.delete(listingId);
  sendJson(res, 204, undefined);
}

async function handleUploadImage(req, body, res) {
  const user = getUserFromRequest(req);
  if (!user) return sendError(res, 401, "UNAUTHORIZED", "Token ausente ou inválido.");

  const { filename, contentType, dataBase64 } = body ?? {};

  if (!filename || !contentType || !dataBase64) {
    return sendError(
      res,
      400,
      "INVALID_PAYLOAD",
      "Campos obrigatórios: filename, contentType, dataBase64."
    );
  }
  if (!ALLOWED_MIME.has(contentType)) {
    return sendError(
      res,
      400,
      "UNSUPPORTED_MEDIA_TYPE",
      "Tipo de arquivo não suportado. Use JPEG, PNG, WEBP ou GIF."
    );
  }

  const buffer = Buffer.from(dataBase64, "base64");
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    return sendError(res, 400, "FILE_TOO_LARGE", "Arquivo maior que o limite de 5MB.");
  }

  const ext = path.extname(filename) || `.${contentType.split("/")[1]}`;
  const storedName = `${crypto.randomUUID()}${ext}`;
  await writeFile(path.join(UPLOADS_DIR, storedName), buffer);

  sendJson(res, 201, {
    data: { url: `http://localhost:${PORT}/uploads/${storedName}` },
  });
}

async function handleServeUpload(fileName, res) {
  const safeName = path.basename(fileName); // evita path traversal
  const filePath = path.join(UPLOADS_DIR, safeName);

  if (!existsSync(filePath)) {
    return sendError(res, 404, "NOT_FOUND", "Arquivo não encontrado.");
  }

  const ext = path.extname(safeName).toLowerCase();
  const mimeByExt = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };

  const buffer = await readFile(filePath);
  res.writeHead(200, { "Content-Type": mimeByExt[ext] ?? "application/octet-stream" });
  res.end(buffer);
}

// ---------- Router ----------

const server = createServer(async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const query = Object.fromEntries(url.searchParams.entries());

  try {
    if (req.method === "POST" && path === "/auth/login") {
      return handleLogin(await readBody(req), res);
    }

    if (req.method === "GET" && path === "/catalog/disciplines") {
      return handleGetDisciplines(res);
    }

    if (req.method === "GET" && path === "/listings/mine") {
      return handleGetMyListings(req, res);
    }

    if (req.method === "GET" && path === "/listings") {
      return handleGetListings(query, res);
    }

    const listingIdMatch = path.match(/^\/listings\/([^/]+)$/);
    if (listingIdMatch) {
      const id = listingIdMatch[1];
      if (req.method === "GET") return handleGetListingById(id, res);
      if (req.method === "PUT") return handleUpdateListing(req, id, await readBody(req), res);
      if (req.method === "DELETE") return handleDeleteListing(req, id, res);
    }

    if (req.method === "POST" && path === "/listings") {
      return handleCreateListing(req, await readBody(req), res);
    }

    if (req.method === "GET" && path === "/favorites") {
      return handleGetFavorites(req, res);
    }

    const favoriteMatch = path.match(/^\/favorites\/([^/]+)$/);
    if (favoriteMatch) {
      const listingId = favoriteMatch[1];
      if (req.method === "POST") return handleAddFavorite(req, listingId, res);
      if (req.method === "DELETE") return handleRemoveFavorite(req, listingId, res);
    }

    if (req.method === "POST" && path === "/uploads") {
      return handleUploadImage(req, await readBody(req), res);
    }

    const uploadMatch = path.match(/^\/uploads\/([^/]+)$/);
    if (req.method === "GET" && uploadMatch) {
      return handleServeUpload(uploadMatch[1], res);
    }

    sendError(res, 404, "ROUTE_NOT_FOUND", `Rota não encontrada: ${req.method} ${path}`);
  } catch (err) {
    if (err.message === "INVALID_JSON") {
      return sendError(res, 400, "INVALID_JSON", "Corpo da requisição não é um JSON válido.");
    }
    console.error(err);
    sendError(res, 500, "INTERNAL_ERROR", "Erro interno do mock server.");
  }
});

server.listen(PORT, () => {
  console.log(`BookSwap mock server rodando em http://localhost:${PORT}`);
  console.log(`Usuários de teste: ana@fiap.com.br / bruno@fiap.com.br (senha: 123456)`);
});
