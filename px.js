if (Meteor.isClient) {
  Clients = new Meteor.Collection('clients');

  function calculatePx(){
    var viewportWidth = document.documentElement.clientWidth;
    var viewportHeight = document.documentElement.clientHeight;
    return viewportWidth * viewportHeight;
  }

  function updatePx(){
    clientPx = calculatePx();
    Clients.update({_id: clientId}, {px: clientPx});
  }

  var clientPx = calculatePx();

  var clientId = Clients.insert({px: clientPx});

  var count = Meteor.render(function(){
    Template.hello.count = function () {
      return Clients.findOne({_id: clientId}).px
    };
  });

  window.onresize = function() {
      console.log('resize triggered');
      updatePx();
  }
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Clients = new Meteor.Collection('clients');

  });
}
