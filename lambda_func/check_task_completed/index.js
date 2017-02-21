var AWS = require('aws-sdk'); 
var s3 = new AWS.S3();

function main(event, context, callback) {
    Promise.resolve([event, context])
    .then(check_result_exist)
    .then(function() {
        event["step_func_result"]["is_task_completed"] = true;
        event["step_func_result"]["previous_nortify_msg"] = "Completed task. | " + event["step_func_result"]["instance_id"];
        callback(null, event);
    }).catch(function(msg) {
        console.log(msg);
        event["step_func_result"]["is_task_completed"] = false;
        callback(null, event);
    });
}

function check_result_exist(args) {
    var event = args[0];
    var context = args[1];

    var target_file_list = [event.exec_param.result_model_name, event.exec_param.result_log_name];
    return new Promise(function(resolve, reject) {
        Promise.all(target_file_list.map(function(target_file) {
            return new Promise(function(resolve, reject) {
                check_s3_exist_of(event, target_file, function(is_exist) {
                    is_exist ? resolve() : reject("Does not exsit file of: " + target_file);
                });
            });
        }))
        .then(function() {
            resolve();
        }) 
        .catch(function(msg) {
            reject(msg);
        });
    });
}

function check_s3_exist_of(event, filename, callback) {
    var keyname = event.project.name + '/' + event.exec_param.name + '_' + event["step_func_result"]["timestamp"] + '/' + filename;
    s3.getObject({Bucket: event.resource.s3_bucket_name, Key: keyname},
        function(err, data) {
            if (err) {
                console.error(err);
                callback(false);
            } else {
                callback(true);
            }
        }
    )
}

/////on Lambda/////
exports.handler = function(event, context, callback) {
    return main(event, context, callback);
};

/////test/////
/*
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

config["step_func_result"]["timestamp"] = 11111;
main(config, test_context, callback);
*/
