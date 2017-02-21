#! /bin/bash 
aws s3 cp $1 ${S3_RESULT_PATH}/${1}
aws s3 cp $2 ${S3_RESULT_PATH}/${2}
