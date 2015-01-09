//////////////////////////////////////////////////////
/////////////// Helper Functions /////////////////////
//////////////////////////////////////////////////////
window.onerror = function() {
    location.reload();
}

//Check for IE
function detectIE() {

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
		var trident = ua.indexOf('Trident/');
		
		if (msie > 0 || trident > 0) { 
			return true;
		} else {
			return false;
		}//else
}//detectIE
     	   
function tick(e) {
  circle
	  .each(cluster(10 * e.alpha * e.alpha))
	  .each(collide(0.25))
	  .attr("cx", function(d) { return (d.x); })
	  .attr("cy", function(d) { return (d.y); });
}//tick

//Show the planet name on mouseover of planet/Sun
function showName(d) {

	//Location of mouse	
	var xLoc = d3.mouse(this)[0];
	var yLoc = d3.mouse(this)[1];
	
	tooltip.attr("transform", "translate(" + xLoc + "," + yLoc + ")");
	tooltip.select("text").text(d.body);
}//showName

//Update the radius
function rescale() {
	radiusScale = Math.pow($("#slider").slider("value"),2);
	
	force.stop();
		d3.selectAll(".solarObject")
			.transition()
			.attr("r", function(d) { return radiusScale*d.radius; });
	force.start();
}//rescale

//Change between fast and pretty mode
function noSVGmode() {
	//Set lowPerf to other state
	lowPerf = (lowPerf == false) ? true : false;
	
	if (lowPerf == true) {
		d3.select("#faster").html("high performance mode");
	} else {
		d3.select("#faster").html("low performance mode");
	}//else
	
	//Because Saturns size changes when no more SVG images are used (because of the rings)
	//the radius needs to be updated
	nodes.forEach(function(d, i) {
		if (lowPerf == false) {d.radius = dataSet[i].meanRadiusEarth;}
		else {d.radius = dataSet[i].meanRadiusEarthLP;}//else
	});
	
	//Update color (and size for Saturn)
	d3.selectAll(".solarObject")
		.attr("r", function(d) { return radiusScale*d.radius; })
		.style("fill", function(d){
			if (lowPerf == true) {
				return d.color;
			} else {
				return "url(#planet-" + d.body + ")";
			}//else
		});
}// noSVGmode

//Set up the slider
$(function() {
$("#slider").slider({
  orientation: "horizontal",
  min: 1,
  max: 3,
  value: 1,
  step: 0.25,
  slide: rescale,
  change: rescale
});
});

// Move d to be adjacent to the cluster node.
function cluster(alpha) {
  var max = {};

  // Find the largest node for each cluster.
  nodes.forEach(function(d) {
	  if (d.type == "Star") {
		  max = d;
		}
	  });

	  return function(d) {
		var node = max,
			l,
			r,
			x,
			y,
			i = -1;

		if (node == d) return;

		x = d.x - node.x;
		y = d.y - node.y;
		l = Math.sqrt(x * x + y * y);
		r = radiusScale* (d.radius + node.radius);
		if (l != r) {
		  l = (l - r) / l * alpha;
		  d.x -= x *= l;
		  d.y -= y *= l;
		  node.x += x;
		  node.y += y;
		}
	  };
}//cluster
		
// Resolves collisions between d and all other circles.
function collide(alpha) {
  var quadtree = d3.geom.quadtree(nodes);
  return function(d) {
	//var r = radiusScale*(d.radius + radius.domain()[1]) + padding,
	var r = radiusScale*(d.radius + maxSize) + padding,
		nx1 = d.x - r,
		nx2 = d.x + r,
		ny1 = d.y - r,
		ny2 = d.y + r;
	quadtree.visit(function(quad, x1, y1, x2, y2) {
	  if (quad.point && (quad.point !== d)) {
		var x = d.x - quad.point.x,
			y = d.y - quad.point.y,
			l = Math.sqrt(x * x + y * y),
			r = radiusScale*(d.radius + quad.point.radius);
		if (l < r) {
		  l = (l - r) / l * alpha;
		  d.x -= x *= l;
		  d.y -= y *= l;
		  quad.point.x += x;
		  quad.point.y += y;
		}
	  }
	  return x1 > nx2
		  || x2 < nx1
		  || y1 > ny2
		  || y2 < ny1;
	});
  };
}//collide