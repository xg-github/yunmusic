// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
// 初始化云数据库
const db = cloud.database()

const rp = require('request-promise')

const playlistCollection = db.collection('playlist')

const URL = 'http://musicapi.xiecheng.live/personalized'

const MAX_LIMIT = 100
// 云函数入口函数
// async处理异步操作
exports.main = async (event, context) => {
  // 在连接时会用重复的代码，直接上去定一个变量，list是数据库存的数据
  //异步操作还是要写await
  // const list = await playlistCollection.get()  突破条数限制，多取几次
  const countResult = await playlistCollection.count()  //获取是一个对象
  const total = countResult.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)  //向上取整
  const tasks = []
  for(let i=0; i < batchTimes; i++){
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let list = {
    data: []
  }
  if(tasks.length > 0){
    list =(await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }

  // 向URL发送请求，结果返回到playlist（从服务器获取的数据）
  const playlist = await rp(URL).then((res) => {
    //  转化成对象
    return JSON.parse(res).result
  })
//去重处理
  const newData = []
  for (let i = 0, len1 = playlist.length; i < len1; i++) {
    let flag = true //判断是否重复的标志位
    for (let j = 0, len2 = list.data.length; j < len2; j++) {
      if (playlist[i].id === list.data[j].id){
         flag = false
        break
      }
       
    }
      if(flag){
        newData.push(playlist[i])
      }
  }
  //  不能打印到控制器上，应在云端
  //  console.log(playlist)
  for (let i = 0, len = newData.length; i < len; i++) {
    // 还是异步的过程，一条结束插入第二条
    await playlistCollection.add({
      data: {
        // 扩展运算符展示
        ...newData[i],  //由playlist换为newData 去重后的
        // 获取服务器时间，以实现时间倒叙
        createTime: db.serverDate(),
      }
    }).then((res) => {
      console.log('插入成功')
    }).catch((err) => {
      console.error('插入失败')
    })
  }
  return newData.length
}