# intl_export
when you used React-intl, maybe you need a tool to export an excel those been setted intl.

### Installation:
```javascript
$ npm install -g intl_export
$ cd your_project
$ intl_export
```
### Usage:
* eg.
```javascript 
//a.js
<FormattedMessage id='hello' name='你好' />
//b.js
let user = this.LangMessage.user || '用户'
//c.js
let login = this.Lang.login || '登录'
```
#### result: you will get an excel
<table>
    <tr>
        <th>i18nKey</th>
        <th>content</th>
    </tr>
    <tr>
        <th>hello</th>
        <th>你好</th>
    </tr>
    <tr>
        <th>user</th>
        <th>用户</th>
    </tr>
    <tr>
        <th>login</th>
        <th>登录</th>
    </tr>
</table>

### Other params:
* port: 自定义端口号， 默认是3000
* dir: 自定义目录， 默认在当前执行命令目录下
* prefix: 前缀 例如： 只想导出前缀为 a_***的， 则加上 prefix=a_
* key: 变量名, 以|隔开， 默认：LangMessage|Lang

eg.
```javascript
intl_export port=3333 prefix=a_ key=test1|test2|test3
```