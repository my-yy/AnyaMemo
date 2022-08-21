import item_util from "@/utils/item_util";
import moment from "moment";


function span2str(span) {
  if (span instanceof Array) {
    if (span.length > 0) {
      return span.join("，")
    }
  }
  return "无"
}


//span:
function replaceAll(string, search, replacement) {
  return string.replace(new RegExp(search, 'g'), replacement);
}

function str2span(spanStr, max_len = 15) {
  if (!spanStr) {
    return []
  }

  //进行转化:
  let arr = replaceAll(spanStr.trim(), "，", ",").split(",");
  //变成数组:
  // console.log(arr);
  let tmp = [];
  let len = 0;
  for (let v of arr) {
    let i = parseInt(v);
    if (i > 0) {//不接受负数与0
      tmp.push(i);
      len = len + 1;
      if (len === max_len) {
        break;
      }
    }
  }
  return tmp
}


function dateEnd(date) {
  return new Date(date.getTime()).setHours(23, 59, 59, 999)
}


function getDayDiff_tz(day1, day2) {
  day1 = dateEnd(day1);
  day2 = dateEnd(day2);
  return moment(day1).diff(day2, 'days');
}


function str2date(str) {
  const FORMAT = 'YYYY-M-D HH:mm:ss'
  return moment(str, FORMAT).toDate();
}


function getTodayNeedRev() {
  const all_items = item_util.getAllItemsFromDB()
  const today = new Date();
  const need_rev = []
  for (const db_item of all_items) {
    if (!db_item.is_on) {//未启用复习
      continue
    }
    const rev_plan = db_item.rev_plan //遍历复习计划
    for (const p of rev_plan) {
      const plan_at_date = str2date(p.plan_at)
      const diff = getDayDiff_tz(plan_at_date, today)
      if (diff <= 0) {//需要复习
        need_rev.push({
          //用于展示
          "name": db_item._show_name,
          "date": p.plan_at,
          "diff": diff,
          "done": false,
          "full_path": db_item._full_path,
          //索引：
          "db_item": db_item,
          "plan_obj": p,
        })
      } else {
        break
      }
    }
  }
  return need_rev
}


function getHistory(days = 7) {
  const all_items = item_util.getAllItemsFromDB()
  const today = new Date();
  const groups = {}//分组
  for (const db_item of all_items) {
    const rev_history = db_item.rev_history
    for (const obj of rev_history) {
      const done_at = str2date(obj.done_at)
      const diff = getDayDiff_tz(today, done_at)
      if (diff < days) {
        const arr = groups[diff] || []
        arr.push(db_item)
        groups[diff] = arr
      }
    }
  }

  const keys = Object.keys(groups)
  keys.sort()


  const group_array = keys.map(k => {
    return {
      "items": groups[k],
      "diff": k,
      "diff_str": getDiffStr(k)
    }
  })
  console.log("group_array", group_array)
  return group_array
}

function getDiffStr(diff) {
  diff = parseInt(diff)
  if (diff === 0) {
    return "今日"
  }
  if (diff === 1) {
    return "昨日"
  }
  return diff + "天前"

}


export default {
  span2str,
  str2span,
  getTodayNeedRev,
  getHistory
}

