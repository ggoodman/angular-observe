var _ = require('lodash');

var baseConfig = {
    cache: true,
    entry: {
        'angular-observe': __dirname + "/compat/none",
    },
    output: {
        libraryTarget: "umd",
        library: "AngularObserve",
        path: "./dist",
        pathInfo: false,
        // publicPath: "/static/",
        filename: "[name].js",
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

module.exports = [
    baseConfig,
    _.defaultsDeep({
        entry: {
            'angular-observe.rx': __dirname + '/compat/rx',
        },
        externals: {
            'rx':  {
                commonjs: 'rx',
                commonjs2: 'rx',
                amd: 'rx',
                root: 'Rx'
            },
        },
    }, baseConfig),
    _.defaultsDeep({
        entry: {
            'angular-observe.most': __dirname + '/compat/most',
        },
        externals: {
            'most': 'most',
        },
    }, baseConfig),
    _.defaultsDeep({
        entry: {
            'angular-observe.rx.next': __dirname + '/compat/rx.next',
        },
        externals: {
            '@reactivex/rx': {
                commonjs: '@reactivex/rx',
                commonjs2: '@reactivex/rx',
                amd: 'rx',
                root: 'Rx'
            },
        },
    }, baseConfig),
];