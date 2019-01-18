const auth = require('../../middleware/auth-v2');
const Schema = require('mongoose').Schema;
const mongoose = require('mongoose');
const errors = require('../../services/errors');
const messages = require('../../../model/mongoose/messages'); // TODO need to change to messages schema

module.exports.request = {
    type: 'get',
    path: '/messages/'
};

const querySchema = new Schema({
    sender_id: String
})

module.exports.inputValidation = {
    query: querySchema
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
    console.log('in endpoint LastJobOffer');
    const userType = req.auth.user.type;
    const sender_id = req.auth.user._id;
    let messageDoc;

    if(req.query.sender_id){
        console.log(req.query.sender_id);
        const count = await messages.count({
            sender_id: mongoose.Types.ObjectId(req.query.sender_id),
            is_read: false
        });
        res.send({
            sender_id: req.query.sender_id,
            unReadCount: count
        });
    }
    else{
        console.log('not received');
    }

    checkMessageSenderType(userType, 'company');

    messageDoc = await messages.findLastJobOffer({
        sender_id: sender_id,
        msg_tag: 'job_offer'
    });
    res.send(messageDoc);
}