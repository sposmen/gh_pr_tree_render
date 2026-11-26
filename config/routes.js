/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

const path = require('path');
const serveApp = (req, res) => res.sendFile(path.resolve(__dirname, '../.tmp/public/index.html'));

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  'GET /': serveApp,
  'GET /config': serveApp,
  'GET /tree': serveApp,
  'GET /tree/*': serveApp,
  'GET /api/v1/tree': { action: 'owners/list' },
  'GET /api/v1/tree/:owner': { action: 'owners/repos' },
  'GET /api/v1/tree/:owner/:repo': { action: 'tree/index' },
  'POST /api/v1/tree/:owner/:repo/refresh': { action: 'tree/refresh' },


  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
