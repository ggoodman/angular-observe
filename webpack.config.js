module.exports = {
    cache: true,
    entry: {
        'angular-observe': __dirname + "/src/angular-observe.js",
    },
    output: {
        libraryTarget: "umd",
        library: "AngularObserve",
        path: "./dist",
        pathInfo: false,
        // publicPath: "/static/",
        filename: "angular-observe.js",
    },
    externals: {
        'angular': 'angular',
    },
    module: {
    },
    resolve: {
        modulesDirectories: ["node_modules", "src"],
        root: __dirname,
    },
};