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

Meteor.startup(function(){
  clientId = Meteor.call('createClient', clientPx, createdSuccess);
});

Template.hello.count = function () {
  return format(Session.get('clientPx'));
};

Template.hello.allCount = function(){
  return format(Session.get('totalPx'));
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

  var clientPxCollection = Clients.find({}).map(function(client){
    return {value: client.clientPx};
  });

  svg = d3.select("svg")
    .selectAll("circle")
    .data(bubble.nodes({children: clientPxCollection}));

  svg.enter()
    .append("circle")
    .attr("r", function(d) { return d.r; })
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .style("fill", function(d) { return color(d.r); })

  svg.transition().duration(750)
    .attr("r", function(d){
      return d.r;
    })
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .style("fill", function(d) { return color(d.r); });

  svg.exit().remove();

  // return clientPxCollection.reduce(function(a, b){
  //    return a + b;
  // });
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
