const users = require('../../../../../model/mongoose/users');
const messages = require('../../../../../model/mongoose/messages');
const logger = require('../../../../services/logger');
const currency = require('../../../../services/currency');
const errors = require('../../../../services/errors');
const cities = require('../../../../../model/mongoose/cities');
const objects = require('../../../../services/objects');


const salaryFactor = 1.1;

/*
filters = {
    is_verify: 1 or 0,
    status: String,
    status_last_updated_day: Number,
    disable_account: Boolean,
    msg_tags: String,
    last_msg_received_day: Date,
    blacklist: [ObjectId]
};

search = {
    work_type: String,
    name: String,
    why_work: String,
    locations: [{
        city: ObjectId,
        remote: Boolean
    }],
    visa_needed: Boolean
    roles: [String],
    expected_salary_min: Number,
    expected_hourly_rate_min: Number,
    currency: String,
    // salary: {
    //     current_currency: String,
    //     current_salary: Number
    // },
    // hourly_rate: {
    //     current_currency: String,
    //     expected_hourly_rate: Number
    // },
    required_skills: [{
        name: String,
        exp_year: Number
    }]
};
*/

module.exports.candidateSearch = async function (filters, search) {
    logger.debug("Doing new candidate search", {
        filters: filters,
        search: search
    });

    let userQuery = [];
    userQuery.push({"type" : 'candidate'});

    if (filters.is_verify === 1 || filters.is_verify === 0) userQuery.push({"is_verify" : filters.is_verify});

    if (filters.status && filters.status !== -1) userQuery.push({'candidate.latest_status.status' : filters.status});
    if (filters.status_last_updated_day) userQuery.push({'candidate.latest_status.timestamp' : {$gte: objects.getDateFromDays(filters.status_last_updated_day)}});

    if (filters.disable_account === true || filters.disable_account === false) userQuery.push({"disable_account" :  filters.disable_account});
    if (filters.msg_tags) {
        let userIds = [];
        const messageDocs = await messages.findMany({msg_tag : {$in: filters.msg_tags}}, {sender_id: 1, receiver_id: 1});
        if (!messageDocs) {
            errors.throwError("No users matched the search", 404);
        }
        for (let messageDoc of messageDocs) {
            userIds.push(messageDoc.sender_id.toString());
            userIds.push(messageDoc.receiver_id.toString());
        }
        const userIdsDistinct = makeDistinctSet(userIds);
        userQuery.push({_id : {$in : userIdsDistinct}});
    }
    if(filters.last_msg_received_day){
        userQuery.push({
            "conversations": {
                "$elemMatch":{"last_message":{$gte:filters.last_msg_received_day}}
            }
        });
    }

    if (filters.blacklist) {
        userQuery.push({_id: {$nin: filters.blacklist}});
    }

    if (search) {
        let locationQuery;
        let roleQuery;

        if(search.work_type === 'employee') {
            locationQuery= "candidate.employee.location";
            roleQuery = "candidate.employee.roles";
            userQuery.push({'candidate.employee': {$exists: true}});
        }
        if(search.work_type === 'contractor') {
            locationQuery= "candidate.contractor.location";
            roleQuery = "candidate.contractor.roles";
            userQuery.push({'candidate.contractor': {$exists: true}});
        }
        if(search.work_type === 'volunteer') {
            locationQuery= "candidate.volunteer.location";
            roleQuery = "candidate.volunteer.roles";
            userQuery.push({'candidate.volunteer': {$exists: true}});
        }

        if(search.name) {
            const nameSearch = { $or: [{ first_name: {'$regex' : search.name, $options: 'i'}},
                {last_name : {'$regex' : search.name, $options: 'i'}}] };
            userQuery.push(nameSearch);
        }
        if(search.why_work) {
            const wordSearch = { $or: [{ 'candidate.why_work': {'$regex' : search.why_work, $options: 'i'}},
                {description : {'$regex' : search.why_work, $options: 'i'}}] };
            userQuery.push(wordSearch);
        }
        if (search.locations && search.locations.length > 0 ) {
            logger.debug("locations: " ,search.locations);
            let locationsQuery = [];
            let citiesArray=[];
            let countriesArray = [];
            for(let loc of search.locations) {
                const cityDoc = await cities.findOneById(loc.city);
                if(cityDoc) {
                    citiesArray.push(cityDoc._id);
                    countriesArray.push(cityDoc.country);
                }
            }
            if(citiesArray.length > 0 ) {
                countriesArray = removeDups(countriesArray);
                if (search.visa_needed) {
                    for (let city of citiesArray) {
                        const setCityLocationQuery = function (locationQuery){
                            const cityQuery = {
                                [locationQuery]: {
                                    $elemMatch: {
                                        city: city,
                                        visa_needed: true
                                    }
                                }
                            }
                            locationsQuery.push(cityQuery)
                        };
                        if(locationQuery) setCityLocationQuery(locationQuery);
                        else {
                            setCityLocationQuery("candidate.employee.location");
                            setCityLocationQuery("candidate.contractor.location");
                            setCityLocationQuery("candidate.volunteer.location");
                        }
                    }

                    for (let country of countriesArray) {
                        const setCountryLocationQuery = function (locationQuery){
                            const countryQuery = {
                                [locationQuery]: {
                                    $elemMatch: {
                                        country: country,
                                        visa_needed: true
                                    }
                                }
                            }
                            locationsQuery.push(countryQuery)
                        };
                        if(locationQuery) setCountryLocationQuery(locationQuery);
                        else {
                            setCountryLocationQuery("candidate.employee.location");
                            setCountryLocationQuery("candidate.contractor.location");
                            setCountryLocationQuery("candidate.volunteer.location");
                        }

                    }
                }
                else {
                    for (let city of citiesArray) {
                        const setCityLocationQuery = function (locationQuery){
                            const cityQuery = {
                                [locationQuery]: {
                                    $elemMatch: {
                                        city: city,
                                        visa_needed: false
                                    }
                                }
                            }
                            locationsQuery.push(cityQuery)
                        };
                        if(locationQuery) setCityLocationQuery(locationQuery);
                        else {
                            setCityLocationQuery("candidate.employee.location");
                            setCityLocationQuery("candidate.contractor.location");
                            setCityLocationQuery("candidate.volunteer.location");
                        }
                    }

                    for (let country of countriesArray) {
                        const setCountryLocationQuery = function (locationQuery){
                            const countryQuery = {
                                [locationQuery]: {
                                    $elemMatch: {
                                        country: country,
                                        visa_needed: false
                                    }
                                }
                            }
                            locationsQuery.push(countryQuery)
                        };
                        if(locationQuery) setCountryLocationQuery(locationQuery);
                        else {
                            setCountryLocationQuery("candidate.employee.location");
                            setCountryLocationQuery("candidate.contractor.location");
                            setCountryLocationQuery("candidate.volunteer.location");
                        }

                    }

                }

            }
            if(search.locations.find(x => x.remote === true)) {
                let locationRemote;
                if(search.work_type === 'employee') locationRemote = {"candidate.employee.location.remote" : true};
                else if(search.work_type === 'contractor') locationRemote = {"candidate.contractor.location.remote" : true};
                else if(search.work_type === 'volunteer') locationRemote = {"candidate.volunteer.location.remote" : true};
                else {
                    locationRemote = {
                        $or: [
                            {"candidate.employee.location.remote" : true},
                            {"candidate.contractor.location.remote" : true},
                            {"candidate.volunteer.location.remote" : true}
                        ]
                    };
                }
                const locationRemoteFilter = locationRemote;
                locationsQuery.push(locationRemoteFilter);
            }
            if(locationsQuery && locationsQuery.length > 0) {
                userQuery.push({
                    $or:locationsQuery
                });
            }

        }

        if (search.roles && search.roles.length > 0  ) {
            let rolesQuery =[];
            const setRoleQuery = function (roleQuery) {
                const rolesFilter = {[roleQuery]: {$in: search.roles}};
                rolesQuery.push(rolesFilter);
            };
            if(roleQuery) setRoleQuery(roleQuery);
            else {
                setRoleQuery("candidate.employee.roles");
                setRoleQuery("candidate.contractor.roles");
                setRoleQuery("candidate.volunteer.roles");
            }

            if(rolesQuery && rolesQuery.length > 0) {
                userQuery.push({
                    $or: rolesQuery
                });
            }

        }

        if (search.currency && search.expected_salary_min) {
            const curr = search.currency;
            const salary = search.expected_salary_min;
            const usd = [{'candidate.employee.currency' : "$ USD"}, {'candidate.employee.expected_annual_salary': {$lte: salaryFactor*currency.convert(curr, "$ USD", salary)}}];
            const gbp = [{'candidate.employee.currency': "£ GBP"}, {'candidate.employee.expected_annual_salary': {$lte: salaryFactor*currency.convert(curr, "£ GBP", salary)}}];
            const eur = [{'candidate.employee.currency': "€ EUR"}, {'candidate.employee.expected_annual_salary': {$lte: salaryFactor*currency.convert(curr, "€ EUR", salary)}}];

            const currencyFiler = {
                $or : [{ $and : usd }, { $and : gbp }, { $and : eur }]
            };
            userQuery.push(currencyFiler);
        }

        if (search.currency && search.expected_hourly_rate_min) {
            const curr = search.currency;
            const hourly_rate = search.expected_hourly_rate_min;
            const usd = [{'candidate.contractor.currency' : "$ USD"}, {'candidate.contractor.expected_hourly_rate': {$lte: salaryFactor*currency.convert(curr, "$ USD", hourly_rate)}}];
            const gbp = [{'candidate.contractor.currency': "£ GBP"}, {'candidate.contractor.expected_hourly_rate': {$lte: salaryFactor*currency.convert(curr, "£ GBP", hourly_rate)}}];
            const eur = [{'candidate.contractor.currency': "€ EUR"}, {'candidate.contractor.expected_hourly_rate': {$lte: salaryFactor*currency.convert(curr, "€ EUR", hourly_rate)}}];

            const hourlyRateFilter = {
                $or : [{ $and : usd }, { $and : gbp }, { $and : eur }]
            };
            userQuery.push(hourlyRateFilter);
        }

        if (search.required_skills && search.required_skills.length > 0) {
            for (let skill of search.required_skills) {
                let skillMatch = {
                    name: skill.name
                };
                if (skill.exp_year) {
                    skillMatch.exp_year = {
                        $gte: skill.exp_year
                    }
                }
                userQuery.push({
                    "candidate.commercial_skills" : {
                        $elemMatch: skillMatch
                    }
                });
            }
        }
    }

    logger.debug("query", {query: userQuery});
    let searchQuery = {$and: userQuery};
    let sort = {"candidate.latest_status.timestamp" : -1};
    const userDocs = await users.findAndSort(searchQuery, sort);
    if(userDocs && userDocs.length > 0) {
        return {
            count: userDocs.length,
            candidates: userDocs
        };

    }
    else {
        errors.throwError("No candidates matched this search criteria", 404);
    }

}

function makeDistinctSet(array) {
    return Array.from(new Set(array));
}

function salary_converter(salary_value, currency1, currency2)
{

    let value1 = (salary_value / currency1).toFixed();
    let value2 = (salary_value/currency2).toFixed();
    let array = [];

    array.push(value1);
    array.push(value2);

    return array;
}

//Remove duplicates from one dimension array
function removeDups(names) {
    let unique = {};
    names.forEach(function(i) {
        if(!unique[i]) {
            unique[i] = true;
        }
    });
    return Object.keys(unique);
}

const minExpToArray  = function(expYears) {
    switch (expYears) {
        case 1:
            return ['0-1', '1-2', '2-4', '4-6', '6+'];
            break;
        case 2:
            return ['1-2', '2-4', '4-6', '6+'];
            break;
        case 3:
            return ['2-4', '4-6', '6+'];
            break;
        case 4:
        case 5:
        case 6:
            return ['4-6', '6+'];
            break;
        default:
            return ['6+'];
            break;
    }
}