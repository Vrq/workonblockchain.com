const syncQueue = require('../../model/mongoose/sync_queue');
const users = require('../../model/mongoose/users');
const companies = require('../../model/mongoose/companies');
const logger = require('./logger');
const objects = require('./objects');
const crypto = require('./crypto');
const time = require('./time');
const zoho = require('./zoho/zoho');
const sendgrid = require('./email/sendGrid');
const settings = require('../../settings');

module.exports.pushToQueue = async function(operation, obj) {
    const timestamp = Date.now();
    let syncDoc = {
        operation: operation,
        status: 'pending',
        added_to_queue: timestamp
    };

    if (obj.userDoc) {
        let userDoc = obj.user;

        syncDoc.queue = userDoc.type;
        if (userDoc) syncDoc.user = userDoc;
        if (obj.company) syncDoc.company = obj.company;

        if (operation === "PATCH") {
            const existingSyncDoc = await syncQueue.findOne({"user._id": userDoc._id, status: 'pending', operation: operation});

            if (existingSyncDoc) {
                delete syncDoc.queue;
                delete syncDoc.operation;
                delete syncDoc.status;
                await syncQueue.updateOne({_id: existingSyncDoc._id}, { $set: syncDoc });
            } else {
                await syncQueue.insert(syncDoc);
            }
        } else {
            await syncQueue.insert(syncDoc);
        }

    }
}

module.exports.pullFromQueue = async function() {

    let syncDocs = await syncQueue.findSortLimitSkip({status: 'pending', operation: "POST"}, {added_to_queue: "ascending"}, 100, null);
    await syncZoho("POST", syncDocs);

    await time.sleep(1000);

    syncDocs = await syncQueue.findSortLimitSkip({status: 'pending', operation: "PATCH"}, {added_to_queue: "ascending"}, 100, null);
    await syncZoho("PATCH", syncDocs);

    // sync to amplitude
    // sync to sendgrid?
}

const syncZoho = async function (operation, syncDocs) {
    if (!syncDocs || syncDocs.length < 1) return;

    const docIds = syncDocs.map((syncDoc) => { return syncDoc._id })

    let zohoContacts = [], zohoAccounts;
    try {
        for (let syncDoc of syncDocs) {
            syncDoc.user.email = sendgrid.addEmailEnvironment(syncDoc.user.email);
            const zohoContact = await toZohoContact(syncDoc);
            let zohoAccount;
            if (syncDoc.company) {
                zohoAccount = await toZohoAccount(syncDoc);

                if (operation === "PATCH" && !zohoAccount.id) {
                    let companyDoc = await companies.findOne({_id: syncDoc.company._id});
                    if (!companyDoc.zohocrm_account_id) throw new Error("No zohocrm account id found on company: " + companyDoc._id)
                    zohoAccount.id = companyDoc.zohocrm_account_id;
                }

                zohoAccounts.push(zohoAccount);
            }

            if (operation === "PATCH" && !zohoContact.id) {
                let userDoc = await users.findOne({_id: syncDoc.user._id});
                if (!userDoc.zohocrm_contact_id) throw new Error("No zohocrm contact id found on user: " + userDoc._id)
                zohoContact.id = userDoc.zohocrm_contact_id;
            }

            zohoContacts.push(zohoContact);
        }

        let input = {
            body: {
                data: zohoContacts
            },
            duplicate_check_fields: ["Email"]
        };
        let res;
        if (operation === "POST") {
            res = await zoho.contacts.upsert(input);
        } else {
            res = await zoho.contacts.putMany(input);
        }

        let docsToDelete = [], i = 0;
        for (let contactRecord of res) {
            if (contactRecord.status === "error") {
                const errorId = crypto.getRandomString(10);
                let message = "Zoho CRM record message: " + contactRecord.message;
                if (!objects.isEmpty(contactRecord.details)) message = message + ", details: " + JSON.stringify(contactRecord.details);
                logger.error(message, {
                    error_id: errorId,
                    code: contactRecord.code
                });
                await
                syncQueue.updateOne({_id: docIds[i]}, {
                    $set: {
                        status: "error",
                        error_id: errorId
                    }
                });
            } else {
                if (operation === "POST") {
                    await users.updateOne({_id: syncDocs[i].user._id}, {$set: {zohocrm_contact_id: contactRecord.details.id}})
                }
                docsToDelete.push(docIds[i]);
            }
            i++;
        }

        await syncQueue.deleteMany({_id: { $in: docIds}});
    } catch (error) {
        console.log(error);
        const errorId = crypto.getRandomString(10);
        logger.error("Sync service error", {
            error: {
                id: errorId,
                code: error.code,
                message: error.message,
                stack: error.stack
            }
        });
        await syncQueue.updateMany({_id: { $in: docIds}}, {
            status: "error",
            error_id: errorId
        });

    }

}


