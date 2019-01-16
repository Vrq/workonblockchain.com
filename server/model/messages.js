const mongoose = require('mongoose');
const regexes = require('./regexes');
const enumerations = require('./enumerations');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    sender_id:
    {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    receiver_id:
    {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },

    msg_tag:
    {
        type:String,
        enum: enumerations.chatMsgTypes,
        required: true
    },
    is_read:
    {
        type:Boolean,
        required:true,
        default:false

    },
    date_created:
    {
        type: Date,
        required: true
    },
    message: {
        file: {
            type: new Schema({
                url: {
                    type: String,
                    required: true,
                    validate: regexes.url
                }
            }),
            required: false
        },
        normal: {
            type: new Schema({
                message: {
                    type: String,
                    required: true
                }
            }),
            required: false
        },
        job_offer: {
            type: new Schema({
                title: {
                    type: String,
                    required: true
                },
                salary: {
                    type: Number,
                    required: true
                },
                salary_currency: {
                    type: String,
                    enum: enumerations.currencies,
                    required: true
                },
                type: {
                    type: String,
                    enum: enumerations.jobTypes,
                    required: true
                },
                location: {
                    type: String,
                    required: true
                },
                description: {
                    type: String,
                    required: false
                }
            }),
            required: false
        },
        job_offer_accepted: {
            type: new Schema({
                message: {
                    type: String,
                    required: true
                }
            }),
            required: false
        },
        job_offer_rejected: {
            type: new Schema({
                message: {
                    type: String,
                    required: true
                }
            }),
            required: false
        },
        interview_offer: {
            type: new Schema({
                location: {
                    type: String,
                    required: true
                },
                description: {
                    type: String,
                    required: false
                },
                date_time: {
                    type: Date,
                    required: true
                }
            }),
            required: false
        },
        employment_offer: {
            type: new Schema({
                title: {
                    type: String,
                    required: true
                },
                salary: {
                    type: Number,
                    required: true
                },
                salary_currency: {
                    type: String,
                    enum: enumerations.currencies,
                    required: true
                },
                type: {
                    type: String,
                    enum: enumerations.jobTypes,
                    required: true
                },
                start_date: {
                    type: Date,
                    required: true
                },
                description: {
                    type: String,
                    required: false
                },
                file_url: {
                    type: String,
                    validate: regexes.url
                }
            }),
            required: false
        },
        employment_offer_accepted: {
            type: new Schema({
                employment_offer_message_id: {
                    type: Schema.Types.ObjectId,
                    ref: 'Messages',
                    required: false
                },
                message: {
                    type: String,
                    required: false
                }
            }),
            required: false
        },
        employment_offer_rejected: {
            type: new Schema({
                employment_offer_message_id: {
                    type: Schema.Types.ObjectId,
                    required: true,
                    ref: 'Messages'
                },
                message: {
                    type: String,
                    required: true
                }
            }),
            required: false
        }
    }
});

module.exports = mongoose.model('Messages',MessageSchema);