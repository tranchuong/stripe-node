'use strict';

var StripeResource = require('../StripeResource');
var stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({

  path: 'disputes',

  includeBasic: [
    'list', 'retrieve', 'update',
    'setMetadata', 'getMetadata', 'autoPaginateEach',
  ],

  close: stripeMethod({
    method: 'POST',
    path: '/{id}/close',
    urlParams: ['id'],
  }),

});
