// ref: https://github.com/AnalyticalFlavorSystems/d3ReactExample/blob/master/src/components/TimeSeriesSparkLineScatterPlot/index.js
// ref: gridlines: https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218

import React, { Fragment } from 'react';
import { extent as d3ArrayExtent } from 'd3-array';
import { axisBottom as d3AxisBottom, axisLeft as d3AxisLeft } from 'd3-axis';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { select as d3Select } from 'd3-selection';
import { line as d3Line } from 'd3-shape';

import RRMAxisAndGridlines from './rrm-axis-and-gridlines';
import SVGWithMargin from './d3-svg-with-margin/d3-svg-with-margin';

export default ({
    fValueToColor,
    data,
    height,
    iAxisInterval,
    iMaxX,
    iMaxY,
    margin,
    sColorGridlines,
    sColorLabels,
    sXAxisLabel,
    sYAxisLabel,
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
        .ticks(data.length / 2);
    const yAxis = d3AxisLeft()
        .scale(yScale)
        .ticks(data.length);

    const selectScaledX = datum => xScale(datum.x);
    const selectScaledY = datum => yScale(datum.y);

    const sparkLine = d3Line()
        .x(selectScaledX)
        .y(selectScaledY);

    const linePath = sparkLine(data);
    const circlePoints = data.map(datum => {
        return {
            x: selectScaledX(datum),
            y: selectScaledY(datum),
        };
    });

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
                <g className="line">
                    <path d={linePath} />
                </g>
                <g className="scatter">
                    {circlePoints.map(circlePoint => (
                        <circle cx={circlePoint.x} cy={circlePoint.y} key={`${circlePoint.x},${circlePoint.y}`} r={4} />
                    ))}
                </g>
                {/*<RRMAxisAndGridlines {...this.props} {...this.state} />*/}
            </SVGWithMargin>
        </Fragment>
    );
};
