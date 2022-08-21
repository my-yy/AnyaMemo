function setupListener(dom_id, callback) {
  const holder = document.getElementById(dom_id)
  if (!holder) {
    console.log(dom_id + "不存在")
    return
  }

  holder.ondragover = (event) => {
    if (holder.children.length > 0) {//有child，判断是否落在之内
      const child = holder.children[holder.children.length - 1]
      const childY = child.getBoundingClientRect().bottom;
      const clientY = event.clientY
      if (clientY <= childY) {//不接收事件
        holder.style.outline = "none"
        return true
      }
    }
    //没有child，或者不在范围内
    event.preventDefault()
    holder.style.outline = "2px skyblue solid"
  };


  holder.ondrop = (event) => {
    holder.style.outline = "none"
    if (event.eventPhase !== 2) {
      //child中产生的drop
      return
    }
    event.preventDefault();
    console.log("parent ondrop")
    //判断内容
    callback(event.dataTransfer.files)
  };

  holder.ondragleave = () => {
    holder.style.outline = "none"
  };


}

function removeListener(dom_id) {
  console.log("removeListener")
  const holder = document.getElementById(dom_id)
  if (holder) {
    holder.ondragover = null
    holder.ondragleave = null
    holder.ondragend = null
    holder.ondrop = null
  }
}

export default {
  setupListener, removeListener
}
