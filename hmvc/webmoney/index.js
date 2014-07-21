const config = require('config');
const jade = require('jade');
const path = require('path');
var mongoose = require('mongoose');
var Transaction = mongoose.models.Transaction;

var router = require('./router');

exports.middleware = router.middleware();

exports.createTransactionForm = function* (order) {

  var transaction = new Transaction({
    order:       order._id,
    amount:      order.amount,
    paymentType: 'webmoney'
  });

  yield transaction.persist();

  return jade.renderFile(path.join(__dirname, 'template/form.jade'), {
    amount: transaction.amount,
    number: transaction.number,
    purse:  config.webmoney.purse
  });

};
