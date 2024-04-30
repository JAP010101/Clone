import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,

    {
        // Global ignores
        ignores: [
            "**/*.min.js",
            "**/src/lib/**",
            "**/dist/",
            "packages/backend/src/public/assets/**",
        ],
    },
    {
        // Top-level and tools use Node
        files: [
            "tools/**/*.js",
        ],
        languageOptions: {
            globals: {
                ...globals.node,
            }
        }
    },
    {
        // Back end
        files: [
            "packages/backend/**/*.js",
            "dev-server.js",
            "utils.js",
        ],
        languageOptions: {
            globals: {
                ...globals.node,
                "kv": true,
            }
        }
    },
    {
        // Front end
        files: [
            "index.js",
            "initgui.js",
            "src/**/*.js",
            "packages/**/*.js",
        ],
        ignores: [
            "packages/backend/**/*.js",
        ],
        languageOptions: {
            globals: {
                ...globals.browser,
                "puter": true,
                "$": true, // jQuery
                "_": true, // lodash
                "i18n": true,
                "html_encode": true,
                "html_decode": true,
                "isMobile": true,
                "iro": true, // iro.js color picker
            }
        }
    },
    {
        // Tests
        files: [
            "**/test/**/*.js",
        ],
        languageOptions: {
            globals: {
                ...globals.mocha,
            }
        }
    },
    {
        // Phoenix
        files: [
            "packages/phoenix/**/*.js",
        ],
        languageOptions: {
            globals: {
                ...globals.node,
            }
        }
    },
    {
        // Global rule settings
        rules: {
            "no-prototype-builtins": "off", // Complains about any use of hasOwnProperty()
            "no-unused-vars": "off", // Temporary, we just have a lot of these
            "no-debugger": "warn",
        }
    },
];
