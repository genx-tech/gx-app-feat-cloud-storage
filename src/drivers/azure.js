class AzureService {
    constructor(app, options) {
        const { accountName, accountKey, containerName } = options;
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

    async getUploadUrl_(objectKey, contentType, extra) {
        const blockBlobClient = this.client.getBlockBlobClient(objectKey);
        const permissions = this.createBlobSASPermissions();
        permissions.create = true;
        permissions.write = true;

        // default 5 minutes
        const expiresOn = this.app.now().plus({ minutes: 5 }).toJSDate();

        const options = {
            expiresOn,
            permissions,
            contentType,
            ...extra,
        };

        return blockBlobClient.generateSasUrl(options);
    }

    async getDownloadUrl_(objectKey, extra) {
        const blockBlobClient = this.client.getBlockBlobClient(objectKey);
        const permissions = this.createBlobSASPermissions();
        permissions.read = true;

        // default 5 minutes
        const expiresOn = this.app.now().plus({ minutes: 5 }).toJSDate();

        const options = {
            expiresOn,
            permissions,
            ...extra,
        };

        return blockBlobClient.generateSasUrl(options);
    }
}

module.exports = AzureService;
