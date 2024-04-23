/*
 * Copyright (C) 2024  Puter Technologies Inc.
 *
 * This file is part of Phoenix Shell.
 *
 * Phoenix Shell is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

const configFile = process.env.CONFIG_FILE ?? 'config/dev.js';
await import(`./${configFile}`);

export default {
    input: "src/main_puter.js",
    output: {
        file: "dist/bundle.js",
        format: "iife"
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        copy({
            targets: [
                {
                    src: 'assets/index.html',
                    dest: 'dist',
                    transform: (contents, name) => {
                        return contents.toString().replace('__SDK_URL__',
                            process.env.PUTER_JS_URL ?? globalThis.__CONFIG__.sdk_url);
                    }
                },
                { src: 'assets/shell.html', dest: 'dist' },
                { src: configFile, dest: 'dist', rename: 'config.js' }
            ]
        }),
    ]
}
