/**
 *  vestigestory.com
 *  (c) Vestige <http://vestigestory.com>
 */

'use strict';

var express = require('express');
var compress = require('compression');
var app = express();

app.use(compress());

app.use(function(req, res, next)
{
    if ((req.url.indexOf('/assets/') === 0) || (req.url.indexOf('/favicon.png') === 0))
    {
        res.setHeader('Cache-Control', 'public, max-age=345600');
        res.setHeader('Expires', new Date(Date.now() + 345600000).toUTCString());
    }

    return next();
});

app.use(express.static(__dirname + '/public'));
app.listen(process.env.PORT || 9000);

console.log('Listening on port ' + (process.env.PORT || 9000) + '...');