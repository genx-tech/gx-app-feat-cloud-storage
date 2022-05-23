const {
    Feature,
    Helpers: { requireConfig },
} = require('@genx/app');
const { InvalidConfiguration } = require('@genx/error');

const mapOfVendorToDriver = {
    digitalocean: 's3v2',
    aws: 's3v3',
    azure: 'azure',
};

/**
 * General cloud storage feature
 * @module Feature_CloudStorage
 */

module.exports = {
    /**
     * This feature is loaded at service stage
     * @member {string}
     */
    type: Feature.SERVICE,

    /**
     * This feature can be grouped by serviceGroup
     * @member {boolean}
     */
    groupable: true,

    /**
     * Load the feature
     * @param {App} app - The app module object
     * @param {object} options - Options for the feature
     * @property {string} options.vendor - Cloud storage vendor.
     * @property {object} options.options - Storage driver options.
     * @returns {Promise.<*>}
     *
     * @example
     *
     * vendor: 'digitalocean',
     * options: {
     *
     * }
     */
    load_: async function (app, options, name) {
        requireConfig(app, options, ['vendor', 'options'], name);

        const { vendor, options: serviceOptions } = options;
        const driver = mapOfVendorToDriver[vendor];

        if (driver == null) {
            throw new InvalidConfiguration(
                `Unsupported vendor: ${vendor}`,
                app,
                `${name}.vendor`
            );
        }

        const StorageService = require(`./drivers/${driver}.js`);
        const service = new StorageService(app, serviceOptions);

        app.registerService(name, service);
    },
};
