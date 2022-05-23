const { transformDownloadArgs, transformUploadArgs } = require('../utils');

class S3Service {
    constructor(app, options) {
        const { region, accessKeyId, secretAccessKey, bucket } = options;

        this.SDK = app.tryRequire('@aws-sdk/client-s3');
        const S3Client = this.SDK.S3Client;

        this.presigner = app.tryRequire('@aws-sdk/s3-request-presigner');

        this.client = new S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        this.bucket = bucket;
    }

    async getUploadUrl_(...args) {
        const [objectKey, contentType, expiresInSeconds, payload] =
            transformUploadArgs(...args);

        console.log(objectKey, contentType, expiresInSeconds, payload);

        const { PutObjectCommand } = this.SDK;

        /**
         * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/modules/putobjectrequest.html
         */
        const putObjectInput = {
            Bucket: this.bucket,
            Key: objectKey,
        };

        if (contentType) {
            // most of the time, you don't know the contentType before user selected the file
            putObjectInput.ContentType = contentType;
        }

        const command = new PutObjectCommand(putObjectInput);
        return this.presigner.getSignedUrl(this.client, command, {
            expiresIn: expiresInSeconds,
        });
    }

    async getDownloadUrl_(...args) {
        const [objectKey, expiresInSeconds, payload] = transformDownloadArgs(
            ...args
        );

        const { GetObjectCommand } = this.SDK;

        const getObjectInput = {
            Bucket: this.bucket,
            Key: objectKey,
            ...payload,
        };

        const command = new GetObjectCommand(getObjectInput);

        return this.presigner.getSignedUrl(this.client, command, {
            expiresIn: expiresInSeconds,
        });
    }
}

module.exports = S3Service;
