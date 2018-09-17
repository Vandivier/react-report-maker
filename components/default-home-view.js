import Link from 'next/link';
import React, { Component, Fragment } from 'react';

import ReactDropzone from 'react-dropzone';
import { Container, Row, Col, Button, Jumbotron, ListGroup, ListGroupItem } from 'reactstrap';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    fHandleDownloadThemeClick = e => {
        const arrsRelevantPropKeys = ['arroColorRanges'];
        const oRelevantProps = Object.keys(this.props).reduce((oAcc, sKey) => {
            // Note: remember: !sKey.indexOf means 'starts with' not 'does not include'
            if (arrsRelevantPropKeys.includes(sKey) || !sKey.indexOf('sTheme') || !sKey.indexOf('siTheme')) {
                oAcc[sKey] = this.props[sKey];
            }

            return oAcc;
        }, {});
        this.props.fDownload('report-theme-' + Date.now().toString() + '.json', JSON.stringify(oRelevantProps));
    };

    render() {
        return (
            <Fragment>
                <Jumbotron
                    className="text-light rounded-0"
                    style={{
                        backgroundColor: this.props.sThemeColorOffGrey,
                        background:
                            'radial-gradient(ellipse at center, ' +
                            this.props.fsThemeColorWithAlpha('sThemeColorOffGrey', 0.5) +
                            ' 0%,' +
                            this.props.fsThemeColorWithAlpha('sThemeColorOffGrey', 1) +
                            ' 100%)',
                        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.1)',
                    }}
                >
                    <Container className="mt-2 mb-2">
                        <h1 className="display-2 mb-3" style={{ fontWeight: 300 }}>
                            <span style={{ fontWeight: 600 }}>
                                <br className="v-block d-sm-none" />
                                React
                            </span>
                            <br className="v-block d-lg-none" /> Report Maker
                        </h1>
                        <p className="lead mb-5">Input data, get graphic reports</p>
                        <Row className="col-12" style={{ marginBottom: 20 }}>
                            {this.props.arroReportDatas &&
                                this.props.arroReportDatas.length && (
                                    <button
                                        className="btn btn-outline-light btn-lg"
                                        onClick={e => this.setState({ bShowAdvancedOptions: !this.state.bShowAdvancedOptions })}
                                        title="Click to edit advanced settings like theme colors."
                                    >
                                        View Report
                                    </button>
                                )}

                            <div className="text-left">
                                <ReactDropzone
                                    accept=".txt"
                                    className={'btn btn-outline-light btn-lg'}
                                    multiple={true}
                                    onDrop={this.props.fHandleReportDataUpload.bind(this)}
                                    style={
                                        this.props.arroReportDatas &&
                                        this.props.arroReportDatas.length && {
                                            marginLeft: 20,
                                        }
                                    }
                                    title="Drag and drop or click to select a data file containing tab-separated values."
                                >
                                    {({ isDragActive, isDragReject, acceptedFiles, rejectedFiles }) => {
                                        if (isDragActive) {
                                            return 'Drop here to get started!';
                                        }

                                        return (
                                            <Fragment>
                                                <span className="icon ion-md-cloud-upload mr-2" />
                                                Upload TSV Now
                                            </Fragment>
                                        );
                                    }}
                                </ReactDropzone>

                                <button
                                    className="btn btn-outline-light btn-lg"
                                    onClick={e => this.setState({ bShowAdvancedOptions: !this.state.bShowAdvancedOptions })}
                                    style={{
                                        marginLeft: 20,
                                    }}
                                    title="Click to edit advanced settings like theme colors."
                                >
                                    Advanced Options
                                </button>
                            </div>
                        </Row>

                        {this.props.arroReportDatas &&
                            this.props.arroReportDatas.length && (
                                <Container>
                                    <Row>
                                        <Col xs="12" sm="3" className="pt-5">
                                            <span>Report Title</span>
                                        </Col>
                                        <Col xs="12" sm="3" className="pt-5">
                                            <span>Report X-Axis Label</span>
                                        </Col>
                                        <Col xs="12" sm="3" className="pt-5">
                                            <span>Report Order Number (0 is Current Period)</span>
                                        </Col>
                                    </Row>
                                    {this.props.arroReportDatas.map((oReportData, i) => (
                                        <Row className="pb-5" key={'report-data-fragment-' + i}>
                                            <Col xs="12" sm="3" className="pt-5">
                                                <input
                                                    name="sReportTitle"
                                                    onChange={e => this.props.fHandleReportDataChange(e, oReportData)}
                                                    type="text"
                                                    value={oReportData.sReportTitle}
                                                />
                                            </Col>
                                            <Col xs="12" sm="3" className="pt-5">
                                                <input
                                                    name="sLabel"
                                                    onChange={e => this.props.fHandleReportDataChange(e, oReportData)}
                                                    type="text"
                                                    value={oReportData.sLabel}
                                                />
                                            </Col>
                                            <Col xs="12" sm="3" className="pt-5">
                                                <input
                                                    name="iPriority"
                                                    onChange={e => this.props.fHandleReportDataChange(e, oReportData)}
                                                    type="text"
                                                    value={oReportData.iPriority}
                                                />
                                            </Col>
                                        </Row>
                                    ))}
                                </Container>
                            )}

                        <Row className="col-12">
                            <ReactDropzone
                                accepts={['.json']}
                                className="btn btn-outline-light btn-lg"
                                multiple={false}
                                onDrop={this.props.fHandleThemeJsonUpload.bind(this)}
                                title="Drag and drop or click to select a data file containing tab-separated values."
                            >
                                {({ isDragActive, isDragReject, acceptedFiles, rejectedFiles }) => {
                                    if (isDragActive) {
                                        return 'Drop here to get started!';
                                    }

                                    return (
                                        <Fragment>
                                            <span className="icon ion-md-brush mr-2" />
                                            Upload Theme File (.json)
                                        </Fragment>
                                    );
                                }}
                            </ReactDropzone>

                            <ReactDropzone
                                accepts={['.jpeg', '.jpg', '.png', '.svg']}
                                className="btn btn-outline-light btn-lg"
                                multiple={false}
                                onDrop={this.props.fHandleLogoUpload.bind(this)}
                                style={{
                                    marginLeft: 20,
                                }}
                                title="Drag and drop or click to select a data file containing tab-separated values."
                            >
                                {({ isDragActive, isDragReject, acceptedFiles, rejectedFiles }) => {
                                    if (isDragActive) {
                                        return 'Drop here to get started!';
                                    }

                                    return (
                                        <Fragment>
                                            <span className="icon ion-md-brush mr-2" />
                                            Upload Logo
                                        </Fragment>
                                    );
                                }}
                            </ReactDropzone>

                            {this.props.imageHeader && (
                                <img
                                    src={this.props.imageHeader.preview}
                                    style={{
                                        marginLeft: 20,
                                        marginRight: 20,
                                        maxHeight: 46, // tallest it can go without expanding row/button height
                                    }}
                                />
                            )}
                        </Row>

                        <Row className="col-12" style={{ marginTop: 20 }}>
                            <button
                                className="btn btn-outline-light btn-lg"
                                onClick={this.fHandleDownloadThemeClick}
                                title="Download current theme settings as a file you can import later."
                            >
                                Download Theme
                            </button>
                        </Row>

                        {this.state.bShowAdvancedOptions && (
                            <Container>
                                {this.props.arroColorRanges && (
                                    <Row className="pb-5">
                                        {this.props.arroColorRanges.map((oRange, i) => {
                                            <Fragment key={'color-range-fragment-' + i}>
                                                <Col xs="12" sm="3" className="pt-5" key={'color-range-text-' + i}>
                                                    <span>
                                                        Color for Scores Between {Math.min(...oRange.values)} and{' '}
                                                        {Math.max(...oRange.values)}
                                                    </span>
                                                </Col>
                                                <Col xs="12" sm="3" className="pt-5">
                                                    <input
                                                        type="text"
                                                        value={oRange.color}
                                                        onChange={e => this.props.fHandleColorRangeChange(e, oRange, i)}
                                                    />
                                                </Col>
                                            </Fragment>;
                                        })}
                                    </Row>
                                )}
                                <Row className="pb-5">
                                    <Col xs="12" sm="3" className="pt-5">
                                        <span>Theme Color Off Black</span>
                                    </Col>
                                    <Col xs="12" sm="3" className="pt-5">
                                        <input
                                            name="sThemeColorOffBlack"
                                            onChange={e => this.props.fHandleChange(e)}
                                            type="text"
                                            value={this.props.sThemeColorOffBlack}
                                        />
                                    </Col>
                                    <Col xs="12" sm="3" className="pt-5">
                                        <span>Theme Color Off Grey</span>
                                    </Col>
                                    <Col xs="12" sm="3" className="pt-5">
                                        <input
                                            name="sThemeColorOffGrey"
                                            onChange={e => this.props.fHandleChange(e)}
                                            type="text"
                                            value={this.props.sThemeColorOffGrey}
                                        />
                                    </Col>
                                    <Col xs="12" sm="3" className="pt-5">
                                        <span>Theme Color Off White</span>
                                    </Col>
                                    <Col xs="12" sm="3" className="pt-5">
                                        <input
                                            name="sThemeColorOffWhite"
                                            onChange={e => this.props.fHandleChange(e)}
                                            type="text"
                                            value={this.props.sThemeColorOffWhite}
                                        />
                                    </Col>
                                    <Col xs="12" sm="3" className="pt-5">
                                        <span>Theme Color Primary</span>
                                    </Col>
                                    <Col xs="12" sm="3" className="pt-5">
                                        <input
                                            name="sThemeColorPrimary"
                                            onChange={e => this.props.fHandleChange(e)}
                                            type="text"
                                            value={this.props.sThemeColorPrimary}
                                        />
                                    </Col>
                                    <Col xs="12" sm="3" className="pt-5">
                                        <span>Theme Color Secondary</span>
                                    </Col>
                                    <Col xs="12" sm="3" className="pt-5">
                                        <input
                                            name="sThemeColorSecondary"
                                            onChange={e => this.props.fHandleChange(e)}
                                            type="text"
                                            value={this.props.sThemeColorSecondary}
                                        />
                                    </Col>
                                    <Col xs="12" sm="3" className="pt-5">
                                        <span>Theme Color Tertiary</span>
                                    </Col>
                                    <Col xs="12" sm="3" className="pt-5">
                                        <input
                                            name="sThemeColorTertiary"
                                            onChange={e => this.props.fHandleChange(e)}
                                            type="text"
                                            value={this.props.sThemeColorTertiary}
                                        />
                                    </Col>
                                </Row>
                                <Row style={{ alignItems: 'baseline' }}>
                                    <Col xs="12" sm="3" className="pt-5">
                                        <span>Theme Custom Style (CSS)</span>
                                    </Col>
                                    <textarea
                                        className="col-xs-12 col-sm-9"
                                        name="sThemeCustomStyle"
                                        onChange={e => this.props.fHandleChange(e)}
                                        value={this.props.sThemeCustomStyle}
                                    />
                                </Row>
                            </Container>
                        )}
                        <style jsx>{`
                            .display-2 {
                                text-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
                                color: rgba(255, 255, 255, 0.9);
                            }
                            .lead {
                                font-size: 3em;
                                opacity: 0.7;
                            }
                            @media (max-width: 767px) {
                                .display-2 {
                                    font-size: 3em;
                                    margin-bottom: 1em;
                                }
                                .lead {
                                    font-size: 1.5em;
                                }
                            }
                        `}</style>
                    </Container>
                </Jumbotron>
                <Container>
                    <h2 className="text-center display-4 mt-5 mb-2">Features</h2>
                    <Row className="pb-5">
                        <Col xs="12" sm="4" className="pt-5">
                            <h3 className="text-center mb-4">Sessions / Security</h3>
                            <ListGroup>
                                <ListGroupItem>
                                    <a className="text-dark" href="https://expressjs.com">
                                        Express
                                    </a>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <a className="text-dark" href="https://www.npmjs.com/package/express-sessions">
                                        Express Sessions
                                    </a>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <a className="text-dark" href="https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)">
                                        CSRF Tokens
                                    </a>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <a className="text-dark" href="https://www.owasp.org/index.php/HttpOnly">
                                        HTTP Only Cookies
                                    </a>
                                </ListGroupItem>
                            </ListGroup>
                        </Col>
                        <Col xs="12" sm="4" className="pt-5">
                            <h3 className="text-center mb-4">Authentication</h3>
                            <ListGroup>
                                <ListGroupItem>
                                    <a className="text-dark" href="http://www.passportjs.org">
                                        Passport
                                    </a>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <Link href="/examples/authentication">
                                        <a className="text-dark">Email Sign In</a>
                                    </Link>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <Link href="/examples/authentication">
                                        <a className="text-dark">oAuth (Facebook, Google, Twitter…)</a>
                                    </Link>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <a className="text-dark" href="https://www.npmjs.com/package/next-auth">
                                        NextAuth
                                    </a>
                                </ListGroupItem>
                            </ListGroup>
                        </Col>
                        <Col xs="12" sm="4" className="pt-5">
                            <h4 className="text-center mb-4">CSS / SCSS</h4>
                            <ListGroup>
                                <ListGroupItem>
                                    <a className="text-dark" href="https://getbootstrap.com">
                                        Bootstrap 4.0
                                    </a>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <a className="text-dark" href="http://reactstrap.github.io/">
                                        Reactstrap
                                    </a>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <a className="text-dark" href="https://ionicframework.com/docs/ionicons/">
                                        Ionicons
                                    </a>
                                </ListGroupItem>
                                <ListGroupItem>
                                    <a className="text-dark" href="http://sass-lang.com/">
                                        SASS
                                    </a>
                                </ListGroupItem>
                            </ListGroup>
                        </Col>
                    </Row>
                    <h2 className="text-center display-4 mt-2 mb-5">Getting Started</h2>
                    <p>
                        <a href="https://github.com/zeit/next.js">Next.js</a> from <a href="https://zeit.co">Zeit</a> makes creating
                        websites with React easy.
                    </p>
                    <p>This project integrates several concepts to show how you can use them together in a Next.js project.</p>
                    <p>It also serves as template for creating new projects.</p>
                    <pre>
                        {`git clone https://github.com/iaincollins/nextjs-starter.git
npm install
npm run dev`}
                    </pre>
                    <p>
                        The simplest way to deploy projects to the cloud is with with 'now', which is from Zeit, the creators of Next.js
                        framework.
                    </p>
                    <pre>
                        {`npm install -g now
now`}
                    </pre>
                    <p>
                        For more information on how to build and deploy see{' '}
                        <a href="https://github.com/iaincollins/nextjs-starter/blob/master/README.md">README.md</a>
                    </p>
                    <p>
                        For tips on configuring authentication see{' '}
                        <a href="https://github.com/iaincollins/nextjs-starter/blob/master/AUTHENTICATION.md">AUTHENTICATION.md</a>
                    </p>
                    <p>
                        The next.js repository has a{' '}
                        <a href="https://github.com/zeit/next.js/tree/master/examples">great selection of examples</a> which are excellent
                        reference.
                    </p>
                </Container>
            </Fragment>
        );
    }
}
