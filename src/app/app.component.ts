import { Component, OnInit } from '@angular/core';
import * as d3 from "d3";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  public title = 'charts';

  public ngOnInit(): void {
    this.barChart();
    this.lineChart();
    this.donutChart();
    this.stackedBarChart();
    
  }

  private barChart(): void {
    var width = 960;
    var height = 500;
    var margin = 5;
    var padding = 5;
    var adj = 20;
    // we are appending SVG first
    var svg = d3.select("div#barchart").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    //.attr("viewBox", "-20 -20 1600 1600")
    .attr("viewBox", "-" + adj + " -"+ adj + " " + (width + adj) + " " + (height + adj*2))
    .style("padding", padding)
    .style("margin", margin)
    .classed("svg-content", true);

    //-----------------------SCALES PREPARATION----------------------//
    var xScale = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.05);
    var yScale = d3.scaleLinear()
        .rangeRound([height, 0]);

    //------------------------DATA PREPARATION-----------------------//
    var dataset = d3.csv("./assets/data/barchart.csv");
    dataset.then(function(data) {
        data.map(function(d) {
                d.val = +d.val;
                return d;});
    });

    dataset.then(function(data) {  
        xScale.domain(data.map(function(d) {return d.cat}))
        yScale.domain([0, d3.max(data, function(d)
                                {return d.val; })]);
    });

    console.log(dataset);

    //----------------------------DRAWING----------------------------//
    //-----------------------------AXES------------------------------//
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(yScale));    

    //-----------------------------BARS------------------------------//
    dataset.then(function (data) { 
        svg.selectAll("div")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d){
            return xScale(d.cat);
        })
        .attr("y", function (d) {
            return yScale(d.val);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function (d) {
            return height - yScale(d.val);
        });
    });
  }  

  private lineChart(): void {
    const width = 960;
    const height = 500;
    const margin = 5;
    const padding = 5;
    const adj = 30;
    // we are appending SVG first
    const svg = d3.select("div#linechart").append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "-"
              + adj + " -"
              + adj + " "
              + (width + adj *3) + " "
              + (height + adj*3))
        .style("padding", padding)
        .style("margin", margin)
        .classed("svg-content", true);
    
    //-----------------------------DATA-----------------------------//
    const timeConv = d3.timeParse("%d-%b-%Y");
    const dataset = d3.csv("./assets/data/linechart.csv");
    dataset.then(function(data) {
        var slices = data.columns.slice(1).map(function(id) {
            return {
                id: id,
                values: data.map(function(d){
                    return {
                        date: timeConv(d.date),
                        measurement: +d[id]
                    };
                })
            };
        });
    
    //----------------------------SCALES----------------------------//
    const xScale = d3.scaleTime().range([0,width]);
    const yScale = d3.scaleLinear().rangeRound([height, 0]);
    xScale.domain(d3.extent(data, function(d){
        return timeConv(d.date)}));

    yScale.domain([(0), d3.max(slices, function(c) {
        return d3.max(c.values, function(d) {
            return d.measurement + 4; });
            })
        ]);

    //-----------------------------AXES-----------------------------//
    const yaxis = d3.axisLeft()
        .ticks((slices[0].values).length)
        .scale(yScale);

    const xaxis = d3.axisBottom()
        .ticks(d3.timeDay.every(1))
        .tickFormat(d3.timeFormat('%b %d'))
        .scale(xScale);

    //----------------------------LINES-----------------------------//
    const line = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.measurement); });

    let id = 0;
    const ids = function () {
        return "line-"+id++;
    }  

    //---------------------------TOOLTIP----------------------------//
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute");

    //-------------------------2. DRAWING---------------------------//
    //-----------------------------AXES-----------------------------//
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xaxis);

    svg.append("g")
        .attr("class", "axis")
        .call(yaxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", ".75em")
        .attr("y", 6)
        .style("text-anchor", "end")
        .text("Frequency");

    //----------------------------LINES-----------------------------//
    const lines = svg.selectAll("lines")
        .data(slices)
        .enter()
        .append("g");

    lines.append("path")
        .attr("class", ids)
        .attr("d", function(d) { return line(d.values); });

    lines.append("text")
        .attr("class","serie_label")
        .datum(function(d) {
            return {
                id: d.id,
                value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) {
                return "translate(" + (xScale(d.value.date) + 10)  
                + "," + (yScale(d.value.measurement) + 5 )+ ")"; })
        .attr("x", 5)
        .text(function(d) { return ("Serie ") + d.id; });

    //---------------------------POINTS-----------------------------// 
    lines.selectAll("points")
        .data(function(d) {return d.values})
        .enter()
        .append("circle")
        .attr("cx", function(d) { return xScale(d.date); })      
        .attr("cy", function(d) { return yScale(d.measurement); })    
        .attr("r", 1)
        .attr("class","point")
        .style("opacity", 1);

    //---------------------------EVENTS-----------------------------//    
    lines.selectAll("circles")
        .data(function(d) { return(d.values); } )
        .enter()
        .append("circle")
        .attr("cx", function(d) { return xScale(d.date); })      
        .attr("cy", function(d) { return yScale(d.measurement); })    
        .attr('r', 10)
        .style("opacity", 0)
        .on('mouseover', function(d) {
            tooltip.transition()
                .delay(30)
                .duration(200)
                .style("opacity", 1);

            tooltip.html(d.measurement)
                .style("left", (d3.event.pageX + 25) + "px")
                .style("top", (d3.event.pageY) + "px");

            const selection = d3.select(this).raise();

            selection
                .transition()
                .delay("20")
                .duration("200")
                .attr("r", 6)
                .style("opacity", 1)
                .style("fill","#ed3700");
        })                
        .on("mouseout", function(d) {      
            tooltip.transition()        
                .duration(100)      
                .style("opacity", 0);  

            const selection = d3.select(this);

            selection
                .transition()
                .delay("20")
                .duration("200")
                .attr("r", 10)
                .style("opacity", 0);
        });
    })
  }

  public donutChart(): void {
    // set the dimensions and margins of the graph
    const width = 450
    const height = 450
    const margin = 40
    const adj = 20;

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin

    
    var svg = d3.select("div#donutchart")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-"
          + adj + " -"
          + adj + " "
          + (width + adj *3) + " "
          + (height + adj*3))    
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Create dummy data
    var data = {a: 9, b: 20, c:30, d:8, e:12, f:3, g:7, h:14}

    // set the color scale
    var color = d3.scaleOrdinal()
    .domain(["a", "b", "c", "d", "e", "f", "g", "h"])
    .range(d3.schemeDark2);

    // Compute the position of each group on the pie:
    var pie = d3.pie()
    .sort(null) // Do not sort group by size
    .value(function(d) {return d.value; })
    var data_ready = pie(d3.entries(data))

    // The arc generator
    var arc = d3.arc()
    .innerRadius(radius * 0.5)         // This is the size of the donut hole
    .outerRadius(radius * 0.8)

    // Another arc that won't be drawn. Just for labels positioning
    var outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
    .selectAll('allSlices')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', function(d){ return(color(d.data.key)) })
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)

    // Add the polylines between chart and labels:
    svg
    .selectAll('allPolylines')
    .data(data_ready)
    .enter()
    .append('polyline')
    .attr("stroke", "black")
    .style("fill", "none")
    .attr("stroke-width", 1)
    .attr('points', function(d) {
      var posA = arc.centroid(d) // line insertion in the slice
      var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
      var posC = outerArc.centroid(d); // Label position = almost the same as posB
      var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
      posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
      return [posA, posB, posC]
    })

    // Add the polylines between chart and labels:
    svg
    .selectAll('allLabels')
    .data(data_ready)
    .enter()
    .append('text')
    .text( function(d) { console.log(d.data.key) ; return d.data.key } )
    .attr('transform', function(d) {
        var pos = outerArc.centroid(d);
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
    })
    .style('text-anchor', function(d) {
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
    })

  }

  private stackedBarChart(): void {
    const BAR_HEIGHT = 50;
    const BAR_SPACING = 85;
    const TEXT_OFFSET = 18;
    const LABEL_OFFSET = 30;
    const QUANTITY_OFFSET = 30;
    
    d3.json("./assets/data/stackedbarchart.csv").then(data => {
      d3.select("div#stackedbarchart")
        .append("svg")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("height", BAR_HEIGHT)
        .attr("y", (val, idx) => idx * BAR_SPACING)
        .attr("width", (val, idx) => val.tickets_sold)
        .attr("fill", "green");
      d3.select("svg")
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", 0)
        .attr("y", (val, idx) => idx * BAR_SPACING + BAR_HEIGHT + TEXT_OFFSET)
        .attr("fill", "black")
        .attr("font-size", "18px")
        .text(
          (val, idx) =>
            `${val.conference_name} - ${Math.round(
              (val.tickets_sold / val.tickets_available) * 100
            )}%`
        );
      d3.select("div#stackedbarchart svg")      
        .selectAll("rect#diffs")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (val, idx) => val.tickets_sold)
        .attr("y", (val, idx) => idx * BAR_SPACING)
        .attr("height", BAR_HEIGHT)
        .attr("width", (val, idx) =>
          Math.abs(val.tickets_sold - val.tickets_available)
        )
        .attr("fill", "red");

    d3.select("div#stackedbarchart svg")      
        .selectAll("text.labels")
        .data(data)
        .enter()
        .append("text")
        .attr("x", (val, idx) => val.tickets_sold - QUANTITY_OFFSET)
        .attr("y", (val, idx) => idx * BAR_SPACING + LABEL_OFFSET)
        .attr("fill", "white")
        .attr("font-size", "12")
        .text((val, idx) => `${val.tickets_sold}`);
    });    
  }
}
