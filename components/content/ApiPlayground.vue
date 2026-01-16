<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { snippetz } from "@scalar/snippetz";
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import 'highlight.js/styles/github-dark.css'; // Or another style

hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);

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
  variables: () => ({}),
  headers: () => ({}),
  body: null,
});

// --- State ---
const activeTab = ref(0);
const loading = ref(false);
const response = ref<any>(null);
const error = ref<string | null>(null);
const copied = ref(false);

const languages = [
  { label: "cURL", lang: "shell", client: "curl", hlLang: "bash" },
  { label: "JavaScript", lang: "js", client: "fetch", hlLang: "javascript" },
  { label: "Python", lang: "python", client: "requests", hlLang: "python" },
  { label: "Node.js", lang: "node", client: "undici", hlLang: "javascript" },
];

// --- Logic: Variable Replacement ---
const replaceVariables = (text: string) => {
  if (!text) return text;
  let result = text;
  for (const [key, value] of Object.entries(props.variables || {})) {
    result = result.replace(new RegExp(`{${key}}`, "g"), value);
  }
  return result;
};

const processedUrl = computed(() => replaceVariables(props.url));

const processedHeaders = computed(() => {
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(props.headers || {})) {
    headers[key] = replaceVariables(value);
  }
  return headers;
});

