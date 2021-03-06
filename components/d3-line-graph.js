// ref: https://github.com/AnalyticalFlavorSystems/d3ReactExample/blob/master/src/components/TimeSeriesSparkLineScatterPlot/index.js
// ref: gridlines: https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218

import React, { Fragment } from 'react';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { line as d3Line } from 'd3-shape';

import RRMAxisAndGridlines from './rrm-axis-and-gridlines';
import SVGWithMargin from './d3-svg-with-margin/d3-svg-with-margin';

export default class extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fsXFactorLabel: (d, i) => {
                const oMaskedValue =
                    this.props.arroLabelMasks &&
                    d !== undefined &&
                    this.props.arroLabelMasks.find(oLabelMask => oLabelMask.sMaskLabel === d.toString());
                const sMaskedValue = oMaskedValue && oMaskedValue.sMaskValue;

                if (!this.props.bMaskLineGraphXAxis) return d;

                if (sMaskedValue) return sMaskedValue;

                if (this.props.bHideUnmaskedValues) {
                    return '';
                }

                return d;
            },
            fsYFactorLabel: (d, i) => d,
            xScale: d3ScaleLinear()
                .domain([0, this.props.iMaxX])
                .range([0, this.props.width]),
            yScale: d3ScaleLinear()
                .domain([0, this.props.iMaxY])
                .range([this.props.height, 0]),
        };

        // TODO: reimpliment when i have time to figure out why it isn't working
        //      as a direct class method
        this.selectScaledX = function(datum) {
            return this.state.xScale(datum.x);
        }.bind(this);
        this.selectScaledY = function(datum) {
            return this.state.yScale(datum.y);
        }.bind(this);

        this.state.circlePoints = this.props.data.map(datum => {
            return {
                x: this.selectScaledX(datum),
                y: this.selectScaledY(datum),
            };
        });

        this.state.fsXFactorLabel = this.state.fsXFactorLabel.bind(this);
        this.state.fsYFactorLabel = this.state.fsYFactorLabel.bind(this);
    }

    // ref: https://bl.ocks.org/kdubbels/c445744cd3ffa18a5bb17ac8ad70017e
    // ref: https://github.com/d3/d3-shape
    // wtf idk
    fd3Line = d3Line();

    render() {
        return (
            <Fragment>
                <style>
                    {// TODO: do a real css import or inline the styles
                    `
            .d3-bar-graph-container > .contentContainer > .contentContainerBackgroundRect {
                fill: #fafafa;
            }
            
            .d3-bar-graph-container > .contentContainer .line path {
                fill: black;
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
                    height={this.props.height}
                    margin={this.props.margin}
                    width={this.props.width}
                >
                    <g className="line">
                        <path d={this.fd3Line.x(this.selectScaledX).y(this.selectScaledY)(this.props.data)} />
                    </g>

                    <g className="scatter">
                        {this.state.circlePoints.map(circlePoint => (
                            <circle cx={circlePoint.x} cy={circlePoint.y} key={`${circlePoint.x},${circlePoint.y}`} r={4} />
                        ))}
                    </g>
                    <RRMAxisAndGridlines {...this.props} {...this.state} />
                </SVGWithMargin>
            </Fragment>
        );
    }
}
