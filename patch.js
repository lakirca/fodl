const fs = require('fs');

[
    'node_modules/@angular-devkit/build-angular/src/webpack/configs/browser.js',
    'node_modules/@angular-devkit/build-angular/src/webpack/configs/test.js',
].map((webpackFile) =>
    fs.readFile(webpackFile, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }

        const alreadyPatched = data.match(/fallback: {/g);

        if (alreadyPatched && alreadyPatched.length > 0) return;

        var result = data.replace(
            /resolve: {/g,
            `resolve: {
            fallback: {
                assert: require.resolve('assert/'),
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify'),
                os: require.resolve('os-browserify/browser'),
                stream: require.resolve('stream-browserify')
            },`,
        );

        fs.writeFile(webpackFile, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    }),
);
