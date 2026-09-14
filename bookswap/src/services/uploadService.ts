import api from "./api";

export interface UploadImageResponse {
  data: { url: string };
}

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB, deve bater com o limite do back-end
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // remove o prefixo "data:image/png;base64," antes de enviar
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME.has(file.type)) {
    return "Formato não suportado. Use JPEG, PNG, WEBP ou GIF.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "Arquivo maior que 5MB.";
  }
  return null;
}

/**
 * Envia a imagem como base64 dentro de um JSON.
 *
 * Isso é uma decisão de implementação do MOCK server (evita lidar com
 * multipart/form-data sem dependências). O back-end real deve expor o mesmo
 * contrato de resposta (`{ data: { url } }`), mas pode receber o arquivo
 * como preferir (multipart, ou até um fluxo de presigned URL direto pro
 * S3/Cloudinary) — ver API-CONTRACT.md, seção "Upload de imagem".
 */
export async function uploadImageRequest(file: File) {
  const dataBase64 = await fileToBase64(file);

  const response = await api.post<UploadImageResponse>("/uploads", {
    filename: file.name,
    contentType: file.type,
    dataBase64,
  });

  return response.data.data.url;
}
