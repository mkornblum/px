Clients = new Meteor.Collection("clients");

Clients.allow({
  insert: function(){
    return false;
  },
  update: function(){
    return true;
  },
  remove: function(){
    return true
  }
});
