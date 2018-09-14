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
        oResponse.arrarroGraphDatas = oResponse.arrarrsColumns.slice(1, oResponse.arrarrsColumns.length).map(arrsColumnCells => {
            let arroGraphData = [];
            let i = 10;
            const sGraphTitle = arrsColumnCells[0];

            while (i + 1) {
                arroGraphData.push({
                    count: arrsColumnCells.filter(sCell => sCell === i.toString()).length,
                    value: i,
                });

                i--;
            }

            return {
                arroGraphData,
                sGraphTitle,
            };
        });

        oResponse.arrsMetadata = oResponse.arrarrsColumns[0];

        fs.writeFile(sWritePath, sData, 'utf8', error => {
            if (error) {
                res.render('error', error);
            }

            res.json(oResponse);
        });
    });
});

module.exports = router;
