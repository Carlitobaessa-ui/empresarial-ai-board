// Validacao e sanitizacao de anexos (arquivo ou audio) enviados junto com
// uma mensagem. Os anexos sao guardados como data URL (base64) direto no
// mesmo banco JSON que ja guarda o resto dos dados do app - sem
// infraestrutura de armazenamento externa. Por isso existe um limite de
// tamanho por arquivo, para nao inflar demais o banco.

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024; // 8MB por anexo
const MAX_ATTACHMENTS_PER_MESSAGE = 5;

const DATA_URL_RE = /^data:([a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=]+)$/;

// Estima o tamanho em bytes de uma string base64 sem decodificar tudo.
function base64ByteLength(b64) {
  const len = b64.length;
  let padding = 0;
  if (b64.endsWith("==")) padding = 2;
  else if (b64.endsWith("=")) padding = 1;
  return (len * 3) / 4 - padding;
}

// Recebe o array "attachments" cru do corpo da requisicao e devolve uma
// versao validada/sanitizada, pronta para ser salva na mensagem. Lanca um
// Error com mensagem amigavel se algo estiver invalido.
export function sanitizeAttachments(rawAttachments) {
  if (rawAttachments == null) return [];
  if (!Array.isArray(rawAttachments)) {
    throw new Error("Anexos invalidos.");
  }
  if (rawAttachments.length > MAX_ATTACHMENTS_PER_MESSAGE) {
    throw new Error(`Envie no maximo ${MAX_ATTACHMENTS_PER_MESSAGE} anexos por mensagem.`);
  }

  return rawAttachments.map((raw, index) => {
    const { type, name, mimeType, dataUrl } = raw || {};

    if (type !== "file" && type !== "audio") {
      throw new Error(`Anexo ${index + 1}: tipo invalido.`);
    }
    if (typeof dataUrl !== "string" || !dataUrl) {
      throw new Error(`Anexo ${index + 1}: conteudo ausente.`);
    }

    const match = DATA_URL_RE.exec(dataUrl);
    if (!match) {
      throw new Error(`Anexo ${index + 1}: formato invalido.`);
    }

    const detectedMime = match[1];
    const base64Data = match[2];
    const sizeBytes = base64ByteLength(base64Data);

    if (sizeBytes > MAX_ATTACHMENT_BYTES) {
      const mb = (MAX_ATTACHMENT_BYTES / (1024 * 1024)).toFixed(0);
      throw new Error(`Anexo "${name || detectedMime}" excede o limite de ${mb}MB.`);
    }

    return {
      id: raw.id || undefined, // preenchido pela rota com nanoid()
      type,
      name: (typeof name === "string" && name.trim()) || (type === "audio" ? "audio.webm" : "arquivo"),
      mimeType: mimeType || detectedMime,
      size: Math.round(sizeBytes),
      dataUrl,
    };
  });
}

export { MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS_PER_MESSAGE };
