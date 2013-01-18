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
  createClient();
});

Template.hello.count = function () {
  return format(Session.get('clientPx'));
};

Template.hello.allCount = function(){
  return format(Session.get('totalPx'));
};

function createClient(){
  clientId = Meteor.call('createClient', clientPx, createdSuccess);
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

  var containerWidth = $('.container').width();
  var visibleHeight = $(window).height();
  diameter = containerWidth < visibleHeight ? containerWidth : visibleHeight;
  bubble.size([diameter, diameter]);

  bubbleNodes = bubble.nodes({children: clientPxCollection})

  svg = d3.select("svg")
    .attr('width', diameter)
    .attr('height', diameter)
    .selectAll("circle")
    .data(bubbleNodes);

  svg.enter()
    .append("circle")
    .attr("r", function(d) { return d.r; })
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .style("fill", function(d) { return color(d.r); })

  svg.transition().duration(300)
    .attr("r", function(d){
      return d.r;
    })
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .style("fill", function(d) { return color(d.r); });

  svg.exit().remove();
  return bubbleNodes[0].value;
}

function createdSuccess(error, result){
  if(!error){
    clientId = result;
    Session.set('clientId', clientId);

    Meteor.setInterval(function(){
      keepAlive();
    }, 2000);

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
