'use strict';

require('source-map-support/register');

const {
    Feature,
    Helpers: { requireConfig },
} = require('@genx/app');

const { InvalidConfiguration } = require('@genx/error');

const mapOfVendorToDriver = {
    digitalocean: 's3',
    aws: 's3',
    azure: 'azure',
};
module.exports = {
    type: Feature.SERVICE,
    groupable: true,
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
//# sourceMappingURL=index.js.map
