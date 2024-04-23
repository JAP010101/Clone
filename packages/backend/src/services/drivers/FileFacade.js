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
const { AdvancedBase } = require("@heyputer/puter-js-common");
const { Context } = require("../../util/context");
const { MultiValue } = require("../../util/multivalue");
const { stream_to_buffer } = require("../../util/streamutil");
const { PassThrough } = require("stream");

/**
 * FileFacade
 *
 * This class is used to provide a unified interface for
 * passing files through the Puter Driver API, and avoiding
 * unnecessary work such as downloading the file from S3
 * (when a Puter file is specified) in case the underlying
 * implementation can accept S3 bucket information instead
 * of the file's contents.
 *
 *
 */
class FileFacade extends AdvancedBase {
    static OUT_TYPES = {
        S3_INFO: { key: 's3-info' },
        STREAM: { key: 'stream' },
    }

    static MODULES = {
        axios: require('axios'),
    }

    constructor (...a) {
        super(...a);

        this.values = new MultiValue();

        this.values.add_factory('fs-node', 'uid', async uid => {
            const context = Context.get();
            const services = context.get('services');
            const svc_filesystem = services.get('filesystem');
            const fsNode = await svc_filesystem.node({ uid });
            return fsNode;
        });

        this.values.add_factory('fs-node', 'path', async path => {
            const context = Context.get();
            const services = context.get('services');
            const svc_filesystem = services.get('filesystem');
            const fsNode = await svc_filesystem.node({ path });
            return fsNode;
        });

        this.values.add_factory('s3-info', 'fs-node', async fsNode => {
            try {
                return await fsNode.get('s3:location');
            } catch (e) {
                return null;
            }
        });

        this.values.add_factory('stream', 'fs-node', async fsNode => {
            if ( ! await fsNode.exists() ) return null;

            const context = Context.get();
            const services = context.get('services');
            const svc_filesystem = services.get('filesystem');

            const dst_stream = new PassThrough();

            svc_filesystem.read(context, dst_stream, {
                fsNode,
                user: context.get('user'),
            });

            return dst_stream;
        });

        this.values.add_factory('stream', 'web_url', async web_url => {
            const response = await FileFacade.MODULES.axios.get(web_url, {
                responseType: 'stream',
            });

            return response.data;
        });

        this.values.add_factory('stream', 'data_url', async data_url => {
            const data = data_url.split(',')[1];
            const buffer = Buffer.from(data, 'base64');
            const stream = new PassThrough();
            stream.end(buffer);
            return stream;
        });

        this.values.add_factory('buffer', 'stream', async stream => {
            return await stream_to_buffer(stream);
        });
    }

    set (k, v) { this.values.set(k, v); }
    get (k) { return this.values.get(k); }


}

module.exports = {
    FileFacade,
};
