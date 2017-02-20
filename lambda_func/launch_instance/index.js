var AWS = require('aws-sdk'); 
AWS.config.region = 'us-east-1';
var Moment = require('moment-timezone');
var ec2 = new AWS.EC2();

var LAUNCH_MAX_COUNT = 1;
var LAUNCH_MIN_COUNT = 1;
var TIMESTAMP_ZONE_NAME = 'Asia/Tokyo';

function main(event, context) {
    Promise.resolve([event, context])
    .then(create_ec2_instance)
    .then(create_tags)
    .then(function() {
        context.succeed("completed");
    }).catch(function(msg) {
        context.fail(msg);
    });
}

function create_ec2_instance(args) {
    var event = args[0];
    var context = args[1];

    return new Promise(function(resolve, reject) {
        var params = {
            ImageId: event.resource.ami_id, 
            InstanceType: event.resource.instance_type,
            KeyName: event.resource.keyname,
            MaxCount: LAUNCH_MAX_COUNT,
            MinCount: LAUNCH_MIN_COUNT,
            SecurityGroupIds: event.resource.security_group_ids,
            SubnetId: event.resource.subnet_id,
            BlockDeviceMappings: event.resource.external_device.params
        };
        // Create the instance
        ec2.runInstances(params, function(err, data) {
            if (err) {
                reject("Could not create instance:" + err);
            }
            resolve([event, context, data.Instances[0].InstanceId]);
        });
    });
}

function create_tags(args) {
    var event = args[0];
    var context = args[1];
    var resource_id = args[2];

    return new Promise(function(resolve, reject) {
       // Add tags to the instance
        var timestamp = Moment().tz(TIMESTAMP_ZONE_NAME).unix();
        params = {
            Resources: [resource_id], 
            Tags: [
                {
                    Key: 'Name',
                    Value: event.project.name + "_" + event.exec_param.name + "_" + timestamp
                }
            ]
        };
        ec2.createTags(params, function(err) {
            if (err) {
                console.log(err);
                reject("Could not tag name to instance: " + err);
            }
            resolve()
        });
    });
}

/////on Lambda/////
exports.handler = function(event, context) {
    main(event, context)
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

main(config, test_context)

