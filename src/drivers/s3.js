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

    async getUploadUrl_(objectKey, contentType, payload) {
        const params = {
            Bucket: this.bucket,
            Key: objectKey,
            Expires: 300,
        };

        if (contentType) {
            // most of the time, you don't know the contentType before user selected the file
            params.contentType = contentType;
        }

        return this.client.getSignedUrl('putObject', {
            params,
            ...payload,
        });
    }

    async getDownloadUrl_(objectKey, payload) {
        return this.client.getSignedUrl('getObject', {
            Bucket: this.bucket,
            Key: objectKey,
            ...payload,
        });
    }
}

module.exports = S3Service;
