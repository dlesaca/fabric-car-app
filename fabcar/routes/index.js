'use strict';
/*
 * Hyperledger Fabric Sample Query Program
 */
var express = require('express');
var router = express.Router();
var hfc = require('fabric-client');
var path = require('path');
var options = require('./options')
var channel = {};
var client = null;

/* GET home page. */
router.get('/', function(req, res, next) {
  var data;
  Promise.resolve().then(() => {
      console.log("Create a client and set the wallet location");
      client = new hfc();
      return hfc.newDefaultKeyValueStore({ path: options.wallet_path });
  }).then((wallet) => {
      console.log("Set wallet path, and associate user ", options.user_id, " with application");
      client.setStateStore(wallet);
      return client.getUserContext(options.user_id, true);
  }).then((user) => {
      console.log("Check user is enrolled, and set a query URL in the network");
      if (user === undefined || user.isEnrolled() === false) {
          console.error("User not defined, or not enrolled - error");
      }
      channel = client.newChannel(options.channel_id);
      channel.addPeer(client.newPeer(options.network_url));
      return;
  }).then(() => {
      console.log("Make query");
      var transaction_id = client.newTransactionID();
      console.log("Assigning transaction_id: ", transaction_id._transaction_id);

      // queryCar - requires 1 argument, ex: args: ['CAR4'],
      // queryAllCars - requires no arguments , ex: args: [''],
      const request = {
        chaincodeId: options.chaincode_id,
        txId: transaction_id,
        fcn: 'queryAllCars',
        args: ['']
      };

      // console.log("Query is:" + req.query.car);
      return channel.queryByChaincode(request);
  }).then((query_responses) => {
      console.log("returned from query");
      if (!query_responses.length) {
          console.log("No payloads were returned from query");
      } else {
          console.log("Query result count = ", query_responses.length)
      }
      if (query_responses[0] instanceof Error) {
          console.error("error from query = ", query_responses[0]);
      }
      console.log(query_responses[0].toString());

      var data = query_responses[0].toString();

      // res.render('index', { data: data });
      res.setHeader('Content-Type', 'application/json');
      res.json({ data: data });
  }).catch((err) => {
      console.error("Caught Error", err);
  });
});

router.get('/:car', function(req, res, next) {
  var data;
  Promise.resolve().then(() => {
      console.log("Create a client and set the wallet location");
      client = new hfc();
      return hfc.newDefaultKeyValueStore({ path: options.wallet_path });
  }).then((wallet) => {
      console.log("Set wallet path, and associate user ", options.user_id, " with application");
      client.setStateStore(wallet);
      return client.getUserContext(options.user_id, true);
  }).then((user) => {
      console.log("Check user is enrolled, and set a query URL in the network");
      if (user === undefined || user.isEnrolled() === false) {
          console.error("User not defined, or not enrolled - error");
      }
      channel = client.newChannel(options.channel_id);
      channel.addPeer(client.newPeer(options.network_url));
      return;
  }).then(() => {
      console.log("Make query");
      var transaction_id = client.newTransactionID();
      console.log("Assigning transaction_id: ", transaction_id._transaction_id);

      // queryCar - requires 1 argument, ex: args: ['CAR4'],
      // queryAllCars - requires no arguments , ex: args: [''],
      const request = {
          chaincodeId: options.chaincode_id,
          txId: transaction_id,
          fcn: 'queryCar',
          args: [req.params.car]
      };

      console.log('QUERY' + req.params.car)

      return channel.queryByChaincode(request);
  }).then((query_responses) => {
      console.log("returned from query");
      if (!query_responses.length) {
          console.log("No payloads were returned from query");
      } else {
          console.log("Query result count = ", query_responses.length)
      }
      if (query_responses[0] instanceof Error) {
          console.error("error from query = ", query_responses[0]);
      }
      console.log(query_responses[0].toString());

      var data = query_responses[0].toString();

      res.setHeader('Content-Type', 'application/json');
      res.json(data);
      // res.render('index', { data: data });
  }).catch((err) => {
      console.error("Caught Error", err);
  });
});

module.exports = router;
