import * as d3 from "d3";

/**
 * TODO: Fix choppy data addition
 * TODO: What about non-deterministic data-addition?
 * TODO: Don't animate in axis on first render - it should just be there
 * TODO: Don't render gray bar on right side on first render
 * TODO: Data being deleted too soon? Only happens sometimes
 */

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

	svg
		.append("path")
		.attr("clip-path", "url(#clip)")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "black")
		.transition()
		.duration(1000)
		.ease(d3.easeLinear)
		.on("start", updateChart);

	const oneSecondInPixels = width / (60 * 1000);
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
			// @ts-ignore
			.call(d3.axisBottom(xScale).tickFormat(multiFormat));

		yScale.domain(d3.extent(data.map((d) => d.y)) as [number, number]);
		yAxis
			.transition()
			.duration(200)
			.ease(d3.easeLinear)
			.call(d3.axisLeft(yScale));

		// @ts-ignore
		d3.select(this).attr("d", line).attr("transform", null);
		// @ts-ignore
		d3.active(this)
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
