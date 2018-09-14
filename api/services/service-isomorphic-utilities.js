/**
 * This utility service is an extraction from the UI's BaseController
 * it is not an ordinary utility module
 * TODO: actually implement as an isomorphic utility module in UI
 *
 */

let isoUtils = {
    'isoState': {}
};

const oSubsiteMap = {
    'installations': 'militaryInstallations',
    'planmymove': 'planMyMove',
    'planmydeployment': 'planMyDeployment',
    'mi': 'militaryInstallations',
    'pmm': 'planMyMove',
    'pmd': 'planMyDeployment'
};

const sDisaPre = 'apps.pre.militaryonesource.mil/omos/pre-production/';
const sDisaProd = 'apps.militaryonesource.mil/omos/mcfp-prod/';

const oDisaUriMap = {
    'localhost': sDisaPre,
    'localhost:3000': sDisaPre,
    'dev': sDisaPre,
    'mcfpdev': sDisaPre,
    'uat': sDisaPre,
    'mcfp': sDisaPre,
    'pre': sDisaPre,
    'militaryonesource': sDisaProd
};

const oLiferayUriMap = {
    'localhost': 'pre.militaryonesource.mil',
    'localhost:3000': 'pre.militaryonesource.mil',
    'dev': 'pre.militaryonesource.mil',
    'mcfpdev': 'pre.militaryonesource.mil',
    'mcfp': 'pre.militaryonesource.mil',
    'pre': 'pre.militaryonesource.mil',
    'militaryonesource': 'www.militaryonesource.mil'
};

// given a relo app location, return the liferay address for the same environment
isoUtils.fGetBackendUri = function(sProtocol) {
    sProtocol = sProtocol ? (sProtocol + ':') : 'https:'; // default to https

    if (!isoUtils.fbInvokedServerSide()) {
        sProtocol = window.location.protocol;
    }

    //This url format is also used in fGetBaseServiceUrl.
    return sProtocol + '//' + oLiferayUriMap[isoUtils.isoState.sEnvironment] + '/api/jsonws/';
}

// given a relo app location, return the liferay address for the same environment
isoUtils.fGetDisaUri = function(sProtocol) {
    sProtocol = sProtocol ? (sProtocol + ':') : 'https:'; // default to https

    if (!isoUtils.fbInvokedServerSide()) {
        sProtocol = window.location.protocol;
    }

    //This url format is also used in fGetBaseServiceUrl.
    return sProtocol + '//' + oDisaUriMap[isoUtils.isoState.sEnvironment];
}

isoUtils.fInitState = function(env) {
    isoUtils.isoState.bInitialized = true;
    isoUtils.isoState.sEnvironment = (env === 'prod') ? 'militaryonesource' : 'pre';
    isoUtils.isoState.cachedData = {};
    return 'fInitState: environment='+isoUtils.isoState.sEnvironment;
}

isoUtils.fsSupplant = function(sInterpolee, oOptions) {
  return sInterpolee.replace(/{([^{}]*)}/g,
      function (a, b) {
        var r = oOptions[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a;
      }
  );
}

isoUtils.fbInvokedServerSide = function() {
    return (typeof window === 'undefined');
}

// ref: https://github.com/Vandivier/data-science-practice/blob/master/js/earhart-fellows/email-append-repec.js
isoUtils.fpWait = function (ms) {
    ms = ms || 10000;
    return new Promise(resolve => setTimeout(resolve, ms));
}

//  ref: https://github.com/Vandivier/data-science-practice/blob/master/js/grand-tour-study/utils.js
//  _utils.forEachReverse as async function
//  fp must return a promise
//  forces each async function to complete in order (phased async pattern)
//  phased is useful for throttling or dependencies
isoUtils.forEachReverseAsyncPhased = async function (arr, fp) {
    let arrOutputs = [];

    for (var i = arr.length; i--;) {
        arrOutputs.push(await fp(arr[i], i));
    }

    return arrOutputs;
}

/**
 * Find values 'vMatch' in an array of objects 'arr' with key 'sKey'.
 * 'vMatch' can be a regex or a simple string.
 * 
 * @param {*} arr 
 * @param {*} sKey 
 * @param {*} vMatch 
 */
isoUtils.getMatches = function (arr, sKey, vMatch) {
    if (vMatch instanceof RegExp) {
        return arr.filter(function (oEl) {
            return oEl[sKey] && oEl[sKey].match(vMatch);
        });
    }

    return arr &&
        arr.filter(function (oEl) {
            return oEl[sKey] === vMatch;
        }) ||
        [];
}

/**
 * wraps isoUtils.getMatches()
 * ensure a unique query result exists: find an object in arr with key === sUniqueKey and value === vUniqueValue
 * if it exists, return that value, if it doesn't exist, make it
 * finally, return the whole array by default or the new value if bReturnNewValue
 * Note: bReturnNewValue is experimental and unexpected results may occur
 * if attempting to mutate vNewValue by reference
 * options.bReturnNewValue
 * options.bExtend
 */
isoUtils.fvSureSet = function (arro, sUniqueKey, vUniqueValue, vNewValue, options) {
    var arrMatch = isoUtils.getMatches(arro, sUniqueKey, vUniqueValue);

    options = options || {}; // don't err if it isn't passed

    if (arrMatch.length === 1) {
        if (options.bExtend) {
            arrMatch[0] = $.extend(arrMatch[0],
                vNewValue,
                arrMatch[0]);
        } else {
            arrMatch[0] = vNewValue;
        }
    } else if (arrMatch.length > 1) {
        MI.get('log-error', {
            'sErrorMessage': 'error in fvSureSet().',
            'soException': 'Unique result expected but multiple results found.' +
                ' Consider prior using a dedup method like fDedupeByNumericProperty'
        });
    } else { // arrMatch.length === 0
        arro.push(vNewValue);
    }

    if (options.bReturnNewValue) {
        return vNewValue;
    }

    return arro;
}

// for external use, see fvRemoveCircularReferences
// ref: https://stackoverflow.com/a/31557814/3931488
function _fRemoveCircularReferences(object, bStringify) {
    var simpleObject = {};

    for (var prop in object) {
        if (!object.hasOwnProperty(prop)) {
            continue;
        }
        if (typeof (object[prop]) == 'object') {
            continue;
        }
        if (typeof (object[prop]) == 'function') {
            continue;
        }
        simpleObject[prop] = object[prop];
    }

    return bStringify ? JSON.stringify(simpleObject) : simpleObject;
}

// decides whether input is an array or not and cleans appropriately
isoUtils.fvRemoveCircularReferences = function (v, bStringify) {
    if (Array.isArray(v)) {
        return v.map(function (el) {
            return _fRemoveCircularReferences(el, bStringify);
        });
    }

    return _fRemoveCircularReferences(v, bStringify);
}

module.exports = isoUtils;
