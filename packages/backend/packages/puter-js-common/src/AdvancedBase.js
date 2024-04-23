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
// This doesn't go in ./bases because it logically depends on
// both ./bases and ./traits, and ./traits depends on ./bases.

const { TraitBase } = require("./bases/TraitBase");

class AdvancedBase extends TraitBase {
    static TRAITS = [
        require('./traits/NodeModuleDITrait'),
        require('./traits/PropertiesTrait'),
    ]
}

module.exports = {
    AdvancedBase,
};
