const { transformDownloadArgs, transformUploadArgs } = require('../utils');

class AzureService {
    constructor(app, options) {
        const { accountName, accountKey, bucket: containerName } = options;
        const StorageBlob = app.tryRequire('@azure/storage-blob');

        this.app = app;

        const {
            BlobServiceClient,
            StorageSharedKeyCredential,
            BlobSASPermissions,
        } = StorageBlob;

        // Use StorageSharedKeyCredential with storage account and account key
        // StorageSharedKeyCredential is only available in Node.js runtime, not in browsers
        const sharedKeyCredential = new StorageSharedKeyCredential(
            accountName,
            accountKey
        );

        const endpoint = `https://${accountName}.blob.core.windows.net`;

        const blobServiceClient = new BlobServiceClient(
            endpoint,
            sharedKeyCredential
        );

        this.client = blobServiceClient.getContainerClient(containerName);

        this.createBlobSASPermissions = () => new BlobSASPermissions();
    }

    async getUploadUrl_(...args) {
        const [objectKey, contentType, expiresInSeconds, payload] =
            transformUploadArgs(...args);

        const blockBlobClient = this.client.getBlockBlobClient(objectKey);
        const permissions = this.createBlobSASPermissions();
        permissions.create = true;
        permissions.write = true;

        const expiresOn = this.app
            .now()
            .plus({ seconds: expiresInSeconds })
            .toJSDate();

        const options = {
            expiresOn,
            permissions,
            contentType,
            ...payload,
        };

        return blockBlobClient.generateSasUrl(options);
    }

    async getDownloadUrl_(...args) {
        const [objectKey, expiresInSeconds, payload] = transformDownloadArgs(
            ...args
        );

        const blockBlobClient = this.client.getBlockBlobClient(objectKey);
        const permissions = this.createBlobSASPermissions();
        permissions.read = true;

        const expiresOn = this.app
            .now()
            .plus({ seconds: expiresInSeconds })
            .toJSDate();

        const options = {
            expiresOn,
            permissions,
            ...payload,
        };

        return blockBlobClient.generateSasUrl(options);
    }
}

module.exports = AzureService;
