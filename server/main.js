Meteor.publish("clients", function() {
  return Clients.find({}, {fields: {clientPx: 1}});
});

Meteor.methods({
  keepalive: function(clientId){
    Clients.update({_id: clientId},
                   {$set: {last_seen: (new Date()).getTime()}},
                   function(e){});
  },

  createClient: function(px) {
    if(!px)
      throw new Meteor.Error(400, 'You need some px to create a client record');

    return Clients.insert({
      clientPx: px,
      last_seen: (new Date()).getTime()
    });
  }
});

function cleanOldClients(){
  var now = (new Date()).getTime();
  var remove_threshold = now - 3000;
  Clients.remove({$or : [{last_seen: {$lt: remove_threshold}}, {last_seen : null}]});
}

Meteor.setInterval(cleanOldClients, 1000);
