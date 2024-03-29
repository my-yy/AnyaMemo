# AnyaMemo
一款用于复习文档的软件，特点是能够为文档生成”稳定的链接“，即使文档改名或移动位置，依旧可以实现对文档的追踪。

[下载地址](https://huacishu.com/app/AnyaMemo/)

[软件说明](https://www.huacishu.com/2022/08/21/anya_memo/)




## 技术细节

**1.如何在文件改名、移动位置的前提下打开该文件?**

利用"文件标识符"：[inode](https://www.ruanyifeng.com/blog/2011/12/inode.html)

文件改名、移动位置均不会使得inode发生变化，因此在文件录入时会记录文件的inode值。

在打开文件时，如果路径对应的文件不存在，则会根据inode重新定位文件位置、更新路径记录。


**2.复习条目文件格式示例：**

```
{
  "link": "file:///Users/my/Desktop/Audio Self-supervised Learning- A Survey.docx",
  "inode": 153542495,
  "created_at": "2022-8-21 09:52:52",
  "is_on": true,
  "star": 0,
  "rev_plan": [
    {
      "plan_at": "2022-8-25"
    },
    {
      "plan_at": "2022-9-1"
    },
    {
      "plan_at": "2022-9-12"
    },
    {
      "plan_at": "2022-10-2"
    }
  ],
  "rev_history": [
    {
      "plan_at": "2022-8-21",
      "done_at": "2022-8-21 10:20:20"
    }
  ],
  "version": 1
}
```

复习安排使用了”预先计算“的方式，在创建条目时即生成了未来的所有的复习日期（`rev_plan`字段）

当复习完成时，`rev_plan`中的相关记录会被删去，在`rev_history`中创建一个新记录。



**3.文件夹复习间隔 功能是如何实现的?**

在文件夹下创建隐藏文件`.folder_description.json`，示例：

```
{
  "span": [
    1,
    3,
    7,
    11,
  ]
}
```



**4.跨平台迁移性？**

目前的版本是基于Electron的，因此迁移到其他平台是可行的，但我并没有精力去适配。

Linux同样基于inode机制，预估可实现全部功能，有兴趣可以fork一份魔改一番。

Windows平台则要依靠其他方案实现（我认为不太适合用跨平台技术去开发）



**5.如何实现跨设备数据同步？**

同步是很复杂的，因为：

1）软件没有存储录入的文件（只是存储了链接），因此对应的文件需要额外进行同步

2）inode的在各个设备间是不一致的，因此可能需要记录设备号
