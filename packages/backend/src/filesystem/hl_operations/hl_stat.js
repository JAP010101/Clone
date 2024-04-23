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
const { chkperm } = require("../../helpers");
const { Context } = require("../../util/context");
const { HLFilesystemOperation } = require("./definitions");

class HLStat extends HLFilesystemOperation {
    static MODULES = {
        ['mime-types']: require('mime-types'),
    }

    async _run () {
        const {
            subject, user,
            return_subdomains,
            return_permissions,
            return_versions,
            return_size,
        } = this.values;

        await subject.fetchEntry();

        // file not found
        if( ! subject.found ) throw APIError.create('subject_does_not_exist');

        await subject.fetchOwner();

        const context = Context.get();
        const svc_acl = context.get('services').get('acl');
        const actor = context.get('actor');
        if ( ! await svc_acl.check(actor, subject, 'read') ) {
            throw await svc_acl.get_safe_acl_error(actor, subject, 'read');
        }

        // check permission
        // TODO: this check is redundant now that ACL is used;
        //   we will need to remove it to implement user-user permissions
        if(user && !await chkperm(subject.entry, user.id, 'stat')){
            throw { code:`forbidden`, message: `permission denied.`};
        }

        // TODO: why is this specific to stat?
        const mime = this.require('mime-types');
        const contentType = mime.contentType(subject.entry.name)
        subject.entry.type = contentType ? contentType : null;

        if (return_size) await subject.fetchSize(user);
        if (return_subdomains) await subject.fetchSubdomains(user)
        if (return_permissions) await subject.fetchShares();
        if (return_versions) await subject.fetchVersions();

        await subject.fetchIsEmpty();

        return await subject.getSafeEntry();
    }
}

module.exports = {
    HLStat
};
