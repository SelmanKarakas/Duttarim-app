const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 32 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((item) => item.trim());
  const isAllowed = allowed.some((item) => origin === item || origin.startsWith(`${item}:`));
  return isAllowed
    ? {
        "access-control-allow-origin": origin,
        "access-control-allow-headers": "authorization, content-type",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        vary: "Origin",
      }
    : {};
}

async function secretsEqual(left, right) {
  const encoder = new TextEncoder();
  const [a, b] = [encoder.encode(left || ""), encoder.encode(right || "")];
  if (a.byteLength !== b.byteLength) return false;
  return crypto.subtle.timingSafeEqual(a, b);
}

async function authorised(request, env) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return secretsEqual(token, env.ADMIN_TOKEN);
}

function safeId(value) {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function validateCatalog(catalog) {
  if (!Array.isArray(catalog) || catalog.length > 500) throw new Error("Geçersiz nota listesi");
  const ids = new Set();
  for (const song of catalog) {
    if (!song || !safeId(song.id) || ids.has(song.id)) throw new Error("Geçersiz veya yinelenen nota kimliği");
    if (!song.title || typeof song.title.latin !== "string" || !song.title.latin.trim()) throw new Error("Nota adı eksik");
    for (const key of ["simplePages", "notationPages"]) {
      if (!Array.isArray(song[key]) || song[key].some((path) => typeof path !== "string" || !/^songs\/[a-zA-Z0-9._-]+$/.test(path))) {
        throw new Error("Geçersiz nota sayfası yolu");
      }
    }
    ids.add(song.id);
  }
}

function decodeBase64(data) {
  const clean = data.includes(",") ? data.slice(data.indexOf(",") + 1) : data;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function validateFiles(files) {
  if (!Array.isArray(files) || files.length > 40) throw new Error("Çok fazla dosya seçildi");
  let total = 0;
  return files.map((file) => {
    if (!file || !/^songs\/[a-zA-Z0-9._-]+$/.test(file.path) || !ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error("Geçersiz resim dosyası");
    const bytes = decodeBase64(file.base64 || "");
    if (!bytes.byteLength || bytes.byteLength > MAX_FILE_BYTES) throw new Error("Bir resim en fazla 8 MB olabilir");
    total += bytes.byteLength;
    if (total > MAX_TOTAL_BYTES) throw new Error("Toplam yükleme en fazla 32 MB olabilir");
    return { path: `content/${file.path}`, bytes };
  });
}

async function github(env, path, init = {}) {
  const response = await fetch(`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "x-github-api-version": "2022-11-28",
      "user-agent": "duttarim-content-api",
      ...(init.headers || {}),
    },
  });
  if (!response.ok) {
    const message = (await response.json().catch(() => ({}))).message || `GitHub ${response.status}`;
    throw new Error(message);
  }
  return response.json();
}

async function createBlob(env, content, encoding) {
  const result = await github(env, "/git/blobs", {
    method: "POST",
    body: JSON.stringify({ content, encoding }),
  });
  return result.sha;
}

async function publish(env, payload) {
  validateCatalog(payload.catalog);
  const files = validateFiles(payload.files || []);
  const branch = env.GITHUB_BRANCH || "main";
  const ref = await github(env, `/git/ref/heads/${encodeURIComponent(branch)}`);
  const parent = await github(env, `/git/commits/${ref.object.sha}`);
  const entries = [];

  for (const file of files) {
    let binary = "";
    for (let offset = 0; offset < file.bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...file.bytes.subarray(offset, offset + 0x8000));
    }
    entries.push({ path: file.path, mode: "100644", type: "blob", sha: await createBlob(env, btoa(binary), "base64") });
  }

  const catalogText = `${JSON.stringify(payload.catalog, null, 2)}\n`;
  entries.push({ path: "content/songs.json", mode: "100644", type: "blob", sha: await createBlob(env, catalogText, "utf-8") });

  const tree = await github(env, "/git/trees", {
    method: "POST",
    body: JSON.stringify({ base_tree: parent.tree.sha, tree: entries }),
  });
  const commit = await github(env, "/git/commits", {
    method: "POST",
    body: JSON.stringify({ message: payload.message || "Add score from Duttarim app", tree: tree.sha, parents: [ref.object.sha] }),
  });
  await github(env, `/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return commit.sha;
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") return json({ ok: true }, 200, cors);
    if (url.pathname !== "/publish" || request.method !== "POST") return json({ error: "Bulunamadı" }, 404, cors);
    if (!(await authorised(request, env))) return json({ error: "Yetkisiz erişim" }, 401, cors);

    try {
      const contentLength = Number(request.headers.get("content-length") || 0);
      if (contentLength > 45 * 1024 * 1024) return json({ error: "Yükleme çok büyük" }, 413, cors);
      const payload = await request.json();
      const sha = await publish(env, payload);
      console.log(JSON.stringify({ event: "catalog_published", sha, songCount: payload.catalog.length }));
      return json({ ok: true, sha }, 200, cors);
    } catch (error) {
      console.error(JSON.stringify({ event: "publish_failed", message: error.message }));
      return json({ error: error.message || "Yayın başarısız" }, 400, cors);
    }
  },
};
