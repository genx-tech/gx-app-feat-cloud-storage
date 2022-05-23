const { transformDownloadArgs, transformUploadArgs } = require('../utils');

class S3Service {
    constructor(app, options) {
        const { endpoint, accessKeyId, secretAccessKey, bucket } = options;

        const AWS = app.tryRequire('aws-sdk');

        const spacesEndpoint = new AWS.Endpoint(endpoint);

        this.client = new AWS.S3({
            endpoint: spacesEndpoint,
            accessKeyId,
            secretAccessKey,
            signatureVersion: 'v4',
        });

        this.bucket = bucket;
    }

    async getUploadUrl_(...args) {
        const [objectKey, contentType, expiresInSeconds, payload] =
            transformUploadArgs(...args);

        const params = {
            Bucket: this.bucket,
            Key: objectKey,
            Expires: expiresInSeconds,
        };

        if (contentType) {
            // most of the time, you don't know the contentType before user selected the file
            params.ContentType = contentType;
        }

        return this.client.getSignedUrl('putObject', {
            ...params,
            ...payload,
        });
    }

    async getDownloadUrl_(...args) {
        const [objectKey, expiresInSeconds, payload] = transformDownloadArgs(
            ...args
        );

        return this.client.getSignedUrl('getObject', {
            Bucket: this.bucket,
            Key: objectKey,
            Expires: expiresInSeconds,
            ...payload,
        });
    }
}

module.exports = S3Service;
