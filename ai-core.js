

const OLLAMA_URL   = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'llama3';

/**
 * Send a prompt to local Ollama and return the raw response string.
 * @param {string} prompt
 * @param {Object} options  — merged into the nested `options` object (temperature, num_predict, …)
 */
async function callOllama(prompt, options = {}) {
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:   OLLAMA_MODEL,
      prompt,
      stream:  false,
      format:  'json',
      options: { temperature: 0.8, num_predict: 800, ...options }
    })
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  return data.response;
}

/**
 * Try to extract and parse JSON from an LLM response string.
 * Handles direct JSON, markdown code blocks, and bare {...} substrings.
 */
function parseJSON(text) {
  // 1. Direct parse
  try { return JSON.parse(text); } catch {}

  // 2. Markdown code block ```json ... ``` or ``` ... ```
  const md = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (md) { try { return JSON.parse(md[1].trim()); } catch {} }

  // 3. First balanced { ... } in the string
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch {}
  }

  throw new Error('parseJSON: could not extract JSON from response — ' + text.substring(0, 120));
}

/**
 * Render an error banner with Ollama startup instructions into `container`.
 * @param {HTMLElement} container
 */
function showOllamaError(container) {
  container.innerHTML = `
    <div style="display:flex;gap:14px;align-items:flex-start;padding:16px 20px;
                background:rgba(231,76,60,0.1);border:1px solid #e74c3c;
                border-radius:12px;margin-bottom:16px">
      <span style="font-size:1.5rem;flex-shrink:0">⚠️</span>
      <div>
        <div style="font-weight:700;margin-bottom:6px;color:#e74c3c">
          AI недоступен — показан резервный сценарий
        </div>
        <div style="font-size:.88rem;line-height:1.7">
          Для AI-генерации запусти в терминале:<br>
          <code style="background:rgba(0,0,0,0.15);padding:4px 10px;border-radius:6px;
                       font-size:.82rem;display:inline-block;margin-top:6px;
                       font-family:monospace">
            OLLAMA_ORIGINS="*" ollama serve
          </code>
        </div>
      </div>
    </div>`;
  container.style.display = 'block';
}

window.AICore = { callOllama, parseJSON, showOllamaError };
