/*
 * Copyright (C) 2024 Puter Technologies Inc.
 *
 * This file is part of Puter.
 *
 * Puter is free software: you can redistribute it and/or modify
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
const { BaseES } = require("./BaseES");

class MaxLimitES extends BaseES {
    static METHODS = {
        async select (options) {
            let limit = options.limit;

            // `limit` is numeric but a value of 0 doesn't make sense,
            // so we can treat 0 and undefined as the same case.
            if ( ! limit ) {
                limit = this.max;
            }

            if ( limit > this.max ) {
                limit = this.max;
            }

            options.limit = limit;

            console.log('SELECT options (1)', options);

            return await this.upstream.select(options);
        }
    };
}

module.exports = {
    MaxLimitES,
};
