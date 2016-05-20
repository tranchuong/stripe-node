'use strict';

var StripeResource = require('../StripeResource');
var stripeMethod = StripeResource.method;

module.exports = StripeResource.extend({

  path: 'subscriptions',
  includeBasic: ['create', 'list', 'retrieve', 'update', 'del', 'autoPaginateEach',],

  /**
   * Subscription: Discount methods
   */

  deleteDiscount: stripeMethod({
    method: 'DELETE',
    path: '/{subscriptionId}/discount',
    urlParams: ['subscriptionId'],
  }),
});
