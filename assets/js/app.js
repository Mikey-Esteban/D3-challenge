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

// Import Data
d3.csv("/assets/data/data.csv").then(function(healthData) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    healthData.forEach(function(data) {
      data.state = data.state;
      data.abbr = data.abbr;
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
      data.age = +data.age;
    })

    // Step 2: Create scale functions
    // ==============================
    let xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d=>d.poverty)-2 , d3.max(healthData, d=>d.poverty)+2])
      .range([0 , width]);

    let yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d=>d.healthcare)-3 , d3.max(healthData, d=>d.healthcare)+3])
      .range([height , 0]);

    // Step 3: Create axis functions
    // =============================
    let xAxis = d3.axisBottom(xLinearScale).ticks();
    let yAxis = d3.axisLeft(yLinearScale).ticks();

    // Step 4: Append Axes to the chart
    // ================================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    chartGroup.append("g")
      .call(yAxis);

    // Step 5: Create Circles
    // ======================

    // var circlesGroup = chartGroup.selectAll("g")
    //     .data(data).enter().append("g").classed("circlesGroup", true);
    // circlesGroup.append("circle")
    //     .attr("cx", d => xLinearScale(d.income)).attr("cy", d => yLinearScale(d.obesity))
    //     .attr("r", "10").attr("fill", "skyblue").attr("opacity", "0.75");
    // chartGroup.selectAll('.circlesGroup').append("text")
    //     .attr("x", d => xLinearScale(d.income) - 5).attr("y", d => yLinearScale(d.obesity) + 5)
    //     .attr("fill", "black").text(d => d.abbr);


    let circlesGroup = chartGroup.selectAll("g")
      .data(healthData)
      .enter()
      .append("g")
      .classed("circles",true);


      circlesGroup.append("circle")
      .attr("cx", d=>xLinearScale(d.poverty))
      .attr("cy", d=>yLinearScale(d.healthcare))
      .attr("r", "10")
      .attr("fill", "lightblue")
      .attr("stroke-width", "1")
      .attr("opacity", "0.75");

      chartGroup.selectAll(".circles")
        .append("text")
        .attr("x", d=>xLinearScale(d.poverty))
        .attr("y", d=>yLinearScale(d.healthcare))
        .attr("text-anchor", "middle")
        .attr("stroke", "white")
        .attr("alignment-baseline", "middle")
        .attr("font-size", ".5em")
        .text(d=>d.abbr);
      // .append("text")
      // .attr("x", d=>xLinearScale(d.poverty))
      // .attr("y", d=>yLinearScale(d.age))
      // .text(d=>d.abbr);

    // chartGroup.selectAll("data")
    //   .data(healthData)
    //   .enter()
    //   .append("text")
    //   .attr("x", d=>xLinearScale(d.poverty))
    //   .attr("y", d=>yLinearScale(d.age))
    //   .attr("text-anchor", "middle")
    //   .attr("stroke", "white")
    //   .attr("alignment-baseline", "middle")
    //   .attr("font-size", ".5em")
    //   .text(d=>d.abbr);


    // let circlesGroup = chartGroup.selectAll("circle")
    //   .data(healthData)
    //   .enter()
    //   .append("circle")
    //   .attr("class", "data-circle")
    //   .attr("cx", d=>xLinearScale(d.poverty))
    //   .attr("cy", d=>yLinearScale(d.age))
    //   .attr("r", "10")
    //   .attr("fill", "lightblue")
    //   .attr("stroke-width", "1")
    //   .attr("stroke", "black");

    // let elemEnter = chartGroup.enter()
    //   .append("g")
    //   .data(healthData)
    //   .attr("transform", `translate(${margin.left}, ${margin.top})`);
    //
    // let circlesGroup = elemEnter.append("circle")
    //   .attr("cx", d=>xLinearScale(d.poverty))
    //   .attr("cy", d=>yLinearScale(d.age))
    //   .attr("r", "10")
    //   .attr("fill", "lightblue")
    //   .attr("stroke-width", "1")
    //   .attr("stroke", "black")
    //
    // elemEnter.append("text")
    //   .append("text")
    //   .attr("x", d=>xLinearScale(d.poverty))
    //   .attr("y", d=>yLinearScale(d.age))
    //   .text(d=>d.abbr);

    // circlesGroup.selectAll("circle")
    //   .data(healthData)
    //   .enter()
    //   .append("text")
    //   .attr("x", d=>xLinearScale(d.poverty))
    //   .attr("y", d=>yLinearScale(d.age))
    //   .text(d=>d.abbr);

      //.append("text")
      // .attr("x", d=>xLinearScale(d.poverty))
      // .attr("y", d=>yLinearScale(d.age))
      // .text("(d=>d.abbr");

      // .append("text")
      // .attr("x", d=>xLinearScale(d.poverty))
      // .attr("y", d=>yLinearScale(d.age))
      // .text("hi")

    // Step 6: Initalize tool tip
    // ==========================
    let toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-5,-50])
      .html(function(d) {
        return (`${d.state}<br>Poverty(%): ${d.poverty}<br>Healthcare(%): ${d.healthcare}`)
      });

    // Step 7: Create tooltip in the chart
    // ===================================
    chartGroup.call(toolTip);
    console.log('creating toolTip')

    // Step 8: Create event listeners to display and hide the tooltip
    // ======================================
    circlesGroup.on("click", function(d) {
      toolTip.show(d, this);
    })
    // Step 9: Create "mouseout" event
      .on("mouseout", function(d) {
        toolTip.hide(d);
      });

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height/2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Healthcare %");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("Poverty %");
  }).catch(function(error) {
    console.log(error);
});
