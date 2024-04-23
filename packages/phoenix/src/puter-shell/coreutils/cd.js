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
import { Exit } from './coreutil_lib/exit.js';
import { resolveRelativePath } from '../../util/path.js';

export default {
    name: 'cd',
    usage: 'cd PATH',
    description: 'Change the current directory to PATH.',
    args: {
        $: 'simple-parser',
        allowPositionals: true
    },
    execute: async ctx => {
        // ctx.params to access processed args
        // ctx.args to access raw args
        const { positionals, values } = ctx.locals;
        const { filesystem } = ctx.platform;

        let [ target ] = positionals;
        target = resolveRelativePath(ctx.vars, target);

        const result = await filesystem.readdir(target);

        if ( result.$ === 'error' ) {
            await ctx.externs.err.write('cd: error: ' + result.message + '\n');
            throw new Exit(1);
        }

        ctx.vars.pwd = target;
    }
};
