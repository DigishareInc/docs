export default defineNuxtConfig({
  // @ts-ignore
  extends: ["docus"], // Extended from Docus framework (reloading v4)
  // future: {
  //   compatibilityVersion: 5,
  // },
  modules: ["@nuxtjs/i18n", "@nuxt/ui"],
  i18n: {
    langDir: "locales",
    locales: [
      { code: "en", name: "English", language: "en-US", file: "en.json" },
      { code: "fr", name: "Français", language: "fr-FR", file: "fr.json" },
    ],
    defaultLocale: "en",
    strategy: "prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
  },
  compatibilityDate: "2026-01-13",
  css: ["~/assets/css/main.css"],
  content: {
    // @ts-ignore
    documentDriven: true,
  },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || "/",
  },
  nitro: {
    preset: "github_pages",
  },
  hooks: {
    // i18n leaves Docus's optional :lang in its routes, so /en/:lang? swallows /en/use-cases and shows a 404.
    "pages:resolved"(pages) {
      for (const page of pages) {
        page.path = page.path.replace("/:lang?/:slug(.*)*", "/:slug(.*)+").replace("/:lang?", "");
      }
    },
  },
  robots: {
    robotsTxt: false,
  },
  llms: {
    domain: "https://digishareinc.github.io",
  },
});
