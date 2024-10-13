function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;  // 注意：月份是从 0 开始的，所以需要 +1
  const day = d.getDate();

  // 确保月份和日期是两位数，不要带前导零
  return `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
}
function getImageInfo(url) {
  return new Promise((reslove,reject)=>{
    wx.getImageInfo({
      src: url,
      success: reslove,
      fail: reject
    })
  })
}
var time = null;
function debounce(fn,delay) {
  return function() {
    if(time) clearTimeout(time);
    time = setTimeout(()=>{
      fn.apply(this,arguments)
    },delay)
  }()
}
module.exports = {
  formatDate,
  getImageInfo,
  debounce
}