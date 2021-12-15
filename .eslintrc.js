module.exports = {
    env: {
        node: true,
        jest: true,
    },
    extends: ['eslint:recommended', 'airbnb-base'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        'linebreak-style': 0,
        'no-plusplus': 0,
        indent: ['error', 4],
        'max-len': 0,
        'no-unused-vars': ['error', {
            args: 'none',
            varsIgnorePattern: 'ip',
        }],
        'class-methods-use-this': ['error', { exceptMethods: ['messageHandler', 'sendTransaction', 'getPeerAddress', 'sendPeers', 'addNotExistingPeer'] }],
    },
};
