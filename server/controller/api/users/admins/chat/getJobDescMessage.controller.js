const settings = require('../../../../../settings');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var date = require('date-and-time');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
const users = require('../../../../../model/users');
const CandidateProfile = require('../../../../../model/candidate_profile');
const Pages = require('../../../../../model/pages_content');
var crypto = require('crypto');
var jwt_hash = require('jwt-simple');
const EmployerProfile = require('../../../../../model/employer_profile');
const chat = require('../../../../../model/chat');

const forgotPasswordEmail = require('../../../../services/email/emails/forgotPassword');
const verifyEmailEmail = require('../../../../services/email/emails/verifyEmail');
const referUserEmail = require('../../../../services/email/emails/referUser');
const chatReminderEmail = require('../../../../services/email/emails/chatReminder');
const referedUserEmail = require('../../../../services/email/emails/referredFriend');

const USD = settings.CURRENCY_RATES.USD;
const GBP = settings.CURRENCY_RATES.GBP;
const Euro = settings.CURRENCY_RATES.Euro;
const emails = settings.COMPANY_EMAIL_BLACKLIST;
const logger = require('../../../../services/logger');

module.exports = function (req,res){
    get_job_desc_msgs(req.body).then(function (err, about)
    {
        if (about)
        {
            res.json(about);
        }
        else
        {
            res.json(err);
        }
    })
        .catch(function (err)
        {
            res.json({error: err});
        });
}

function get_job_desc_msgs(data){
    var deferred = Q.defer();
    chat.find({
        $and : [
            {
                $and:[{receiver_id:data.receiver_id},{sender_id: data.sender_id}]
            },
            {
                msg_tag:data.msg_tag
            }
        ]
    }, function (err, data)
    {
        if (err){
            logger.error(err.message, {stack: err.stack});
            deferred.reject(err.name + ': ' + err.message);
        }
        else{
            //console.log(data);
            deferred.resolve({
                datas:data
            });
        }
    });
    return deferred.promise;
}