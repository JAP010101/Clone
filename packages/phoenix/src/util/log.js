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
export class Log {
    static log (...items) {
        items = items.map(this.toString);
        console.log(...items);
    }

    static toString (item) {
        if ( item instanceof Uint8Array ) {
            return [...item]
                .map(x => x.toString(16).padStart(2, '0'))
                .join(' ');
        }

        return item;
    }
}
