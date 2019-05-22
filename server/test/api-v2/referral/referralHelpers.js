const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../server');
const fs = require('fs');

chai.use(chaiHttp);

const getRefCode = module.exports.getRefCode = async function getRefCode(email) {
    const res = await chai.request(server)
        .get('/v2/referral?email='+email)
        .send();
    res.should.have.status(200);
    return res;
}