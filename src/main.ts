import * as d3 from "d3";

type Data = {
	timestamp: Date;
	y: number;
};

const data: Data[] = [
	{
		timestamp: new Date(),
		y: 0,
	},
];

const main = () => {
	const margin = { top: 20, right: 20, bottom: 30, left: 40 };
	const width = 600 - margin.left - margin.right;
	const height = 300 - margin.top - margin.bottom;

	const svg = d3
		.select("#root")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	svg
		.append("defs")
		.append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", width)
		.attr("height", height);

	const now = new Date();
	const oneMinuteAgo = new Date(now.getTime() - 60000);

	const xScale = d3.scaleUtc().domain([oneMinuteAgo, now]).range([0, width]);

	const yScale = d3.scaleLinear().range([height, 0]);

	const line = d3
		.line<Data>()
		.x((d) => xScale(d.timestamp))
		.y((d) => yScale(d.y));

	const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);

	const yAxis = svg.append("g");

	const linePath = svg
		.append("path")
		.datum(data)
		.attr("clip-path", "url(#clip)")
		.attr("fill", "none")
		.attr("stroke", "black");

	linePath
		.transition()
		.duration(1000)
		.ease(d3.easeLinear)
		.on("start", updateChart);
	const oneSecondInPixels = width / (60 * 1000);

	function updateChart() {
		const now = new Date();
		const oneMinuteAgo = new Date(now.getTime() - 60000);

		const value = Math.random() - 0.5 + data[data.length - 1].y; // random walk
		data.push({
			timestamp: now,
			y: value,
		});

		xScale.domain([oneMinuteAgo, now]);
		xAxis
			.transition()
			.duration(1000)
			.ease(d3.easeLinear)
			.call(d3.axisBottom(xScale));

		yScale.domain(d3.extent(data.map((d) => d.y)) as [number, number]);
		yAxis
			.transition()
			.duration(200)
			.ease(d3.easeLinear)
			.call(d3.axisLeft(yScale));

		linePath.attr("d", line).attr("transform", null);
		d3.active(linePath.node())
			.attr("transform", `translate(${oneSecondInPixels},0)`)
			.transition()
			.on("start", updateChart);

		// Remove data older than 1 minute
		const cutoff = oneMinuteAgo.getTime();
		if (data[0].timestamp.getTime() < cutoff) {
			data.shift();
		}
	}
};

main();
