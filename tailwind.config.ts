import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  corePlugins: {
    preflight: false
  },
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg_color: "var(--el-bg-color)",
        primary: "var(--el-color-primary)",
        text_color_primary: "var(--el-text-color-primary)",
        text_color_regular: "var(--el-text-color-regular)"
      },
      maxWidth: {
        ac: "220px", // AutoComplete宽度
        dt: "150px" // AutoComplete宽度
      }
    }
  }
} satisfies Config;
