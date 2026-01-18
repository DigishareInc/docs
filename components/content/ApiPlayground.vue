<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { snippetz } from "@scalar/snippetz";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import php from "highlight.js/lib/languages/php";
import go from "highlight.js/lib/languages/go";

hljs.registerLanguage("json", json);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("php", php);
hljs.registerLanguage("go", go);

interface Props {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url?: string;
  description?: string;
  variables?: Record<string, string>;
  headers?: Record<string, string>;
  body?: any;
}

const props = withDefaults(defineProps<Props>(), {
  method: "GET",
  url: "",
  description: "",
  variables: () => ({}),
  headers: () => ({}),
  body: null,
});

const { t } = useI18n();

// --- State ---
const activeLanguage = ref(0);
const activeRequestTab = ref("params");
const activeResponseTab = ref("body");
const loading = ref(false);
const response = ref<any>(null);
const error = ref<string | null>(null);
const copied = ref(false);
const showResponse = ref(false);
const flashSuccess = ref(false);
const isModalOpen = ref(false);
const showCopyTooltip = ref(false);

// Editable state
const editableVariables = ref<Record<string, string>>({});
const editableBody = ref<string>("");
const editableHeaders = ref<Record<string, string>>({});

// Sensitive header visibility (for password toggle)
const hiddenHeaders = ref<Set<string>>(new Set(['Authorization', 'X-API-Key', 'Api-Key', 'Secret']));
const visibleSecrets = ref<Set<string>>(new Set());

// JSON validation state
const isBodyValid = ref(true);
const bodyError = ref<string>("");

// Initialize from props
onMounted(() => {
  editableVariables.value = { ...props.variables };
  editableHeaders.value = { ...props.headers };
  editableBody.value = props.body ? JSON.stringify(props.body, null, 2) : "";
  validateBody();
});

// Watch for prop changes
watch(() => props.variables, (newVars) => {
  editableVariables.value = { ...newVars };
}, { deep: true });

watch(() => props.body, (newBody) => {
  editableBody.value = newBody ? JSON.stringify(newBody, null, 2) : "";
  validateBody();
}, { deep: true });

watch(() => props.headers, (newHeaders) => {
  editableHeaders.value = { ...newHeaders };
}, { deep: true });

// Validate JSON body
const validateBody = () => {
  if (!editableBody.value.trim()) {
    isBodyValid.value = true;
    bodyError.value = "";
    return;
  }
  try {
    JSON.parse(editableBody.value);
    isBodyValid.value = true;
    bodyError.value = "";
  } catch (err: any) {
    isBodyValid.value = false;
    bodyError.value = err.message || "Invalid JSON";
  }
};

watch(editableBody, validateBody);

// Format/prettify JSON
const formatBody = () => {
  if (!editableBody.value.trim()) return;
  try {
    const parsed = JSON.parse(editableBody.value);
    editableBody.value = JSON.stringify(parsed, null, 2);
  } catch {
    // Can't format invalid JSON
  }
};

// Toggle secret visibility
const toggleSecretVisibility = (key: string) => {
  if (visibleSecrets.value.has(key)) {
    visibleSecrets.value.delete(key);
  } else {
    visibleSecrets.value.add(key);
  }
  visibleSecrets.value = new Set(visibleSecrets.value); // Trigger reactivity
};

const isSensitiveHeader = (key: string) => {
  const lowerKey = key.toLowerCase();
  return lowerKey.includes('auth') || 
         lowerKey.includes('token') || 
         lowerKey.includes('secret') || 
         lowerKey.includes('key') ||
         lowerKey.includes('password');
};

const isSecretVisible = (key: string) => visibleSecrets.value.has(key);

// Add/remove headers
const newHeaderKey = ref("");
const newHeaderValue = ref("");
const addHeader = () => {
  if (newHeaderKey.value.trim()) {
    editableHeaders.value[newHeaderKey.value.trim()] = newHeaderValue.value;
    newHeaderKey.value = "";
    newHeaderValue.value = "";
  }
};
const removeHeader = (key: string) => {
  const newHeaders = { ...editableHeaders.value };
  delete newHeaders[key];
  editableHeaders.value = newHeaders;
};

