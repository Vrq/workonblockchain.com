const settings = require('../../../../settings');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
const users = require('../../../../model/users');
const logger = require('../../../services/logger');

module.exports = function (req,res)
{
    emailVerify(req.params.email_hash).then(function (err, data)
    {

        if (data)
        {
            res.json(data);
        }
        else
        {
            res.send(err);
        }
    })


}

function emailVerify(verifyEmailToken)
{
    var deferred = Q.defer()
    //var data = jwt_hash.decode(token, settings.EXPRESS_JWT_SECRET, 'HS256');

    //if(new Date(data.expiry) > new Date())
    //{
        users.findOne(  { verify_email_key: verifyEmailToken  }, function (err, result)
        {
            if (err){
                logger.error(err.message, {stack: err.stack});
                deferred.reject(err.name + ': ' + err.message);
            }
            if(result)
            {
      
                updateData(result._id);
            }
            else
           
                deferred.resolve({error:'Email hash not found'});
        });

        function updateData(_id)
        {
            var set =
                {
                    is_verify: 1,
                };
            users.update({ _id: mongo.helper.toObjectID(_id) },{ $set: set }, function (err, doc)
            {
                if (err){
                    logger.error(err.message, {stack: err.stack});
                    deferred.reject(err.name + ': ' + err.message);
                }
                else
                    deferred.resolve({msg:'Email Verified'});
            });
        }
    //}

   // else
    //{
    	
        //deferred.resolve({error:'Link Expired'});
    //}
    return deferred.promise;

}