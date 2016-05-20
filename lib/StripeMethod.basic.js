'use strict';

var _ = require('lodash');
var bluebird = require('bluebird');

var stripeMethod = require('./StripeMethod');
var utils = require('./utils');

var promiseFor = bluebird.method(function(condition, action, value) {
  return !condition(value) ? value : action(value).then(promiseFor.bind(null, condition, action));
});

module.exports = {

  create: stripeMethod({
    method: 'POST',
  }),

  list: stripeMethod({
    method: 'GET',
  }),

  retrieve: stripeMethod({
    method: 'GET',
    path: '/{id}',
    urlParams: ['id'],
  }),

  update: stripeMethod({
    method: 'POST',
    path: '{id}',
    urlParams: ['id'],
  }),

  // Avoid 'delete' keyword in JS
  del: stripeMethod({
    method: 'DELETE',
    path: '{id}',
    urlParams: ['id'],
  }),

  setMetadata: function(id, key, value, auth, cb) {
    var self = this;
    var data = key;
    var isObject = utils.isObject(key);
    // We assume null for an empty object
    var isNull = data === null || (isObject && !Object.keys(data).length);

    // Allow optional passing of auth & cb:
    if ((isNull || isObject) && typeof value == 'string') {
      auth = value;
    } else if (typeof auth != 'string') {
      if (!cb && typeof auth == 'function') {
        cb = auth;
      }
      auth = null;
    }

    var urlData = this.createUrlData();
    var deferred = this.createDeferred(cb);
    var path = this.createFullPath('/' + id, urlData);

    if (isNull) {
      // Reset metadata:
      sendMetadata(null, auth);
    } else if (!isObject) {
      // Set individual metadata property:
      var metadata = {};
      metadata[key] = value;
      sendMetadata(metadata, auth);
    } else {
      // Set entire metadata object after resetting it:
      this._request('POST', path, {
        metadata: null,
      }, auth, {}, function(err, response) {
        if (err) {
          return deferred.reject(err);
        }
        sendMetadata(data, auth);
      });
    }

    function sendMetadata(metadata, auth) {
      self._request('POST', path, {
        metadata: metadata,
      }, auth, {}, function(err, response) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(response.metadata);
        }
      });
    }

    return deferred.promise;
  },

  getMetadata: function(id, auth, cb) {
    if (!cb && typeof auth == 'function') {
      cb = auth;
      auth = null;
    }

    var urlData = this.createUrlData();
    var deferred = this.createDeferred(cb);
    var path = this.createFullPath('/' + id, urlData);

    this._request('GET', path, {}, auth, {}, function(err, response) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(
         response.metadata
        );
      }
    });

    return deferred.promise;
  },

  autoPaginateEach: function(options, auth, onEach) {
    if (!onEach && typeof auth == 'function') {
      onEach = auth;
      auth = null;
    }

    var opts = options || {};

    return promiseFor(function(lastItem) {
      return !_.isNull(lastItem);
    }, function(lastItem) {
      if (typeof lastItem === 'string') {
        opts['starting_after'] = lastItem;
      }

      return this.list(opts).then(function(thing) {
        thing.data.forEach(onEach);

        var last = thing.data[thing.data.length - 1];

        return (last && last.id) ? last.id : null;
      });
    }.bind(this), undefined);
  },
};
