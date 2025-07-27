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
		.attr("fill", "none")
		.attr("stroke", "black")
		.attr("stroke-width", 1);

	const updateChart = () => {
		const now = new Date();
		const oneMinuteAgo = new Date(now.getTime() - 60000);

		const value = Math.random() - 0.5 + data[data.length - 1].y; // random walk
		data.push({
			timestamp: now,
			y: value,
		});

		// Update scales
		xScale.domain([oneMinuteAgo, now]);
		yScale.domain(d3.extent(data.map((d) => d.y)) as [number, number]);

		// Update axes
		xAxis.call(d3.axisBottom(xScale));
		yAxis.call(d3.axisLeft(yScale));

		// Update line
		linePath.datum(data).attr("d", line);

		// Remove data older than 1 minute
		const cutoff = oneMinuteAgo.getTime();
		if (data[0].timestamp.getTime() < cutoff) {
			data.shift();
		}
	};

	// Update every second
	setInterval(updateChart, 1000);
};

main();
