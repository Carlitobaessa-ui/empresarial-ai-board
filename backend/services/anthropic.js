import Anthropic from "@anthropic-ai/sdk";

let client = null;

// Valores de placeholder que vem no .env.example - nao contam como "configurado"
const PLACEHOLDER_VALUES = new Set(["", "coloque_sua_chave_aqui"]);

function hasRealKey() {
  const key = process.env.ANTHROPIC_API_KEY || "";
  return !PLACEHOLDER_VALUES.has(key);
}

function getClient() {
  if (!hasRealKey()) return null;
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export function isConfigured() {
  return hasRealKey();
}

// Monta o "system prompt" do agente a partir do conhecimento composto no
// Painel Admin: frameworks, modelos mentais, metodos, experiencia e tom.
export function buildSystemPrompt(agent) {
  return `Voce e o agente "${agent.name}", atuando como ${agent.role} dentro de
um conselho de assessoria estrategica para empreendedores de startups e
gestores de empresas (#startups e #corps).

O seu conhecimento e a sua forma de responder foram compostos por um
especialista com 26 anos de experiencia profissional, a partir dos seguintes
elementos:

## Frameworks e metodologias de referencia
${agent.frameworks || "(nao definido ainda)"}

## Modelos mentais que voce aplica
${agent.mentalModels || "(nao definido ainda)"}

## Metodos de trabalho que voce recomenda
${agent.methods || "(nao definido ainda)"}

## Experiencia pratica do especialista que compos este agente
${agent.experience || "(nao definido ainda)"}

## Tom e estilo de resposta
${agent.tone || "Seja direto, estruturado e pratico."}

Instrucoes gerais:
- Responda sempre em portugues do Brasil.
- Seja direto, estruturado e pratico - traga recomendacoes acionaveis, nao so teoria.
- Quando fizer sentido, cite o framework ou modelo mental que esta aplicando.
- Considere o porte e o estagio do negocio do usuario (startup em validacao,
  scale-up ou empresa estabelecida) antes de recomendar algo.
- Se a pergunta for fora da sua area (${agent.role}), responda com sua
  perspectiva mas sugira consultar tambem outro agente do conselho mais
  adequado ao tema.`;
}

// Formatos de imagem que a API da Anthropic aceita como bloco "image".
const SUPPORTED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

function extractBase64(dataUrl) {
  const idx = dataUrl.indexOf("base64,");
  return idx === -1 ? dataUrl : dataUrl.slice(idx + "base64,".length);
}

// Monta o "content" de uma mensagem para a API da Anthropic. Se a mensagem
// nao tiver anexos, e so o texto (formato mais simples/compativel). Se tiver
// anexos de imagem em formato suportado, eles viram blocos "image" que o
// Claude enxerga de verdade (visao multimodal). Outros anexos (audio, pdf,
// etc.) viram uma nota textual, ja que o modelo nao consegue "ouvir" ou abrir
// esses arquivos diretamente.
function buildMessageContent(m) {
  const attachments = Array.isArray(m.attachments) ? m.attachments : [];
  if (attachments.length === 0) {
    return m.content || "";
  }

  const imageBlocks = [];
  const notes = [];
  if (m.content) notes.push(m.content);

  for (const att of attachments) {
    const isSupportedImage = att.type === "file" && SUPPORTED_IMAGE_MIME.has(att.mimeType);
    if (isSupportedImage) {
      imageBlocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: att.mimeType,
          data: extractBase64(att.dataUrl),
        },
      });
    } else {
      const kb = att.size ? ` (${Math.round(att.size / 1024)}KB)` : "";
      const kind = att.type === "audio" ? "audio" : "arquivo";
      notes.push(`[Anexo enviado pelo usuario - ${kind}: ${att.name || "sem nome"}${kb}. O conteudo deste anexo nao pode ser lido diretamente, apenas o nome/tipo.]`);
    }
  }

  const blocks = [...imageBlocks];
  if (notes.length > 0) blocks.push({ type: "text", text: notes.join("\n") });
  if (blocks.length === 0) blocks.push({ type: "text", text: "(mensagem vazia)" });
  return blocks;
}

// Chama a API da Anthropic com o historico da conversa e retorna o texto da resposta.
export async function askAgent({ agent, history }) {
  const anthropic = getClient();
  if (!anthropic) {
    throw new Error(
      "ANTHROPIC_API_KEY nao configurada no backend (.env). Configure a chave para os agentes responderem."
    );
  }

  const model = process.env.CLAUDE_MODEL || "claude-sonnet-4-5-20250929";
  const system = buildSystemPrompt(agent);

  const messages = history.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: buildMessageContent(m),
  }));

  const response = await anthropic.messages.create({
    model,
    max_tokens: 1500,
    system,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "";
}
