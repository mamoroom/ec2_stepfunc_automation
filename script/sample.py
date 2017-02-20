import datetime
import time
import os
import sys
from PIL import Image

IMAGE_EXTENTION = '.jpg'
INPUT_FILE_PATH = './data/input/sample' + IMAGE_EXTENTION
OUTPUT_DIR_PATH = './data/output/'
SCRIPT_PATH     = './s3_uploader.sh'

now = datetime.datetime.now().strftime('%s')
out_file_name = now+"_sample"+IMAGE_EXTENTION
out_file_path = OUTPUT_DIR_PATH+out_file_name
#out_file_path2 = OUTPUT_DIR_PATH+now+"_sample"+'.png'
Image.open(INPUT_FILE_PATH).resize((1512,2016)).save(out_file_path)
time.sleep(5)
shell_result = os.system('sh ' + SCRIPT_PATH + ' ' + out_file_path + ' ' + out_file_name)
if (shell_result) :
    print 'ERROR'
else if :
    print 'succeed!'
