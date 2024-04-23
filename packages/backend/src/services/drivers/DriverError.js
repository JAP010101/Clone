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
class DriverError {
    static create (source) {
        return new DriverError({ source });
    }
    constructor ({ source, message }) {
        this.source = source;
        this.message = source?.message || message;
    }

    serialize () {
        return {
            $: 'heyputer:api/DriverError',
            message: this.message,
        };
    }
}

module.exports = {
    DriverError
};
