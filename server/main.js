Meteor.publish("clients", function() {
  return Clients.find({}, {fields: {clientPx: 1}});
});

Meteor.methods({
  keepalive: function(clientId){
    Clients.update({_id: clientId},
                   {$set: {last_seen: (new Date()).getTime()}});
  },

  createClient: function(px, callback) {
    if(!px)
      throw new Meteor.Error(400, 'You need some px to create a client record');

    return Clients.insert({clientPx: px});
  }
});

Meteor.setInterval(function(){
  var now = (new Date()).getTime();
  var remove_threshold = now - 3000;
  Clients.remove({last_seen: {$lt: remove_threshold}});
}, 3000);
