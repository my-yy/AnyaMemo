const {clipboard} = require('electron');
const fs = require('fs');


function detect_link() {
  const plain_text = clipboard.readText();
  const rtf_data = clipboard.readRTF();
  const html_data = clipboard.readHTML();
  console.log({
    rtf_data, html_data
  })
  //1.检测印象笔记
  const evernote_info = clipboard.read("com.evernote.notelink.html");
  if (evernote_info) {
    //<a href="https://app.yinxiang.com/shard/s57/nl/2147483647/0deb97d5-c275-4621-bcd7-33ae6fb4b9b0/" style="color:#69aa35;">TestNoteOne</a>
    let index = evernote_info.indexOf(">");
    let title = evernote_info.substring(index + 1, evernote_info.length - 4);
    return [title, plain_text];
  }

  //2.Onenote:
  if (isOnenoteType(plain_text)) {
    let link = plain_text.split("\n")[1];
    let index = link.indexOf("#");
    let to_index = link.indexOf("&section-id");
    let title = link.substring(index + 1, to_index);
    return [title, link];
  }

  //3.Devonthink:
  if (plain_text.startsWith("x-devonthink-item://")) {
    let title = clipboard.read("public.url-name");//即便是复制的纯文本，也只不过是没有title，不会有什么影响
    return [title, plain_text];
  }

  //4. 文件系统
  if (fs.existsSync(plain_text)) {
    const anme = path.basename(plain_text)
    return [anme, "file://" + plain_text]
  }

  //6. bookmark,能涵盖marginNote
  const bookmark = clipboard.readBookmark();
  if (bookmark && bookmark.url) {
    return [bookmark.title, bookmark.url];
  }

  //7.文本兜底
  if (isUrl(plain_text)) {
    console.log("普通URL")
    const name = plain_text.split("/").pop()
    return [name, plain_text];
  }
  return [plain_text, ""];//认为是name
}

function isOnenoteType(text) {
  let tmp = text.split("\n");
  if (tmp.length === 2 && tmp[1].startsWith("onenote:https://") && tmp[0].startsWith("https://")) {
    return true
  }
  return false;
}


function isUrl(text) {
  return new RegExp("^[\\w-]+://", "g").test(text);
}


module.exports = {
  detect_link
}