// Reset to defaults
const resetToDefaults = () => {
  editableVariables.value = { ...props.variables };
  editableHeaders.value = { ...props.headers };
  editableBody.value = props.body ? JSON.stringify(props.body, null, 2) : "";
  response.value = null;
  error.value = null;
  showResponse.value = false;
};

const languages = [
  { label: "cURL", lang: "shell", client: "curl", hlLang: "bash", icon: "i-lucide-terminal", color: "blue" },
  { label: "JavaScript", lang: "js", client: "fetch", hlLang: "javascript", icon: "i-lucide-braces", color: "yellow" },
  { label: "Python", lang: "python", client: "requests", hlLang: "python", icon: "i-lucide-code", color: "sky" },
  { label: "PHP", lang: "php", client: "guzzle", hlLang: "php", icon: "i-lucide-file-code", color: "indigo" },
  { label: "Go", lang: "go", client: "native", hlLang: "go", icon: "i-lucide-zap", color: "cyan" },
];

const langColors: Record<string, string> = {
  blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  yellow: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  sky: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  indigo: "text-indigo-400 bg-indigo-400/10 border-indigo-500/20",
  cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
};

const methodColors: Record<string, { bg: string; text: string; glow: string; border: string }> = {
  GET: { bg: "bg-blue-500/10", text: "text-blue-500 dark:text-blue-400", glow: "", border: "border-blue-500/30" },
  POST: { bg: "bg-indigo-500/10", text: "text-indigo-500 dark:text-indigo-400", glow: "", border: "border-indigo-500/30" },
  PUT: { bg: "bg-slate-500/10", text: "text-slate-500 dark:text-slate-400", glow: "", border: "border-slate-500/30" },
  PATCH: { bg: "bg-slate-500/10", text: "text-slate-500 dark:text-slate-400", glow: "", border: "border-slate-500/30" },
  DELETE: { bg: "bg-red-500/10", text: "text-red-500 dark:text-red-400", glow: "", border: "border-red-500/30" },
};

const methodDescriptions: Record<string, string> = {
  GET: "Retrieve data from the server",
  POST: "Create a new resource",
  PUT: "Replace an existing resource",
  PATCH: "Partially update a resource",
  DELETE: "Remove a resource",
};

// --- Logic: Variable Replacement ---
const replaceVariables = (text: string) => {
  if (!text) return text;
  let result = text;
  for (const [key, value] of Object.entries(editableVariables.value || {})) {
    result = result.replace(new RegExp(`{${key}}`, "g"), value);
  }
  return result;
};

const pathVariables = computed(() => {
  const vars: Record<string, string> = {};
  const urlPattern = /{(\w+)}/g;
  const matches = Array.from(props.url?.matchAll(urlPattern) || []);
  for (const match of matches) {
    const key = (match as RegExpMatchArray)[1];
    if (editableVariables.value[key] !== undefined) {
      vars[key] = editableVariables.value[key];
    }
  }
  return vars;
});

const envVariables = computed(() => {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(editableVariables.value)) {
    if (!pathVariables.value[key]) {
      vars[key] = value;
    }
  }
  return vars;
});

const processedUrl = computed(() => replaceVariables(props.url));

const processedHeaders = computed(() => {
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(editableHeaders.value || {})) {
    headers[key] = replaceVariables(value);
  }
  return headers;
});

const processedBodyText = computed(() => replaceVariables(editableBody.value));

const processedBody = computed(() => {
  if (!processedBodyText.value) return null;
  try {
    return JSON.parse(processedBodyText.value);
  } catch {
    return processedBodyText.value;
  }
});

