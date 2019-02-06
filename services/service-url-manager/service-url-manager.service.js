const EllaUtils = require('ella-utils');

export class ServiceUrlManager {
    async fpRequest(sUrlKey, oOptions) {
        const oRequestOptions = oOptions.oRequestOptions || {};
        const oFetchConfig = {
            body: (oOptions.oRequestBody && JSON.stringify(oOptions.oRequestBody)) || null,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            observe: oRequestOptions.bAsRawResponse ? 'response' : null,
            params: oRequestOptions.params || null,
            reportProgress: null,
            responseType: oRequestOptions.responseType || 'json',
            withCredentials: null,
        };
        let vUrl;

        oOptions.sMethod = oOptions.sMethod || 'GET';
        oFetchConfig.method = oOptions.sMethod.toUpperCase();
        oOptions.sBackendUri = oOptions.sBackendUri || this.fsGetBackendUri();

        if (window.location.href.slice(-9) === 'mock=true') {
            vUrl = _fMock();
        } else {
            if (sUrlKey[0] === '/' || sUrlKey.includes('http')) {
                // litteral url
                vUrl = sUrlKey;
            } else {
                // TODO: standardize url map usage or remove
                // note: currently deprecated. empty object added simply to sync w rrm and prevent breaking.
                const oUrlMap = {}
                vUrl = oUrlMap[sUrlKey] ? oUrlMap[sUrlKey] : sUrlKey;
            }
        }

        if (!vUrl) {
            return undefined;
        } else if (typeof vUrl === 'string') {
            vUrl = EllaUtils.fsSupplant(vUrl, oOptions);
        } else if (vUrl instanceof Object) {
            // it's a function not a url string
            return vUrl(oOptions, EllaUtils.State);
        }

        // oOptions.oFormData and oOptions.oRequestBody cannot be sent simultaneously
        // oOptions.oFormData will override and is not stringified; it's a real formData
        if (oOptions.oFormData) {
            oFetchConfig.body = oOptions.oFormData;
            delete oFetchConfig.headers['Content-Type']; // let browser handle multipart/form-data
        }

        if (typeof oRequestOptions.oHeaders === 'object') {
            oFetchConfig.headers = oRequestOptions.oHeaders || {}; // TODO: maybe use Object.assign instead?
        }

        if (oRequestOptions.sCredentials) {
            oFetchConfig.headers = oFetchConfig.headers || {};
            oFetchConfig.headers.authorization = 'Basic ' + oRequestOptions.sCredentials.replace(/["\\]/g, '');
            oFetchConfig.withCredentials = true;
        }

        try {
            const _oResponse = await fetch(vUrl, oFetchConfig);
            return _oResponse.json();
        } catch (e) {
            console.log('fetch error', e);
            return Promise.reject('fetch error');
            /* TODO: pseudocode:
            if (!bFromLogErrorCall) {
                fGet('log-error', {
                    'sErrorMessage': 'Get exception',
                    'soException': e.message
                });
            }
            */
        }

        function _fMock() {
            return 'mock/' + sUrlKey + '.json';
        }
    }

    fpGet(sUrlKey, oOptions) {
        oOptions = oOptions || {};
        oOptions.sMethod = 'GET';
        return this.fpRequest(sUrlKey, oOptions);
    }

    fpPost(sUrlKey, oOptions) {
        oOptions = oOptions || {};
        oOptions.sMethod = 'POST';
        return this.fpRequest(sUrlKey, oOptions);
    }

    fsGetBackendUri() {
        const oUriMap = {
            'pki.dev.mil': 'pki.dev.mil',
            'pki.test.mil': 'pki.test.mil',
            localhost: 'pki.test.mil',
            'pki.prod.mil': 'pki.prod.mil',
        };
        let sKey = window.location.origin.split('//')[1];
        if (sKey.includes('localhost:')) sKey = 'localhost';

        EllaUtils.State.sEnvironment = EllaUtils.State.sEnvironment || sKey;

        EllaUtils.State.sLiferayBaseUrl =
            window.location.protocol + '//' + oUriMap[EllaUtils.State.sEnvironment] + (EllaUtils.State.bProdLike ? '' : ':8080');

        return EllaUtils.State.sLiferayBaseUrl + '/api/jsonws/';
    }

    // ref: https://bitbucket.org/halfaker/usa4mf-service-plugin/src/master/
    // ref: https://dev.liferay.com/develop/tutorials/-/knowledge_base/7-0/writing-a-custom-login-portlet
    // autologin pattern happens before app load
    // this method gets session data based on existing JSESSIONID found on header
    fGetSessionData() {
        if (!this.fsGetCookie('COOKIE_SUPPORT')) {
            this.fsSetCookie('COOKIE_SUPPORT', true);
        }
        this.fSetIsProdLike();
        if (!EllaUtils.State.bProdLike) {
            return this.fGet('/o/session?u={username}&p={password}', {
                username: EllaUtils.State.oSession.oUser.sEmailAddress,
                password: 'test',
            });
        }
        // TODO: heart beat polling on below session, back end can instruct to show log out or show user to renew session
        return this.fGet('/o/session', {});
    }

    // ref: https://stackoverflow.com/questions/5142337/read-a-javascript-cookie-by-name
    // cookie name === cookie key
    fsGetCookie(sCookieName) {
        const cookiestring = RegExp('' + sCookieName + '[^;]+').exec(document.cookie);
        return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./, '') : '');
    }

    // DOES NOT check whether cookie already exists. refer to fsGetCookie and check if needed.
    fsSetCookie(sCookieName, sCookieValue) {
        document.cookie = sCookieName + '=' + sCookieValue;
    }

    // ref: https://stackoverflow.com/questions/2144386/how-to-delete-a-cookie
    fDeleteCookie(sCookieName) {
        document.cookie = sCookieName + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    fSetIsProdLike() {
        const sKey = window.location.origin.split('//')[1];
        EllaUtils.State.bProdLike = sKey.includes('militaryonesource.mil');
    }
}
