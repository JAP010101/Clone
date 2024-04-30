/*
 * Copyright (C) 2024 Puter Technologies Inc.
 *
 * This file is part of Puter.
 *
 * Puter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use strict"
const express = require('express');
const config = require('../config');
const router = express.Router();
const _path = require('path');
const _fs = require('fs');
const auth = require('../middleware/auth.js');
const { generate_puter_page_html } = require('../temp/puter_page_loader');
const { Context } = require('../util/context');
const { DB_READ } = require('../services/database/consts');

let auth_user;

// -----------------------------------------------------------------------//
// All other requests
// -----------------------------------------------------------------------//
router.all('*', async function(req, res, next) {
    const subdomain = req.hostname.slice(0, -1 * (config.domain.length + 1));
    let path = req.params[0] ? req.params[0] : 'index.html';

    // --------------------------------------
    // API
    // --------------------------------------
    if( subdomain === 'api'){
        return next();
    }
    // --------------------------------------
    // cloud.js must be accessible globally regardless of subdomain
    // --------------------------------------
    else if (path === '/cloud.js') {
        return res.sendFile(_path.join(__dirname, '../../puter.js/alpha.js'), function (err) {
            if (err && err.statusCode) {
                return res.status(err.statusCode).send('Error /cloud.js')
            }
        });
    }
    // --------------------------------------
    // /puter.js/v1 must be accessible globally regardless of subdomain
    // --------------------------------------
    else if (path === '/puter.js/v1' || path === '/puter.js/v1/') {
        return res.sendFile(_path.join(__dirname, '../../puter.js/v1.js'), function (err) {
            if (err && err.statusCode) {
                return res.status(err.statusCode).send('Error /puter.js')
            }
        });
    }
    else if (path === '/puter.js/v2' || path === '/puter.js/v2/') {
        return res.sendFile(_path.join(__dirname, '../../puter.js/v2.js'), function (err) {
            if (err && err.statusCode) {
                return res.status(err.statusCode).send('Error /puter.js')
            }
        });
    }
    // --------------------------------------
    // https://js.[domain]/v1/
    // --------------------------------------
    else if( subdomain === 'js'){
        if (path === '/v1' || path === '/v1/') {
            return res.sendFile(_path.join(__dirname, '../../puter.js/v1.js'), function (err) {
                if (err && err.statusCode) {
                    return res.status(err.statusCode).send('Error /puter.js')
                }
            });
        }
        if (path === '/v2' || path === '/v2/') {
            return res.sendFile(_path.join(__dirname, '../../puter.js/v2.js'), function (err) {
                if (err && err.statusCode) {
                    return res.status(err.statusCode).send('Error /puter.js')
                }
            });
        }
    }

    const db = Context.get('services').get('database').get(DB_READ, 'default');

    // --------------------------------------
    // POST to login/signup/logout
    // --------------------------------------
    if( subdomain === '' && req.method === 'POST' &&
        (
            path === '/login' ||
            path === '/signup' ||
            path === '/logout' ||
            path === '/send-pass-recovery-email' ||
            path === '/set-pass-using-token'
        )
    ){
        return next();
    }
    // --------------------------------------
    // No subdomain: either GUI or landing pages
    // --------------------------------------
    else if( subdomain === ''){
        // auth
        const {jwt_auth, get_app, invalidate_cached_user} = require('../helpers');
        let authed = false;
        try{
            try{
                auth_user = await jwt_auth(req);
                auth_user = auth_user.user;
                authed = true;
            }catch(e){
                authed = false;
            }
        }
        catch(e){
            authed = false;
        }

        if(path === '/robots.txt'){
            res.set('Content-Type', 'text/plain');
            let r = ``;
            r += `User-agent: AhrefsBot\nDisallow:/\n\n`;
            r += `User-agent: BLEXBot\nDisallow: /\n\n`;
            r += `User-agent: DotBot\nDisallow: /\n\n`;
            r += `User-agent: ia_archiver\nDisallow: /\n\n`;
            r += `User-agent: MJ12bot\nDisallow: /\n\n`;
            r += `User-agent: SearchmetricsBot\nDisallow: /\n\n`;
            r += `User-agent: SemrushBot\nDisallow: /\n\n`;
            // sitemap
            r += `\nSitemap: ${config.protocol}://${config.domain}/sitemap.xml\n`;
            return res.send(r);
        }
        else if(path === '/sitemap.xml'){
            let h = ``;
            h += `<?xml version="1.0" encoding="UTF-8"?>`;
            h += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

            // docs
            h += `<url>`;
                h += `<loc>${config.protocol}://docs.${config.domain}/</loc>`;
            h += `</url>`;

            // apps
            // TODO: use service for app discovery
            let apps = await db.read( `SELECT * FROM apps WHERE approved_for_listing = 1`);
            if(apps.length > 0){
                for(let i=0; i<apps.length; i++){
                    const app = apps[i];
                    h += `<url>`;
                        h += `<loc>${config.protocol}://${config.domain}/app/${app.name}</loc>`;
                    h += `</url>`;
                }
            }
            h += `</urlset>`;
            res.set('Content-Type', 'application/xml');
            return res.send(h);
        }
        else if(path === '/unsubscribe'){
            let h = `<body style="display:flex; flex-direction: column; justify-content: center; height: 100vh;">`;
            if(req.query.user_uuid === undefined)
                h += '<p style="text-align:center; color:red;">user_uuid is required</p>';
            else{
                // modules
                const {get_user} = require('../helpers')

                // get user
                const user = await get_user({uuid: req.query.user_uuid})

                // more validation
                if(!user)
                    h += '<p style="text-align:center; color:red;">User not found.</p>';
                else if(user.unsubscribed === 1)
                    h += '<p style="text-align:center; color:green;">You are already unsubscribed.</p>';
                // mark user as confirmed
                else{
                    await db.write(
                        "UPDATE `user` SET `unsubscribed` = 1 WHERE id = ?",
                        [user.id]
                    );

                    invalidate_cached_user(user);

                    // return results
                    h += `<p style="text-align:center; color:green;">Your have successfully unsubscribed from all emails.</p>`;
                }
            }

            h += `</body>`;
            res.send(h);
        }
        else if(path === '/confirm-email-by-token'){
            let h = `<body style="display:flex; flex-direction: column; justify-content: center; height: 100vh;">`;
            if(req.query.user_uuid === undefined)
                h += '<p style="text-align:center; color:red;">user_uuid is required</p>';
            else if(req.query.token === undefined)
                h += '<p style="text-align:center; color:red;">token is required</p>';
            else{
                // modules
                const {get_user} = require('../helpers')

                // get user
                const user = await get_user({uuid: req.query.user_uuid})

                // more validation
                if(user === undefined || user === null || user === false)
                    h += '<p style="text-align:center; color:red;">user not found.</p>';
                else if(user.email_confirmed === 1)
                    h += '<p style="text-align:center; color:green;">Email already confirmed.</p>';
                else if(user.email_confirm_token !== req.query.token)
                    h += '<p style="text-align:center; color:red;">invalid token.</p>';
                // mark user as confirmed
                else{
                    await db.write(
                        "UPDATE `user` SET `email_confirmed` = 1, `requires_email_confirmation` = 0 WHERE id = ?",
                        [user.id]
                    );
                    invalidate_cached_user(user);

                    // send realtime success msg to client
                    let socketio = require('../socketio.js').getio();
                    if(socketio){
                        socketio.to(user.id).emit('user.email_confirmed', {})
                    }

                    // return results
                    h += `<p style="text-align:center; color:green;">Your email has been successfully confirmed.</p>`;

                    const svc_referralCode = Context.get('services').get('referral-code');
                    svc_referralCode.on_verified(user);
                }
            }

            h += `</body>`;
            res.send(h);
        }
        // ------------------------
        // /assets/
        // ------------------------
        else if (path.startsWith('/assets/')) {
            return res.sendFile(path, { root: __dirname + '../../public' }, function (err) {
                if (err && err.statusCode) {
                    return res.status(err.statusCode).send('Error /public/')
                }
            });
        }
        // ------------------------
        // GUI
        // ------------------------
        else{
            let canonical_url = config.origin + path;
            let app_name, app_title, description;

            // default title
            app_title = config.title;

            // /action/
            if(path.startsWith('/action/')){
                path = '/';
            }
            // /app/
            else if(path.startsWith('/app/')){
                app_name = path.replace('/app/', '');
                const app = await get_app({name: app_name});
                if(app){
                    app_title = app.title;
                    description = app.description;
                }
                // 404 - Not found!
                else if(app_name){
                    app_title = app_name.charAt(0).toUpperCase() + app_name.slice(1);
                    res.status(404);
                }

                path = '/';
            }

            const manifest =
                _fs.existsSync(_path.join(config.assets.gui, 'puter-gui.json'))
                    ? (() => {
                        const text = _fs.readFileSync(_path.join(config.assets.gui, 'puter-gui.json'), 'utf8');
                        return JSON.parse(text);
                    })()
                    : {};

            // index.js
            if(path === '/'){
                const APP_ORIGIN = config.origin;
                const API_ORIGIN = config.api_base_url;
                return res.send(generate_puter_page_html({
                    env: config.env,

                    app_origin: APP_ORIGIN,
                    api_origin: API_ORIGIN,
                    use_bundled_gui: config.use_bundled_gui,

                    manifest,
                    gui_path: config.assets.gui,

                    // page meta
                    meta: {
                        title: app_title,
                        description: description || config.short_description,
                        short_description: config.short_description,
                        company: 'Puter Technologies Inc.',
                        canonical_url: canonical_url,
                    },

                    // gui parameters
                    gui_params: {
                        app_name_regex: config.app_name_regex,
                        app_name_max_length: config.app_name_max_length,
                        app_title_max_length: config.app_title_max_length,
                        subdomain_regex: config.subdomain_regex,
                        subdomain_max_length: config.subdomain_max_length,
                        domain: config.domain,
                        protocol: config.protocol,
                        env: config.env,
                        api_base_url: config.api_base_url,
                        thumb_width: config.thumb_width,
                        thumb_height: config.thumb_height,
                        contact_email: config.contact_email,
                        max_fsentry_name_length: config.max_fsentry_name_length,
                        require_email_verification_to_publish_website: config.require_email_verification_to_publish_website,
                        short_description: config.short_description,
                        long_description: config.long_description,
                    },
                }));
            }

            // /dist/...
            else if(path.startsWith('/dist/') || path.startsWith('/src/')){
                path = _path.resolve(path);
                return res.sendFile(path, {root: config.assets.gui}, function(err){
                    if(err && err.statusCode){
                        return res.status(err.statusCode).send('Error /gui/dist/')
                    }
                });
            }

            // All other paths
            else{
                return res.sendFile(path, {root: _path.join(config.assets.gui, 'src')}, function(err){
                    if(err && err.statusCode){
                        return res.status(err.statusCode).send('Error /gui/')
                    }
                });
            }
        }
    }
    // --------------------------------------
    // Native Apps
    // --------------------------------------
    else if(subdomain === 'viewer' || subdomain === 'editor' ||  subdomain === 'about' || subdomain === 'docs' ||
            subdomain === 'player' || subdomain === 'pdf' || subdomain === 'code' || subdomain === 'markus' ||
            subdomain === 'draw' || subdomain === 'camera' || subdomain === 'recorder' ||
            subdomain === 'dev-center' || subdomain === 'terminal'){

        let root = _path.join(__dirname, '../../apps/', subdomain);
        if ( subdomain === 'docs' ) root += '/dist';
        root = _path.normalize(root);

        path = _path.normalize(path);
        const real_path = _path.normalize(_path.join(root, path));

        // Determine if the path is a directory
        // (necessary because otherwise res.sendFile() will HANG!)
        try {
            const is_dir = (await _fs.promises.stat(real_path)).isDirectory();
            if ( is_dir && ! path.endsWith('/') ) {
                // Redirect to directory (use 307 to avoid browser caching)
                path += '/';
                let redirect_url = req.protocol + '://' + req.get('host') + path;

                // We need to add the query string to the redirect URL
                if ( req.query ) {
                    const old_url = req.protocol + '://' + req.get('host') + req.originalUrl;
                    redirect_url += new URL(old_url).search;
                }

                return res.redirect(307, redirect_url);
            }
        } catch (e) {
            console.error(e);
            return res.status(404).send('Not found');
        }

        console.log('sending path', path, 'from', root);
        try {
            return res.sendFile(path, { root }, function(err){
                if(err && err.statusCode){
                    return res.status(err.statusCode).send('Error /apps/')
                }
            });
        } catch (e) {
            console.error('error from sendFile', e);
            return res.status(e.statusCode).send('Error /apps/')
        }
    }
    // --------------------------------------
    // WWW, redirect to root domain
    // --------------------------------------
    else if( subdomain === 'www'){
        console.log('redirecting from www to root domain');
        return res.redirect(config.origin);
    }
    //------------------------------------------
    // User-defined subdomains: *.puter.com
    // redirect to static hosting domain *.puter.site
    //------------------------------------------
    else{
        // replace hostname with static hosting domain and redirect to the same path
        return res.redirect(301, req.protocol + '://' + req.get('host').replace(config.domain, config.static_hosting_domain) + req.originalUrl);
    }
});

module.exports = router