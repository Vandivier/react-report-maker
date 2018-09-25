import React from 'react';
import ReactDOM from 'react-dom';
import { Container, Row, Jumbotron } from 'reactstrap';

import D3BarGraph from './d3-bar-graph';
import D3LineGraph from './d3-line-graph';

export default class extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fLinePathToColor: linePath => this.state.sThemeColorOffGrey, // TODO: maybe we can do a better function?
            fValueToColor: iValue => {
                const oMatch = props.arroColorRanges && props.arroColorRanges.find(oColorRange => oColorRange.values.includes(iValue));
                return oMatch && oMatch.color; // if !oMatch, d3 is expected to render black by default
            },
        };

        this.fParsePanelColumns();

        this.fHandleLineGraphClick = this.fToggleLineGraphView.bind(this);
        this.foBarGraphProps = this.foBarGraphProps.bind(this);
        this.foLineGraphData = this.foLineGraphData.bind(this);
    }

    // TODO: today we take the first report's questions/columns (this.state.arroColumns)
    //      but, we could loop through all reports and create a superset of questions/columns that exist on any report
    // TODO: prerender bar charts for all t, unless it creates perf load or extreme file size bloat
    fParsePanelColumns() {
        this.state.arroPanelColumns = [];

        this.props.arroReportDatas.forEach(oReportData => {
            oReportData.arrarroColumns.map((oGraphData, iColumn) => {
                this.state.arroPanelColumns[iColumn] = this.state.arroPanelColumns[iColumn] || [];
                this.state.arroPanelColumns[iColumn].push(this.foBarGraphProps(oReportData, oGraphData));
            });
        });
    }

    // graphdata is like a single question on a single report
    // report data is like a single survey
    // arroReportDatas is like a panel of survey data
    // TODO: this should be like 'prepare report data' not 'prepare bar graph data'
    //          unless we want a seperate 'prepare line graph data', etc
    foBarGraphProps(_oReportData, _oGraphData) {
        try {
            let oUnfilteredReport;
            let oUnfilteredColumn;

            if (this.props.arroUnfilteredReportDatas) {
                oUnfilteredReport = this.props.arroUnfilteredReportDatas[_oReportData.iPriority];
                oUnfilteredColumn = oUnfilteredReport.arrarroColumns[_oGraphData.iColumnNumber];
            }

            return Object.assign({}, _oGraphData, {
                arriColumnsToExclude: (this.props.sColumnsToExclude || '').split(','),
                arriColumnsToMask: (this.props.sColumnsToMask || '').split(','),
                arroLabelMasks: this.props.arroLabelMasks,
                barWidth: parseInt(this.props.siThemeChartBarWidth),
                bHideUnmaskedValues: this.props.bHideUnmaskedValues,
                bMaskLineGraphXAxis: this.props.bMaskLineGraphXAxis,
                data: _oGraphData.arroColumnCells,
                dataUnfiltered: oUnfilteredColumn && oUnfilteredColumn.arroColumnCells,
                fLinePathToColor: this.state.fLinePathToColor, // TODO: maybe pass indirectly
                fValueToColor: this.state.fValueToColor, // TODO: maybe pass indirectly
                height: parseInt(this.props.siThemeChartHeight),
                iAxisInterval: parseInt(this.props.siThemeChartAxisInterval),
                iMaxX: parseFloat(_oReportData.iMaxX),
                iMaxY: parseFloat(_oReportData.iMaxY),
                iUnfilteredResponseAverage: oUnfilteredColumn && oUnfilteredColumn.iResponseAverage,
                margin: 50, // TODO: make customizable? but like how much value is there and do ppl actually care
                oAssociatedReport: _oReportData,
                sColorGridlines: this.props.sThemeColorGridlines,
                sColorLabels: this.props.sThemeColorPrimary,
                sXAxisLabel: _oReportData.sReportBarGraphXAxisLabel,
                sYAxisLabel: _oReportData.sReportBarGraphYAxisLabel,
                width: parseInt(this.props.siThemeChartWidth),
            });
        } catch (e) {
            console.log('couldnt parse graph data. Returning base chart theme config without data', e);
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

    foLineGraphData(oMassagedBarGraphData, arroColumnDataByReport) {
        return Object.assign({}, oMassagedBarGraphData, {
            data: arroColumnDataByReport.map(_oColumnWithinReport => {
                return Object.assign({}, _oColumnWithinReport, {
                    x: _oColumnWithinReport.oAssociatedReport.iPriority,
                    y: _oColumnWithinReport.iResponseAverage,
                    info: _oColumnWithinReport,
                });
            }),
            iMaxX: arroColumnDataByReport.length - 1,
            iMaxY: this.props.sDataMaxYLinegraph,
            sXAxisLabel: this.props.sDataXAxisLabel,
            sYAxisLabel: this.props.sDataYAxisLabel,
        });
    }

    // indirectly cause rerender using setState
    // ref: https://stackoverflow.com/questions/42630473/react-toggle-class-onclick
    // ref: https://stackoverflow.com/questions/30626030/can-you-force-a-react-component-to-rerender-without-calling-setstate
    fToggleLineGraphView(e) {
        document.body.classList.toggle('show-line-graphs');
    }

    render() {
        return (
            <div
                id="DownloadableReport"
                style={{
                    width: '100%',
                }}
            >
                <style>{this.props.sThemeCustomStyle}</style>
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
                    className="rounded-0"
                    style={
                        this.props.bUseGradientBackground
                            ? {
                                  background:
                                      'radial-gradient(ellipse at center, ' +
                                      this.props.fsThemeColorWithAlpha('sThemeColorOffWhite', 0) +
                                      ' 0%,' +
                                      this.props.fsThemeColorWithAlpha('sThemeColorOffWhite', 1) +
                                      ' 100%)',
                                  boxShadow: 'inset 0 0 100px rgba(0,0,0,0.1)',
                              }
                            : {
                                  backgroundColor: this.props.sThemeColorOffWhite,
                              }
                    }
                >
                    <Container style={{ marginBottom: 20 }}>
                        <style>
                            {`
                                button.btn.btn-outline-light.btn-lg {
                                    border-color: ${this.props.sThemeColorOffGrey};
                                    color: ${this.props.sThemeColorOffGrey};
                                }
                            `}
                        </style>
                        <Row>
                            <h1
                                className="display-2"
                                style={{
                                    color: this.props.sThemeColorPrimary,
                                    fontSize: 32,
                                    fontWeight: 'bold',
                                    margin: '-30px auto 0',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {this.props.sPanelTitle}
                            </h1>
                        </Row>

                        <Row id="DontHideButtonsRow">
                            <button
                                className="btn btn-outline-light btn-lg"
                                id="handle-line-graph-click"
                                onClick={this.fHandleLineGraphClick}
                                style={{ margin: 'auto', marginTop: 50 }}
                            >
                                Toggle Line/Bar Graph
                            </button>
                        </Row>

                        <Row id="HideButtonsRow" style={{ marginTop: 20 }}>
                            <button className="btn btn-outline-light btn-lg" onClick={this.props.fReturnToSetup}>
                                Return to Report Setup
                            </button>

                            <button
                                className="btn btn-outline-light btn-lg"
                                onClick={e => this.props.fHandleDownloadReportClick(ReactDOM.findDOMNode(this))}
                                style={{
                                    marginLeft: 20,
                                }}
                            >
                                Download Report Data
                            </button>
                        </Row>
                    </Container>

                    {this.state.arroPanelColumns.map((arroColumnDataByReport, iColumn) => {
                        // the last arroColumnDataByReport is the current period
                        const oMassagedData = arroColumnDataByReport[arroColumnDataByReport.length - 1];

                        if (oMassagedData.arriColumnsToExclude.includes(iColumn.toString())) return null;

                        return (
                            <Container key={'graph-container-' + iColumn} style={{ marginTop: 70 }}>
                                <Row>
                                    <h3
                                        className="graph-title"
                                        key={'graph-title-' + iColumn}
                                        style={{
                                            color: this.props.sThemeColorSecondary,
                                            fontSize: 18,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {oMassagedData.sGraphTitle}
                                    </h3>
                                </Row>
                                <Row>
                                    <p
                                        className="graph-info"
                                        key={'graph-response-average-' + iColumn}
                                        title={oMassagedData.iUnfilteredResponseAverage}
                                    >
                                        {this.props.sMetaTextUnfilteredAverage}:{' '}
                                        {oMassagedData.iUnfilteredResponseAverage && oMassagedData.iUnfilteredResponseAverage.toFixed(2)}
                                    </p>
                                </Row>
                                <Row>
                                    <p
                                        className="graph-info"
                                        key={'graph-response-average-' + iColumn}
                                        title={oMassagedData.iResponseAverage}
                                    >
                                        {this.props.sMetaTextFilteredAverage}:
                                        {oMassagedData.iResponseAverage && oMassagedData.iResponseAverage.toFixed(2)}
                                    </p>
                                </Row>
                                <Row>
                                    <p className="graph-info" key={'graph-response-count-' + iColumn}>
                                        Response Count: {oMassagedData.iResponseCount} / {oMassagedData.iMaxY}
                                    </p>
                                </Row>

                                {/* render even if it isn't shown, so it will be available after download */}
                                <div className="d3-bar-graph-wrapper">
                                    <D3BarGraph {...oMassagedData} key={'bar-graph-' + iColumn} />
                                </div>
                                <div className="d3-line-graph-wrapper">
                                    <D3LineGraph
                                        {...this.foLineGraphData(oMassagedData, arroColumnDataByReport)}
                                        key={'line-graph-' + iColumn}
                                    />
                                </div>
                                <style>
                                    {`
                                        body.show-line-graphs .d3-bar-graph-wrapper {
                                            display: none;
                                        }
                                        body.show-line-graphs .d3-line-graph-wrapper {
                                            display: initial;
                                        }
                                        body .d3-bar-graph-wrapper {
                                            display: initial;
                                        }
                                        body .d3-line-graph-wrapper {
                                            display: none;
                                        }

                                        .graph-info {
                                            color: ${this.props.sThemeColorOffGrey ? this.props.sThemeColorOffGrey : 'inherit'};
                                            font-size: 14px;
                                            margin-bottom: 0;
                                        }
                                    `}
                                </style>
                            </Container>
                        );
                    })}
                </Jumbotron>
            </div>
        );
    }
}
