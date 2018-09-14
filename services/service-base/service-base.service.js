/**
 *  file name: service-base-service.ts
 *  aliases: B, Base Service
 *
 *  description:
 *      wraps a number of commonly used services into one injectable base service.
 *
 * TODO: rxjs and typescript (tsx)
 **/

import { ServiceUrlManager } from '../service-url-manager/service-url-manager.service';

const EllaUtils = require('ella-utils');

export class ServiceBaseService {
    mUrlManager = new ServiceUrlManager();
    State = EllaUtils.State;
    Utils = EllaUtils;

    constructor(ServiceUrlManager) {}

    fpGet(sUrlKey, oOptions) {
        return this.mUrlManager.fpGet(sUrlKey, oOptions);
    }

    fpPost(sUrlKey, oOptions) {
        return this.mUrlManager.fpPost(sUrlKey, oOptions);
    }
}
