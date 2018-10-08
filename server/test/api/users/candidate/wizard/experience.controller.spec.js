const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../../../server');
const mongo = require('../../../../helpers/mongo');
const Users = require('../../../../../model/users');
const candidateProfile = require('../../../../../model/candidate_profile');
const docGenerator = require('../../../../helpers/docGenerator');
const candidateHelper = require('../candidateHelpers');

const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
chai.use(chaiHttp);

describe('add experience of candidate', function () {

    afterEach(async () => {
        console.log('dropping database');
        //await mongo.drop();
    })

    describe('PUT /users/welcome/exp', () => {

        it('it should add experience of candidate', async () => {

            const candidate = docGenerator.candidate();
            await candidateHelper.signupVerifiedApprovedCandidate(candidate);

            const userDoc = await Users.findOne({email: candidate.email}).lean();
            const candidateExperience = docGenerator.experience();
            const res = await candidateHelper.about(candidateExperience,userDoc.jwt_token);
            const newCandidateInfo = await candidateProfile.findOne({_creator: userDoc._id}).lean();
            console.log(newCandidateInfo);
            //to do
            /*newCandidateInfo.first_name.should.equal(candidateProfileInfo.first_name);
            newCandidateInfo.last_name.should.equal(candidateProfileInfo.last_name);
            newCandidateInfo.github_account.should.equal(candidateProfileInfo.github_account);
            newCandidateInfo.stackexchange_account.should.equal(candidateProfileInfo.stackexchange_account);
            newCandidateInfo.contact_number.should.equal(candidateProfileInfo.contact_number);
            newCandidateInfo.nationality.should.equal(candidateProfileInfo.nationality);
            newCandidateInfo.image.should.equal(candidateProfileInfo.image_src);*/
        })
    })
});