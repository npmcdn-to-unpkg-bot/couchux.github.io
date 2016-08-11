
/* select what csv should be run */
var csv_url = "https://couchux.github.io/RBR_charts/BamaMSU_SRXR_Quarters.csv"

/* run the whole chart function */

qsrChart(csv_url, "Alabama", "1"); //the latter part doesn't do anything, but I'd like to control the team from here
qsrChart(csv_url, "Michigan State", "2");

/* tie chart colors to team names */
var teamColors = {
  "Alabama": "#C31C45",
  "Michigan State": "#509E8B" // dark version was "#205649"
}
    gameColor = "#5C5C5C"

teamColor = function(team_name) {
  return teamColors[team_name]
};

/* defining the main chart functions */
function qsrChart(data_url, which_team, what_order) {
  d3.csv(data_url, csv_response.bind(null, which_team).bind(null, what_order))
}

function csv_response(which_team, what_order, error, data) {
  if (error) {
    console.error(error)
  }
  else {
    console.log("data loaded")
    qsrData = data.filter(function(row){
      return row.Team == which_team  //try to Filter/reformat ("Transform") outside of data pull
    })
    data.forEach(function(d) {
      d.SuccessRate = +d.SuccessRate
      if (d.Quarter !== "Game") {
        d.Quarter = "Q" + +d.Quarter
      }
      else {
        d.Quarter = d.Quarter
      }
    })

    render_chart(which_team, what_order)
  }
}

/* Some prep for building the d3 chart */
var containerWidth = document.getElementById("qsr-charts-container").offsetWidth

function chartWidthFn(containerWidth) {
  if (containerWidth < 584) {
    return containerWidth
    }
  else {
    return containerWidth / 2 - 16 /* adjusting this from 8 for RBR tablet view */
    }
}
function render_chart(which_team, what_order) {

var qsrChartName = "qsr-chart"

function selectChartClass() {
  return "." + qsrChartName + ".chart" + what_order
}
function defineChartClass() {
  return qsrChartName + " chart" + what_order
}

var layout = {
  barHeight: 32,
  barMarginBoost: 1.1,
  srWidthScale: 0.7,
  leagueSR: 0.42, //update this peridically for NCAA Success Rate averages
  leagueSRwidth: 3,
  qLabelX: 8,
  srLabelX: 24,
  secondLabelX: 40,
  labelYpc: 0.58,
  yAdjust: 24,
  titleAdjust: 8,
  bottomLabelAdj: 24,
}

var chartWidth = chartWidthFn(containerWidth)
    barHeightMulti = layout.barHeight * layout.barMarginBoost
    labelYadj = barHeightMulti * layout.labelYpc
    yKeys = layout.yAdjust - layout.titleAdjust
    maxIndex = d3.max(qsrData, function(d,i) { return (i + 1) });
    totalMaxSR = d3.max(qsrData, function(d,i) { return d.SuccessMax })
    svgHeight = maxIndex * barHeightMulti + layout.yAdjust + layout.bottomLabelAdj
    leagueSRx = layout.leagueSR / totalMaxSR * chartWidth * layout.srWidthScale - layout.leagueSRwidth / 2

    srBarWidth = function(d,i) {
      return d.SuccessRate / totalMaxSR * chartWidth * layout.srWidthScale
    }
    expBarWidth = function(d,i) {
      return d.ExpRate / totalMaxSR * chartWidth * layout.srWidthScale
    }
    barY = function(d,i) {
      return i * barHeightMulti + layout.yAdjust
    }
    labelY = function(d,i) {
      return i * barHeightMulti + labelYadj + layout.yAdjust
    }
    srBarColor = function(d,i) {
      if ( d.Quarter === "Game") {
        return gameColor
      }
      else {
        return teamColor(d.Team)
      }
    }
    returnQ = function(d,i) {
      return d.Quarter
    }
    srPercent = function(d,i) {
      return format.percent(d.SuccessRate)
    }
    expPercent = function(d,i) {
      if( d.ExpRate === "0.00") {
        return ""
      }
        return format.percent(d.ExpRate)
    }
    leagueSRpercent = function() {
      return format.percent(layout.leagueSR)
    }
    marginRightPx = function() {
      return qsrMarginRight() + "px"
    }
    leagueSRtext = function() {
      return leagueSRpercent() + " NCAA SR avg"
    }

var format = {
  percent: d3.format(".0%")
}

/* actually building the chart in d3 */

var teamChart = d3.select("#qsr-charts-container")
      .append("div")
      .attr("class",defineChartClass())

    svg = d3.select(selectChartClass())
      .append("svg")
      .attr("class","svgChart")
      .attr("width",chartWidth)
      .attr("height",svgHeight)

    teamTitle = svg.append("text")
      .text(which_team)
      .style("fill",teamColor(which_team))
      .attr("class","teamTitle")
      .attr("y",yKeys)

    srKey = svg.append("text")
      .text("SR")
      .attr("class","srKey")
      .attr("text-anchor","middle")
      .attr("x", chartWidth - layout.srLabelX + 2)
      .attr("y",yKeys)

    expKey = svg.append("text")
      .text("XR")
      .attr("class","expKey")
      .attr("text-anchor","middle")
      .attr("x", chartWidth - layout.srLabelX - layout.secondLabelX + 4)
      .attr("y",yKeys)

    backBars = svg.selectAll(".backBar").data(qsrData).enter()
      .append("rect")
      .attr("class","backBar")
      .attr("width",chartWidth)
      .attr("height",layout.barHeight)
      .attr("y",barY)

    srBars = svg.selectAll(".srBar").data(qsrData).enter()
      .append("rect")
      .attr("class","backBar")
      .attr("width",srBarWidth)
      .attr("height",layout.barHeight)
      .attr("y",barY)
      .style("fill",srBarColor)

    expBars = svg.selectAll(".expBars").data(qsrData).enter()
      .append("rect")
      .attr("class","expBars")
      .attr("width",expBarWidth)
      .attr("height",layout.barHeight)
      .attr("y",barY)

    qLabels = svg.selectAll(".qLabels").data(qsrData).enter()
      .append("text")
      .text(returnQ)
      .attr("class","qLabels")
      .attr("x",layout.qLabelX)
      .attr("y",labelY)

    srLabels = svg.selectAll(".srLabels").data(qsrData).enter()
      .append("text")
      .text(srPercent)
      .attr("class","srLabels")
      .attr("text-anchor","end")
      .attr("x", chartWidth - layout.qLabelX)
      .attr("y",labelY)

    expLabels = svg.selectAll(".expLabels").data(qsrData).enter()
      .append("text")
      .text(expPercent)
      .attr("class","expLabels")
      .attr("text-anchor","end")
      .attr("x", chartWidth - layout.qLabelX - layout.secondLabelX)
      .attr("y",labelY)

    leagueSRline = svg.append("line")
      .attr("class","leagueSRline")
      .attr("x1",leagueSRx)
      .attr("x2",leagueSRx)
      .attr("y1",layout.yAdjust)
      .attr("y2",svgHeight - layout.yAdjust - 4 )
      .style("stroke","#242424")
      .style("stroke-width",2)
      .style("stroke-dasharray","5,5")
      .style("d","M5 20 l215 0")

    leagueSRkey = svg.append("text")
      .text(leagueSRtext)
      .attr("class","leagueKey")
      .attr("text-anchor","middle")
      .attr("x",leagueSRx)
      .attr("y",yKeys + svgHeight - layout.bottomLabelAdj)

} //end of building chart in d3
