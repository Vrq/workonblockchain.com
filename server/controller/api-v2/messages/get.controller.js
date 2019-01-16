const auth = require('../../middleware/auth-v2');
const Schema = require('mongoose').Schema;
const enumerations = require('../../../model/enumerations');
const errors = require('../../services/errors');
const messages = require('../../../model/mongoose/messages'); // TODO need to change to messages schema

module.exports.request = {
    type: 'get',
    path: '/conversations/:sender_id'
};

const bodySchema = new Schema({
    sender_id: {
        type: String,
        required: true
    }
});

module.exports.inputValidation = {
    body: bodySchema
};

module.exports.auth = async function (req) {
    console.log('in auth');
    await auth.isValidUser(req);

    // if (req.query.admin) {
    //     await auth.isAdmin(req);
    // }
}

const checkMessageSenderType = function (userType, expectedType) {
    if (userType !== expectedType) errors.throwError("Only be called by a " + expectedType, 400);
}

module.exports.endpoint = async function (req, res) {
    console.log('in endpoint');
    const userType = req.auth.user.type;
    const sender_id = req.auth.user._id;
    let messageDoc;

    checkMessageSenderType(userType, 'company');

    messageDoc = await messages.find({
        sender_id: sender_id,
        msg_tag: 'job_offer'
    });
    res.send(messageDoc[messageDoc.length-1]);
}