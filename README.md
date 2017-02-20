# AWS-EC-STEPFUNC-AUTOMATION

主に機械学習用のEC2インスタンス自動起動/停止スクリプト

#### ネーミング規則

###### EC2
 - Tag: {config.project.name}_{config.exec_param.name}_$timestamp

###### S3
 - Path: machine-learning-result/{config.project.name}/config.exec_param.name}_$timestamp

