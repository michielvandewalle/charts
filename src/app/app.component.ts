import { Component, OnInit } from "@angular/core";
import * as d3 from "d3";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  public title = "charts";

  public ngOnInit(): void {
    this.barChart();
    this.stackedBarChart();
    this.donutChart();
    this.lineChart();
    this.lineareaChart();
  }

  private barChart(): void {
    // set the dimensions and margins of the graph
    const width = 960;
    const height = 500;
    const margin = 5;
    const padding = 5;
    const adj = 30;

    // we are appending SVG first
    const svg = d3
      .select("div#barchart")
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr(
        "viewBox",
        "-" +
          adj +
          " -" +
          adj +
          " " +
          (width + adj * 3) +
          " " +
          (height + adj * 3)
      )
      .style("padding", padding)
      .style("margin", margin)
      .classed("svg-content", true);

    // Parse the Data
    const dataset = d3.csv("./assets/data/barchart.csv");
    dataset.then(function (data) {
      // X axis
      var x = d3
        .scaleBand()
        .range([0, width])
        .domain(
          data.map(function (d) {
            return d.Country;
          })
        )
        .padding(0.2);
      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

      // Add Y axis
      var y = d3.scaleLinear().domain([0, 13000]).range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      // Bars
      svg
        .selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d) {
          return x(d.Country);
        })
        .attr("y", function (d) {
          return y(d.Value);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
          return height - y(d.Value);
        })
        .attr("fill", "#69b3a2");
    });
  }

  private stackedBarChart(): void {
    // set the dimensions and margins of the graph
    const width = 960;
    const height = 500;
    const margin = 5;
    const padding = 5;
    const adj = 30;

    // we are appending SVG first
    const svg = d3
      .select("div#barchart")
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr(
        "viewBox",
        "-" +
          adj +
          " -" +
          adj +
          " " +
          (width + adj * 3) +
          " " +
          (height + adj * 3)
      )
      .style("padding", padding)
      .style("margin", margin)
      .classed("svg-content", true);

    // Parse the Data
    const dataset = d3.csv("./assets/data/stackedbarchart.csv");
    dataset.then(function (data) {
      // List of subgroups = header of the csv files = soil condition here
      var subgroups = data.columns.slice(1);

      // List of groups = species here = value of the first column called group -> I show them on the X axis
      var groups = d3
        .map(data, function (d) {
          return d.group;
        })
        .keys();

      // Add X axis
      var x = d3.scaleBand().domain(groups).range([0, width]).padding([0.2]);
      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));

      // Add Y axis
      var y = d3.scaleLinear().domain([0, 60]).range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      // color palette = one color per subgroup
      var color = d3
        .scaleOrdinal()
        .domain(subgroups)
        .range(["#C7EFCF", "#FE5F55", "#EEF5DB"]);

      //stack the data? --> stack per subgroup
      var stackedData = d3.stack().keys(subgroups)(data);

      // ----------------
      // Create a tooltip
      // ----------------
      var tooltip = d3
        .select("#my_dataviz")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function (d) {
        var subgroupName = d3.select(this.parentNode).datum().key;
        var subgroupValue = d.data[subgroupName];
        tooltip
          .html(
            "subgroup: " + subgroupName + "<br>" + "Value: " + subgroupValue
          )
          .style("opacity", 1);
      };
      var mousemove = function (d) {
        tooltip
          .style("left", d3.mouse(this)[0] + 90 + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
          .style("top", d3.mouse(this)[1] + "px");
      };
      var mouseleave = function (d) {
        tooltip.style("opacity", 0);
      };

      // Show the bars
      svg
        .append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter()
        .append("g")
        .attr("fill", function (d) {
          return color(d.key);
        })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function (d) {
          return d;
        })
        .enter()
        .append("rect")
        .attr("x", function (d) {
          return x(d.data.group);
        })
        .attr("y", function (d) {
          return y(d[1]);
        })
        .attr("height", function (d) {
          return y(d[0]) - y(d[1]);
        })
        .attr("width", x.bandwidth())
        .attr("stroke", "grey")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
    });
  }

  private lineChart(): void {
    const width = 960;
    const height = 500;
    const margin = 5;
    const padding = 5;
    const adj = 30;
    // we are appending SVG first
    const svg = d3
      .select("div#linechart")
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr(
        "viewBox",
        "-" +
          adj +
          " -" +
          adj +
          " " +
          (width + adj * 3) +
          " " +
          (height + adj * 3)
      )
      .style("padding", padding)
      .style("margin", margin)
      .classed("svg-content", true);

    //-----------------------------DATA-----------------------------//
    const timeConv = d3.timeParse("%d-%b-%Y");
    const dataset = d3.csv("./assets/data/linechart.csv");
    dataset.then(function (data) {
      var slices = data.columns.slice(1).map(function (id) {
        return {
          id: id,
          values: data.map(function (d) {
            return {
              date: timeConv(d.date),
              measurement: +d[id],
            };
          }),
        };
      });

      //----------------------------SCALES----------------------------//
      const xScale = d3.scaleTime().range([0, width]);
      const yScale = d3.scaleLinear().rangeRound([height, 0]);
      xScale.domain(
        d3.extent(data, function (d) {
          return timeConv(d.date);
        })
      );

      yScale.domain([
        0,
        d3.max(slices, function (c) {
          return d3.max(c.values, function (d) {
            return d.measurement + 4;
          });
        }),
      ]);

      //-----------------------------AXES-----------------------------//
      const yaxis = d3.axisLeft().ticks(slices[0].values.length).scale(yScale);

      const xaxis = d3
        .axisBottom()
        .ticks(d3.timeDay.every(1))
        .tickFormat(d3.timeFormat("%b %d"))
        .scale(xScale);

      //----------------------------LINES-----------------------------//
      const line = d3
        .line()
        .x(function (d) {
          return xScale(d.date);
        })
        .y(function (d) {
          return yScale(d.measurement);
        });

      let id = 0;
      const ids = function () {
        return "line-" + id++;
      };

      //---------------------------TOOLTIP----------------------------//
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute");

      //-------------------------2. DRAWING---------------------------//
      //-----------------------------AXES-----------------------------//
      svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xaxis);

      svg
        .append("g")
        .attr("class", "axis")
        .call(yaxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", ".75em")
        .attr("y", 6)
        .style("text-anchor", "end")
        .text("Frequency");

      //----------------------------LINES-----------------------------//
      const lines = svg.selectAll("lines").data(slices).enter().append("g");

      lines
        .append("path")
        .attr("class", ids)
        .attr("d", function (d) {
          return line(d.values);
        });

      lines
        .append("text")
        .attr("class", "serie_label")
        .datum(function (d) {
          return {
            id: d.id,
            value: d.values[d.values.length - 1],
          };
        })
        .attr("transform", function (d) {
          return (
            "translate(" +
            (xScale(d.value.date) + 10) +
            "," +
            (yScale(d.value.measurement) + 5) +
            ")"
          );
        })
        .attr("x", 5)
        .text(function (d) {
          return "Serie " + d.id;
        });

      //---------------------------POINTS-----------------------------//
      lines
        .selectAll("points")
        .data(function (d) {
          return d.values;
        })
        .enter()
        .append("circle")
        .attr("cx", function (d) {
          return xScale(d.date);
        })
        .attr("cy", function (d) {
          return yScale(d.measurement);
        })
        .attr("r", 1)
        .attr("class", "point")
        .style("opacity", 1);

      //---------------------------EVENTS-----------------------------//
      lines
        .selectAll("circles")
        .data(function (d) {
          return d.values;
        })
        .enter()
        .append("circle")
        .attr("cx", function (d) {
          return xScale(d.date);
        })
        .attr("cy", function (d) {
          return yScale(d.measurement);
        })
        .attr("r", 10)
        .style("opacity", 0)
        .on("mouseover", function (d) {
          tooltip.transition().delay(30).duration(200).style("opacity", 1);

          tooltip
            .html(d.measurement)
            .style("left", d3.event.pageX + 25 + "px")
            .style("top", d3.event.pageY + "px");

          const selection = d3.select(this).raise();

          selection
            .transition()
            .delay("20")
            .duration("200")
            .attr("r", 6)
            .style("opacity", 1)
            .style("fill", "#ed3700");
        })
        .on("mouseout", function (d) {
          tooltip.transition().duration(100).style("opacity", 0);

          const selection = d3.select(this);

          selection
            .transition()
            .delay("20")
            .duration("200")
            .attr("r", 10)
            .style("opacity", 0);
        });
    });
  }

  private lineareaChart(): void {
    // // set the dimensions and margins of the graph
    var width = 960;
    var height = 500;
    var margin = 5;
    var padding = 5;
    var adj = 20;

    // // append the svg object to the body of the page
    // const svg = d3
    //   .select("#my_dataviz")
    //   .append("svg")
    //   .attr("width", width + margin.left + margin.right)
    //   .attr("height", height + margin.top + margin.bottom)
    //   .append("g")
    //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const svg = d3
      .select("div#lineareachart")
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr(
        "viewBox",
        "-" + adj + " -" + adj + " " + (width + adj) + " " + (height + adj * 2)
      )
      .style("padding", padding)
      .style("margin", margin)
      .classed("svg-content", true);

    // //Read the data
    const dataset = d3.csv("./assets/data/lineareachart.csv");
    dataset.then((data) => {
      console.log(data);
      // Add X axis --> it is a date format
      var x = d3.scaleLinear().domain([1, 100]).range([0, width]);
      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Add Y axis
      var y = d3.scaleLinear().domain([0, 13]).range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      // This allows to find the closest X index of the mouse:
      var bisect = d3.bisector(function (d) {
        return d.x;
      }).left;

      // Show confidence interval
      svg
        .append("path")
        .datum(data)
        .attr("fill", "#cce5df")
        .attr("stroke", "none")
        .attr(
          "d",
          d3
            .area()
            .x(function (d) {
              return x(d.x);
            })
            .y0(function (d) {
              return y(d.CI_right);
            })
            .y1(function (d) {
              return y(d.CI_left);
            })
        );

      // Create the circle that travels along the curve of chart
      var focus = svg
        .append("g")
        .append("circle")
        .style("fill", "none")
        .attr("stroke", "black")
        .attr("r", 8.5)
        .style("opacity", 0);

      // Create the text that travels along the curve of chart
      var focusText = svg
        .append("g")
        .append("text")
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle");

      // Add the line
      svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr(
          "d",
          d3
            .line()
            .x(function (d) {
              return x(d.x);
            })
            .y(function (d) {
              return y(d.y);
            })
        );

      // Create a rect on top of the svg area: this rectangle recovers mouse position
      svg
        .append("rect")
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

      // What happens when the mouse move -> show the annotations at the right positions.
      function mouseover() {
        focus.style("opacity", 1);
        focusText.style("opacity", 1);
      }

      function mousemove() {
        // recover coordinate we need
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = bisect(data, x0, 1);
        const selectedData = data[i];
        focus.attr("cx", x(selectedData.x)).attr("cy", y(selectedData.y));
        focusText
          .html("x:" + selectedData.x + "  -  " + "y:" + selectedData.y)
          .attr("x", x(selectedData.x) + 15)
          .attr("y", y(selectedData.y));
      }
      function mouseout() {
        focus.style("opacity", 0);
        focusText.style("opacity", 0);
      }
    });
  }

  public donutChart(): void {
    // set the dimensions and margins of the graph
    const width = 450;
    const height = 450;
    const margin = 40;
    const adj = 20;

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin;

    var svg = d3
      .select("div#donutchart")
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr(
        "viewBox",
        "-" +
          adj +
          " -" +
          adj +
          " " +
          (width + adj * 3) +
          " " +
          (height + adj * 3)
      )
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Create dummy data
    var data = { a: 9, b: 20, c: 30, d: 8, e: 12, f: 3, g: 7, h: 14 };

    // set the color scale
    var color = d3
      .scaleOrdinal()
      .domain(["a", "b", "c", "d", "e", "f", "g", "h"])
      .range(d3.schemeDark2);

    // Compute the position of each group on the pie:
    var pie = d3
      .pie()
      .sort(null) // Do not sort group by size
      .value(function (d) {
        return d.value;
      });
    var data_ready = pie(d3.entries(data));

    // The arc generator
    var arc = d3
      .arc()
      .innerRadius(radius * 0.5) // This is the size of the donut hole
      .outerRadius(radius * 0.8);

    // Another arc that won't be drawn. Just for labels positioning
    var outerArc = d3
      .arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
      .selectAll("allSlices")
      .data(data_ready)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", function (d) {
        return color(d.data.key);
      })
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.7);

    // Add the polylines between chart and labels:
    svg
      .selectAll("allPolylines")
      .data(data_ready)
      .enter()
      .append("polyline")
      .attr("stroke", "black")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr("points", function (d) {
        var posA = arc.centroid(d); // line insertion in the slice
        var posB = outerArc.centroid(d); // line break: we use the other arc generator that has been built only for that
        var posC = outerArc.centroid(d); // Label position = almost the same as posB
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left
        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        return [posA, posB, posC];
      });

    // Add the polylines between chart and labels:
    svg
      .selectAll("allLabels")
      .data(data_ready)
      .enter()
      .append("text")
      .text(function (d) {
        console.log(d.data.key);
        return d.data.key;
      })
      .attr("transform", function (d) {
        var pos = outerArc.centroid(d);
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return "translate(" + pos + ")";
      })
      .style("text-anchor", function (d) {
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midangle < Math.PI ? "start" : "end";
      });
  }
}
