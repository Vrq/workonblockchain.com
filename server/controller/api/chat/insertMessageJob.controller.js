const settings = require('../../../settings');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var date = require('date-and-time');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
const users = require('../../../model/users');
const CandidateProfile = require('../../../model/candidate_profile');
const Pages = require('../../../model/pages_content');
var crypto = require('crypto');
var jwt_hash = require('jwt-simple');
const EmployerProfile = require('../../../model/employer_profile');
const chat = require('../../../model/chat');
const mongoose = require('mongoose');
const sanitize = require('../../services/sanitize');

const forgotPasswordEmail = require('../../services/email/emails/forgotPassword');
const verifyEmailEmail = require('../../services/email/emails/verifyEmail');
const referUserEmail = require('../../services/email/emails/referUser');
const chatReminderEmail = require('../../services/email/emails/chatReminder');
const referedUserEmail = require('../../services/email/emails/referredFriend');

const USD = settings.CURRENCY_RATES.USD;
const GBP = settings.CURRENCY_RATES.GBP;
const Euro = settings.CURRENCY_RATES.Euro;
const emails = settings.COMPANY_EMAIL_BLACKLIST;
const logger = require('../../services/logger');

module.exports = function insert_message_job(req,res){
    let sanitizeddescription = sanitize.sanitizeHtml(req.unsanitizedBody.description);
    let sanitizedmessage = sanitize.sanitizeHtml(req.unsanitizedBody.message);
    let userId = req.auth.user._id;
	insert_message_job_new(req.body,sanitizeddescription,sanitizedmessage,userId).then(function (err, about)
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

function insert_message_job_new(data,description,msg,senderId){
	let new_description = '';
	let new_msg = '';
    if(description){
        new_description = description.replace(/\r\n|\n\r/g, '\n').replace(/\n\n/g, '\n').replace(/\n/g, '<br />');
        //new_description = description.replace(/\n/g, "<br>");
        new_description = new_description.replace(/<(?!br\s*\/?)[^>]+>/g, '');
        //new_description = new_description.replace(/<br[^>]*>/, '');
    }
    if(msg){
        new_msg = msg.replace(/\r\n|\n\r/g, '\n').replace(/\n\n/g, '\n').replace(/\n/g, '<br />');
        //new_msg = msg.replace(/\n/g, "<br>");
        new_msg = new_msg.replace(/<(?!br\s*\/?)[^>]+>/g, '');
        //new_msg = new_msg.replace(/<br[^>]*>/, '');
    }
	var current_date = new Date();
	my_date = date.format(current_date, 'MM/DD/YYYY HH:mm:ss');
    var deferred = Q.defer();
	if(data.employment_reference_id == 0){
		let newChat = new chat({
			sender_id : mongoose.Types.ObjectId(senderId),
			receiver_id : mongoose.Types.ObjectId(data.receiver_id),
			sender_name: data.sender_name,
			receiver_name: data.receiver_name,
			message: new_msg,
			description: new_description,
			job_title: data.job_title,
			salary: data.salary,
			salary_currency: data.currency,
			date_of_joining: data.date_of_joining,
			msg_tag: data.msg_tag,
			is_company_reply: data.is_company_reply,
			job_type: data.job_type,
			file_name: data.file_to_send,
			is_job_offered: data.job_offered,
			is_read: 0,
			date_created: my_date
		});
		newChat.save((err,data)=>
		{
			if(err){
				logger.error(err.message, {stack: err.stack});
				deferred.reject(err.name + ': ' + err.message);
			}
			else{
				////console.log('done');
				deferred.resolve({Success:'Msg sent'});
			}
		});
		return deferred.promise;
	}
	else{
		let newChat = new chat({
			sender_id : mongoose.Types.ObjectId(data.sender_id),
			receiver_id : mongoose.Types.ObjectId(data.receiver_id),
			sender_name: data.sender_name,
			receiver_name: data.receiver_name,
			message: new_msg,
			description: new_description,
			job_title: data.job_title,
			salary: data.salary,
			salary_currency: data.currency,
			date_of_joining: data.date_of_joining,
			msg_tag: data.msg_tag,
			is_company_reply: data.is_company_reply,
			job_type: data.job_type,
			file_name: data.file_to_send,
			is_job_offered: data.job_offered,
			is_read: 0,
			employment_offer_reference: mongoose.Types.ObjectId(data.employment_reference_id),
			date_created: my_date
		});
		newChat.save((err,data)=>
		{
			if(err){
				logger.error(err.message, {stack: err.stack});
				deferred.reject(err.name + ': ' + err.message);
			}
			else{
				////console.log('done');
				deferred.resolve({Success:'Msg sent'});
			}
		});
		return deferred.promise;
	}
}