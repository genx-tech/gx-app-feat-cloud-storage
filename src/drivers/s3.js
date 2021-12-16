class S3Service {
    constructor(app, options) {
        const { endpoint, accessKeyId, secretAccessKey, bucket } = options;
        
        const AWS = app.tryRequire("aws-sdk");

        const spacesEndpoint = new AWS.Endpoint(endpoint);

        this.client = new AWS.S3({
            endpoint: spacesEndpoint,
            accessKeyId,
            secretAccessKey,
            signatureVersion: 'v4',
        });

        this.bucket = bucket;
    }

    async getUploadUrl_(objectKey, contentType, extra) {
        return this.client.getSignedUrl('putObject', {
            Bucket: this.bucket,
            Key: objectKey,
            ContentType: contentType || 'text',
            Expires: 300,
            ...extra
        });
    }

    async getDownloadUrl_(objectKey, extra) {
        return this.client.getSignedUrl('getObject', {
            Bucket: this.bucket,
            Key: objectKey,
            ...extra
        });
    }
};

module.exports = S3Service;
