


function appendGradients(svg){
  
  var redGradient = svg.append("svg:defs")
  .append("svg:linearGradient")
  .attr("id", "redGradient")
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "100%")
  .attr("y2", "100%")
  .attr("spreadMethod", "pad");
  redGradient.append("svg:stop")
  .attr("offset", "0%")
  .attr("stop-color", "red")
  .attr("stop-opacity", 1);

  redGradient.append("svg:stop")
  .attr("offset", "100%")
  .attr("stop-color", "white")
  .attr("stop-opacity", 1);

var blueGradient = svg.append("svg:defs")
  .append("svg:linearGradient")
  .attr("id", "blueGradient")
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "100%")
  .attr("y2", "100%")
  .attr("spreadMethod", "pad");
  blueGradient.append("svg:stop")
  .attr("offset", "0%")
  .attr("stop-color", "blue")
  .attr("stop-opacity", 1);

  blueGradient.append("svg:stop")
  .attr("offset", "100%")
  .attr("stop-color", "white")
  .attr("stop-opacity", 1);
}

let filename = document.cookie
    .split('; ')
    .find(row => row.startsWith('tapFile='))
    .split('=')[1];

d3.csv(`../data/${filename}.csv`, function(data) {
  var mydata = [];
  if(!data.length>0 || !data[0].X || !data[0].Y ||!data[0].time || !data[0].button || !data[0].correct){
    alert('Data does not meet criteria of the graph.');
    return;
  }
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



  let linearColorScale = d3.scaleLinear()
    .domain([0, 1])
    .range(["url(#redGradient)","url(#blueGradient)"]);
    //.range(['red', 'blue']);

  let lastItemTime = mydata[mydata.length - 1].time;
  let scaleFactor = 0.05;

  var width = 200,
    height = (lastItemTime * scaleFactor) + 50;
  let startGraphAfter = 10;

  let linearScale = d3.scaleLinear()
    .domain([0, lastItemTime])
    .range([0, lastItemTime * scaleFactor]).nice();

  var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");


  appendGradients(svg);


  var y_axis = d3.axisLeft()
    .scale(linearScale);
  svg.append("g")
    .attr("transform", `translate(100, ${startGraphAfter})`)
    .call(y_axis);

  svg.selectAll("rect")
    .data(mydata)
    .enter()
    .append("rect")
    .attr("x", function (d) { return d.button == 1 ? 0 : 15 })
    .attr("y", function (d) {
      if (d.index == 0) {
        return linearScale(d.time) + startGraphAfter;
      }
      return linearScale(d.time)
    })
    .attr('width', 8)
    .attr('height', function (d) {
      if (d.index == mydata.length - 1) {
        return 10;
      } else {
        // return calculated height from current and next time.
        // -1 added to show a little space from adjacent rectangles.
        return linearScale(mydata[d.index + 1].time - d.time) - 1;
      }
    })
    .attr("fill", function (d) {
      return d.correct == 0 ?  "url(#redGradient)" :  "url(#blueGradient)";
    })
});
