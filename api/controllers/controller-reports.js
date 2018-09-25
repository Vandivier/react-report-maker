/**
 * A service to process reports
 * Parse tsv, return d3-ready json
 * Save a copy of the upload
 *
 * @type {*}
 */

const EOL = require('os').EOL;
const fs = require('fs');
const router = require('express').Router();

const multer = require('multer');
const sOutPath = __dirname + '/static/uploads/';
const upload = multer({ dest: sOutPath });

const logger = require('./../services/service-logger');

// TODO: put in ella utils
const transpose = matrix => matrix.reduce(($, row) => row.map((_, i) => [...($[i] || []), row[i]]), []);

// ref: https://developer.mozilla.org/en-US/docs/Web/API/FormData/append#Example
// ref: https://stackoverflow.com/questions/36067767/how-do-i-upload-a-file-with-the-js-fetch-api
// ref: https://stackoverflow.com/questions/41025078/react-dropzone-how-to-upload-images
// ref: https://stackoverflow.com/questions/31530200/node-multer-unexpected-field
router.post('/', upload.single('reportInputData'), (req, res) => {
    const sTempPath = req.file.path;
    const sWritePath = sOutPath + req.file.originalname;

    // A better way to copy the uploaded file.
    fs.readFile(sTempPath, 'utf8', (error, sData) => {
        const oResponse = {
            arrarrsRows: sData.split(EOL).map(sRow => sRow.split(/\t/g)),
        };

        if (error) {
            res.render('error', error);
        }

        // rectangle transpose and filter columns with no cells
        // ref: https://gist.github.com/femto113/1784503#gistcomment-1222341
        oResponse.arrarrsColumns = transpose(oResponse.arrarrsRows).filter(arrsColumn => arrsColumn.filter(sCell => sCell).length);
        oResponse.bMetaWithinSpreadsheet = oResponse.arrarrsColumns[0][0].toLowerCase() === 'metadata';

        oResponse.arrarroColumns = (oResponse.bMetaWithinSpreadsheet
            ? oResponse.arrarrsColumns.slice(1, oResponse.arrarrsColumns.length)
            : oResponse.arrarrsColumns
        )
            .map((arrsColumnCells, iColumnNumber) => {
                let arroColumnCells = [];
                let i = 10;
                let iResponseCount = 0;
                let iResponseValue = 0;
                const sGraphTitle = arrsColumnCells[0];

                if (!sGraphTitle) return;

                while (i) {
                    arroColumnCells.push({
                        count: arrsColumnCells.filter(sCell => sCell.toString() === i.toString()).length,
                        value: i,
                    });

                    i--;
                }

                arroColumnCells.forEach(oGraphData => {
                    iResponseCount += oGraphData.count;
                    iResponseValue += oGraphData.count * oGraphData.value;
                });

                return {
                    arroColumnCells,
                    iColumnNumber,
                    iResponseAverage: iResponseValue / iResponseCount,
                    iResponseCount,
                    iResponseValue,
                    sGraphTitle,
                };
            })
            .filter(oColumn => oColumn); // remove records not associated to a column

        oResponse.arrarroColumns;

        oResponse.arrsMetadata = oResponse.bMetaWithinSpreadsheet ? oResponse.arrarrsColumns[0] : [];

        fs.writeFile(sWritePath, sData, 'utf8', error => {
            if (error) {
                res.render('error', error);
            }

            res.json(oResponse);
        });
    });
});

// TODO: test case Jody
router.post('/split-panel-by-column', upload.single('reportInputData'), (req, res) => {
    const sTempPath = req.file.path;
    fs.readFile(sTempPath, 'utf8', (error, sData) => {
        const arrarroCellsByRow = sData.split(EOL).map((sRow, iRowNumber) => ({ iRowNumber, arrsRowCells: sRow.split(/\t/g) }));
        const arrTitleRow = arrarroCellsByRow[0]; // TODO: drop this report
        const oarroReportDataMap = arrarroCellsByRow.reduce((oAcc, arroCellsByRow) => {
            const iRowDiscriminator = arroCellsByRow.arrsRowCells[req.body.iColumnDiscriminator];
            oAcc[iRowDiscriminator] = (oAcc[iRowDiscriminator] || []).concat([arroCellsByRow]);
            return oAcc;
        }, {}); // map to an array of row numbers

        const oResponse = { oarroReportDataMap };

        if (error) {
            res.render('error', error);
        }

        oResponse.bMetaWithinSpreadsheet = arrarroCellsByRow[0].arrsRowCells[0].toLowerCase() === 'metadata';

        // empty report datas are invalid, and also the title row is not a valid report
        const _arroReportDatas = Object.keys(oarroReportDataMap)
            .map(sKey => ({
                arroMatchingRowNumbers: [arrTitleRow].concat(oarroReportDataMap[sKey]),
            }))
            .filter(oReportData => {
                const oSecondRow = oReportData.arroMatchingRowNumbers[1];
                // empty report datas are invalid, and also the title row is not a valid report
                if (
                    oSecondRow &&
                    oSecondRow.arrsRowCells.filter(sRow => sRow).length &&
                    oSecondRow.arrsRowCells[0] !== arrTitleRow.arrsRowCells[0]
                ) {
                    return oReportData;
                }
            });

        oResponse.arroReportDatas = _arroReportDatas.map(oReport => {
            oReport.bMetaWithinSpreadsheet = oResponse.bMetaWithinSpreadsheet;
            oReport.arrarrsRows = oReport.arroMatchingRowNumbers.map(oMatchingRows => oMatchingRows.arrsRowCells);

            // rectangle transpose and filter columns with no cells
            // ref: https://gist.github.com/femto113/1784503#gistcomment-1222341
            oResponse.arrarrsColumns = transpose(oReport.arrarrsRows).filter(arrsColumn => arrsColumn.filter(sCell => sCell).length);

            oReport.arrarroColumns = oResponse.arrarrsColumns
                .map((arrsColumnCells, iColumnNumber) => {
                    let arroColumnCells = [];
                    let i = 10;
                    let iResponseCount = 0;
                    let iResponseValue = 0;
                    const sGraphTitle = arrsColumnCells[0];

                    if (!sGraphTitle) return;

                    while (i) {
                        arroColumnCells.push({
                            count: arrsColumnCells.filter(sCell => sCell.toString() === i.toString()).length,
                            value: i,
                        });

                        i--;
                    }

                    arroColumnCells.forEach(oGraphData => {
                        iResponseCount += oGraphData.count;
                        iResponseValue += oGraphData.count * oGraphData.value;
                    });

                    return {
                        arroColumnCells,
                        iColumnNumber,
                        iResponseAverage: iResponseValue / iResponseCount,
                        iResponseCount,
                        iResponseValue,
                        sGraphTitle,
                    };
                })
                .filter(oColumn => oColumn); // remove records not associated to a column

            return oReport;
        });

        oResponse.arrsMetadata = oResponse.bMetaWithinSpreadsheet ? oResponse.arroReportDatas[0].arrarrsColumns[0] : [];

        res.json(oResponse);
    });
});

module.exports = router;
