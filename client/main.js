var clientId;
var clientPx = calculatePx();
var Clients = new Meteor.Collection('clients');
Meteor.subscribe('clients');

Meteor.startup(function(){
  keepAlive();
});

Meteor.setInterval(function(){
  keepAlive();
}, 3000);

Template.hello.count = function () {
  return Session.get('clientPx');
};

Template.hello.allCount = function(){
  return Session.get('totalPx');
};

Template.hello.clientId = function(){
  return Session.get('clientId');
}

function keepAlive(){
  updateClientPx();
  updateTotalPx();

  Meteor.call('keepalive', Session.get('clientId'), Session.get('clientPx'), function(error, result){
    Session.set('clientId', result);
  });
}

function calculatePx(){
  var viewportWidth = document.documentElement.clientWidth;
  var viewportHeight = document.documentElement.clientHeight;
  return viewportWidth * viewportHeight;
}

function updateClientPx(){
  clientPx = calculatePx();
  Session.set('clientPx', clientPx);
}

function updateTotalPx(){
  var clients = Clients.find().map(function(client){
    return client.px;
  });

  var total = clients.reduce(function(a, b){
    return a + b;
  });
  Session.set('totalPx', total);
}

window.onresize = function() {
  keepAlive();
}
