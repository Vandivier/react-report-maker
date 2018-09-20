import * as d3 from 'd3';
import { axisBottom as d3AxisBottom, axisLeft as d3AxisLeft } from 'd3-axis';
import { select as d3Select } from 'd3-selection';
import React, { Fragment } from 'react';

export default ({
    data,
    height,
    iAxisInterval,
    margin,
    sColorGridlines,
    sColorLabels,
    sXAxisLabel,
    sYAxisLabel,
    fsXFactorLabel,
    fsYFactorLabel,
    xScale,
    yScale,
    width,
}) => {
    const xAxis = d3AxisBottom()
        .scale(xScale)
        .ticks(data.length / iAxisInterval)
        .tickFormat((d, i) => (fsXFactorLabel && fsXFactorLabel()) || d);
    const yAxis = d3AxisLeft()
        .scale(yScale)
        .ticks(data.length / iAxisInterval)
        .tickFormat((d, i) => (fsYFactorLabel && fsYFactorLabel()) || d);

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
            .text(sXAxisLabel);

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
            .text(sYAxisLabel);

        d3.selectAll('g line').style('stroke', sColorGridlines);
    };

    return (
        <Fragment>
            <style>
                {`
                    .d3-bar-graph-container > .contentContainer .xAxis text {
                        color: ${sColorLabels};
                        font-size: 12px;
                    }
            
                    .d3-bar-graph-container > .contentContainer .yAxis text {
                        color: ${sColorLabels};
                        font-size: 12px;
                    }
                `}
            </style>
            <g className="gridlines" ref={node => d3Select(node).call(fAppendGridLines)} />
            <g
                className="xAxis"
                ref={node => d3Select(node).call(xAxis)}
                style={{
                    transform: `translateY(${height}px)`,
                }}
            />
            <g className="yAxis" ref={node => d3Select(node).call(yAxis)} />
        </Fragment>
    );
};
