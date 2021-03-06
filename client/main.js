Meteor.subscribe('clients');

var clientId;
var clientPx = calculatePx();
var color = d3.scale.category20();
var diameter = 960,
    format = d3.format(",d");

var bubble = d3.layout.pack()
  .sort(null)
  .size([diameter, diameter])
  .padding(1.5);

var tree = d3.layout.treemap()
  .sort(null)
  .size([diameter, diameter])
  .padding(1.5);

var currentLayout = 'bubble';
var keepAliveInterval;

Meteor.startup(function(){
  createClient();
});

Template.hello.count = function () {
  return format(Session.get('clientPx'));
};

Template.hello.allCount = function(){
  return format(Session.get('totalPx'));
};

function createClient(){
  Meteor.clearInterval(keepAliveInterval);
  clientId = Meteor.call('createClient', clientPx, createdSuccess);
}

function watch(){
  updateClientPx();

  Meteor.autorun(function(){
    Clients.find({}).observe({
      added: function(doc, index){
        var totalPx = calculateTotalPx();
        Session.set('totalPx', totalPx);
      },
      changed: function(newDoc, index, oldDoc){
        var totalPx = calculateTotalPx();
        Session.set('totalPx', totalPx);
      },
      removed: function(doc, index){
        if(doc._id == clientId){
          createClient();
        }
        var totalPx = calculateTotalPx();
        Session.set('totalPx', totalPx);
      }
    });
  });
}

function changeLayout(){
  currentLayout = this.value;
  $('.viz').toggleClass('squares');
  $('svg').empty();
  calculateTotalPx();
}

function calculateTotalPx(){

  var clientPxCollection = Clients.find({}).map(function(client){
    return {
      value: client.clientPx,
      currentClient: client._id == clientId
    };
  });

  var containerWidth = $('.viz').width();
  var visibleHeight = $(window).height() * .90;

  return LayoutMap[currentLayout](clientPxCollection, containerWidth, visibleHeight);
}

function createdSuccess(error, result){
  if(!error){
    clientId = result;
    Session.set('clientId', clientId);

    keepAliveInterval = Meteor.setInterval(function(){
      keepAlive();
    }, 2000);

    d3.selectAll(".layout-selector").on("change", changeLayout);
    watch();
  }
}

function keepAlive(){
  var clients = Clients.find({_id: clientId}).fetch();
  if(clients.length > 0){
    Meteor.call('keepalive', clientId);
  }
  else{
    createClient();
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
