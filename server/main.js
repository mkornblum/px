Clients = new Meteor.Collection('clients');

Meteor.methods({
  keepalive: function (clientId, clientPx) {
    id = clientId || Clients.insert({px: clientPx});
    Clients.update({_id: id}, {$set: {last_seen: (new Date()).getTime(), px: clientPx}});
    return id;
  }
});

Meteor.setInterval(function(){
  var now = (new Date()).getTime();
  Clients.remove({last_seen: {$lt: (now - 10 * 1000)}});
}, 5000);

Meteor.publish("clients", function() {
  return Clients.find({}, {fields: {px: 1}});
});
