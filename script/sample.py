import datetime
import time
import os
import sys
from PIL import Image

IMAGE_EXTENTION = '.jpg'
INPUT_FILE_PATH = './data/input/sample' + IMAGE_EXTENTION
SCRIPT_PATH     = './s3_uploader.sh'

args = sys.argv 
i_width = args[1]
i_height = args[2]
result_model_name = args[3]
result_log_name = args[4]

now = datetime.datetime.now().strftime('%s')
out_file_name = now+"_sample"+IMAGE_EXTENTION
Image.open(INPUT_FILE_PATH).resize((int(i_width),int(i_height))).save(out_file_name)
time.sleep(3)
f = open(result_model_name, 'w')
f.write('model')
f.close()
f = open(result_log_name, 'w')
f.write('log')
f.close()
shell_result = os.system('sh ' + SCRIPT_PATH + ' ' + result_model_name + ' ' + result_log_name)
if (shell_result) :
    print 'ERROR'
else :
    print 'succeed!'
