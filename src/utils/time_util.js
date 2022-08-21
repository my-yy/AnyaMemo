import moment from "moment";

const FORMAT = 'YYYY-M-D HH:mm:ss'

function dateEnd(date) {
  return new Date(date.getTime()).setHours(23, 59, 59, 999)
}


function str2date(str) {
  return moment(str, FORMAT).toDate();
}

function date2str(date) {
  return moment(date).format('YYYY-M-D HH:mm:ss')
}

function getDayDiff_tz(day1, day2) {
  day1 = dateEnd(day1);
  day2 = dateEnd(day2);
  return moment(day1).diff(day2, 'days');
}


function getDateDesc(date) {
  if (date == null) {
    return "null"
  }
  if (typeof date == "string") {
    date = new Date(date);
  }
  let today = new Date();
  let span = getDayDiff_tz(date, today);
  if (span === 0) {
    return "今日"
  } else if (today > date) {
    return `${-span}天前`
  } else {
    return `${span}天后`
  }
}

export default {
  str2date,
  date2str,
  getDateDesc,
  getDayDiff_tz
}
