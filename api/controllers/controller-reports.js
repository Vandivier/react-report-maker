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

// ref: https://developer.mozilla.org/en-US/docs/Web/API/FormData/append#Example
// ref: https://stackoverflow.com/questions/36067767/how-do-i-upload-a-file-with-the-js-fetch-api
// ref: https://stackoverflow.com/questions/41025078/react-dropzone-how-to-upload-images
// ref: https://stackoverflow.com/questions/31530200/node-multer-unexpected-field
router.post('/', upload.single('reportInputData'), (req, res) => {
    const sTempPath = req.file.path;
    const sWritePath = sOutPath + req.file.originalname;

    // A better way to copy the uploaded file.
    fs.readFile(sTempPath, 'utf8', (error, sData) => {
        const arrarrsCellsByRow = sData.split(EOL).map(sRow => sRow.split(/\t/g));
        const oResponse = {};

        if (error) {
            res.render('error', error);
        }

        // transpose
        // ref: https://stackoverflow.com/a/17428705/3931488
        oResponse.arrarrsColumns = arrarrsCellsByRow.map((sCell, i, _arr) => _arr.map(row => row[i]));
        oResponse.bMetaWithinSpreadsheet = oResponse.arrarrsColumns[0][0].toLowerCase() === 'metadata';

        oResponse.arrarroColumns = (oResponse.bMetaWithinSpreadsheet
            ? oResponse.arrarrsColumns.slice(1, oResponse.arrarrsColumns.length)
            : oResponse.arrarrsColumns
        )
            .map(arrsColumnCells => {
                let arroColumnCells = [];
                let i = 10;
                const sGraphTitle = arrsColumnCells[0];

                if (!sGraphTitle) return;

                while (i + 1) {
                    arroColumnCells.push({
                        count: arrsColumnCells.filter(sCell => sCell === i.toString()).length,
                        value: i,
                    });

                    i--;
                }

                return {
                    arroColumnCells,
                    sGraphTitle,
                };
            })
            .filter(oColumn => oColumn); // remove records not associated to a column

        oResponse.arrsMetadata = oResponse.bMetaWithinSpreadsheet ? oResponse.arrarrsColumns[0] : [];

        fs.writeFile(sWritePath, sData, 'utf8', error => {
            if (error) {
                res.render('error', error);
            }
        });
    });
});

// iColumnDiscriminator
router.post('/split-panel-by-column', upload.single('reportInputData'), (req, res) => {
    const sTempPath = req.file.path;
    fs.readFile(sTempPath, 'utf8', (error, sData) => {
        const arrarroCellsByRow = sData.split(EOL).map((sRow, iRowNumber) => ({ iRowNumber, arrsRowCells: sRow.split(/\t/g) }));
        const arrTitleRow = arrarroCellsByRow[0]; // TODO: drop this report
        const oarroReportDataMap = arrarroCellsByRow.reduce((oAcc, arroCellsByRow) => {
            const iRowDiscriminator = arroCellsByRow.arrsRowCells[req.iDiscriminator];
            debugger;
            oAcc[iRowDiscriminator] = (oAcc[iRowDiscriminator] || []).concat([arroCellsByRow]);
            return oAcc;
        }, {}); // map to an array of row numbers
        const oResponse = { oarroReportDataMap };

        if (error) {
            res.render('error', error);
        }

        // transpose
        // ref: https://stackoverflow.com/a/17428705/3931488
        oResponse.bMetaWithinSpreadsheet = oResponse.arrarrsColumns[0][0].toLowerCase() === 'metadata';

        const _arroReportDatas = Object.keys(oarroReportDataMap).map(sKey => ({
            arroMatchingRowNumbers: arrTitleRow.concat(oarroReportDataMap[sKey]),
        }));

        debugger;

        oResponse.arroReportDatas = _arroReportDatas.map(oReport => {
            oReport.bMetaWithinSpreadsheet = oResponse.arrarrsColumns[0][0].toLowerCase() === 'metadata';
            /*
            oReport.arrarrsColumns = (oReport.bMetaWithinSpreadsheet
                ? oReport.arrarrsColumns.slice(1, oReport.arrarrsColumns.length)
                : oReport.arrarrsColumns
            )
                .map(arrsColumnCells => {
                    let arroColumnCells = [];
                    let i = 10;
                    const sGraphTitle = arrsColumnCells[0];
    
                    if (!sGraphTitle) return;
    
                    while (i + 1) {
                        arroColumnCells.push({
                            count: arrsColumnCells.filter(sCell => sCell === i.toString()).length,
                            value: i,
                        });
    
                        i--;
                    }
    
                    return {
                        arroColumnCells,
                        sGraphTitle,
                    };
                })
                .filter(oColumn => oColumn); // remove records not associated to a column
                */

            return oReport;
        });

        oResponse.arrsMetadata = oResponse.bMetaWithinSpreadsheet ? oResponse.arroReportDatas[0].arrarrsColumns[0] : [];

        res.json(oResponse);
    });
});

module.exports = router;
