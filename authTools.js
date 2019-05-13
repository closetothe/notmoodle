/* Jamiel Rahi
 * notmoodle
 * GPL 2019
 *
 * Authentication utilities.
 */

'use strict';

module.exports.isNotLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()){
        res.redirect("/");    
    } 
    else {
        next();
    }
};

module.exports.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()){
        next();  
    } else {
        res.redirect("/login");
    }
};