const settings = require('../../../../../settings');
const users = require('../../../../../model/users');
const CandidateProfile = require('../../../../../model/candidate_profile');

const USD = settings.CURRENCY_RATES.USD;
const GBP = settings.CURRENCY_RATES.GBP;
const Euro = settings.CURRENCY_RATES.Euro;
const filterReturnData = require('../../filterReturnData');

module.exports = async  function (req,res)
{
    let userId = req.auth.user._id;
    let companyParam = req.body;
    let salaryArray = [];
    let salaryConverterResult;
    if(companyParam.currency === '$ USD' && companyParam.salary)
    {
        salaryConverterResult = expected_salary_converter(companyParam.salary, USD.GBP , USD.Euro );
        salaryArray= {USD : companyParam.salary , GBP : salaryConverterResult[0] , Euro :salaryConverterResult[1]};
    }

    if(companyParam.currency === '£ GBP' && companyParam.salary)
    {
        salaryConverterResult = expected_salary_converter(companyParam.salary, GBP.USD , GBP.Euro );
        salaryArray= {USD : salaryConverterResult[0] , GBP : companyParam.salary , Euro :salaryConverterResult[1]};
    }
    if(companyParam.currency === '€ EUR' && companyParam.salary)
    {
        salaryConverterResult = expected_salary_converter(companyParam.salary, Euro.USD , Euro.GBP );
        salaryArray= {USD : salaryConverterResult[0] , GBP : salaryConverterResult[1]  , Euro : companyParam.salary};
    }

    const userDoc = await users.find({type : 'candidate' , is_verify :1, is_approved :1, disable_account : false }).lean();
    if(userDoc){
        let userDocArray = [];
        userDoc.forEach(function(item)
        {
            userDocArray.push(item._id);
        });

        let queryString = [];

        const usersToSearch = { "_creator": {$in: userDocArray}};
        queryString.push(usersToSearch);

        if(companyParam.position ) {
            const rolesFilter = { "roles": {$in: companyParam.position}};
            queryString.push(rolesFilter);
        }

        if(companyParam.skill !== -1 ) {
            const skillsFilter = {"programming_languages.language" :  companyParam.skill};
            queryString.push(skillsFilter);
        }

        if(companyParam.location !== -1) {
            const locationFilter = { "locations": {$in:companyParam.location} };
            queryString.push(locationFilter);
        }

        if(companyParam.blockchain) {
            const platformFilter = { $or: [
                {"commercial_platform.platform_name": {$in: companyParam.blockchain}},
                {"platforms.platform_name": {$in: companyParam.blockchain}}
            ] };
            queryString.push(platformFilter);
        }

        if(companyParam.availability!==-1) {
            const availabilityFilter = { availability_day: companyParam.availability };
            queryString.push(availabilityFilter);
        }

        if(salaryArray.length !== 0 && companyParam.currency!== -1 && companyParam.salary) {
            const searchFilter = {
                $or : [
                    { $and : [ { expected_salary_currency : "$ USD" }, { expected_salary : {$lte: salaryArray.USD} } ] },
                    { $and : [ { expected_salary_currency : "£ GBP" }, { expected_salary : {$lte: salaryArray.GBP} } ] },
                    { $and : [ { expected_salary_currency : "€ EUR" }, { expected_salary : {$lte: salaryArray.Euro} } ] }
                ]
            };
            queryString.push(searchFilter);
        }

        if(companyParam.word) {
            const wordSearch = { $or: [{ why_work: {'$regex' : companyParam.word , $options: 'i'  }} , { description : {'$regex' : companyParam.word , $options: 'i' } }] };
            queryString.push(wordSearch);
        }

        const searchQuery = { $and: queryString };

        const candidateDoc = await CandidateProfile.find(searchQuery).populate('_creator').lean();
        if(candidateDoc) {
            if(candidateDoc.length <= 0){
                res.send(candidateDoc);
            }
            else
            {
                let resultArray = [];
                candidateDoc.forEach(function(item)
                {
                    filterReturnData.candidateAsCompany(item, userId).then(function(data) {
                        resultArray.push(data);

                        if(candidateDoc.length === resultArray.length){
                            res.send(resultArray);
                        }
                    })
                })

            }

        }

    }
    else {
        errors.throwErrors("No candidates matched this search criteria", 400);
    }

}

function expected_salary_converter(salary_value, currency1, currency2)
{

    let value1 = (salary_value / currency1).toFixed();
    let value2 = (salary_value/currency2).toFixed();
    let array = [];

    array.push(value1);
    array.push(value2);

    return array;
}


