var width = 100,
  height = 3000;


var mydata = [];


let linearScale = d3.scaleLinear()
  .domain([0, 1])
  .range(['red', 'blue']);



let linearScale2 = d3.scaleLinear()
  .domain([0, 19526])
  .range([0, 1000]);




var svg = d3.select("#chart").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g");



d3.csv("../data/data2.csv", function (data) {
  for (var i = 0; i < data.length; i++) {
    mydata.push(
      {
        index: i,
        x: parseInt(data[i].X),
        y: parseInt(data[i].Y),
        time: parseInt(data[i].time),
        button: parseInt(data[i].button),
        correct: parseInt(data[i].correct)
      }
    );
  }

  svg.selectAll("rect")
    .data(mydata)
    .enter()
    .append("rect")
    .attr("x", function (d) { return d.button == 1 ? 0 : 15 })
    .attr("y", function (d) { return linearScale2(d.time) })
    .attr('width', 10)
    .attr('height', function (d) {
      if (d.index == mydata.length-1) {
        return 10;
      } else {
        console.log()
        return linearScale2(mydata[d.index+1].time - d.time)-1;
      }
    })
    .attr("fill", function (d) { return linearScale(d.correct); })
  // add space.

  yscale = svg.append('line')
  .attr('x1', 50)
  .attr('y1', 0)
  .attr('x2', 50)
  .attr('y2', linearScale2(mydata[mydata.length-1].time)+10)
  .attr('stroke', 'red')
  

});