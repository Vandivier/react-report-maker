/**
 * A general purpose logger. Could be expanded with more transports
 *
 */
const fs = require('fs');
const EOL = require('os').EOL;

const logger = {
  sLogPathError: '/var/log/mcfp-relo/mcfp-relo-error.log',
  sLogPathEverything: '/var/log/mcfp-relo/mcfp-everything.log',
  sLogPathInfo: '/var/log/mcfp-relo/mcfp-relo-info.log',
  logInfo: function (sMessage, oException) {
    var logMsgToFile = EOL + 'INFO: ' + (new Date().toLocaleString()) + ' : ' + sMessage;

    console.log(logMsgToFile);
    fs.appendFile(this.sLogPathEverything, logMsgToFile, function (err) {
      if (err) {
        console.log(err);
      }
    });
    fs.appendFile(this.sLogPathInfo, logMsgToFile, function (err) {
      if (err) {
        console.log(err);
      }
    });
  },
  logError: function (sMessage, soException) {
    var logMsgToFile = EOL + 'ERROR: ' + (new Date().toLocaleString()) + ' : ' + sMessage + EOL + soException;

    console.log(logMsgToFile);
    fs.appendFile(this.sLogPathEverything, logMsgToFile, function (err) {
      if (err) {
        console.log(err);
      }
    });
    fs.appendFile(this.sLogPathError, logMsgToFile, function (err) {
      if (err) {
        console.log(err);
      }
    });
  }
};

module.exports = logger;
