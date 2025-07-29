import * as d3 from "d3";

type Data = {
	timestamp: Date;
	y: number;
};

/**
 * TODO: Don't start with one second delay
 * TODO: What about non-deterministic data-addition?
 */

const random = d3.randomNormal(0, 0.2);

const data: Data[] = [];

var svg = d3
		.select("#root")
		.append("svg")
		.attr("width", 750)
		.attr("height", 500),
	margin = { top: 20, right: 20, bottom: 20, left: 40 },
	width = +svg.attr("width") - margin.left - margin.right,
	height = +svg.attr("height") - margin.top - margin.bottom,
	g = svg
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

const now = new Date();
const oneMinuteAgo = new Date(now.getTime() - 60000);
var x = d3
	.scaleUtc()
	.domain([oneMinuteAgo, new Date(now.getTime() - 1000)])
	.range([0, width]);

var y = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

var line = d3
	.line<Data>()
	.x((d) => x(d.timestamp))
	.y((d) => y(d.y));

g.append("defs")
	.append("clipPath")
	.attr("id", "clip")
	.append("rect")
	.attr("width", width)
	.attr("height", height);

const xAxis = g
	.append("g")
	.attr("class", "axis axis--x")
	.attr("transform", `translate(0,${y(0)})`)
	.call(d3.axisBottom(x));

g.append("g").attr("class", "axis axis--y").call(d3.axisLeft(y));

const formatMillisecond = d3.utcFormat(".%L"),
	formatSecond = d3.utcFormat(":%S"),
	formatMinute = d3.utcFormat("%H:%M"),
	formatHour = d3.utcFormat("%I %p"),
	formatDay = d3.utcFormat("%a %d"),
	formatWeek = d3.utcFormat("%b %d"),
	formatMonth = d3.utcFormat("%B"),
	formatYear = d3.utcFormat("%Y");

function multiFormat(date: Date) {
	return (
		d3.utcSecond(date) < date
			? formatMillisecond
			: d3.utcMinute(date) < date
				? formatSecond
				: d3.utcHour(date) < date
					? formatMinute
					: d3.utcDay(date) < date
						? formatHour
						: d3.utcMonth(date) < date
							? d3.utcWeek(date) < date
								? formatDay
								: formatWeek
							: d3.utcYear(date) < date
								? formatMonth
								: formatYear
	)(date);
}

g.append("g")
	.attr("clip-path", "url(#clip)")
	.append("path")
	.datum(data)
	.attr("fill", "none")
	.attr("stroke", "black")
	.transition()
	.duration(1000)
	.ease(d3.easeLinear)
	.on("start", tick);

function tick() {
	const now = new Date();
	const oneMinuteAgo = new Date(now.getTime() - 60000);
	// Push a new data point onto the back.
	data.push({ timestamp: now, y: random() });

	x.domain([oneMinuteAgo, new Date(now.getTime() - 1000)]);
	xAxis
		.transition()
		.duration(1000)
		.ease(d3.easeLinear)
		// @ts-ignore
		.call(d3.axisBottom(x).tickFormat(multiFormat));

	// Redraw the line.
	// @ts-ignore
	d3.select(this).attr("d", line).attr("transform", null);

	// Slide it to the left.
	// @ts-ignore
	d3.active(this)
		?.attr(
			"transform",
			`translate(${x(new Date(oneMinuteAgo.getTime() - 1000))},0)`,
		)
		.transition()
		.on("start", tick);

	// Pop the old data point off the front.
	if (data[0].timestamp < oneMinuteAgo) data.shift();
}
