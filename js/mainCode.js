//Use the pretty SVG images initially
var lowPerf = false;

//Width and Height of the SVG
var wind = window,
	d = document,
	e = d.documentElement,
	g = d.getElementsByTagName('body')[0],
	x = wind.innerWidth || e.clientWidth || g.clientWidth,
	y = wind.innerHeight|| e.clientHeight|| g.clientHeight;

//SVG margins
var margin = {top: 0, right: 0, bottom: 0, left: 0},
	otherDivHeights = 150,
	width = x - margin.left - margin.right - 30,
	height = y - margin.top - margin.bottom - 30 - otherDivHeights;

//Initiate SVG
var svg = d3.select("#chart").append("svg")
			.attr("class","chartWrapper")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		  .append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Container for all SVG patterns			
var patternContainer = svg.append("g").attr("class","patternContainer");

//Container for all the planets and Sun
var planetContainer = svg.append("g").attr("class","planetContainer");

//Show planet name on hover over
var tooltip = svg.append("g")
				.attr("class", "tooltip")
				.style("display", "none");

//Change between fast and pretty mode				
d3.select("#faster").on("click", noSVGmode);
				
var m = 3, //Number of types of objects
	padding = 5,
	radiusScale = 1,
	force,
	nodes,
	circle,
	maxSize,
	labels,
	dataSet;	
	
d3.csv("Solar planets object sizes.csv", function(error, data) {

	//Convert to numeric values
	//Note that the value for the radius of Saturn should be 9.14
	//The value of 21.56 is the value needed to include the rings without clipping
	data.forEach(function(d) {
		d.meanRadiusEarth = +d.meanRadiusEarth;
		d.meanRadiusEarthLP = +d.meanRadiusEarthLP;
	});
	
	//Save for use outside function
	dataSet = data;
	
	//Save the size of the sun
	maxSize = d3.max(data, function(d) {return d.meanRadiusEarth;})

	//Create dataset for actual use
	nodes = d3.range(dataSet.length).map(function(d,i) {	
	  return {
		radius: dataSet[i].meanRadiusEarth,
		body: dataSet[i].body,
		type: dataSet[i].type,
		imgsrc: dataSet[i].imgsrc,
		color: dataSet[i].color
	  };
	});

	//Initiate force
	force = d3.layout.force()
		.nodes(nodes)
		.size([width, height])
		.gravity(.02)
		.charge(0)
		.on("tick", tick)
		.start();

	//Create pattern fill for each planet
	patternContainer
        .selectAll("defs").data(nodes).enter()
		.append("defs")
			.append('pattern')
			.attr('id', function(d){return "planet-"+d.body;})
			.attr('class', "pattern")
			.attr('patternContentUnits', 'objectBoundingBox')
			.attr('width', 1)
			.attr('height', 1)
		   .append("image")
			.attr('class', "patternImage")
			.attr("xlink:href", function(d){return d.imgsrc;})
			.attr('width', 1)
			.attr('height', 1);
   
	//Initiate the planets
	circle = planetContainer.selectAll("circle")
		.data(nodes)
	  .enter().append("circle")
		.attr("class", "solarObject")
		.attr("r", function(d) { return radiusScale*d.radius; })
        .attr("cx",0)
        .attr("cy",0)
		.style("fill", function(d){return "url(#planet-" + d.body + ")";})
		.on("mouseover", function() { tooltip.style("display", null); })
		.on("mouseout", function() { tooltip.style("display", "none"); })
		.on("mousemove", showName)
		.call(force.drag);

	//Tooltip like label
	tooltip.append("text")
		  .attr("x", 9)
		  .attr("dy", ".35em");
	  
});//csv