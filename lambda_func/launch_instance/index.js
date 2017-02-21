var AWS = require('aws-sdk'); 
AWS.config.region = 'us-east-1';
var Moment = require('moment-timezone');
var here = require('here').here;
var util = require('util');

var ec2 = new AWS.EC2();

var LAUNCH_MAX_COUNT = 1;
var LAUNCH_MIN_COUNT = 1;
var TIMESTAMP_ZONE_NAME = 'Asia/Tokyo';

function main(event, context) {
    var timestamp =  Moment().tz(TIMESTAMP_ZONE_NAME).unix();
    Promise.resolve([event, context, timestamp])
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
    var timestamp = args[2];

    return new Promise(function(resolve, reject) {
        var params = {
            ImageId: event.resource.ami_id, 
            InstanceType: event.resource.instance_type,
            KeyName: event.resource.keyname,
            MaxCount: LAUNCH_MAX_COUNT,
            MinCount: LAUNCH_MIN_COUNT,
            SecurityGroupIds: event.resource.security_group_ids,
            SubnetId: event.resource.subnet_id,
            IamInstanceProfile: event.resource.iam_role_arn,
            BlockDeviceMappings: event.resource.external_device.params,
            UserData: _create_user_data(event, timestamp)
        };
        // Create the instance
        ec2.runInstances(params, function(err, data) {
            if (err) {
                reject("Could not create instance:" + err);
            }
            resolve([event, context, data.Instances[0].InstanceId, timestamp]);
        });
    });
}

// todo timestampを渡す
function create_tags(args) {
    var event = args[0];
    var context = args[1];
    var resource_id = args[2];
    var timestamp = args[3];

    return new Promise(function(resolve, reject) {
       // Add tags to the instance
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

function _create_user_data(event, timestamp) {
    var user_data_format = here(/*
        #!/bin/bash
        su - ubuntu -c 'rm -fr /home/ubuntu/app && mkdir /home/ubuntu/app'
        su - ubuntu -c 'cd /home/ubuntu/app && git clone %s project && cd project && git checkout %s'
        cd /home/ubuntu/app/project/script && pip install -r requirements.txt
        su - ubuntu -c 'cd /home/ubuntu/app/project/script && export S3_RESULT_PATH=%s && python %s %s %s'
        */);
    var user_data = util.format(user_data_format.unindent(), 
        event.project.repository_url,
        event.project.branch_name,
        's3://' + event.resource.s3_bucket_name + '/' + event.project.name + '/' + event.exec_param.name + '_' + timestamp,
        event.exec_param.script_name,
        event.exec_param.epoch,
        event.exec_param.lr
    );
    return Buffer(user_data).toString('base64');
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

//console.log(_create_user_data(config, "11111"));
main(config, test_context)