const processedBody = computed(() => {
  if (!props.body) return null;
  if (typeof props.body === "string") {
    return replaceVariables(props.body);
  }
  return props.body;
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

  if (props.body && ["POST", "PUT", "PATCH"].includes(props.method)) {
    requestSpec.postData = {
      mimeType: "application/json",
      text: JSON.stringify(processedBody.value, null, 2),
    };
  }

  try {
    const result = snippetz().print(lang, client, requestSpec);
    console.log(`[Snippet Gen] ${lang}:`, result);
    return result || `// Error: Failed to generate snippet for ${lang} (Result: ${result})`;
  } catch (err) {
    console.error("Snippetz error:", err);
    return `// Error generating snippet: ${err}`;
  }
};

const currentSnippet = computed(() => {
  const { lang, client } = languages[activeTab.value];
  return generateSnippet(lang, client);
});

const highlightedSnippet = computed(() => {
  const { hlLang } = languages[activeTab.value];
  if (!currentSnippet.value) return '';
  return hljs.highlight(currentSnippet.value, { language: hlLang }).value;
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

  const startTime = Date.now();

  try {
    const options: RequestInit = {
      method: props.method,
      headers: processedHeaders.value,
    };

    if (props.body && ["POST", "PUT", "PATCH"].includes(props.method)) {
      options.body = JSON.stringify(processedBody.value);
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
      duration: `${duration}ms`,
    };
  } catch (err: any) {
    error.value = err.message || "An unknown error occurred";
  } finally {
    loading.value = false;
  }
};

const formattedResponseBody = computed(() => {
  if (!response.value) return '';
  const content = typeof response.value.body === 'object' 
    ? JSON.stringify(response.value.body, null, 2) 
    : response.value.body;
  
  if (typeof response.value.body === 'object') {
     return hljs.highlight(content, { language: 'json' }).value;
  }
  return content; // Plain text
});
</script>

<template>
  <div
    class="api-playground my-8 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm"
  >
    <!-- Header -->
    <div
      class="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50"
    >
      <!-- VERSION_DEBUG_MARKER -->
      <div class="flex items-center gap-2 mb-1">
        <UBadge
          :color="
            method === 'GET'
              ? 'primary'
              : method === 'POST'
                ? 'emerald'
                : method === 'DELETE'
                  ? 'red'
                  : 'orange'
          "
          variant="solid"
          size="sm"
          class="font-mono"
        >
          {{ method }}
        </UBadge>
        <code
          class="text-sm font-mono text-gray-700 dark:text-gray-300 break-all"
          >{{ processedUrl }}</code
        >
      </div>
      <p
        v-if="description"
        class="text-sm text-gray-500 dark:text-gray-400 mt-2"
      >
        {{ description }}
      </p>
    </div>

    <div
      class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-800"
    >
      <!-- Left Panel: Config & Info -->
      <div class="p-4 space-y-6">
        <!-- Variables Section -->
        <div v-if="Object.keys(variables || {}).length > 0">
          <h4
            class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"
          >
            Variables
          </h4>
          <div class="space-y-3">
            <div v-for="(value, key) in variables" :key="key" class="mb-3">
              <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{{ key }}</label>
              <UInput
                :model-value="value"
                readonly
                variant="outline"
                color="gray"
                icon="i-heroicons-variable"
              />
            </div>
          </div>
        </div>

        <!-- Request Body Preview -->
        <div v-if="body">
          <h4
            class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"
          >
            Request Body
          </h4>
          <div
            class="bg-gray-50 dark:bg-gray-950 p-3 rounded border border-gray-200 dark:border-gray-800"
          >
            <pre
              class="text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap"
              >{{ JSON.stringify(processedBody, null, 2) }}</pre
            >
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-4">
          <UButton
            block
            size="lg"
            :loading="loading"
            icon="i-heroicons-play"
            @click="executeRequest"
          >
            Execute Request
          </UButton>
          <p class="text-[10px] text-gray-400 mt-2 text-center italic">
            Note: Requests are made directly from your browser. Cross-Origin
            Resource Sharing (CORS) must be enabled on the API.
          </p>
        </div>
      </div>

      <!-- Right Panel: Code & Response -->
      <div class="bg-gray-50 dark:bg-gray-950 flex flex-col min-h-[400px]">
        <!-- Code Snippets -->
        <div class="flex-1 flex flex-col">
          <div
            class="border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between"
          >
            <div class="flex gap-2">
              <button
                v-for="(lang, index) in languages"
                :key="lang.label"
                class="px-3 py-1 text-xs font-medium rounded transition-colors"
                :class="
                  activeTab === index
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                "
                @click="activeTab = index"
              >
                {{ lang.label }}
              </button>
            </div>
            <UButton
              size="2xs"
              variant="ghost"
              color="gray"
              :icon="copied ? 'i-heroicons-check' : 'i-heroicons-clipboard'"
              @click="copyToClipboard"
            >
              {{ copied ? "Copied!" : "Copy" }}
            </UButton>
          </div>
          <div class="p-4 flex-1 overflow-auto bg-[#0d1117]">
             <!-- We use v-html for syntax highlighted code (safe here as it's generated code) -->
            <pre class="text-xs font-mono h-full text-gray-300"><code v-html="highlightedSnippet"></code></pre>
          </div>
        </div>

        <!-- Response Area -->
        <div
          v-if="response || error"
          class="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900"
        >
          <div class="flex items-center justify-between mb-3">
            <h4
              class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            >
              Response
            </h4>
            <div v-if="response" class="flex gap-2">
              <UBadge
                :color="response.status < 300 ? 'emerald' : 'red'"
                size="xs"
              >
                {{ response.status }} {{ response.statusText }}
              </UBadge>
              <UBadge color="gray" size="xs">{{ response.duration }}</UBadge>
            </div>
          </div>

          <div v-if="error">
            <UAlert
              icon="i-heroicons-exclamation-triangle"
              color="red"
              variant="soft"
              :title="error"
            />
          </div>

          <div v-if="response" class="space-y-4">
            <!-- Headers -->
            <details class="text-[11px]">
              <summary
                class="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
              >
                Headers
              </summary>
              <div
                class="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-gray-600 dark:text-gray-400"
              >
                <template v-for="(val, key) in response.headers" :key="key">
                  <div class="font-semibold">{{ key }}:</div>
                  <div class="truncate">{{ val }}</div>
                </template>
              </div>
            </details>

            <!-- Body -->
            <div
              class="bg-[#0d1117] p-3 rounded border border-gray-200 dark:border-gray-800 max-h-[300px] overflow-auto"
            >
              <pre
                class="text-xs font-mono text-gray-300 whitespace-pre-wrap"
                v-html="formattedResponseBody"
              ></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Import Highlight.js styles - docus might handle this differently, but for component isolation we can do this or use global */
/* We already imported the css in script setup */

.api-playground pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Custom scrollbar for small code blocks */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #8884;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #8886;
}
</style>
