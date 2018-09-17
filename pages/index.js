import Link from 'next/link';
import React, { Component, Fragment } from 'react';

import DefaultHomeView from '../components/default-home-view';
import Page from '../components/page';
import RrmReport from '../components/rrm-report';
import Layout from '../components/layout';
import { ServiceBaseService } from '../services/service-base/service-base.service';

export default class extends Page {
    constructor(props) {
        super(props);

        this.state = {
            instance: this,
            files: [],
            sDataXAxisLabel: 'Value of Response',
            sDataYAxisLabel: 'Frequency of Response',
            sPanelLabel: 'Time',
            iPanelMaxX: 10.5, // default bc it's just sort of like a standard survey value
            sThemeColorOffWhite: 'lightcyan',
            sThemeColorOffGrey: 'silver',
            sThemeColorPrimary: '#97dcdc',
            sThemeColorSecondary: 'darkcyan',
            sThemeCustomStyle: `body { font-family: Arial; }`, // TODO: interpolatable theme colors
            siThemeChartAxisInterval: '1',
            siThemeChartBarWidth: '50',
            siThemeChartHeight: '500',
            siThemeChartWidth: '1000',
            fsThemeColorWithAlpha: function(sThemeColor, sAlpha) {
                let sRgb =
                    (this[sThemeColor] && this[sThemeColor].split('rgb(')[1] && this[sThemeColor].split('rgb(')[1].split(')')[0]) ||
                    '0,0,0'; // default to black
                return 'rgba(' + sRgb + ',' + sAlpha + ')';
            },
            // ref: https://stackoverflow.com/a/18197341/3931488
            fDownload: (filename, text) => {
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', filename);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            },
        };

        this.fHandleChange = this.fHandleChange.bind(this);
        this.fHandleDownloadReportClick = this.fHandleDownloadReportClick.bind(this);
        this.fHandlePanelLineGraphVariableChange = this.fHandlePanelLineGraphVariableChange.bind(this);
        this.fHandleReportDataChange = this.fHandleReportDataChange.bind(this);
        this.fHandleViewReportButtonClick = this.fHandleViewReportButtonClick.bind(this);
    }

    farrProcessReport(arr) {
        return arr
            .map((oReportData, i) =>
                Object.assign(
                    {
                        iId: i,
                        iMaxY: oReportData.arrsMetadata[6],
                        iMaxX: oReportData.arrsMetadata[8] || this.state.iPanelMaxX,
                        iPriority: i,
                        sReportDate: oReportData.arrsMetadata[4],
                        sReportTitle: oReportData.arrsMetadata[2],
                        sLabel: oReportData.arrsMetadata[4] || oReportData.arrsMetadata[2], // TODO: file name as additional fallback?
                    },
                    oReportData
                )
            )
            .sort((a, b) => a.iPriority - b.iPriority);
    }

    // Today, setup === home page. but maybe not down the road.
    fReturnToSetup = () => {
        this.setState({
            bShowReport: false,
        });
    };

    fHandleChange(e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value,
        });
    }

    // TODO: support oRange.min and oRange.max
    // ref: https://stackoverflow.com/questions/28121272/whats-the-best-way-to-update-an-object-in-an-array-in-reactjs
    fHandleColorRangeChange(e, oRange, i) {
        const arroNewColorRanges = [...this.arroColorRanges];
        arroNewColorRanges[i] = Object.assign(oRange, { color: e.target.value });

        this.instance.setState({
            arroColorRanges: arroNewColorRanges,
        });
    }

    // if you use the LineGraphVariable option, you can only upload one master spreadsheet
    // given one report (a panelreport, or master spreadsheet, or panel-in-report), split it into arr of report
    // server will do the splitting
    fHandlePanelLineGraphVariableChange(e) {
        const iColumnDiscriminator = e.target.value;
        const oExistingReport = this.state.arrFiles[0];
        let arroResponses = [];

        if (!files[0]) return Promise.resolve();

        arroPromises = [oExistingReport].map(file => {
            const formdata = new FormData();
            formdata.append('reportInputData', file);

            return this.mBaseService.fpPost('/reports/split-panel-by-column', {
                oFormData: formdata,
                iColumnDiscriminator: iColumnDiscriminator,
            });
        });

        arroResponses = await Promise.all(arroPromises);

        if (arroResponses.length) {
            arroNewReportDatas = this.farrProcessReport(arroResponses);
            this.setState({
                arroFiles: files,
                arroReportDatas: arroNewReportDatas,
                //iPanelMaxX: arroNewReportDatas[0].iMaxX,
                //sPanelTitle: arroNewReportDatas[0].sReportTitle,
                [e.target.name]: iColumnDiscriminator,
            });
        } else {
            // TODO: handle
        }
        
        /*
        const target = e.target;
        const iColumnDiscriminator = target.value;
        const oLineGraphVariableMap = {};
        const name = target.name;
        //const arroNewReportDatas = this.farrProcessReport(oExistingReport.map(oReportData => {}));

        arroExistingReportData.arrarroColumns[iColumnDiscriminator];
        oExistingReport.forEach((oReportData, i) => {
            const sReportDiscriminator = oReportData[iColumnDiscriminator];
            oLineGraphVariableMap[sReportDiscriminator] = (oLineGraphVariableMap[sReportDiscriminator] || []).concat();
        });

        debugger;

        this.setState({
            arroReportDatas: this.farrProcessReport(Object.keys(oLineGraphVariableMap).map(sKey => oLineGraphVariableMap[sKey])),
            [name]: value,
        });
        */
    }

    // TODO: maybe some code dup with farrProcessReport
    fHandleReportDataChange = (e, oUpdatedReport) => {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            arroReportDatas: this.state.arroReportDatas
                .map(_oReport => {
                    if (_oReport.iId === oUpdatedReport.iId) {
                        // TODO: could handle evaluating priority on user's behalf
                        return Object.assign(oUpdatedReport, { [name]: value });
                    } else {
                        return _oReport;
                    }
                })
                .sort((a, b) => a.iPriority - b.iPriority),
        });
    };

    fHandleReportDataUpload = async files => {
        const arroExistingReportData = this.state.arroReportDatas || [];
        let arroNewReportDatas = [];
        let arroPromises = [];
        let arroResponses = [];

        if (!files[0]) return Promise.resolve();

        arroPromises = files.map(file => {
            const formdata = new FormData();
            formdata.append('reportInputData', file);

            return this.mBaseService.fpPost('/reports', {
                oFormData: formdata,
            });
        });

        arroResponses = await Promise.all(arroPromises);

        if (arroResponses.length) {
            arroNewReportDatas = this.farrProcessReport(arroExistingReportData.concat(arroResponses));
            this.setState({
                arroFiles: files,
                arroReportDatas: arroNewReportDatas,
                iPanelMaxX: arroNewReportDatas[0].iMaxX,
                sPanelTitle: arroNewReportDatas[0].sReportTitle,
            });
        } else {
            // TODO: handle
        }
    };

    // TODO: rename fHandleHeadingUpload
    fHandleLogoUpload = async files => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(files[0]);

        this.setState({
            imageHeader: files[0],
        });

        fileReader.onload = event => {
            this.setState({
                imageHeaderBas64Source: fileReader.result,
            });
        };
    };

    // ref: https://stackoverflow.com/questions/49776193/react-open-json-file-via-dialog-and-read-content
    fHandleThemeJsonUpload = async files => {
        const fileReader = new FileReader();
        fileReader.readAsText(files[0]);

        fileReader.onload = event => {
            const oParsedTheme = JSON.parse(event.target.result);
            this.setState(oParsedTheme);
        };
    };

    fHandleViewReportButtonClick = e => {
        this.setState({
            bShowReport: true,
        });
    };

    fHandleDownloadReportClick = elReport => {
        let elHideButtonsRow;
        const elShadowDocument = document.createElement('html'); // it's a clone byval (virtual dom) so we don't mess with the rendered DOM
        const elShadowReport = document.createElement('div');
        const elShadowStyle = document.createElement('style');
        const sFileName = (this.sPanelTitle + '-' + new Date().getTime()).toLowerCase().replace(/[^\w]/g, '-');

        elShadowReport.innerHTML = elReport.innerHTML;
        elHideButtonsRow = elShadowReport.querySelector('#HideButtonsRow');
        elHideButtonsRow.parentElement.removeChild(elHideButtonsRow);
        elShadowReport.id = 'DownloadableReport';

        elShadowDocument.appendChild(elShadowReport);

        // style.next-head + css text
        // TODO: add missing style. It should be within downloaded-report.scss, but how can we append that?!?!
        //      whatver we do, we should be able to append custom style from a text box similarly; and js and html
        elShadowStyle.appendChild(document.createTextNode(document.querySelector('style.next-head').innerText));
        elShadowStyle.appendChild(document.createTextNode(this.state.sThemeCustomStyle));
        elShadowDocument.appendChild(elShadowStyle);

        this.fDownload(sFileName + '.html', elShadowDocument.innerHTML);
    };

    render() {
        return (
            <Layout {...this.props} navmenu={false} container={false}>
                <style>{this.state.sThemeCustomStyle}</style>
                {!this.state.bShowReport && (
                    <DefaultHomeView
                        {...this.props}
                        {...this.state}
                        fHandleChange={this.fHandleChange}
                        fHandleColorRangeChange={this.fHandleColorRangeChange}
                        fHandleLogoUpload={this.fHandleLogoUpload}
                        fHandlePanelLineGraphVariableChange={this.fHandlePanelLineGraphVariableChange}
                        fHandleReportDataChange={this.fHandleReportDataChange}
                        fHandleReportDataUpload={this.fHandleReportDataUpload}
                        fHandleThemeJsonUpload={this.fHandleThemeJsonUpload}
                        fHandleViewReportButtonClick={this.fHandleViewReportButtonClick}
                        files={this.state.files}
                    />
                )}
                {this.state.bShowReport && (
                    <RrmReport
                        {...this.props}
                        {...this.state}
                        fReturnToSetup={this.fReturnToSetup}
                        fHandleDownloadReportClick={this.fHandleDownloadReportClick}
                    />
                )}
            </Layout>
        );
    }
}
