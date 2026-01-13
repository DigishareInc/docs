export default defineNuxtConfig({
  // @ts-ignore
  extends: ['docus'],
  css: ['~/assets/css/main.css'],
  content: {
    // @ts-ignore
    documentDriven: true
  },
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/docs/' : '/'
  },
  nitro: {
    preset: 'github_pages'
  },
  robots: {
    robotsTxt: false
  },
  llms: {
    domain: 'https://digishareinc.github.io/docs'
  }
})
