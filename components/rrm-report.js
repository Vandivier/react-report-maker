import { interpolateLab } from 'd3-interpolate';
import { scaleLinear } from 'd3-scale';
import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Container, Row, Col, Button, Jumbotron } from 'reactstrap';

import D3BarGraph from './d3-bar-graph';
import { runInDebugContext } from 'vm';

export default class extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            arrarroGraphDatas: props.oReportData.arrarroGraphDatas,
            iMaxX: 10 + 0.5, // TODO: make it a spreadsheet meta val, but still add the .5 so we don't clip bar
            sReportDate: props.oReportData.arrsMetadata[4],
            iMaxY: props.oReportData.arrsMetadata[6],
            sReportTitle: props.oReportData.arrsMetadata[2],
        };

        this.fValueToColor = iValue => {
            const oMatch = props.arroColorRanges && props.arroColorRanges.find(oColorRange => oColorRange.values.includes(iValue));
            return oMatch && oMatch.color; // if !oMatch, d3 is expected to render black by default
        };
    }

    foBarGraphProps(_oGraphData) {
        try {
            return {
                barWidth: parseInt(this.props.siThemeChartBarWidth),
                fValueToColor: this.fValueToColor,
                data: _oGraphData.arroGraphData,
                height: parseInt(this.props.siThemeChartHeight),
                iAxisInterval: parseInt(this.props.siThemeChartAxisInterval),
                iMaxX: this.state.iMaxX,
                iMaxY: this.state.iMaxY,
                margin: 25, // TODO: make customizable? but like how much value is there and do ppl actually care
                selectX: datum => datum.value,
                selectY: datum => datum.count,
                width: parseInt(this.props.siThemeChartWidth),
            };
        } catch (e) {
            console.log('couldnt parse oGraphData. Prob a parseInt issue. Returning base chart theme config without data', e);
            // TODO: maybe try base theme with custom data before returning base theme with no data
            return {
                barWidth: 50,
                data: [],
                height: 500,
                iAxisInterval: 1,
                margin: 25,
                width: 1000,
            };
        }
    }

    render() {
        return (
            <div
                id="DownloadableReport"
                style={{
                    width: '100%',
                }}
            >
                {/* TODO: inject arbitrary html, js, and css here */}
                {this.props.imageHeaderBas64Source && (
                    <img
                        src={this.props.imageHeaderBas64Source}
                        style={{
                            width: '100%',
                        }}
                    />
                )}
                <Jumbotron
                    className="text-light rounded-0"
                    style={{
                        backgroundColor: this.props.sThemeColorOffGrey,
                        background:
                            'radial-gradient(ellipse at center, ' +
                            this.props.fsThemeColorWithAlpha('sThemeColorOffGrey', 0) +
                            ' 0%,' +
                            this.props.fsThemeColorWithAlpha('sThemeColorOffGrey', 1) +
                            ' 100%)',
                        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.1)',
                    }}
                >
                    <Container className="mt-2 mb-4">
                        <Row>
                            <h1 className="display-2" style={{ color: this.props.sThemeColorPrimary, fontSize: 32, fontWeight: 'bold' }}>
                                {this.state.sReportTitle}
                            </h1>
                        </Row>

                        <Row>
                            <p className="lead" style={{ color: this.props.sThemeColorPrimary, fontSize: 24, marginBottom: '20px' }}>
                                {this.state.sReportDate}
                            </p>
                        </Row>

                        <Row id="HideButtonsRow">
                            <button className="btn btn-outline-light btn-lg" onClick={this.props.fClearFiles}>
                                Clear Report Data
                            </button>

                            <button
                                className="btn btn-outline-light btn-lg"
                                onClick={e =>
                                    this.props.fHandleDownloadReportClick(
                                        ReactDOM.findDOMNode(this),
                                        this.state.sReportDate,
                                        this.state.sReportTitle
                                    )
                                }
                                style={{
                                    marginLeft: 20,
                                }}
                            >
                                Download Report Data
                            </button>
                        </Row>
                    </Container>

                    {this.state.arrarroGraphDatas.map((oGraphData, i) => {
                        return (
                            <Container className="" key={'graph-container-' + i}>
                                <h3
                                    className="graph-title"
                                    key={'graph-title-' + i}
                                    style={{
                                        color: this.props.sThemeColorOffWhite,
                                        fontSize: 18,
                                    }}
                                >
                                    {oGraphData.sGraphTitle}
                                </h3>
                                <span
                                    key={'graph-response-count-' + i}
                                    style={{
                                        color: this.props.sThemeColorOffWhite,
                                        fontSize: 14,
                                    }}
                                >
                                    Response Count: {oGraphData.arroGraphData.reduce((iAcc, oGraphData) => iAcc + oGraphData.count, 0)} /{' '}
                                    {this.state.iMaxY}
                                </span>
                                <D3BarGraph {...this.foBarGraphProps(oGraphData)} key={'graph-' + i} />

                                {/* TODO: trend line over time for given person and question
                                    <D3LineGraph {...this.foBarGraphProps(oGraphData)} key={'graph-' + i} />
                                */}
                            </Container>
                        );
                    })}
                </Jumbotron>
            </div>
        );
    }
}
