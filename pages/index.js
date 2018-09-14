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
            siThemeChartAxisInterval: '1',
            siThemeChartBarWidth: '50',
            siThemeChartHeight: '500',
            siThemeChartWidth: '1000',
            fsThemeColorWithAlpha: function(sThemeColor, sAlpha) {
                let sRgb = this[sThemeColor] && this[sThemeColor].split('rgb(')[1].split(')')[0];
                if (!sRgb) sRgb = '0,0,0'; // default to black
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
    }

    fHandleChange(e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.instance.setState({
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

    fHandleReportDataUpload = async files => {
        const formdata = new FormData();

        if (!files[0]) return Promise.resolve();
        formdata.append('reportInputData', files[0]);

        const oResponse = await this.mBaseService.fpPost('/reports', {
            oFormData: formdata,
        });

        if (oResponse) {
            this.setState({
                oReportData: oResponse,
            });
        } else {
            // TODO: handle
        }
    };

    fHandleLogoUpload = async files => {
        this.setState({
            imageHeader: files[0],
        });
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

    fClearFiles = () => {
        this.setState({
            oReportData: null,
        });
    };

    fHandleDownloadReportClick = (elReport, _sReportDate, _sReportTitle) => {
        let elHideButtonsRow;
        const elShadowReport = document.createElement('html'); // it's a clone (virtual dom) so we don't mess with the rendered DOM
        const sFileName = (_sReportTitle + '-' + _sReportDate).toLowerCase().replace(/[^\w]/g, '-');

        elShadowReport.innerHTML = elReport.innerHTML; // clone DOM byval, not byref
        elHideButtonsRow = elShadowReport.querySelector('#HideButtonsRow');
        elHideButtonsRow.parentElement.removeChild(elHideButtonsRow);
        elShadowReport.querySelector('#DownloadableReport').style;
        // TODO: add missing style. It should be within downloaded-report.scss, but how can we append that?!?!
        //      whatver we do, we should be able to append custom style from a text box similarly; and js and html

        this.state.fDownload(sFileName + '.html', elShadowReport.innerHTML);
    };

    render() {
        return (
            <Layout {...this.props} navmenu={false} container={false}>
                <style>{`
                    body {
                        font-family: Arial;
                    }
                `}</style>
                {!this.state.oReportData && (
                    <DefaultHomeView
                        {...this.props}
                        {...this.state}
                        fHandleChange={this.fHandleChange}
                        fHandleColorRangeChange={this.fHandleColorRangeChange}
                        fHandleLogoUpload={this.fHandleLogoUpload}
                        fHandleReportDataUpload={this.fHandleReportDataUpload}
                        fHandleThemeJsonUpload={this.fHandleThemeJsonUpload}
                        files={this.state.files}
                    />
                )}
                {this.state.oReportData && (
                    <RrmReport
                        {...this.props}
                        {...this.state}
                        fClearFiles={this.fClearFiles}
                        fHandleDownloadReportClick={this.fHandleDownloadReportClick}
                    />
                )}
            </Layout>
        );
    }
}