// --- Logic: Code Snippet Generation ---
const generateSnippet = (lang: string, client: string) => {
  const requestSpec: any = {
    url: processedUrl.value,
    method: props.method,
    headers: Object.entries(processedHeaders.value).map(([name, value]) => ({
      name,
      value,
    })),
  };

  if (editableBody.value && ["POST", "PUT", "PATCH"].includes(props.method)) {
    requestSpec.postData = {
      mimeType: "application/json",
      text: processedBodyText.value,
    };
  }

  try {
    const result = snippetz().print(lang, client, requestSpec);
    return result || `// Error generating snippet`;
  } catch (err) {
    return `// Error generating snippet: ${err}`;
  }
};

const currentSnippet = computed(() => {
  const { lang, client } = languages[activeLanguage.value];
  return generateSnippet(lang, client);
});

const highlightedSnippet = computed(() => {
  const { hlLang } = languages[activeLanguage.value];
  if (!currentSnippet.value) return "";
  return hljs.highlight(currentSnippet.value, { language: hlLang }).value;
});

const curlSnippet = computed(() => {
  const result = generateSnippet("shell", "curl");
  return hljs.highlight(result, { language: "bash" }).value;
});

const snippetLines = computed(() => {
  return currentSnippet.value.split("\n");
});

// --- Logic: Copy to Clipboard ---
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(currentSnippet.value);
    copied.value = true;
    showCopyTooltip.value = true;
    setTimeout(() => {
      copied.value = false;
      showCopyTooltip.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

const copyResponse = async () => {
  if (!response.value) return;
  try {
    const text = typeof response.value.body === 'object' 
      ? JSON.stringify(response.value.body, null, 2) 
      : response.value.body;
    await navigator.clipboard.writeText(text);
    // You could add a temporary state for this too
  } catch (err) {
    console.error("Failed to copy response:", err);
  }
};

// --- Logic: Execute Request ---
const executeRequest = async () => {
  if (!isBodyValid.value && editableBody.value.trim()) {
    return; // Don't execute with invalid JSON
  }

  loading.value = true;
  response.value = null;
  error.value = null;
  showResponse.value = true;
  flashSuccess.value = false;
  // Automatically switch to response tab if we were on one of the request tabs
  activeResponseTab.value = 'body';

  const startTime = Date.now();

  try {
    const options: RequestInit = {
      method: props.method,
      headers: processedHeaders.value,
    };

    if (editableBody.value && ["POST", "PUT", "PATCH"].includes(props.method)) {
      options.body = processedBodyText.value;
    }

    const res = await fetch(processedUrl.value, options);
    const duration = Date.now() - startTime;

    const rawText = await res.text();
    let body;
    try {
      body = JSON.parse(rawText);
    } catch {
      body = rawText;
    }

    const resHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      resHeaders[k] = v;
    });

    response.value = {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
      body,
      duration,
      size: typeof body === 'string' ? body.length : JSON.stringify(body).length,
    };

    // Flash success animation for 2xx responses
    if (res.status < 300) {
      flashSuccess.value = true;
      setTimeout(() => {
        flashSuccess.value = false;
      }, 1000);
    }
  } catch (err: any) {
    error.value = err.message || "An unknown error occurred";
  } finally {
    loading.value = false;
  }
};

// Keyboard shortcut
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    executeRequest();
  }
};

const formattedResponseBody = computed(() => {
  if (!response.value) return "";
  const content =
    typeof response.value.body === "object"
      ? JSON.stringify(response.value.body, null, 2)
      : response.value.body;

  if (typeof response.value.body === "object") {
    try {
       return hljs.highlight(content, { language: "json" }).value;
    } catch {
       return content;
    }
  }
  
  // Handle HTML/XML responses gracefully
  if (typeof content === 'string' && content.trim().startsWith('<')) {
    try {
      return hljs.highlight(content, { language: "xml" }).value;
    } catch {
      return content;
    }
  }

  return content;
});

