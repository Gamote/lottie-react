const themeOptions = require("gatsby-theme-apollo-docs/theme-options");

module.exports = {
  pathPrefix: "/docs",
  siteMetadata: {
    title: "Lottie React",
    siteName: "Lottie React",
    description: "Documentation for Lottie React",
    author: "David Gamote",
  },
  plugins: [
    {
      resolve: "gatsby-theme-apollo-docs",
      options: {
        root: __dirname,
        algoliaApiKey: "e25f973ac1ed8a3aa10bc052b4524c55",
        algoliaIndexName: "lottie-react",
        baseUrl: "https://lottiereact.com",
        // spectrumPath: "/", // TODO: find out what's this for
        sidebarCategories: {
          null: ["index", "installation", "getting-started"],
          Guides: ["guides/from-zero"],
          "API Reference": ["api/use-lottie", "api/lottie"],
          Examples: ["examples/simple"],
        },
        githubRepo: "Gamote/lottie-react",
        defaultVersion: "master",
        logoLink: "http://npmjs.com", // TODO: change this + the logo image
        baseDir: "docs",
        contentDir: "src/content",
        navConfig: {
          // TODO: change this
          "Cat Link": {
            category: "Cat 1",
            url: "https://link.com/docs",
            description: "Long description for this link right here",
            omitLandingPage: true,
          },
          "Demo Link": {
            category: "New stuff",
            shortName: "DML",
            url: "https://link.com/docs",
            description: "Long description for this link right here",
          },
          "Client Link": {
            category: "Client",
            shortName: "CLL",
            url: "https://link.com/docs",
            description: "Long description for this link right here",
          },
          "Client 2nd Link": {
            category: "Client",
            shortName: "CL2L",
            url: "https://link.com/docs",
            description: "Long description for this link right here",
          },
        },
        footerNavConfig: {
          // TODO: change this
          Blog: {
            href: "https://blog.com/",
            target: "_blank",
            rel: "noopener noreferrer",
          },
          Contribute: {
            href: "https://www.github.com/Gamote/lottie-react",
          },
          NPM: {
            href: "https://www.npmjs.com/Gamote/lottie-react",
          },
        },
      },
    },
    // {
    //   resolve: `gatsby-plugin-mdx`,
    //   options: {
    //     defaultLayouts: {
    //       default: require.resolve("./src/Layout.tsx"),
    //     },
    //   },
    // },
  ],
};
