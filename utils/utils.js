const fs = require('fs');
const path = require('path');

/**
 * @param {*} url
 * 删除目录
 */
const deleteDir = (url) => {
  let files = [];

  if (fs.existsSync(url)) {
    //判断给定的路径是否存在

    files = fs.readdirSync(url); //返回文件和子目录的数组
    files.forEach(function (file, index) {
      const curPath = path.join(url, file);

      if (fs.statSync(curPath).isDirectory()) {
        //同步读取文件夹文件，如果是文件夹，则函数回调
        deleteDir(curPath);
      } else {
        fs.unlinkSync(curPath); //是指定文件，则删除
      }
    });

    fs.rmdirSync(url); //清除文件夹
  }
};

const isNull = (val) => {
  return val === 'undefined' || val === undefined || val == null || val === 'null' || val.toString().trim() === '' || val === 'unknown';
};

module.exports = {
  deleteDir,
  isNull
};
