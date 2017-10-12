// http://statline.cbs.nl/statweb/publication/?vw=t&dm=slnl&pa=80393ned&d1=10,12-13,16-18&d2=4,7&d3=a&hd=150105-1327&hdr=g1,t&stb=g2
// date DL:  http://statline.cbs.nl/Statweb/publication/?DM=SLNL&PA=80393ned&D1=10%2c12-13%2c16-18&D2=4%2c7&D3=a&HDR=G1%2cT&STB=G2&VW=D
// bar using: https://github.com/liufly/Dual-scale-D3-Bar-Chart

// margins aangeven
var margin = {
  top: 40,
  right: 30,
  bottom: 20,
  left: 70
};

// width and height meegeven
var width = 800 - margin.left - margin.right,
 height = 400 - margin.top - margin.bottom;

// svg aanmaken met de width en height aangeven.
var svg = d3.select('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('class', 'graph')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

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
  // haal de '*' weg van '2015' om dit bruikbaar te maken.
  data = data.replace('*', '');
  // parse dit naar naar csv en zet dit in de variabel period.
  var period = d3.csvParseRows(data, map);

// functie map aanmaken om vervolgens dit te gebruiken voor period.
// hier plaatst ik de data die ik wil gebruiken op de juiste plek.

  function map(placeData) {
    return {
      year: placeData[0],
      peoplepayback: Number(placeData[4]),
      revenue: Number(placeData[5]),
      payoff: Number(placeData[6])
    }
  }

// Hier teken map en max ik de x en Y as zodat ik zo kan tekenen.
  x.domain(period.map(function(d) { return d.year;}  ));
  y0.domain([0, d3.max(period, function(d) { return d.peoplepayback;} )]);

// hier teken ik de x as
  svg.append('g')
  .attr('class', 'x axis')
  .attr(`transform`, `translate(0,${height})`)
  .call(xAxis);

// hier teken ik de linker y as
  svg.append('g')
  .attr('class','y axis axisLeft')
  .attr('transform','translate(0,0)')
  .call(yAxisLeft)
  .append('text')
  .style('fill','#0065E3')
  .attr('y', 6)
  .attr('dy', '-2em')
  .style('text-anchor', 'end')
  .text('Million (in euro)');

// hier teken ik de rechter y as
 svg.append('g')
    .attr('class', 'y axis axisRight')
    .attr('transform', 'translate(' + (width) + ',0)')
    .call(yAxisRight)
  .append('text')
    .attr('y', 6)
    .attr('dy', '-2em')
    .attr('dx', '2em')
    .style('fill', '#E6C136')
    .style('text-anchor', 'end')
    .text('Million (in euro)');

/*
  we selecteren alle bars en zetten daar de data in. Zet de juiste waardes bij het juiste jaar
  en dan de y vullen we aan met onze data!
  Vervolgens genereren we de hoogte met onze data. a.d.h.v. de hoogte variabelen
*/

  bars = group;
  bars.selectAll('.bar')
    .data(period)
    .enter()
    .append('rect')
    .attr('class', 'bar1')
    .attr('fill', '#0065E3')
    .attr('x', function(d) { 
      return x(d.year); 
    })
    .attr('y', function(d) { 
      return y0(d.peoplepayback); 
    })
    .attr('width', x.bandwidth()/2)
    .attr('height', function(d,i,j) {
      return height - y0(d.peoplepayback)
    });

/*
  we selecteren alle bars en geven de class bar2 en zetten daar de data in. Zet de juiste waardes bij het juiste jaar
  en dan de y1 (tweede y) vullen we aan met onze data!
  Vervolgens genereren we de hoogte met onze data. a.d.h.v. de hoogte variabelen
*/

    bars.selectAll('.bar')
    .data(period)
    .enter()
    .append('rect')
    .attr('class', 'bar2')
    .attr('fill', '#E6C136')
    .attr('x', function(d) { 
      return x(d.year); 
    })
    .attr('y', function(d) { 
      return y1(d.revenue); 
    })
    .attr('width', x.bandwidth()/2)
    .attr('height', function(d,i,j) {
      return height - y1(d.revenue)
    });



    /*
    Start Animaties!!!
    Get the interactions going!
    */

    // maak een functie genaamd update
    function update() {

    selectYAxisRight = d3.select('.y.axis.axisRight')
  .append('text')
  .style('fill', '#D4642C')
    .attr('y', 6)
    .attr('dy', '-2em')
    .attr('dx', '2em')
    .style('text-anchor', 'end')
    .text('Million (in euro)');

      // selectbars selecteer ik alle bars en vul het met een kleur
      var selectBars = bars.selectAll('.bar')
      .data(period).enter().selectAll('.bar2').style('fill','#D4642C')
      .attr('x', function(d) { 
        // ik vul de x as in om alles de juiste plek te zetten.
      return x(d.year); 
    }).attr('y', function(d) { 
      // ik vul de y as in om alles de juiste plek te zetten.
      return y1(d.payoff); 
      // ik maak de bars wat dunner na dat je er op klikt want dan kan je de rode bars nog zien.
    }).attr('width', x.bandwidth() / 3)
    .attr('height', function(d,i,j) {
      // nieuwe data inladen.
      return height - y1(d.payoff)
    });

  // luisteren naar een click en dan update functie uitvoeren met de click
    selectBars.enter()
    .on('click', function(e, i){
      update();
    });

    // EXECUTE. dit verwijdert de data en plaatst de nieuwe data in
    selectBars.exit().remove();

    };
    // hier selecteer ik de button en als die geclicked wordt dan wordt de update uitgevoerd
   d3.select('#payoff').on('click', function(e){
  update();
});

   /*
    functie newUpdate  zet de bar weer terug naar revenue. Om de bar van revenue weer te laten tonen maken we een nieuwe button om die te laten zien.
    Die doen we letterlijk op hetzelfde manier zoals update().
   */

    function newUpdate() {

  selectYAxisRight = d3.select('.y.axis.axisRight')
  .append('text')
  .style('fill', '#E6C136')
    .attr('y', 6)
    .attr('dy', '-2em')
    .attr('dx', '2em')
    .style('text-anchor', 'end')
    .text('Million (in euro)');

      var selectBars = bars.selectAll('.bar')
      .data(period).enter().selectAll('.bar2').style('fill','#E6C136')
      .attr('x', function(d) { 
      return x(d.year); 
    }).attr('y', function(d) { 
      return y1(d.revenue); 
    }).attr('width', x.bandwidth()/3)
    .attr('height', function(d,i,j) {
      return height - y1(d.revenue)
    });

    selectBars.enter()
    .on('click', function(e, i){
      update();
    });

    selectBars.exit().remove();

    };

   d3.select('#peoplepayback').on('click', function(e){
  newUpdate();
});

// d3.select selecteert de input tag in het document en verandert die met de functie change
    d3.select('input').on('change', change);

// hier maken we een time out met een functie die de checkbox 'vrijwel' direct op unchecked zet.
  var sortTimeout = setTimeout(function() {
    d3.select('input').property('checked', false).each(change);
  }, 2000);

// Hier is de functie change hier gebeurt al het magie.
  function change() {
    clearTimeout(sortTimeout);

/*
  Hier wordt een variabelen aangemaakt die de data sorteert, van hoog naar laag.
  Hij checked of hij 'checked' is en als hij dat is stopt hij de ascending data erin, zo niet dan wordt de warrige data erin gestopt.
*/
    var x0 = x.domain(period.sort(this.checked
        ? function(a, b) { 
          return b.peoplepayback - a.peoplepayback; 
        }
        : function(a, b) { 
          return d3.ascending(a.year, b.year); 
        })
        .map(function(d) { 
          return d.year; 
        }))
        .copy();

  /*
   Hier wordt een variabelen aangemaakt die de data sorteert, van hoog naar laag.
   Hij checked of hij 'checked' is en als hij dat is stopt hij de ascending data erin, zo niet dan wordt de warrige data erin gestopt.
   Dit geld dan voor de tweede set aan bars
 */
      var x1 = x.domain(period.sort(this.checked
        ? function(a, b) { 
          return b.revenue - a.revenue; 
        }
        : function(a, b) { 
          return d3.ascending(a.year, b.year); 
        })
        .map(function(d) { 
          return d.year; 
        }))
        .copy();


  //  Selecteer alle bars en sorteer die!
    svg.selectAll('.bar1')
        .sort(function(a, b) { 
          return x0(a.year) - x0(b.year); 
        });

//  Selecteer alle bars en sorteer die!
   svg.selectAll('.bar2')
        .sort(function(a, b) { 
          return x1(a.year) - x1(b.year); 
        });
/*
 we maken een variabelen aan die de transitie en de duratie meekrijgt. Daarnaast wordt er een delay meegegeven met de i waarde.
 De i waarde zijn de bars en ook de interval dus er gaat 1 bar per keer en we wachten op elke bar 50 milliseconden.
*/
    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50; };

// die transitie die we net gemaakt hebben gebeurt nu op elke bar.
    transition.selectAll('.bar1')
        .delay(delay)
        .attr('x', function(d) { 
      return x0(d.year); 
    });
// die transitie die we net gemaakt hebben gebeurt nu op elke bar.
    transition.selectAll('.bar2')
        .delay(delay)
        .attr('x', function(d) { 
      return x1(d.year) + x.bandwidth() / 2; 
    });

// we moeten wel de juiste as hebben voor de animatie omdat we spaties in onze class hebben moeten we met '.' puntjes de spaties vervangen of beter gezegd beide classes benoemen.
    transition.select('.x.axis')
        .call(xAxis)
      .selectAll('g')
        .delay(delay);
  }
};



