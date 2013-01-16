Meteor.subscribe('clients');

var clientId;
var clientPx = calculatePx();

Meteor.startup(function(){
  clientId = Meteor.call('createClient', clientPx, createdSuccess);
});

Template.hello.count = function () {
  return Session.get('clientPx');
};

Template.hello.allCount = function(){
  return Session.get('totalPx');
};

Template.hello.clientId = function(){
  return Session.get('clientId');
}

function watch(){
  updateClientPx();

  Meteor.autorun(function(){
    Clients.find({}).observe({
      added: function(doc, index){
        var totalPx = calculateTotalPx();
        Session.set('totalPx', totalPx);
        console.log('added');
        console.log(doc);
      },
      changed: function(newDoc, index, oldDoc){
        var totalPx = calculateTotalPx();
        Session.set('totalPx', totalPx);
        console.log('changed');
        console.log(newDoc);
        console.log(oldDoc);
      },
      removed: function(doc, index){
        var totalPx = calculateTotalPx();
        Session.set('totalPx', totalPx);
        console.log('removed');
        console.log(doc);
      }
    });
  });
}

function calculateTotalPx(){
  return Clients.find({}).map(function(client){
    return client.clientPx;
  }).reduce(function(a, b){
    return a+b;
  });
}

function createdSuccess(error, result){
  if(!error){
    clientId = result;
    Session.set('clientId', clientId);

    Meteor.setInterval(function(){
      Meteor.call('keepalive', clientId);
    }, 1500);

    watch();
  }
}

function calculatePx(){
  var viewportWidth = document.documentElement.clientWidth;
  var viewportHeight = document.documentElement.clientHeight;
  return viewportWidth * viewportHeight;
}

function updateClientPx(){
  clientPx = calculatePx();
  Session.set('clientPx', clientPx);
  Clients.update({_id: clientId}, {$set: {clientPx : clientPx}});
}

var handleResize = _.debounce(function(){
  updateClientPx();
}, 500);

window.addEventListener('resize', handleResize, false);
