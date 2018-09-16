// ref: https://github.com/AnalyticalFlavorSystems/d3ReactExample/blob/master/src/components/TimeSeriesSparkLineScatterPlot/index.js
// ref: gridlines: https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
// ref: react-faux-dom: https://vijayt.com/post/plotting-bar-chart-d3-react/

import * as d3 from 'd3';
import React, { Fragment } from 'react';
import { Element } from 'react-faux-dom';

import { axisBottom as d3AxisBottom, axisLeft as d3AxisLeft } from 'd3-axis';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { select as d3Select } from 'd3-selection';
import { line as d3Line } from 'd3-shape';

import SVGWithMargin from './d3-svg-with-margin/d3-svg-with-margin';
//import './index.css';

/*
type Props = {
    data: any,
    height: number,
    margin: Object | number,
    selectX: (datum: any) => any,
    selectY: (datum: any) => any,
    width: number,
};
*/

export default ({
    barWidth,
    fValueToColor,
    data,
    height,
    iAxisInterval,
    iMaxX,
    iMaxY,
    margin,
    selectX,
    selectY,
    sColorGridlines,
    sColorLabels,
    width,
}) => {
    const xScale = d3ScaleLinear()
        .domain([0, iMaxX])
        .range([0, width]);
    const yScale = d3ScaleLinear()
        .domain([0, iMaxY])
        .range([height, 0]);

    const xAxis = d3AxisBottom()
        .scale(xScale)
        .ticks(data.length / iAxisInterval);
    const yAxis = d3AxisLeft()
        .scale(yScale)
        .ticks(data.length / iAxisInterval);

    // ref: https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
    const fAppendGridLines = svg => {
        // add the X gridlines
        svg.append('g')
            .attr('class', 'gridline')
            .attr('transform', 'translate(0,' + height + ')')
            .call(
                d3
                    .axisBottom(xScale)
                    .tickSize(-height)
                    .tickFormat('')
            );

        // text label for the x axis
        svg.append('text')
            .attr('transform', 'translate(' + width / 2 + ' ,' + (height + 35) + ')')
            .style('text-anchor', 'middle')
            .style('fill', sColorLabels)
            .text('Value');

        // add the Y gridlines
        svg.append('g')
            .attr('class', 'gridline')
            .style('stroke', sColorGridlines)
            .call(
                d3
                    .axisLeft(yScale)
                    .tickSize(-width)
                    .tickFormat('')
            );

        // text label for the y axis
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin)
            .attr('x', 0 - height / 2)
            .attr('dy', '20')
            .style('text-anchor', 'middle')
            .style('fill', sColorLabels)
            .text('Count');

        d3.selectAll('g line').style('stroke', sColorGridlines);
    };

    return (
        <Fragment>
            <style>
                {// TODO: do a real css import or inline the styles
                `
            .d3-bar-graph-container > .contentContainer > .contentContainerBackgroundRect {
                fill: #fafafa;
            }
            
            .d3-bar-graph-container > .contentContainer .xAxis text {
                font-size: 8px;
            }
            
            .d3-bar-graph-container > .contentContainer .line path {
                fill: transparent;
                stroke: #29b6f6;
                stroke-width: 2;
            }
            
            .d3-bar-graph-container > .contentContainer .scatter circle {
                fill: #5c6bc0;
                stroke: #fafafa;
                stroke-width: 2;
            }
            `}
            </style>
            <SVGWithMargin
                className="d3-bar-graph-container"
                contentContainerBackgroundRectClassName="contentContainerBackgroundRect"
                contentContainerGroupClassName="contentContainer"
                height={height}
                margin={margin}
                width={width}
            >
                <g
                    className="xAxis"
                    ref={node => d3Select(node).call(xAxis)}
                    style={{
                        transform: `translateY(${height}px)`,
                    }}
                />
                <g className="yAxis" ref={node => d3Select(node).call(yAxis)} />
                <g className="bars">
                    {data.map((datum, i) => (
                        <rect
                            key={'bar-' + i}
                            x={xScale(datum.value) - barWidth / 2}
                            y={yScale(datum.count)}
                            height={height - yScale(selectY(datum))}
                            width={barWidth}
                            fill={fValueToColor(datum.value)}
                        />
                    ))}
                </g>
                <g className="gridlines" ref={node => d3Select(node).call(fAppendGridLines)} />
            </SVGWithMargin>
        </Fragment>
    );
};
