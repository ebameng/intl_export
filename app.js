/**
 * title: 快速生成国际化excel
 * author: pengjinwen
 * date: 2018/6/25
 *  参数：
 *    端口： port
 *    目录： dir， 默认在当前目录下
 *    需要的前缀: prefix 例如： 只想导出前缀为 a_***的， 则加上 prefix=a_
 *    变量名: key 以|隔开， 默认：LangMessage|Lang
 *  TODO: 去重
 */

const express = require('express')
const app = express()
const nodeExcel = require('excel-export')
const fs = require('fs')
const opn = require('opn')
const path = require('path')
const params = getParams()
const filePath = path.resolve(params.dir || path.join(process.cwd(), '\\'))
const prefix = params.prefix && typeof params.prefix === 'string' ? params.prefix : ''
const key = params.key && typeof params.key === 'string' ? params.key : 'LangMessage|Lang'
const langRegexp = new RegExp(`.*(?:${key})\\.(${prefix}[a-zA-Z_0-9]+)\\s?\\|\\|\\s?['"]([^'"]+).*`, 'ig') // Lang变量型的正则
let resultArray = [] // 存储所有key,value的数组
var tempJsonPath = './temporary.json'

app.get('/', function (req, res) {
  fs.stat(tempJsonPath, (err, stats) => {
    if (err) {
      console.log('run "intl_export" again several seconds later')
    } else {
      let content = fs.readFileSync(tempJsonPath, 'utf-8')
      let array = (content && JSON.parse(content)) || []
      let conf = {}
      fs.unlink(tempJsonPath) // 删除只需异步
      conf.cols = [{
        caption: 'i18nKey',
        type: 'string'
      }, {
        caption: 'content',
        type: 'string'
      }]
      conf.rows = []
      array.forEach((item) => {
        conf.rows.push([item.key, item.value])
      })
      const result = nodeExcel.execute(conf)
      res.setHeader('Content-Type', 'application/csv') // application/vnd.openxmlformats
      res.setHeader('Content-Disposition', 'attachment; filename=' + 'intl_export.csv')
      res.end(result, 'binary')
      console.log('successfully!')
      process.exit()
    }
  })
})

function getStr (str, key) {
  let rs = str.match(new RegExp(key + '=(\'|")[^\'"]+', 'g'))
  return rs && rs[0] && rs[0].replace(key + "='", '')
}

// 文件遍历方法
function fileDisplay (filePath) {
  console.log('start traversing directory....')
  // 根据文件路径读取文件，返回文件列表
  const readdir = fs.readdirSync(filePath) || []
  console.log(readdir)
  readdir.forEach((filename) => {
    // 获取当前文件的绝对路径
    let filedir = path.join(filePath, filename)
    if (filedir.indexOf('node_modules') > -1) {
      return
    }
    // 根据文件路径获取文件信息，返回一个fs.Stats对象
    fs.stat(filedir, (err, stats) => {
      if (err) {
        console.warn('获取文件stats失败')
      } else {
        let isFile = stats.isFile()
        let isDir = stats.isDirectory()
        if (isFile) {
          // 读取文件内容
          let content = fs.readFileSync(filedir, 'utf-8')
          if (/<FormattedMessage[^>]+/.test(content)) {
            let strArr = content.match(/<FormattedMessage[^>]+/g) || []
            strArr.forEach((item) => {
              let id = getStr(item, 'id')
              let value = getStr(item, 'defaultMessage')
              if (prefix) {
                if (new RegExp(`^${prefix}.+`).test(id)) {
                  resultArray.push({
                    key: id,
                    value: value
                  })
                }
              } else {
                resultArray.push({
                  key: id,
                  value: value
                })
              }
            })
            fs.writeFileSync(tempJsonPath, JSON.stringify(resultArray))
          }
          if (langRegexp.test(content)) {
            let langStrArr = content.match(langRegexp) || []
            langStrArr.forEach((item) => {
              let itemArr = item.replace(langRegexp, '$1,$2') && item.replace(langRegexp, '$1,$2').split(',')
              let id = itemArr[0]
              let value = itemArr[1]
              resultArray.push({
                key: id,
                value: value
              })
            })
            fs.writeFileSync(tempJsonPath, JSON.stringify(resultArray))
          }
        }
        if (isDir) {
          fileDisplay(filedir)
        }
      }
    })
  })
}

function getParams () {
  const argvs = process.argv || []
  if (argvs.length > 1) {
    let obj = {}
    let reg = /^(\S+)=(\S+)$/
    argvs.forEach((item, index) => {
      if (index > 1 && reg.test(item)) {
        item.replace(reg, (_, $1, $2) => {
          obj[$1] = $2
        })
      }
    })
    return obj
  } else {
    return {}
  }
}

function motor () {
  console.log('waiting 3 seconds........')
  fileDisplay(filePath)
  app.listen(params.port || 3000)
  setTimeout(_ => {
    opn(`http://localhost:${params.port || 3000}`)
  }, 3000)
}

exports.motor = motor
