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
class BasicBase {
    _get_inheritance_chain () {
        const chain = [];
        let cls = this.constructor;
        while ( cls && cls !== BasicBase ) {
            chain.push(cls);
            cls = cls.__proto__;
        }
        return chain.reverse();
    }

    _get_merged_static_array (key) {
        const chain = this._get_inheritance_chain();
        const values = [];
        for ( const cls of chain ) {
            if ( cls[key] ) {
                values.push(...cls[key]);
            }
        }
        return values;
    }

    _get_merged_static_object (key) {
        const chain = this._get_inheritance_chain();
        const values = {};
        for ( const cls of chain ) {
            if ( cls[key] ) {
                Object.assign(values, cls[key]);
            }
        }
        return values;
    }
}

module.exports = {
    BasicBase,
};