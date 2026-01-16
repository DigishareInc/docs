<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from "vue";
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

// --- State ---
const activeLanguage = ref(0);
const activeRequestTab = ref("params");
const activeResponseTab = ref("body");
const loading = ref(false);
const response = ref<any>(null);
const error = ref<string | null>(null);
const copied = ref(false);
const showResponse = ref(false);

// Editable variables - create a reactive copy from props
const editableVariables = ref<Record<string, string>>({});

// Editable body - create a reactive copy from props
const editableBody = ref<string>("");

// Editable headers - create a reactive copy from props
const editableHeaders = ref<Record<string, string>>({});

// Initialize editable variables, headers, and body from props
onMounted(() => {
  editableVariables.value = { ...props.variables };
  editableHeaders.value = { ...props.headers };
  editableBody.value = props.body ? JSON.stringify(props.body, null, 2) : "";
});

// Watch for prop changes
watch(
  () => props.variables,
  (newVars) => {
    editableVariables.value = { ...newVars };
  },
  { deep: true }
);

watch(
  () => props.body,
  (newBody) => {
    editableBody.value = newBody ? JSON.stringify(newBody, null, 2) : "";
  },
  { deep: true }
);

watch(
  () => props.headers,
  (newHeaders) => {
    editableHeaders.value = { ...newHeaders };
  },
  { deep: true }
);

// Add new header
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
  delete editableHeaders.value[key];
};

const languages = [
  { label: "cURL", lang: "shell", client: "curl", hlLang: "bash", icon: "i-simple-icons-curl" },
  { label: "JavaScript", lang: "js", client: "fetch", hlLang: "javascript", icon: "i-simple-icons-javascript" },
  { label: "Python", lang: "python", client: "requests", hlLang: "python", icon: "i-simple-icons-python" },
  { label: "PHP", lang: "php", client: "guzzle", hlLang: "php", icon: "i-simple-icons-php" },
  { label: "Go", lang: "go", client: "native", hlLang: "go", icon: "i-simple-icons-go" },
];

const methodColors: Record<string, { bg: string; text: string; glow: string }> = {
  GET: { bg: "bg-blue-500/20", text: "text-blue-400", glow: "shadow-blue-500/30" },
  POST: { bg: "bg-emerald-500/20", text: "text-emerald-400", glow: "shadow-emerald-500/30" },
  PUT: { bg: "bg-amber-500/20", text: "text-amber-400", glow: "shadow-amber-500/30" },
  PATCH: { bg: "bg-orange-500/20", text: "text-orange-400", glow: "shadow-orange-500/30" },
  DELETE: { bg: "bg-red-500/20", text: "text-red-400", glow: "shadow-red-500/30" },
};

// --- Logic: Variable Replacement (uses editable variables) ---
const replaceVariables = (text: string) => {
  if (!text) return text;
  let result = text;
  for (const [key, value] of Object.entries(editableVariables.value || {})) {
    result = result.replace(new RegExp(`{${key}}`, "g"), value);
  }
  return result;
};

