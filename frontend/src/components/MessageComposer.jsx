import { useEffect, useRef, useState } from "react";

// Mesmo limite validado no backend (ver backend/services/attachments.js) -
// checar aqui tambem evita que o usuario espere so pra descobrir na resposta
// do servidor que o arquivo e grande demais.
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_ATTACHMENTS = 5;

// Icones de linha fina no mesmo estilo do AgentIcon.jsx (viewBox 0 0 24 24,
// stroke=currentColor, traco fino e sofisticado) usados nos controles de
// anexo/gravacao da caixa de mensagem, no lugar dos emojis anteriores.
export function AttachIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.1 11.1 L11.4 19.8 a4.7 4.7 0 0 1-6.6-6.6 l8.6-8.6 a3.2 3.2 0 0 1 4.5 4.5 l-8.4 8.4 a1.7 1.7 0 0 1-2.4-2.4 l7.7-7.7" />
    </svg>
  );
}

export function MicIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9.4" y="3.3" width="5.2" height="9.4" rx="2.6" />
      <path d="M6.2 11.2 v1.2 a5.8 5.8 0 0 0 11.6 0 v-1.2" />
      <line x1="12" y1="17.9" x2="12" y2="21" />
      <line x1="9" y1="21" x2="15" y2="21" />
    </svg>
  );
}

function StopIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8.4" />
      <rect x="9.3" y="9.3" width="5.4" height="5.4" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function formatSize(bytes) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  return kb < 1024 ? `${Math.round(kb)}KB` : `${(kb / 1024).toFixed(1)}MB`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Campo de envio de mensagem reutilizavel: texto + anexo de arquivo + audio
// gravado direto no navegador. Usado tanto no chat do usuario final
// (ChatWindow) quanto na caixa de resposta do consultor humano no Painel
// Admin (UsersPanel/ConsultReplyBox), mantendo a mesma experiencia nos dois
// lugares. O texto continua opcional/obrigatorio como antes - a novidade e
// que agora uma mensagem tambem pode ser so um anexo, sem texto nenhum.
export default function MessageComposer({
  onSend,
  disabled = false,
  sending = false,
  placeholder = "Escreva sua mensagem...",
  sendLabel = "Enviar",
  rows = 1,
  compact = false,
}) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [attachError, setAttachError] = useState("");
  const [recording, setRecording] = useState(false);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function handleFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // permite selecionar o mesmo arquivo de novo depois

    if (files.length === 0) return;
    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      setAttachError(`Envie no máximo ${MAX_ATTACHMENTS} anexos por mensagem.`);
      return;
    }

    setAttachError("");
    for (const file of files) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        setAttachError(`"${file.name}" excede o limite de 8MB por anexo.`);
        continue;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setAttachments((prev) => [
          ...prev,
          {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            type: "file",
            name: file.name,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            dataUrl,
          },
        ]);
      } catch {
        setAttachError(`Não foi possível ler "${file.name}".`);
      }
    }
  }

  function removeAttachment(id) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  async function startRecording() {
    setAttachError("");
    if (attachments.length >= MAX_ATTACHMENTS) {
      setAttachError(`Envie no máximo ${MAX_ATTACHMENTS} anexos por mensagem.`);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setAttachError("Gravação de áudio não é suportada neste navegador.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (blob.size === 0) return;
        if (blob.size > MAX_ATTACHMENT_BYTES) {
          setAttachError("O áudio gravado excede o limite de 8MB.");
          return;
        }

        try {
          const dataUrl = await readBlobAsDataUrl(blob);
          setAttachments((prev) => [
            ...prev,
            {
              id: `att-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              type: "audio",
              name: `audio-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.webm`,
              mimeType: blob.type || "audio/webm",
              size: blob.size,
              dataUrl,
            },
          ]);
        } catch {
          setAttachError("Não foi possível processar o áudio gravado.");
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setAttachError("Não foi possível acessar o microfone.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function toggleRecording() {
    if (recording) stopRecording();
    else startRecording();
  }

  function handleSubmit(e) {
    e?.preventDefault?.();
    if (disabled || sending || recording) return;
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;
    onSend({ text: trimmed, attachments });
    setText("");
    setAttachments([]);
    setAttachError("");
  }

  const canSend = !disabled && !sending && !recording && (text.trim() || attachments.length > 0);

  return (
    <div>
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {attachments.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-1.5 hairline rounded-lg bg-cream/70 px-2 py-1 text-[11px] text-ink-muted"
            >
              {a.type === "audio" ? <MicIcon className="w-3 h-3" /> : <AttachIcon className="w-3 h-3" />}
              <span className="max-w-[140px] truncate">{a.name}</span>
              <span className="text-ink-muted/60">{formatSize(a.size)}</span>
              <button
                type="button"
                onClick={() => removeAttachment(a.id)}
                className="text-ink-muted hover:text-red-700 leading-none ml-0.5"
                aria-label="Remover anexo"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {attachError && <p className="text-[11px] text-red-700 mb-1.5">{attachError}</p>}

      <div
        className={
          compact
            ? "flex items-end gap-2"
            : "flex items-end gap-2 bg-surface hairline rounded-xl2 px-3 py-2"
        }
      >
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesSelected} />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || sending}
          title="Anexar arquivo"
          className="shrink-0 text-ink-muted hover:text-ink disabled:opacity-30 transition px-1 py-1.5 leading-none"
        >
          <AttachIcon />
        </button>

        <button
          type="button"
          onClick={toggleRecording}
          disabled={disabled || sending}
          title={recording ? "Parar gravação" : "Gravar áudio"}
          className={`shrink-0 px-1 py-1.5 leading-none transition disabled:opacity-30 ${
            recording ? "text-red-600" : "text-ink-muted hover:text-ink"
          }`}
        >
          {recording ? <StopIcon /> : <MicIcon />}
        </button>

        <textarea
          rows={rows}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={recording ? "Gravando áudio..." : placeholder}
          disabled={disabled}
          className={
            compact
              ? "input flex-1 resize-none text-xs disabled:opacity-50"
              : "flex-1 resize-none bg-transparent outline-none text-sm text-ink placeholder:text-ink-muted/70 max-h-32 py-1.5 disabled:opacity-50"
          }
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          className={
            compact
              ? "shrink-0 bg-accent-dark text-cream text-xs font-medium px-3 py-2 rounded-lg disabled:opacity-30 transition"
              : "shrink-0 bg-ink text-cream text-xs font-medium px-4 py-2 rounded-lg disabled:opacity-30 transition"
          }
        >
          {sending ? "Enviando..." : sendLabel}
        </button>
      </div>
    </div>
  );
}