const toZohoContact = async function (syncDoc) {
    const userDoc = syncDoc.user;
    const companyDoc = syncDoc.company;

    let contact = {
        Contact_Status: "converted",
        Contact_type: [userDoc.type],
        Email: userDoc.email,
        First_Name: userDoc.first_name,
        Last_Name: userDoc.last_name,
        Synced_from_server: true,
        Platform_ID: userDoc._id.toString(),
        Platform_URL: settings.CLIENT.URL + "admins/talent/" + userDoc._id.toString(),
        Email_verified: userDoc.is_verify === 1,
        Account_disabled: userDoc.disable_account,
        Environment: settings.ENVIRONMENT
    };

    if (userDoc.session_started) contact.Last_login = convertZohoDate(userDoc.session_started);
    if (userDoc.nationality) contact.Nationalities = userDoc.nationality.map((nat) => { return nat + "\n"});
    if (userDoc.first_approved_date) contact.First_approved = convertZohoDate(userDoc.first_approved_date);
    if (userDoc.marketing_emails) contact.Marketing_emails = userDoc.marketing_emails;
    if (userDoc.contact_number) contact.Phone = userDoc.contact_number;
    if (userDoc.zohocrm_contact_id) contact.id = userDoc.zohocrm_contact_id;

    if (userDoc.type === "candidate" && userDoc.candidate) {
        const candidateDoc = userDoc.candidate;
        contact.Candidate_status = candidateDoc.latest_status.status;
        contact.Candidate_status_last_updated = convertZohoDate(candidateDoc.latest_status.timestamp);
        contact.Created = convertZohoDate(candidateDoc.history[candidateDoc.history.length-1].timestamp);

        if (candidateDoc.base_country) contact.Mailing_country = candidateDoc.base_country;
        if (candidateDoc.base_city) contact.Mailing_city = candidateDoc.base_city;
        if (candidateDoc.job_activity_status) {
            const employed = candidateDoc.job_activity_status.currently_employed;
            if (employed) contact.Currently_employed = employed === "yes";
        }
        if (candidateDoc.programming_languages) contact.Programming_languages = candidateDoc.programming_languages.map( (lan) => {
            return lan.language + "\n";
        })
        if (candidateDoc.description) contact.Bio = candidateDoc.description;
    } else {
        contact.Created = convertZohoDate(companyDoc.created_date)
        contact.Account_Name = convertZohoDate(companyDoc.company_name)
    }

    return contact;
}

const toZohoAccount = async function (syncDoc) {
    const userDoc = syncDoc.user;
    const companyDoc = syncDoc.company;

    let account = {
        Account_Name: companyDoc.company_name,
        Platform_ID: companyDoc._id.toString(),
        Platform_URL: settings.CLIENT.URL + "admin-company-detail?user=" + userDoc._id.toString(),
        Account_Types: ["Client"],
        Synced_from_server: true,
        Environment: settings.ENVIRONMENT,
        Account_disabled: userDoc.disable_account,
        Platform_Status: companyDoc.is_approved === 1 ? "approved" : "not approved",
        Account_status: "Active",
        Account_disabled: userDoc.disable_account,
        Created: convertZohoDate(companyDoc.created_date)
    };

    if (companyDoc.company_country) account.Billing_Country = companyDoc.company_country;
    if (companyDoc.zohocrm_account_id) account.id = companyDoc.zohocrm_account_id;

    return account;
}

let zohoUserOffsetSeconds;

const convertZohoDate = async function(date) {
    // TODO: convert dates based on current user time zone...
    if (!zohoUserOffsetSeconds) {
        const res = await zoho.users.getCurrentUser()
        zohoUserOffsetSeconds = res.users[0].offset / 1000;
    }
    if (date) {
        let now = new Date.now();
        const localOffsetSeconds = now.getTimezoneOffset() * 60;
        logger.debug("Date offsets", {
            localHour: localOffsetSeconds/(60*60),
            zohoUserHour: zohoUserOffsetSeconds/(60*60)
        });
        const diff = localOffsetSeconds - zohoUserOffsetSeconds
        if (diff !== 0) {
            time.addSeconds(date, diff);
        }
        return toISOString(date)
    }
    // if (date) return date.toISOString(); // does not work
}

const toISOString = function(date) {
    function pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    return date.getUTCFullYear() +
        '-' + pad(date.getUTCMonth() + 1) +
        '-' + pad(date.getUTCDate()) +
        'T' + pad(date.getUTCHours()) +
        ':' + pad(date.getUTCMinutes()) +
        ':' + pad(date.getUTCSeconds()) +
        '+00:00';
};