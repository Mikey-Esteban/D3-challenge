//////////////////////////////////////////
//////// Setting up SVG Box for chart ///
////////////////////////////////////////
let svgWidth = 960;
let svgHeight = 500;

let margin = {
  top:20,
  right:40,
  bottom:60,
  left:100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
let svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

let chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

///////////////////////////////////////
////////// Initial Params ////////////
/////////////////////////////////////
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

//////////////////////////////////////
/////////// Helper Functions ////////
////////////////////////////////////

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]-2),
      d3.max(healthData, d => d[chosenXAxis])+2
    ])
    .range([0, width]);

  return xLinearScale;
};
// function used to updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d=>d[chosenYAxis])-3 ,
        d3.max(healthData, d=>d[chosenYAxis])+3])
      .range([height , 0]);

  return yLinearScale;
};
// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
};
// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
};
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d=> newYScale(d[chosenYAxis]));

  return circlesGroup;
};
// function used for updating abbr text group with a transition to
// new circles
function moveAbbr(abbrGroup, newXScale, chosenXaxis, newYScale, chosenYAxis) {

  abbrGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d=> newYScale(d[chosenYAxis]));

  return abbrGroup;
};
// function used for updating circles group with new tooltip
function updateToolTip1(circlesGroup, chosenXAxis, chosenYAxis) {

  // set x label value
  if (chosenXAxis === "poverty") {
      var xlabel = "Poverty: ";
    }
  else if (chosenXAxis === "age") {
      var xlabel = "Age (Median): ";
    }
  else {
      var xlabel = "Household Income (Median): ";
    };
  // set y label value
  if (chosenYAxis === "healthcare") {
      var ylabel = "Lacks Healthcare (%): ";
    }
  else if (chosenYAxis === "smoking") {
      var ylabel = "Smokes (%): ";
    }
  else {
    var ylabel = "Obese (%): ";
    };

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${ylabel} ${d[chosenYAxis]}<br>${xlabel} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
};
//////////////////////////////
///// Import Data ///////////
////////////////////////////
d3.csv("/assets/data/data.csv").then(function(healthData, error) {
    if (error) throw error;

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    healthData.forEach(function(data) {
      data.state = data.state;
      data.abbr = data.abbr;
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smoking = +data.smokes;
    });

    // Step 2: call scale functions
    // ==============================
    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);

    // Step 3: Create axis functions
    // =============================
    var bottomAxis = d3.axisBottom(xLinearScale).ticks();
    var leftAxis = d3.axisLeft(yLinearScale).ticks();

    // Step 4: Append Axes to the chart
    // ================================
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ======================
    var gGroup = chartGroup.selectAll("g")
      .data(healthData)
      .enter()
      .append("g")
      .classed("circles",true);
      // append circles to g
    var circlesGroup = gGroup.append("circle")
      .attr("cx", d=>xLinearScale(d[chosenXAxis]))
      .attr("cy", d=>yLinearScale(d[chosenYAxis]))
      .attr("r", "10")
      .attr("fill", "lightblue")
      .attr("stroke-width", "1")
      .attr("opacity", "0.99");
      // append text data to circles
    var abbrGroup = chartGroup.selectAll(".circles")
        .append("text")
        .attr("x", d=>xLinearScale(d[chosenXAxis]))
        .attr("y", d=>yLinearScale(d[chosenYAxis]))
        .attr("text-anchor", "middle")
        .attr("stroke", "white")
        .attr("stroke-width", ".08em")
        .attr("alignment-baseline", "middle")
        .attr("font-size", ".6em")
        .text(d=>d.abbr);

    ///////////////////////////////
    // Creating all the Labels ///
    /////////////////////////////

    // X labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 15)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("Poverty (%)");
    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 30)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (median)");
    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 45)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

    // Y labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)");

    var healthcareLabel = ylabelsGroup.append("text")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height/2))
      .attr("value", "healthcare") // value to grab for event listener
      .attr("dy", "1.5em")
      .classed("active", true)
      .text("Lacks Healthcare (%)");
    var smokingLabel = ylabelsGroup.append("text")
      .attr("y", 0 - margin.left + 40)
      .attr("x",  0 - (height/2))
      .attr("value", "smoking") // value to grab for event listener
      .attr("dy", ".25em")
      .classed("inactive", true)
      .text("Smokes (%)");
    var obesityLabel = ylabelsGroup.append("text")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height/2))
      .attr("value", "obesity") // value to grab for event listener
      .attr("dy", "-1em")
      .classed("inactive", true)
      .text("Obese (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip1(circlesGroup, chosenXAxis, chosenYAxis);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXaxis with value
          chosenXAxis = value;

          // updates x scale for new data
          xLinearScale = xScale(healthData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderXAxis(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
          // updates abbr with new x values
          abbrGroup = moveAbbr(abbrGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip1(circlesGroup, chosenXAxis, chosenYAxis);

          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

      // y axis labels event listener
      ylabelsGroup.selectAll("text")
        .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenYAxis) {

            // replaces chosenXaxis with value
            chosenYAxis = value;

            // updates y scale for new data
            yLinearScale = yScale(healthData, chosenYAxis);

            // updates y axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            // updates abbr with new y values
            abbrGroup = moveAbbr(abbrGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip1(circlesGroup, chosenXAxis, chosenYAxis);

            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
              healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
              smokingLabel
                .classed("active", false)
                .classed("inactive", true);
              obesityLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenYAxis === "smoking") {
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
              smokingLabel
                .classed("active", true)
                .classed("inactive", false);
              obesityLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
              healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
              smokingLabel
                .classed("active", false)
                .classed("inactive", true);
              obesityLabel
                .classed("active", true)
                .classed("inactive", false);
            }
          }
        });
  }).catch(function(error) {
    console.log(error);
});
