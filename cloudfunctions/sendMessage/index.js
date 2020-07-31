// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  const {
    OPENID
  } = cloud.getWXContext()


  try {
    const result = await cloud.openapi.subscribeMessage.send({
        touser: 'OPENID',
        page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
      
        data: {
          thing2: {
                  value: '云音乐'
                },
          thing3: {
                  value: event.content
                }
        },
        templateId: 'WMTufWaxEnLSj1aIh0cMOliFPd25vwc1Yx3h284Sx0I',
       
      })
    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }






  // const result = await cloud.openapi.subscribeMessage.send({
  //   touser: OPENID,
  //   page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
  //   data: {
  //     thing2: {
  //       value: '云音乐'
  //     },
  //     thing3: {
  //       value: event.content
  //     }
  //   },
  //    templateId: 'WMTufWaxEnLSj1aIh0cMOliFPd25vwc1Yx3h284Sx0I',
  //   formId: event.formId
  // })
  // return result
}