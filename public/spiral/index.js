var width = 960,
    height = 500;


var mydata = [];


let linearScale = d3.scaleLinear()
  .domain([0, 50000])
  .range(['#b3dae6','#0944e6']);



var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g");


let filename = document.cookie
    .split('; ')
    .find(row => row.startsWith('spiralFile='))
    .split('=')[1];

d3.csv(`../data/${filename}.csv`, function(data) {
  if(!data.length>0 || !data[0].X || !data[0].Y ||!data[0].time){
    alert('Data does not meet criteria of the graph.');
    return;
  }

  for (var i = 0; i < data.length; i++) {
    mydata.push(
    {x: parseInt(data[i].X),
      y: parseInt(data[i].Y),
      time: parseInt(data[i].time)}
    );
  }

  let f=1000;

  svg.selectAll("circle")
  .data(mydata)
.enter()
  .append("circle")
  .attr("cx", function (d) { return d.x; })
  .attr("cy", function (d) { return d.y; })
  .attr("r", 2)
  .attr("fill",function (d) { return linearScale(d.time); });



});