// Separate path variables (in URL) from environment variables (in headers/body)
const pathVariables = computed(() => {
  const vars: Record<string, string> = {};
  const urlPattern = /{(\w+)}/g;
  const matches = props.url?.matchAll(urlPattern) || [];
  for (const match of matches) {
    const key = match[1];
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

const processedBody = computed(() => {
  if (!editableBody.value) return null;
  try {
    // Parse and apply variable replacement
    const parsed = JSON.parse(editableBody.value);
    return parsed;
  } catch {
    // If invalid JSON, return the raw string
    return replaceVariables(editableBody.value);
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
      text: editableBody.value,
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

const snippetLines = computed(() => {
  return currentSnippet.value.split("\n");
});

// --- Logic: Copy to Clipboard ---
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(currentSnippet.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

// --- Logic: Execute Request ---
const executeRequest = async () => {
  loading.value = true;
  response.value = null;
  error.value = null;
  showResponse.value = true;

  const startTime = Date.now();

  try {
    const options: RequestInit = {
      method: props.method,
      headers: processedHeaders.value,
    };

    if (editableBody.value && ["POST", "PUT", "PATCH"].includes(props.method)) {
      options.body = editableBody.value;
    }

    const res = await fetch(processedUrl.value, options);
    const duration = Date.now() - startTime;

    let body;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    response.value = {
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries()),
      body,
      duration,
      size: JSON.stringify(body).length,
    };
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
    return hljs.highlight(content, { language: "json" }).value;
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
    class="api-playground group my-8 rounded-2xl overflow-hidden transition-all duration-300"
    @keydown="handleKeydown"
    tabindex="0"
  >
    <!-- Glassmorphism Container - Now theme-aware -->
    <div
      class="relative backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl
             bg-white dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-slate-900/98 dark:to-slate-950
             border border-gray-200 dark:border-slate-700/50"
    >
      <!-- Gradient Border Glow -->
      <div
        class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))"
      />

      <!-- Header -->
      <div class="relative px-6 py-5 border-b border-gray-200 dark:border-slate-700/50">
        <div class="flex items-center gap-4">
          <!-- Method Badge with Glow -->
          <div
            class="relative"
            :class="methodColors[method]?.glow"
            style="filter: drop-shadow(0 0 12px currentColor)"
          >
            <span
              class="inline-flex items-center px-3 py-1.5 rounded-lg font-mono font-bold text-sm tracking-wide transition-all duration-300"
              :class="[methodColors[method]?.bg, methodColors[method]?.text]"
            >
              <span class="relative flex h-2 w-2 mr-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  :class="methodColors[method]?.text.replace('text-', 'bg-')"
                />
                <span
                  class="relative inline-flex rounded-full h-2 w-2"
                  :class="methodColors[method]?.text.replace('text-', 'bg-')"
                />
              </span>
              {{ method }}
            </span>
          </div>

          <!-- URL -->
          <code class="flex-1 text-sm font-mono text-gray-700 dark:text-slate-300 break-all leading-relaxed">
            {{ processedUrl }}
          </code>
        </div>

        <!-- Description -->
        <p v-if="description" class="mt-3 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
          {{ description }}
        </p>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2">
        <!-- Left Panel: Request Builder -->
        <div class="border-r border-gray-200 dark:border-slate-700/50 p-5">
          <!-- Request Tabs -->
          <div class="flex items-center gap-1 mb-4 p-1 bg-gray-100 dark:bg-slate-800/50 rounded-lg w-fit">
            <button
              v-for="tab in ['params', 'headers', 'body']"
              :key="tab"
              class="px-4 py-2 text-xs font-medium rounded-md transition-all duration-200"
              :class="
                activeRequestTab === tab
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              "
              @click="activeRequestTab = tab"
            >
              {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
            </button>
          </div>

          <!-- Variables/Params Section - NOW EDITABLE -->
          <div v-if="activeRequestTab === 'params'" class="space-y-6">
            <!-- Path Variables (in URL) -->
            <div v-if="Object.keys(pathVariables).length > 0">
              <h4 class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Path Variables
              </h4>
              <div class="space-y-3">
                <div
                  v-for="(value, key) in pathVariables"
                  :key="key"
                  class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/30 rounded-lg border border-gray-200 dark:border-slate-700/30"
                >
                  <label :for="`path-${key}`" class="text-xs font-mono text-blue-600 dark:text-blue-400 min-w-[80px]">{{ key }}</label>
                  <span class="text-gray-400 dark:text-slate-500">=</span>
                  <input
                    :id="`path-${key}`"
                    v-model="editableVariables[key]"
                    type="text"
                    class="flex-1 text-sm font-mono bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-300 px-3 py-1.5 rounded border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <!-- Environment Variables (in headers/body) -->
            <div v-if="Object.keys(envVariables).length > 0">
              <h4 class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                Environment Variables
              </h4>
              <div class="space-y-3">
                <div
                  v-for="(value, key) in envVariables"
                  :key="key"
                  class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/30 rounded-lg border border-purple-200 dark:border-purple-700/30"
                >
                  <label :for="`env-${key}`" class="text-xs font-mono text-purple-600 dark:text-purple-400 min-w-[80px]">{{ key }}</label>
                  <span class="text-gray-400 dark:text-slate-500">=</span>
                  <input
                    :id="`env-${key}`"
                    v-model="editableVariables[key]"
                    type="text"
                    class="flex-1 text-sm font-mono bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-300 px-3 py-1.5 rounded border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div v-if="Object.keys(editableVariables).length === 0" class="text-center py-8 text-gray-400 dark:text-slate-500 text-sm">
              No variables defined
            </div>
          </div>

          <!-- Headers Section - NOW EDITABLE -->
          <div v-if="activeRequestTab === 'headers'" class="space-y-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                Request Headers
              </h4>
              <span class="text-[10px] text-gray-400 dark:text-slate-500">Editable</span>
            </div>
            
            <!-- Existing Headers -->
            <div v-if="Object.keys(editableHeaders).length > 0" class="space-y-2">
              <div
                v-for="(value, key) in editableHeaders"
                :key="key"
                class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-800/30 rounded-lg border border-gray-200 dark:border-slate-700/30"
              >
                <span class="text-xs font-mono text-emerald-600 dark:text-emerald-400 min-w-[100px] shrink-0">{{ key }}</span>
                <span class="text-gray-400 dark:text-slate-500">:</span>
                <input
                  v-model="editableHeaders[key]"
                  type="text"
                  class="flex-1 text-sm font-mono bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-300 px-3 py-1.5 rounded border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  @click="removeHeader(String(key))"
                  class="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove header"
                >
                  <UIcon name="i-lucide-x" class="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <!-- Add New Header -->
            <div class="flex items-center gap-2 p-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-600">
              <input
                v-model="newHeaderKey"
                type="text"
                placeholder="Header-Name"
                class="w-32 text-sm font-mono bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-300 px-3 py-1.5 rounded border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <span class="text-gray-400 dark:text-slate-500">:</span>
              <input
                v-model="newHeaderValue"
                type="text"
                placeholder="value"
                class="flex-1 text-sm font-mono bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-300 px-3 py-1.5 rounded border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                @keyup.enter="addHeader"
              />
              <button
                @click="addHeader"
                class="p-1.5 text-emerald-500 hover:text-emerald-600 transition-colors"
                title="Add header"
              >
                <UIcon name="i-lucide-plus" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Body Section - NOW EDITABLE -->
          <div v-if="activeRequestTab === 'body'" class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  Request Body (JSON)
                </h4>
                <span class="text-[10px] text-gray-400 dark:text-slate-500">Editable</span>
              </div>
              <textarea
                v-model="editableBody"
                rows="10"
                placeholder='{"key": "value"}'
                class="w-full p-4 bg-gray-50 dark:bg-slate-950/50 rounded-lg border border-gray-200 dark:border-slate-700/30 text-sm font-mono text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
            </div>
          </div>

          <!-- Execute Button -->
          <div class="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700/30">
            <UButton
              block
              size="lg"
              :loading="loading"
              icon="i-lucide-play"
              class="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 border-0 shadow-lg shadow-blue-500/25 transition-all duration-300"
              @click="executeRequest"
            >
              <span class="font-semibold">Send Request</span>
              <kbd
                class="ml-3 px-2 py-0.5 text-[10px] bg-white/10 rounded border border-white/20 font-mono"
              >
                ⌘↵
              </kbd>
            </UButton>
            <p class="text-[10px] text-gray-400 dark:text-slate-500 mt-2 text-center">
              Requests are sent directly from your browser. CORS must be enabled on the API.
            </p>
          </div>
        </div>

        <!-- Right Panel: Code Snippets & Response -->
        <div class="flex flex-col bg-gray-50 dark:bg-slate-950/30">
          <!-- Language Selector -->
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700/50 bg-gray-100 dark:bg-slate-900/50"
          >
            <div class="flex gap-1">
              <button
                v-for="(lang, index) in languages"
                :key="lang.label"
                class="relative px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200"
                :class="
                  activeLanguage === index
                    ? 'text-white bg-gray-700 dark:bg-slate-700'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-800/50'
                "
                @click="activeLanguage = index"
              >
                {{ lang.label }}
              </button>
            </div>

            <!-- Copy Button -->
            <button
              class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white bg-gray-200 dark:bg-slate-800/50 hover:bg-gray-300 dark:hover:bg-slate-700 rounded-md transition-all duration-200"
              @click="copyToClipboard"
            >
              <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" class="w-3.5 h-3.5" />
              <span>{{ copied ? "Copied!" : "Copy" }}</span>
            </button>
          </div>

          <!-- Code Block with Line Numbers -->
          <div class="flex-1 overflow-auto bg-gray-900 dark:bg-[#0d1117] min-h-[200px] max-h-[350px]">
            <div class="flex text-xs font-mono">
              <!-- Line Numbers -->
              <div
                class="select-none py-4 px-3 text-right text-gray-500 dark:text-slate-600 border-r border-gray-700 dark:border-slate-800 bg-gray-800 dark:bg-slate-900/50"
              >
                <div v-for="(_, i) in snippetLines" :key="i" class="leading-6">
                  {{ i + 1 }}
                </div>
              </div>
              <!-- Code -->
              <pre
                class="flex-1 p-4 text-gray-200 dark:text-slate-300 overflow-x-auto"
              ><code v-html="highlightedSnippet" class="leading-6"></code></pre>
            </div>
          </div>

          <!-- Response Section -->
          <div
            v-if="showResponse"
            class="border-t border-gray-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/50"
          >
            <!-- Response Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700/30">
              <div class="flex items-center gap-3">
                <span class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Response</span>
                <div v-if="response" class="flex items-center gap-2">
                  <UBadge :color="responseStatusColor" variant="subtle" size="xs">
                    <span class="flex items-center gap-1.5">
                      <span
                        v-if="response.status >= 400"
                        class="flex h-1.5 w-1.5 animate-pulse rounded-full bg-current"
                      />
                      {{ response.status }} {{ response.statusText }}
                    </span>
                  </UBadge>
                  <span class="text-[10px] text-gray-400 dark:text-slate-500">{{ response.duration }}ms</span>
                  <span class="text-[10px] text-gray-400 dark:text-slate-500">{{ formatBytes(response.size) }}</span>
                </div>
              </div>

              <!-- Response Tabs -->
              <div v-if="response" class="flex gap-1">
                <button
                  v-for="tab in ['body', 'headers']"
                  :key="tab"
                  class="px-2 py-1 text-[10px] font-medium rounded transition-all duration-200"
                  :class="
                    activeResponseTab === tab
                      ? 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white'
                      : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                  "
                  @click="activeResponseTab = tab"
                >
                  {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
                </button>
              </div>
            </div>

            <!-- Response Content -->
            <div class="max-h-[250px] overflow-auto">
              <!-- Loading State -->
              <div v-if="loading" class="p-4 space-y-3">
                <div class="h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-3/4" />
                <div class="h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-1/2" />
                <div class="h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-2/3" />
              </div>

              <!-- Error State -->
              <div v-else-if="error" class="p-4">
                <div
                  class="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg"
                >
                  <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p class="text-sm font-medium text-red-600 dark:text-red-400">Request Failed</p>
                    <p class="text-xs text-red-500 dark:text-red-300/80 mt-1">{{ error }}</p>
                  </div>
                </div>
              </div>

              <!-- Success Response -->
              <div v-else-if="response">
                <!-- Body Tab -->
                <div v-if="activeResponseTab === 'body'" class="bg-gray-900 dark:bg-[#0d1117]">
                  <pre
                    class="p-4 text-xs font-mono text-gray-200 dark:text-slate-300 whitespace-pre-wrap"
                    v-html="formattedResponseBody"
                  />
                </div>

                <!-- Headers Tab -->
                <div v-if="activeResponseTab === 'headers'" class="p-4 space-y-2">
                  <div
                    v-for="(val, key) in response.headers"
                    :key="key"
                    class="flex items-start gap-3 text-xs"
                  >
                    <span class="font-mono text-purple-600 dark:text-purple-400 min-w-[140px] shrink-0">{{ key }}</span>
                    <span class="font-mono text-gray-600 dark:text-slate-400 break-all">{{ val }}</span>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="p-8 text-center">
                <UIcon name="i-lucide-arrow-up" class="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                <p class="text-sm text-gray-400 dark:text-slate-500">Click "Send Request" to see the response</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.api-playground {
  --tw-ring-color: rgba(99, 102, 241, 0.2);
}

.api-playground:focus {
  outline: none;
}

.api-playground:focus-visible {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}

/* Custom scrollbar */
.api-playground ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.api-playground ::-webkit-scrollbar-track {
  background: transparent;
}

.api-playground ::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.3);
  border-radius: 10px;
}

.api-playground ::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.5);
}

/* Code highlighting enhancements */
.api-playground pre code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
}

/* Smooth transitions for all interactive elements */
.api-playground button {
  transition: all 0.2s ease;
}

/* Focus styles for keyboard navigation */
.api-playground button:focus-visible {
  outline: 2px solid rgba(99, 102, 241, 0.5);
  outline-offset: 2px;
}
</style>
