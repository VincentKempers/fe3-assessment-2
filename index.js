// http://statline.cbs.nl/statweb/publication/?vw=t&dm=slnl&pa=80393ned&d1=10,12-13,16-18&d2=4,7&d3=a&hd=150105-1327&hdr=g1,t&stb=g2
// date DL:  http://statline.cbs.nl/Statweb/publication/?DM=SLNL&PA=80393ned&D1=10%2c12-13%2c16-18&D2=4%2c7&D3=a&HDR=G1%2cT&STB=G2&VW=D
// bar using: https://github.com/liufly/Dual-scale-D3-Bar-Chart

// margins aangeven
var margin = {
  top: 80,
  right: 80,
  bottom: 80,
  left: 80
};

// width and height meegeven
var width = 600 - margin.left - margin.right,
 height = 400 - margin.top - margin.bottom;

// svg aanmaken met de width en height aangeven.
var svg = d3.select('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("class", "graph")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// x, y0, y1 zijn de assen die ik aanmaak voor de grafiek.
var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
var y0 = d3.scaleLinear().domain([200,1100]).range([height, 0]);
y1 = d3.scaleLinear().domain([0, 100]).range([height, 0]);

// axissen tekenen met gebruik van axisBottom axisLeft en axisRight
var xAxis = d3.axisBottom(x);
var yAxisLeft = d3.axisLeft(y0);
var yAxisRight = d3.axisRight(y1);

// group defineren zodat de bars gegroepd worden
var group = svg.append('g')
    .attr('transform', 'translate(0,0)');

// data inladen als text!
d3.text('data.csv', onload);

// functie onload aanmaken om data 
function onload(err, data) {
  if (err) throw err;

// variabelen aanmaken
// index vanaf 2010 ophalen (eerste variabelen) de rest.
  var deleteHeader = data.indexOf('"2010');
  // index van centraal ophalen en dan 3 letters terug (dit hebben we nodig om de footer weg te halen)
  var deleteFooter = data.indexOf('Centraal') -3;
  // data voor substring alles tussen de header en de footer laat ik staan en de rest haal ik weg.
  data = data.substring(deleteHeader, deleteFooter).trim();
  // haal de '*' weg van "2015" om dit bruikbaar te maken.
  data = data.replace('*', '');
  // parse dit naar period.
  var period = d3.csvParseRows(data, map);

// functie map aanmaken om vervolgens dit te gebruiken voor period.

  function map(placeData) {
    return {
      year: placeData[0],
      peoplepayback: Number(placeData[4]),
      revenue: Number(placeData[5]),
      payoff: Number(placeData[6])
    }
  }

  console.log(period);
  x.domain(period.map(function(d) { return d.year;}  ));
  y0.domain([0, d3.max(period, function(d) { return d.peoplepayback;} )]);

  svg.append('g')
  .attr('class', 'x axis')
  .attr(`transform`, `translate(0,${height})`)
  .call(xAxis);

  svg.append('g')
  .attr('class','y axis axisLeft')
  .attr('transform','translate(0,0)')
  .call(yAxisLeft)
  .append('text')
  .attr('y', 6)
  .attr('dy', '-2em')
  .style('text-anchor', 'end')
  .text('Million (in euro)');


  bars = group;
  bars.selectAll('.bar')
    .data(period)
    .enter()
    .append('rect')
    .style('fill', 'red')
    .attr('class', 'bar1')
    .attr('x', function(d) { 
      return x(d.year); 
    })
    .attr('y', function(d) { 
      return y0(d.peoplepayback); 
    })
    .attr('width', x.bandwidth()/3)
    .attr('height', function(d,i,j) {
      return height - y0(d.peoplepayback)
    });

    bars.selectAll('.bar')
    .data(period)
    .enter()
    .append('rect')
    .attr('class', 'bar2')
    .attr('x', function(d) { 
      return x(d.year); 
    })
    .attr('y', function(d) { 
      return y1(d.revenue); 
    })
    .attr('width', x.bandwidth()/3)
    .attr('height', function(d,i,j) {
      return height - y1(d.revenue)
    });


    function update() {
      var selectBars = bars.selectAll('.bar')
      .data(period).enter().selectAll('.bar2').style('fill','purple')
      .attr('x', function(d) { 
      return x(d.year); 
    }).attr('y', function(d) { 
      return y0(d.payoff); 
    }).attr('width', x.bandwidth()/5)
    .attr('height', function(d,i,j) {
      return height - y0(d.payoff)
    });

    selectBars.enter()
    .on("click", function(e, i){
      update();
    });

    selectBars.exit().remove();

    };

   d3.select("#add-btn").on("click", function(e){
  update();
});

    


  

    /*
    Start Animaties!!!
    Get the interactions going!
      
    */

    d3.select("input").on("change", change);

  var sortTimeout = setTimeout(function() {
    d3.select("input").property("checked", false).each(change);
  }, 2000);

  function change() {
    clearTimeout(sortTimeout);

    // Copy-on-write since tweens are evaluated after a delay.
    var x0 = x.domain(period.sort(this.checked
        ? function(a, b) { return b.peoplepayback - a.peoplepayback; }
        : function(a, b) { return d3.ascending(a.year, b.year); })
        .map(function(d) { return d.year; }))
        .copy();

      var x1 = x.domain(period.sort(this.checked
        ? function(a, b) { return b.revenue - a.revenue; }
        : function(a, b) { return d3.ascending(a.year, b.year); })
        .map(function(d) { return d.year; }))
        .copy();

    svg.selectAll(".bar1")
        .sort(function(a, b) { 
          return x0(a.year) - x0(b.year); 
        });

   svg.selectAll(".bar2")
        .sort(function(a, b) { 
          return x1(a.year) - x1(b.year); 
        });

    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50; };

    transition.selectAll(".bar1")
        .delay(delay)
        .attr("x", function(d) { 
      return x0(d.year); 
    });

    transition.selectAll(".bar2")
        .delay(delay)
        .attr("x", function(d) { 
      return x1(d.year) + x.bandwidth() / 2; 
    });


    transition.select(".x.axis")
        .call(xAxis)
      .selectAll("g")
        .delay(delay);
  }



};



