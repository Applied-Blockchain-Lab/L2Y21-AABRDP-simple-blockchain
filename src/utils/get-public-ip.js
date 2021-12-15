const publicIp = require('public-ip');

exports.getPublicIp = async () => {
    const ip = await publicIp.v4();
    return ip;
};
