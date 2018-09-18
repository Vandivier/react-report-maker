import React from 'react';
import ReactDOM from 'react-dom';
import { Container, Row, Jumbotron } from 'reactstrap';

import D3BarGraph from './d3-bar-graph';
import D3LineGraph from './d3-line-graph';
import IconLineGraph from './icon-line-graph';

export default class extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            bLineGraphMode: false,
            fLinePathToColor: linePath => this.state.sThemeColorOffGrey, // TODO: maybe we can do a better function?
            fValueToColor: iValue => {
                const oMatch = props.arroColorRanges && props.arroColorRanges.find(oColorRange => oColorRange.values.includes(iValue));
                return oMatch && oMatch.color; // if !oMatch, d3 is expected to render black by default
            },
            sInitialIconBackgroundColor: 'rgb(230,230,230)',
            sInitialIconPrimaryLineColor: 'black',
            sInitialIconSecondaryLineColor: 'black',
        };

        this.state.sIconBackgroundColor = this.props.sThemeColorOffWhite;
        this.state.sIconPrimaryLineColor = this.props.sThemeColorPrimary;
        this.state.sIconSecondaryLineColor = this.props.sThemeColorSecondary;

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
            let iResponseCount = 0;
            let iResponseValue = 0;

            _oGraphData.arroColumnCells.forEach(oGraphData => {
                iResponseCount += oGraphData.count;
                iResponseValue += oGraphData.count * oGraphData.value;
            });

            return {
                barWidth: parseInt(this.props.siThemeChartBarWidth),
                data: _oGraphData.arroColumnCells,
                fLinePathToColor: this.state.fLinePathToColor, // TODO: maybe pass indirectly
                fValueToColor: this.state.fValueToColor, // TODO: maybe pass indirectly
                height: parseInt(this.props.siThemeChartHeight),
                iAxisInterval: parseInt(this.props.siThemeChartAxisInterval),
                iMaxX: parseFloat(_oReportData.iMaxX),
                iMaxY: parseFloat(_oReportData.iMaxY),
                iResponseAverage: iResponseValue / iResponseCount,
                iResponseCount,
                iResponseValue,
                margin: 50, // TODO: make customizable? but like how much value is there and do ppl actually care
                oAssociatedReport: _oReportData,
                sColorGridlines: this.props.sThemeColorOffWhite,
                sColorLabels: this.props.sThemeColorPrimary,
                sGraphTitle: _oGraphData.sGraphTitle,
                sXAxisLabel: _oReportData.sReportBarGraphXAxisLabel,
                sYAxisLabel: _oReportData.sReportBarGraphYAxisLabel,
                width: parseInt(this.props.siThemeChartWidth),
            };
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
            sXAxisLabel: this.props.sDataXAxisLabel,
            sYAxisLabel: this.props.sDataYAxisLabel,
        });
    }

    // indirectly cause rerender using setState
    // ref: https://stackoverflow.com/questions/42630473/react-toggle-class-onclick
    // ref: https://stackoverflow.com/questions/30626030/can-you-force-a-react-component-to-rerender-without-calling-setstate
    fToggleLineGraphView(e) {
        const bNewLineGraphMode = !this.state.bLineGraphMode;
        let sIconBackgroundColor;
        let sIconPrimaryLineColor;
        let sIconSecondaryLineColor;

        if (bNewLineGraphMode) {
            sIconBackgroundColor = this.state.sInitialIconBackgroundColor;
            sIconPrimaryLineColor = this.state.sInitialIconPrimaryLineColor;
            sIconSecondaryLineColor = this.state.sInitialIconSecondaryLineColor;
        } else {
            sIconBackgroundColor = this.props.sThemeColorOffWhite;
            sIconPrimaryLineColor = this.props.sThemeColorPrimary;
            sIconSecondaryLineColor = this.props.sThemeColorSecondary;
        }

        // do the toggle
        this.setState({
            bLineGraphMode: bNewLineGraphMode,
            sIconBackgroundColor,
            sIconPrimaryLineColor,
            sIconSecondaryLineColor,
        });
    }

    render() {
        return (
            <div
                id="DownloadableReport"
                style={{
                    width: '100%',
                }}
            >
                <div
                    className="icon-container"
                    onClick={this.fHandleLineGraphClick}
                    style={{
                        cursor: 'pointer',
                        position: 'fixed',
                        right: 5,
                        top: '20%',
                        width: '30px',
                    }}
                    title={
                        this.state.bLineGraphMode
                            ? 'Return to bar graph view of current period data.'
                            : 'View line graph representation of data over time.'
                    }
                >
                    {/* TODO: have iconlinegraph, iconbargraph, and iconpiegraph */}
                    <IconLineGraph
                        {...{
                            sIconBackgroundColor: this.state.sIconBackgroundColor,
                            sIconPrimaryLineColor: this.state.sIconPrimaryLineColor,
                            sIconSecondaryLineColor: this.state.sIconSecondaryLineColor,
                        }}
                    />
                </div>
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
                    <Container>
                        <Row>
                            <h1 className="display-2" style={{ color: this.props.sThemeColorPrimary, fontSize: 32, fontWeight: 'bold' }}>
                                {this.props.sPanelTitle}
                            </h1>
                        </Row>

                        <Row id="HideButtonsRow">
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
                            <style jsx>
                                {`
                                    button {
                                        border-color: ${this.props.sThemeColorOffWhite};
                                        color: ${this.props.sThemeColorOffWhite};
                                    }
                                `}
                            </style>
                        </Row>
                    </Container>

                    {this.state.arroPanelColumns.map((arroColumnDataByReport, iColumn) => {
                        const oMassagedData = arroColumnDataByReport[0];

                        return (
                            <Container key={'graph-container-' + iColumn}>
                                <Row>
                                    <h3
                                        className="graph-title"
                                        key={'graph-title-' + iColumn}
                                        style={{
                                            color: this.props.sThemeColorOffWhite,
                                            fontSize: 18,
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
                                        Current Period Unfiltered Average Response: {'TODO'}
                                    </p>
                                </Row>
                                <Row>
                                    <p
                                        className="graph-info"
                                        key={'graph-response-average-' + iColumn}
                                        title={oMassagedData.iResponseAverage}
                                    >
                                        Average Response: {oMassagedData.iResponseAverage.toFixed(2)}
                                    </p>
                                </Row>
                                <Row>
                                    <p className="graph-info" key={'graph-response-count-' + iColumn}>
                                        Response Count: {oMassagedData.iResponseCount} / {oMassagedData.iMaxY}
                                    </p>
                                </Row>

                                {/* render even if it isn't shown, so it will be available after download */}
                                <div style={{ display: this.state.bLineGraphMode ? 'none' : 'initial' }}>
                                    <D3BarGraph {...oMassagedData} key={'bar-graph-' + iColumn} />
                                </div>
                                <div style={{ display: !this.state.bLineGraphMode ? 'none' : 'initial' }}>
                                    <D3LineGraph
                                        {...this.foLineGraphData(oMassagedData, arroColumnDataByReport)}
                                        key={'line-graph-' + iColumn}
                                    />
                                </div>
                                <style jsx>
                                    {`
                                        .graph-info {
                                            color: ${this.props.sThemeColorOffWhite ? this.props.sThemeColorOffWhite : 'inherit'};
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