const responseStatusColor = computed(() => {
  if (!response.value) return "neutral";
  if (response.value.status < 300) return "success";
  if (response.value.status < 400) return "info";
  if (response.value.status < 500) return "warning";
  return "error";
});

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};
</script>

<template>
  <div
    class="api-playground group my-8 mb-12 rounded-2xl overflow-hidden transition-all duration-500 ease-in-out"
    :class="{ 
      'ring-1 ring-indigo-500/40 shadow-2xl': flashSuccess,
      'shadow-xl': !flashSuccess
    }"
    @keydown="handleKeydown"
    tabindex="0"
    role="region"
    :aria-label="`API Playground for ${method} ${url}`"
  >
    <!-- Glassmorphism Container -->
    <div
      class="relative backdrop-blur-xl rounded-2xl overflow-hidden
             bg-white dark:bg-[#0c111c]/98 
             border border-gray-200 dark:border-white/10"
    >
      <!-- Premium Background Effects -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
        <div class="absolute -top-[20%] -right-[10%] w-[40%] h-[60%] bg-gray-500/5 blur-[120px] rounded-full" />
        <div class="absolute -bottom-[20%] -left-[10%] w-[40%] h-[60%] bg-gray-500/5 blur-[120px] rounded-full" />
      </div>
      <!-- Gradient Border Glow -->
      <div
        class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))"
      />

      <!-- Header -->
      <div class="relative px-6 py-4 border-b border-gray-200 dark:border-white/5 bg-gray-50/30 dark:bg-white/5">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <div class="flex items-center gap-4 flex-1">
            <!-- Method Badge -->
            <div class="shrink-0">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-md font-mono font-black text-[10px] tracking-widest transition-all duration-300 border shadow-sm"
                :class="[methodColors[method]?.bg, methodColors[method]?.text, methodColors[method]?.border]"
              >
                {{ method }}
              </span>
            </div>

            <!-- URL with Variable Highlighting -->
            <div class="flex-1 min-w-0 group/url relative">
              <div class="flex items-center gap-2 p-1 px-3 rounded-lg bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 shadow-sm group-hover/url:border-indigo-500/20 transition-colors">
                <UIcon name="i-lucide-globe" class="w-3.5 h-3.5 text-gray-400" />
                <code class="text-[12px] font-mono text-gray-600 dark:text-gray-400 truncate tracking-tight">
                  <span v-for="(part, i) in url.split(/({[\w]+})/)" :key="i" :class="{ 'text-indigo-500 font-bold': part.startsWith('{') }">
                    {{ part.startsWith('{') ? editableVariables[part.slice(1, -1)] || part : part }}
                  </span>
                </code>
                <button @click="copyToClipboard" class="ml-auto p-1 opacity-0 group-hover/url:opacity-100 transition-opacity text-gray-400 hover:text-indigo-400">
                  <UIcon name="i-lucide-copy" class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Actions Header -->
          <div class="flex gap-2 shrink-0">
            <UButton
              color="indigo"
              size="sm"
              icon="i-lucide-play-circle"
              class="font-black uppercase tracking-widest text-[10px] px-3.5 h-8"
              @click="isModalOpen = true"
            >
              Test API
            </UButton>
          </div>
        </div>

        <!-- Description -->
        <p v-if="description" class="mt-2.5 text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
          {{ description }}
        </p>
      </div>

      <!-- Main Content Area (Docs Only) -->
      <div class="flex flex-col bg-gray-50/30 dark:bg-black/10 overflow-hidden">
        <!-- Snippet Explorer -->
        <div class="flex-1 flex flex-col">
          <!-- Selector -->
          <div class="flex items-center justify-between px-6 py-2.5 bg-gray-100/30 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
            <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
              <button
                v-for="(lang, index) in languages"
                :key="lang.label"
                class="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-300 whitespace-nowrap border"
                :class="activeLanguage === index
                  ? [langColors[lang.color], 'shadow-lg shadow-' + lang.color + '-500/5']
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border-transparent'"
                @click="activeLanguage = index"
              >
                <UIcon :name="lang.icon" class="w-3.5 h-3.5" />
                {{ lang.label }}
              </button>
            </div>

            <!-- Copy Snippet -->
            <UButton
              color="gray"
              variant="ghost"
              size="xs"
              :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
              @click="copyToClipboard"
              class="shrink-0 ml-4 font-bold"
            >
              {{ copied ? t('api_playground.actions.copied') : t('api_playground.actions.copy') }}
            </UButton>
          </div>

          <!-- Code Display -->
          <div class="relative group/code flex-1 bg-gray-950 dark:bg-[#080b13] min-h-[240px] overflow-hidden">
             <div class="absolute top-4 right-4 z-10">
               <span 
                 class="px-2 py-0.5 rounded font-mono text-[9px] font-black uppercase tracking-tighter border transition-all duration-500"
                 :class="[langColors[languages[activeLanguage].color]]"
               >
                 {{ languages[activeLanguage].lang }}
               </span>
             </div>
             
             <div class="flex h-full overflow-auto text-[13px] font-mono leading-relaxed">
                <!-- Line Numbers -->
                <div class="hidden sm:flex flex-col py-6 px-4 text-right text-gray-600 bg-gray-950/50 border-r border-white/5 select-none shrink-0">
                  <div v-for="(_, i) in snippetLines" :key="i">{{ i + 1 }}</div>
                </div>
                <!-- Snippet -->
                <pre class="p-5 overflow-x-auto w-full"><code v-html="highlightedSnippet" class="text-gray-300"></code></pre>
             </div>
          </div>
        </div>
      </div>
    </div>

    <UModal v-model:open="isModalOpen" fullscreen>
      <template #content>
        <div class="flex flex-col h-full bg-slate-50 dark:bg-[#0b0f19] overflow-hidden">
          <!-- Modal Header -->
          <div class="flex justify-between items-center px-8 py-4 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl">
            <div class="flex gap-4 items-center">
              <span class="inline-flex items-center px-2 py-1 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-mono text-[10px] font-black uppercase">{{ method }}</span>
              <span class="text-sm font-mono text-gray-500 max-w-md truncate">{{ processedUrl }}</span>
            </div>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" @click="isModalOpen = false" />
          </div>

          <!-- Modal Body: Split Pane -->
          <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
            <!-- Left: Request Config -->
            <div class="flex flex-col border-r border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 space-y-8 overflow-y-auto">
              <!-- Tabs Explorer -->
              <div class="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-full">
                <button
                  v-for="tab in ['params', 'headers', 'body', 'curl']"
                  :key="tab"
                  class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300"
                  :class="activeRequestTab === tab 
                    ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'"
                  @click="activeRequestTab = tab"
                >
                  <UIcon :name="tab === 'params' ? 'i-lucide-variable' : tab === 'headers' ? 'i-lucide-file-text' : tab === 'curl' ? 'i-lucide-terminal' : 'i-lucide-braces'" class="w-4 h-4" />
                  {{ tab }}
                </button>
              </div>

              <!-- Content for each tab -->
              <div class="flex-1">
                <!-- Params -->
                <div v-if="activeRequestTab === 'params'" class="space-y-8">
                  <div v-if="Object.keys(editableVariables).length > 0" class="space-y-6">
                     <div v-for="(value, key) in editableVariables" :key="key" class="group/field relative">
                        <label class="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1 transition-colors group-focus-within/field:text-indigo-500">{{ key }}</label>
                        <input v-model="editableVariables[key]" type="text" class="w-full text-xs font-mono bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-gray-200 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all" />
                     </div>
                  </div>
                  <div v-else class="text-center py-20 opacity-30">
                     <UIcon name="i-lucide-variable" class="w-12 h-12 mx-auto mb-4" />
                     <p class="text-xs font-bold uppercase tracking-widest">No variables needed</p>
                  </div>
                </div>

                <!-- Headers -->
                <div v-if="activeRequestTab === 'headers'" class="space-y-6">
                   <div v-for="(value, key) in editableHeaders" :key="key" class="grid grid-cols-[1fr_2fr_auto] gap-3 items-center">
                      <span class="text-[11px] font-mono text-gray-400">{{ key }}</span>
                      <div class="relative">
                         <input v-model="editableHeaders[key]" :type="isSensitiveHeader(String(key)) && !isSecretVisible(String(key)) ? 'password' : 'text'" class="w-full text-xs font-mono bg-gray-50 dark:bg-black/20 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/5" />
                         <button v-if="isSensitiveHeader(String(key))" @click="toggleSecretVisibility(String(key))" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><UIcon :name="isSecretVisible(String(key)) ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-3.5 h-3.5" /></button>
                      </div>
                      <UButton color="gray" variant="ghost" size="xs" icon="i-lucide-trash" @click="removeHeader(String(key))" />
                   </div>
                   <div class="flex gap-2 p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 mt-8">
                      <input v-model="newHeaderKey" placeholder="Header Name" class="flex-1 bg-transparent text-xs font-mono px-2 py-1 focus:outline-none" />
                      <input v-model="newHeaderValue" placeholder="Value" class="flex-1 bg-transparent text-xs font-mono px-2 py-1 focus:outline-none" @keyup.enter="addHeader" />
                      <UButton size="xs" icon="i-lucide-plus" @click="addHeader" />
                   </div>
                </div>

                <!-- Body -->
                <div v-if="activeRequestTab === 'body'" class="space-y-4">
                   <div class="flex justify-between items-center mb-2">
                      <h4 class="text-[10px] font-black uppercase tracking-widest text-gray-500">JSON Body</h4>
                      <button @click="formatBody" :disabled="!isBodyValid" class="text-[10px] font-black text-indigo-500 hover:text-indigo-400 disabled:opacity-30 uppercase">Format JSON</button>
                   </div>
                   <textarea v-model="editableBody" rows="15" class="w-full p-4 bg-gray-50 dark:bg-black/40 rounded-2xl text-xs font-mono text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 resize-none" :class="{ 'border-red-500 bg-red-500/5': !isBodyValid }" />
                   <p v-if="!isBodyValid" class="text-[10px] text-red-500 font-bold uppercase tracking-tighter">{{ bodyError }}</p>
                </div>

                <!-- cURL Snippet -->
                <div v-if="activeRequestTab === 'curl'" class="h-full">
                   <div class="flex items-center justify-between mb-4">
                      <h4 class="text-[10px] font-black uppercase tracking-widest text-gray-500">cURL Command</h4>
                      <UButton color="gray" variant="ghost" size="xs" icon="i-lucide-copy" @click="copyToClipboard" />
                   </div>
                   <div class="p-6 bg-gray-950 rounded-3xl border border-white/5 overflow-hidden">
                      <pre class="text-[11px] font-mono whitespace-pre-wrap leading-relaxed select-all"><code v-html="curlSnippet" class="text-indigo-400/80"></code></pre>
                   </div>
                   <p class="mt-4 text-[10px] text-gray-500 italic">This command includes your current parameters and headers.</p>
                </div>
              </div>

              <!-- Execute Button in Modal Footer (Sticky-ish) -->
              <div class="pt-8 border-t border-gray-100 dark:border-white/5">
                 <UButton
                   block
                   size="xl"
                   :loading="loading"
                   :disabled="!isBodyValid && editableBody.trim() !== ''"
                   class="h-14 bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-500/10 rounded-2xl font-black uppercase tracking-[0.2em] text-[12px]"
                   @click="executeRequest"
                 >
                   Send Request
                   <div class="ml-auto flex items-center gap-2 opacity-50">
                      <div class="w-px h-4 bg-current" />
                      <span class="font-mono text-[10px]">⌘↵</span>
                   </div>
                 </UButton>
              </div>
            </div>

            <!-- Right: Response Explorer -->
            <div class="flex flex-col bg-gray-50 dark:bg-black/20 overflow-hidden">
               <!-- Response Header Info -->
               <div class="flex justify-between items-center px-8 py-5 border-b border-gray-200 dark:border-white/10 bg-white/5 text-gray-400">
                  <div class="flex gap-4 items-center">
                     <span class="text-[10px] font-black tracking-widest uppercase">Response</span>
                     <div v-if="response" class="flex gap-3 items-center">
                        <UBadge :color="responseStatusColor" variant="subtle" size="xs" class="font-black uppercase">{{ response.status }} {{ response.statusText }}</UBadge>
                        <span class="text-[10px] font-mono capitalize">{{ response.duration }}ms</span>
                     </div>
                  </div>
                  <div v-if="response" class="flex gap-4">
                     <button v-for="t in ['body', 'headers']" :key="t" @click="activeResponseTab = t" :class="activeResponseTab === t ? 'text-indigo-500' : 'text-gray-400'" class="text-[10px] font-black tracking-widest uppercase">{{ t }}</button>
                     <UButton color="gray" variant="ghost" size="xs" icon="i-lucide-copy" @click="copyResponse" />
                  </div>
               </div>

               <!-- Response Content -->
               <div class="flex-1 overflow-auto relative bg-gray-950">
                  <Transition mode="out-in">
                     <!-- Empty -->
                     <div v-if="!response && !loading && !error" class="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                        <UIcon name="i-lucide-zap" class="w-12 h-12 text-gray-800 mb-6 animate-pulse" />
                        <h4 class="text-xs font-black uppercase tracking-[0.3em] text-gray-600 mb-3 ml-[0.3em]">Waiting for Request</h4>
                        <p class="text-[11px] text-gray-500 max-w-[240px] leading-relaxed">Configure your request on the left and hit the magic button to see the server's response.</p>
                     </div>

                     <!-- Loading -->
                     <div v-else-if="loading" class="p-12 space-y-4">
                        <div v-for="i in 5" :key="i" class="h-2 bg-white/5 rounded-full animate-pulse" :style="{ width: `${100 - (i*15)}%` }" />
                     </div>

                     <!-- Error -->
                     <div v-else-if="error" class="p-12">
                        <div class="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl">
                           <div class="flex items-center gap-3 mb-4">
                              <UIcon name="i-lucide-alert-octagon" class="w-5 h-5 text-red-500" />
                              <span class="text-[10px] font-black uppercase tracking-widest text-red-500">Execution Error</span>
                           </div>
                           <p class="text-xs text-red-400/80 leading-relaxed font-mono">{{ error }}</p>
                        </div>
                     </div>

                     <!-- Data -->
                     <div v-else-if="response" class="h-full">
                        <pre v-if="activeResponseTab === 'body'" class="p-8 text-[12px] font-mono text-gray-400 whitespace-pre-wrap selection:bg-indigo-500/30" v-html="formattedResponseBody" />
                        <div v-else class="p-8 space-y-3">
                           <div v-for="(v, k) in response.headers" :key="k" class="grid grid-cols-[160px_1fr] gap-4 text-[10px] font-mono text-gray-400">
                              <span class="text-gray-500 font-bold uppercase tracking-tighter">{{ k }}</span>
                              <span class="break-all select-all">{{ v }}</span>
                           </div>
                        </div>
                     </div>
                  </Transition>
               </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.api-playground {
  --tw-ring-color: rgba(99, 102, 241, 0.2);
}

.api-playground:focus {
  outline: none;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.2);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.4);
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Code highlighting enhancements */
pre code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', ui-monospace, monospace;
}

/* Success flash animation */
@keyframes successPulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.ring-2 {
  animation: successPulse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Responsive Grid Adjustments */
@media (max-width: 1024px) {
  .api-playground {
    margin-left: -1rem;
    margin-right: -1rem;
    border-radius: 0;
  }
}
</style>
