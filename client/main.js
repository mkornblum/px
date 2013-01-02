Clients = new Meteor.Collection('clients');

function calculatePx(){
  var viewportWidth = document.documentElement.clientWidth;
  var viewportHeight = document.documentElement.clientHeight;
  return viewportWidth * viewportHeight;
}

function updateClientPx(){
  clientPx = calculatePx();
  Clients.update({_id: clientId}, {px: clientPx});
}

var clientPx = calculatePx();
var clientId = Clients.insert({px: clientPx});

Meteor.render(function(){
  Template.hello.count = function () {
    return Clients.findOne({_id: clientId}).px
  };

  Template.hello.allCount = function(){
    clients = Clients.find().map(function(client){
      return client.px;
    });

    return clients.reduce(function(a, b){
      return a + b;
    });
  };
});

window.onresize = function() {
  updateClientPx();
}
