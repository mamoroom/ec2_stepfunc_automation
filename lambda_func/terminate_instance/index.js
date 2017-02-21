var AWS = require('aws-sdk'); 
AWS.config.region = 'us-east-1';
var ec2 = new AWS.EC2();

function main(event, context, callback) {
    Promise.resolve([event, context])
    .then(delete_ec2_instance)
    .then(function(e) {
        e["step_func_result"]["previous_nortify_msg"] = "Succeed to terminate an instance. | " + e["step_func_result"]["instance_id"];
        callback(null, e);
    }).catch(function(msg) {
        context.fail(msg);
        callback(msg, {});
    });
}

function delete_ec2_instance(args) {
    var event = args[0];
    var context = args[1];

    return new Promise(function(resolve, reject) {
        var target_instance_id = event.step_func_result.instance_id;
        var params = {
            InstanceIds: [ target_instance_id ],
            DryRun: false
        };
        ec2.terminateInstances(params, function(err, data) {
            if (err) {
                reject("Could not terminate instance of " + target_instance_id + ": "+ err);
            }
            resolve(event);
        });
    })

}

/////on Lambda/////
exports.handler = function(event, context, callback) {
    return main(event, context, callback)
};

/////test/////
var config = require('../../config')
var test_context = {
    fail: function(msg) {
        console.log("[fail]");
        console.error(msg);
    },
    succeed: function(msg) {
        console.log("[succeed]");
        console.log(msg);
    }
};
var callback = function(err, result) {
    if (err) {
        console.error(err);
    } else {
        console.log(result);
    }
}
config["step_func_result"]["instance_id"] = 'i-06f8fcbb571eb0c9a';
//main(config, test_context, callback);