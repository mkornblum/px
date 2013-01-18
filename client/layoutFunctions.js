LayoutMap = {
  'bubble' : drawBubble,
  'tree' : drawTree
}

function drawBubble(collection, width, height){
  diameter = width < height ? width : height;
  bubble.size([diameter, diameter]);

  var bubbleNodes = bubble.nodes({children: collection})

  var svg = d3.select("svg")
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

function drawTree(collection, width, height){
  tree.size([width, height *.95]);
  var treeNodes = tree.nodes({children: collection});

  var svg = d3.select("svg")
    .attr('width', width)
    .attr('height', height *.95)
    .selectAll("rect")
    .data(treeNodes);

  svg.enter()
    .append("rect")
    .attr("width", function(d) { return d.dx; })
    .attr("height", function(d) { return d.dy; })
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .style("fill", function(d) { return color(d.value); })
    .style("stroke", '#000000')
    .style("stroke-width", "10px");

  svg.transition().duration(300)
    .attr("width", function(d){
      return d.dx;
    })
    .attr('height', function(d) { return d.dy; })
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .style("fill", function(d) { return color(d.value); });

  svg.exit().remove();
  return treeNodes[0].value;
}
