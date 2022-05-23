const testSuite = require("@genx/test");
const { Generators } = require("@genx/data");
const request = require('superagent');

testSuite(
    function (suite) {        
        suite.testCase("digitalocean test", async function () {                 
            await suite.startWorker_(async (app) => {
                const service = app.getService('cloudStorage-digitalocean');
                should.exist(service);

                const uid = Generators.uuid();
                const objectKey = `test/${uid}.text`;

                const putUrl = await service.getUploadUrl_(objectKey, 'text', {
                    ACL: 'public-read'
                });

                console.log(putUrl);

                const content = 'This is the content of test file.';
            
                await request.put(putUrl).set('Content-Type', 'text').set('x-amz-acl', 'public-read').send(content);

                const downloadUrl = await service.getDownloadUrl_(objectKey);
                
                const result = await request.get(downloadUrl);

                const content2 = result.res.text;

                console.log(content2);

                content.should.be.eql(content2);
            });
        });

        suite.testCase("aws test", async function () {                 
            await suite.startWorker_(async (app) => {
                const service = app.getService('cloudStorage-aws');
                should.exist(service);

                const uid = Generators.uuid();
                const objectKey = `test/${uid}.text`;

                const putUrl = await service.getUploadUrl_(objectKey, 'text', {
                    ACL: 'public-read'
                });

                console.log(putUrl);

                const content = 'This is the content of test file.';
            
                await request.put(putUrl).set('Content-Type', 'text').send(content);

                const downloadUrl = await service.getDownloadUrl_(objectKey);
                
                const result = await request.get(downloadUrl);

                const content2 = result.res.text;

                console.log(content2);

                content.should.be.eql(content2);
            });
        });

        suite.testCase("azure test", async function () {                 
            await suite.startWorker_(async (app) => {
                const service = app.getService('cloudStorage-azure');
                should.exist(service);

                const uid = Generators.uuid();
                const objectKey = `test/${uid}.txt`;

                const putUrl = await service.getUploadUrl_(objectKey, 'text');
                console.log(putUrl);

                const content = 'This is the content of test file.';
            
                await request.put(putUrl).set("x-ms-blob-type", "BlockBlob").send(content);

                const downloadUrl = await service.getDownloadUrl_(objectKey);
                
                const result = await request.get(downloadUrl);

                const content2 = result.res.text;

                console.log(content2);

                content.should.be.eql(content2);
            });
        }, { only: true })
    }, 
    { verbose: true }
);
