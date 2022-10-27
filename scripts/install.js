const fs = require('fs');
const esbuild = require('esbuild');

const allowedFiletypes = ['css', 'js'];
const paths = ['public/js', 'public/css'];
paths.forEach(path => {
    fs.readdir(path, (err, files) => {
        if(err) return;
        files.forEach(file => {
            if(allowedFiletypes.includes(file.split('.')[1])) {
                console.log(file);

                esbuild.buildSync({
                    entryPoints: [`${path}/${file}`],
                    target: [
                        'chrome80',
                        'firefox70',
                        'safari15',
                        'edge80',
                        'node16',
                    ],
                    minify: true,
                    outfile: `${path}/${file.replace('.', '.min.')}`,
                });
            }
        });
    });
});
