// ref: https://github.com/AnalyticalFlavorSystems/d3ReactExample/blob/master/src/components/TimeSeriesSparkLineScatterPlot/index.js
// ref: gridlines: https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
// ref: react-faux-dom: https://vijayt.com/post/plotting-bar-chart-d3-react/

import React, { Fragment } from 'react';

import { scaleLinear as d3ScaleLinear } from 'd3-scale';

import RRMAxisAndGridlines from './rrm-axis-and-gridlines';
import SVGWithMargin from './d3-svg-with-margin/d3-svg-with-margin';

export default class extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            xScale: d3ScaleLinear()
                .domain([0, this.props.iMaxX])
                .range([0, this.props.width]),
            yScale: d3ScaleLinear()
                .domain([0, this.props.iMaxY])
                .range([this.props.height, 0]),
        };
    }

    render() {
        return (
            <Fragment>
                <style>
                    {// TODO: do a real css import or inline the styles
                    `
            .d3-bar-graph-container > .contentContainer > .contentContainerBackgroundRect {
                fill: #fafafa;
            
            .d3-bar-graph-container > .contentContainer .line path {
                fill: transparent;
                stroke: #29b6f6;
                stroke-width: 2;
            }
            `}
                </style>
                <SVGWithMargin
                    className="d3-bar-graph-container"
                    contentContainerBackgroundRectClassName="contentContainerBackgroundRect"
                    contentContainerGroupClassName="contentContainer"
                    height={this.props.height}
                    margin={this.props.margin}
                    width={this.props.width}
                >
                    <g className="bars">
                        {this.props.data.map((datum, i) => (
                            <rect
                                key={'bar-' + i}
                                x={this.state.xScale(datum.value) - this.props.barWidth / 2}
                                y={this.state.yScale(datum.count)}
                                height={this.props.height - this.state.yScale(datum.count)}
                                width={this.props.barWidth}
                                fill={this.props.fValueToColor(datum.value)}
                            />
                        ))}
                    </g>
                    <RRMAxisAndGridlines {...this.props} {...this.state} />
                </SVGWithMargin>
            </Fragment>
        );
    }
}
