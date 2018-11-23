const CandidateProfile = require('../../../../../model/candidate_profile');
const errors = require('../../../../services/errors');

module.exports = async function (req,res)
{
	let userId = req.auth.user._id;
    const candidateDoc = await CandidateProfile.findOne({ _creator: userId}).lean();

    if(candidateDoc) {
        const queryBody = req.body;
        console.log(queryBody);
        let candidateUpdate = {}
        if (queryBody.country) candidateUpdate.locations = queryBody.country;
        if (queryBody.roles) candidateUpdate.roles = queryBody.roles;
        if (queryBody.interest_area) candidateUpdate.interest_area = queryBody.interest_area;
        if (queryBody.base_currency) candidateUpdate.expected_salary_currency = queryBody.base_currency;
        if (queryBody.expected_salary) candidateUpdate.expected_salary = queryBody.expected_salary;
        if (queryBody.availability_day) candidateUpdate.availability_day = queryBody.availability_day;
        if (queryBody.current_salary) candidateUpdate.current_salary = queryBody.current_salary;
        if (queryBody.current_currency) candidateUpdate.current_currency = queryBody.current_currency;

        await CandidateProfile.update({ _id: candidateDoc._id },{ $set: candidateUpdate });
        res.send({
            success : true
        })
    }
    else {
        errors.throwError("Candidate account not found", 404);
    }
}

