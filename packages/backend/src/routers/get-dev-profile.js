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
"use strict"
const express = require('express');
const config = require('../config.js');
const router = new express.Router();
const auth = require('../middleware/auth.js');

// -----------------------------------------------------------------------// 
// GET /get-dev-profile
// -----------------------------------------------------------------------//
router.get('/get-dev-profile', auth, express.json(), async (req, response, next)=>{
    // check subdomain
    if(require('../helpers').subdomain(req) !== 'api')
        next();

    // check if user is verified
    if((config.strict_email_verification_required || req.user.requires_email_confirmation) && !req.user.email_confirmed)
        return response.status(400).send({code: 'account_is_not_verified', message: 'Account is not verified'});
    
    try{
        // auth
        response.send({
            first_name: req.user.dev_first_name,
            last_name: req.user.dev_last_name,
            approved_for_incentive_program: req.user.dev_approved_for_incentive_program,
            joined_incentive_program: req.user.dev_joined_incentive_program,
            paypal: req.user.dev_paypal,
        });
    }catch(e){
        console.log(e)
        response.status(400).send()
    }
})
module.exports = router