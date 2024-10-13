const db = wx.cloud.database();
const jobDetail = db.collection('jobDetail');
const info = db.collection('info')
const util = require('../utils/utils')
Page({
  data :{
    swiper:[{
      img:"../../images/swiper/swiper1.jpg"
    },{
      img:"../../images/swiper/swiper3.jpg"
    }
  ],
    list:[{
      img:"/images/icon/write.png",
      text:"写作",
      tag:"write"
    },{
      img:"/images/icon/teach.png",
      text:"家教",
      tag:'teach'
    },{
      img:"/images/icon/fastMail.png",
      text:"快递分拣",
      tag:"fastMail"
    },{
      img:"/images/icon/waiter.png",
      text:"服务生",
      tag:"waiter"
    },{
      img:"/images/icon/takeOut.png",
      text:"送餐员",
      tag:"takeOut"
    },{
      img:"/images/icon/invite.png",
      text:"邀请",
      tag:"invite"
    }
  ],
    fire:[],
    new:[],
    activeNames: ['1'],
    notice:"公告：北一2083大甩卖",
    fireTime:''
  },
  onLoad(){
    this.getjobDetail();
  },
  getjobDetail() {
    jobDetail.orderBy('date', 'desc').limit(7).get().then((res) => {
      let re = res.data;
      for (let i = 0; i < res.data.length; i++) {
        const element = res.data[i];
        res.data[i].date = util.formatDate(element.date);
        res.data[i].salary = element.salary || '面议';  // 如果没有薪资，显示“面议”
        
        // 如果数据库没有图片字段，给每个职位一个默认图片
        res.data[i].image = element.image || '/images/default.png';  // 替换为实际路径
      }
      console.log(re);  // 打印数据，确保 image 字段存在
      this.setData({
        new: re
      });
    });
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail
    });
  },
  detail(e){
    let id = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '../detail/detail?id=' + id,
    })
  },
  tagDetail(e){
    let name = e.currentTarget.dataset.name;
    
    if(name === 'invite'){
      wx.showToast({
        title: '功能待完善',
        icon: 'none'
      })
      // wx.navigateTo({
      //   url: '../my/detail/invite/invite',
      // })      
    }else{
      wx.navigateTo({
        url: '../tagList/tagList?name=' + name,
      })
    }
  },
  search(){
    wx.navigateTo({
      url: '../search/search',
    })
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getjobDetail();
    //模拟加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
  }
})
