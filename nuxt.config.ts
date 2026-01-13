export default defineNuxtConfig({
  // @ts-ignore
  extends: ["docus"],
  future: {
    compatibilityVersion: 5,
  },
  compatibilityDate: "2026-01-13",
  css: ["~/assets/css/main.css"],
  content: {
    // @ts-ignore
    documentDriven: true,
  },
  app: {
    baseURL: process.env.NODE_ENV === "production" ? "/" : "/",
  },
  nitro: {
    preset: "github_pages",
  },
  robots: {
    robotsTxt: false,
  },
  llms: {
    domain: "https://digishareinc.github.io",
  },
});
