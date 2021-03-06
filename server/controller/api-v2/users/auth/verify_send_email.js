const users = require('../../../../model/mongoose/users');
const companies = require('../../../../model/mongoose/companies');
const verifyEmailEmail = require('../../../services/email/emails/verifyEmail');
const errors = require('../../../services/errors');

module.exports = async function verify_send_email(emailAddress, verifyEmailToken) {
    const userDoc = await users.findOneByEmail(emailAddress);
    if(userDoc) {
        if(userDoc.type === 'candidate') {
            let name;
            if(userDoc.first_name){
                name = userDoc.first_name;
            }
            verifyEmailEmail.sendEmail(userDoc.email, name ,verifyEmailToken);
            return true;
        }
        if(userDoc.type === 'company') {
            let name;
            const companyDoc = await companies.findOne({_creator : userDoc._id});
            if(companyDoc ) {
                if(companyDoc.first_name) {
                    name = companyDoc.first_name;
                }
                verifyEmailEmail.sendEmail(userDoc.email, name ,verifyEmailToken);
                return true;
            }
            else {
                verifyEmailEmail.sendEmail(userDoc.email, null ,verifyEmailToken);
                return true;
            }
        }
    }
    else {
        errors.throwError("User not found", 404);
    }


}