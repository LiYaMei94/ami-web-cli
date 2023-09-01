#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');
const process = require('process');
const child_process = require('child_process');
const { spawn, exec } = child_process;
const chalk = require('chalk');
const Handlebars = require('handlebars');
const ora = require('ora');
const { deleteDir, isNull } = require('./utils/utils');

// 交互命令
const promptList = [
  {
    name: 'description',
    message: '请输入项目描述'
  },
  {
    name: 'author',
    message: '请输入项目作者',
    default: 'liyamei'
  },
  {
    name: 'git',
    message: '请输入git仓库',
    default: null
  },
  {
    name: 'branch',
    message: '分支名称',
    default: 'main'
  },
  {
    name: 'type',
    type: 'list',
    message: '选择模板类型',
    choices: ['vue-antd'],
    default: 'vue-antd'
  }
];

// 安装依赖
const install = (options) => {
  return new Promise((resolve, reject) => {
    try {
      inquirer
        .prompt([
          {
            name: 'install',
            type: 'list',
            message: '是否安装依赖？',
            choices: ['yes', 'no'],
            default: 'yes'
          }
        ])
        .then((res) => {
          try {
            const { name } = options || {};
            const spinner = ora(`npm install...`);
            const { install } = res || {};
            if (install === 'yes') {
              spinner.start();
              const phonegap = exec(`cd ./${name} && npm install`, function (err, stdout, stderr) {});
              phonegap.stdout.pipe(process.stdout);
              phonegap.stderr.pipe(process.stderr);
              phonegap.on('close', (code) => {
                spinner.stop();
                if (code !== 0) {
                  // console.log(chalk.red(`\n install failed!`));
                  console.log(chalk.blue(`\n cd ${name} \n npm install \n npm run serve`));
                  reject(`\n install failed!`);
                } else {
                  console.log(chalk.green(`\n install successful!`));
                  console.log(chalk.blue(`\n cd ${name} \n npm run serve`));
                  resolve();
                }
              });
            }
            if (install === 'no') {
              spinner.stop();
              console.log(chalk.blue(`\n cd ${name} \n npm run install \n npm run serve`));
              resolve();
            }
          } catch (error) {
            reject(error);
          }
        });
    } catch (error) {
      reject(error);
    }
  });
};

const gitInit = (localPath, options) => {
  return new Promise((resolve, reject) => {
    try {
      const { name, git, branch } = options || {};
      const gitPath = path.join(localPath, '.git');
      // 删除.git文件;
      deleteDir(gitPath);
      if (!isNull(git)) {
        // && git push -u origin ${branch}
        // && git commit -m "first commit"
        const execStr = `cd ./${name} && git init && git branch -M ${branch} && git remote add origin ${git} `;
        const gitExec = exec(execStr);
        gitExec.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`);
        });
        gitExec.stderr.on('data', (data) => {
          console.log(`stdout: ${data}`);
        });
        gitExec.on('close', (code) => {
          if (code !== 0) {
            // console.log(chalk.red(`\n git init failed!`));
            reject(`\n git init failed!`);
          } else {
            console.log(chalk.green(`\n git init successful!`));
            resolve('git init successful');
          }
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

// 将用户输入的内容注入到响应文件
const dataInjection = (localPath, options) => {
  return new Promise((resolve, reject) => {
    try {
      const { name, description, author, git, branch } = options || {};
      const packagePath = path.join(localPath, 'package.json');
      const envDevelopment = path.join(localPath, '.env.development');
      const envPre = path.join(localPath, '.env.pre');
      const envPro = path.join(localPath, '.env.production');
      const envStage = path.join(localPath, '.env.stage');
      const readme = path.join(localPath, 'README.md');

      // FIXME:根据自己的需要新增
      const fileMap = {
        'package.json': packagePath,
        '.env.development': envDevelopment,
        '.env.pre': envPre,
        '.env.production': envPro,
        '.env.stage': envStage,
        'README.md': readme
      };
      //  判断是否有文件, 要把输入的数据回填到模板中;
      for (let key in fileMap) {
        if (fs.existsSync(fileMap[key])) {
          const content = fs.readFileSync(fileMap[key]).toString();
          // handlebars 模板处理引擎
          const template = Handlebars.compile(content);
          const result = template({ description, name, author });
          fs.writeFileSync(fileMap[key], result);
          resolve();
        } else {
          console.log(chalk.yellow(`\n failed! no ${key}`));
          reject(`failed! no ${key}`);
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

// 下载模板
const gitClone = (url, localPath) => {
  return new Promise((resolve, reject) => {
    try {
      const git = spawn('git', ['clone', '--progress', url, localPath]);

      git.stdout.on('data', (data) => {
        console.log(chalk.blue(`stdout: ${data}`));
      });

      git.stderr.on('data', (data) => {
        // 输出 git 进程的错误输出到控制台
        const message = /^([\s\S]+?):\s*(\d+)% \((\d+)\/(\d+)\)/.exec(data.toString('utf8'));
        if (!message) {
          return;
        }

        const { stage, progress } = {
          stage: message[1],
          progress: message[2],
          processed: message[3],
          total: message[4]
        };
        console.log(`git ${stage} stage ${progress}% complete \n`);
      });

      // 监听 git 进程的 exit 事件
      git.on('exit', (code) => {
        if (code !== 0) {
          reject(`\n Git clone process exited with code ${code}`);
        } else {
          console.log(chalk.green(`\n Git clone successful!`));
          resolve('Git clone successful');
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// 创建项目
program
  .command('init <name>')
  .description('init a project')
  .option('-t, --type <type>', 'type of the project to init')
  .action((name, opts) => {
    inquirer.prompt(promptList).then(async (res) => {
      try {
        const { type } = res || {};
        const downloadPath = path.join(process.cwd(), `/${name}`);
        // 下载模板
        await gitClone(`https://github.com/LiYaMei94/${type}-template.git`, downloadPath);
        // 将用户输入的内容注入模板
        await dataInjection(downloadPath, { ...res, name });
        // git init
        await gitInit(downloadPath, { ...res, name });
        // 安装依赖
        await install({ ...res, name });
      } catch (error) {
        console.log(chalk.red(error));
      }
    });
  });

program.parse(process.argv);

// 设置版本
program.version('1.0.0');
