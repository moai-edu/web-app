# TODO

## BUGs

- 学生上传过大屏幕截图时会提示失败，应该解除大小限制或者放大限制；Body exceeded 1 MB limit. To configure the body size limit for Server Actions, see: <https://nextjs.org/docs/app/api-reference/next-config-js/serverActions#bodysizelimit>

## Fixed

## Tasks

- 允许关闭一个班级（课程结束关闭后，不再允许提交）
- jump here课程跳转的链接错误；
- 未登录用户访问登录用户的页面，跳转到登录页面；登录成功后，跳转到原页面；
- 外链显示错误！如 [OpenWeatherMap](https://openweathermap.org/api)
- 在班级的课程页面中显示班级信息；
- 学生只修改姓名不需要 指定 slug（占用 slug，还给用户增加麻烦）
- 记录每个班级的学习进度，可以迅速直接跳到对应的任务中；
- review 截图的界面增加批量操作按键：提交的全部通过；
- 数据的备份与恢复（s3,dynamodb）;
- 使用验证码对新用户注册的邮件发送接口进行保护；
- 在aws cognito界面中重置密码（用户邮箱中会收到一个 reset code，但是因为没有界面可以输入，无法完成密码重置）
- 注销以后，在 cognito 界面仍然保存了密码信息，会自动登录
- 增加一个静态网站 s3+cloudfront 的部署方式；把域名迁移为 www+apex 指向静态网
    站，serverless 动态网站改为 portal 域名；
- 把纯静态资源的发布和动态资源的发布分开；静态资源发布到 s3（同时 invalidate
    CF），彻底解决目前动态网站发布静态文档的整体布局存在问题；
- review 页面中增加一个变成 unsubmit 的按钮，可以将该提交变成未提交状态，同时
    删除对应的提交记录（针对有些同学胡乱提交交卷的 quiz，不应在统计时计入成绩）
    ；
- 成员管理页面：查看班级成员页面，成员统计、排名、查看单个成员的作业页面；整个
    班级的统计信息
- startup 门户网站的功能；
- 不刷新直接加载新提交的截图；
- 申请 ses 的 production 环境（移除 sandbox 环境），解除 cognito 注册发送验证
    邮件有每天 50 封的限制；
- 提交管理页面：针对一个班级课程中已提交的 quiz 的管理，id 重命名等等。注意：
    当 quiz 的 id 改变时，原来的 id 的 quiz 的结果应该被清除或者被 save 到新的
    id 的 quiz 中；
- gsi 的定义、使用和排除，分散在 2 个文件中，容易遗漏和错配
- s3 bucket 要处理 cors，允许跨域访问；本地环境 localstack 中的 s3 是 make 脚
    本中手动解决，则在云部署环境中的 s3 bucket 的 cors 还没有实现自动配置；因为
    gfw 的存在，目前对 s3 的访问都被反向代理了，所以目前在云部署环境中 s3 bucket
    不设置 cors 没有关系，因为已经在反向代理的 ngx 中设置了 cors；

## DONE

- md 文件显示错误信息
- 课程的退出链接错误；
- review 的大图预览界面中 pass/fail/unsubmit 增加快捷键；
- nginx 反向代理要加入 CORS 头(nginx 反向代理配置默认就允许 cors 跨域访问)；为
    dev 环境部署增加反向代理；
- 让 develop 分支部署的时候不代理 s3，只有生产环境部署时才代理 s3;
- 我的静态 html 文档（论文、申请介绍材料、项目报告、个人简介简历、作品介绍展示
    ）
- 修改 ci，仅当提交 message 中有 setup 或 teardown 关键字时才触发部署
- review 页面中显示该 submit 的统计信息（学生数、提交数、未提交数、提交率；通
    过数、未通过数、通过率）
- 通过代理解决 s3 被墙和缓存的问题；
- 统计结果的比率保留小数点后 2 位
- 截图的大图预览页面姓名后面的 status 显示不正确，显示为 object:object

1. 参考 duolingo 的课程（主要考虑英文与技术的双向学习），结合上课的实际情况（截
   图上传可能更可行？），设计每个 step 的练习题的类型，并在学习时显示；
2. 按确定的规则，在学习时，固定往课程 tile 之间插入其它 tile（比如：treasure
   tile），以增加趣味性（playful learning 以及游戏成瘾机制研究）；
3. 每个 tile 的状态对应于 step 的进度（在查看课程的页面中，step 进度永远为 0），
   点击 tile 跳转到对应的 stepIndex=0 页面；
4. sst dev 本地开发部署问题；
5. 完成课程内容中每个 step 对应的任务（课前键盘打字练习、中英文配对测验；课后屏
   幕截图上传；测验、作业、考试、练习、其它 ……以后补充）
6. 完成课程内容列表功能（分为 docs/slug/course 路径下的我的课程 s，和
   docs/public/course 路径下的共享课程），点击课程进入查看课程内容页面；
7. 完成创建课程学习功能，给课程学习绑定课程内容；
8. 完成加入课程学习功能，记录每个用户对课程学习所绑定的课程内容的学习进度；
9. 点登录/注销以后，客户端立即显示 loading 或其它方案，不允许重复点击；
10. 用户的全部课程内容列表页面；
11. 显示用户的某个课程内容页面；
12. 当前页面如果没有 session，重定向到首页进行登录；
13. 只把依赖 s3 docs 目录的文件放到 slug 目录下，并且加上一个 u/slug 前缀

查看课程页面：

wsl 下 localstack 无法保存数据；

1. md content 空内容显示不正常；
1. 在 md content 的前面增加一个 h1 标题，作为课程标题；
1. 查看页面 currentStep 逻辑不正确，永远都是显示第 1 个，应该显示当前选择的
   step；
1. 点击 unit_header 的 guidebook 跳转到该 unit 的全部 steps 的页面（路由
   ：src/app/[lang]/docs/[slug]/course/[courseId]/[unitIndex]/view）；
1. 点击 tile 跳转到该 tile 绑定的 4 个 steps 页面(路由同上，加 queryString 参数
   ：tileIndex=2)；
1. 在 duolingo 的界面显示上把 step 转成 tile，每个 tile 固定分配 4 个 step；
1. course 的 index.md 页面，把 1 级标题对应到 units，2 级标题对应到 steps；

1. 在 course 部分，集成 react-duolingo 项目；
1. course 列表页；
1. 解决 markdown 内容代码部分的#号被识别为标题的问题；
1. 解决 markdown 页面的 max-width 100% 问题；
1. 完成 nextra 集成，多语言支持，样式优化，风格切换；
1. ant design step 样式切换；
1. 完成文档类型 step-task；
1. 重写 replace markdown resource url with presigned url；
