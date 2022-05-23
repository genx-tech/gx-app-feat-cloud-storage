const { DEFAULT_UPLOAD_EXPIRY, DEFAULT_DOWNLOAD_EXPIRY } = require('./defines');

exports.transformUploadArgs = (
    objectKey,
    contentType,
    expiresInSeconds,
    payload
) => {
    if (typeof payload === 'undefined') {
        const type2 = typeof contentType;
        const type3 = typeof expiresInSeconds;

        if (type3 === 'object') {
            payload = expiresInSeconds;
            expiresInSeconds = undefined;

            if (type2 === 'number') {
                expiresInSeconds = contentType;
                contentType = undefined;
            }
        } else if (type3 === 'undefined') {
            if (type2 === 'object') {
                payload = contentType;
                contentType = undefined;
            } else if (type2 === 'number') {
                expiresInSeconds = contentType;
                contentType = undefined;
            }
        }
    }

    if (expiresInSeconds == null) {
        expiresInSeconds = DEFAULT_UPLOAD_EXPIRY;
    }

    return [objectKey, contentType, expiresInSeconds, payload];
};

exports.transformDownloadArgs = (objectKey, expiresInSeconds, payload) => {
    if (
        typeof payload === 'undefined' &&
        typeof expiresInSeconds === 'object'
    ) {
        payload = expiresInSeconds;
        expiresInSeconds = undefined;
    }

    if (expiresInSeconds == null) {
        expiresInSeconds = DEFAULT_DOWNLOAD_EXPIRY;
    }

    return [objectKey, expiresInSeconds, payload];
};
