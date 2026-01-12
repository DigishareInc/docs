export default defineAppConfig({
  docus: {
    title: "Digishare",
    description: "The Official Digishare Platform Documentation",
    image:
      "https://digishare.ma/wp-content/uploads/2023/09/cropped-favicon-192x192.png",
    socials: {
      website: {
        label: "Website",
        icon: "i-lucide-globe",
        href: "https://digishare.ma",
      },
    },
    header: {
      logo: true,
      showLinkIcon: true,
      exclude: [],
    },
    aside: {
      level: 0,
      collapsed: false,
      exclude: [],
    },
    main: {
      padded: true,
      fluid: true,
    },
    footer: {
      credits: {
        icon: "i-lucide-copyright",
        text: "Digishare 2025",
        href: "https://digishare.ma",
      },
    },
  },
  ui: {
    primary: "emerald",
    gray: "slate",
  },
});
