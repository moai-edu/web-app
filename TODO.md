# TODO

wsl 下 localstack 无法保存数据；

查看课程页面：

学习课程页面：

1. 参考 duolingo 的课程（主要考虑英文与技术的双向学习），结合上课的实际情况（截图上传可能更可行？），设计每个 step 的练
   习题的类型，并在学习时显示；
1. 按确定的规则，在学习时，固定往课程 tile 之间插入其它 tile（比如：treasure tile），以增加趣味性（playful learning 以及
   游戏成瘾机制研究）；
1. 每个 tile 的状态对应于 step 的进度（在查看课程的页面中，step 进度永远为 0），点击 tile 跳转到对应的 stepIndex=0 页面
   ；
1. sst dev 本地开发部署问题；
1. 完成课程内容中每个 step 对应的任务（课前键盘打字练习、中英文配对测验；课后屏幕截图上传；测验、作业、考试、练习、其它
   ……以后补充）
1. 完成课程内容列表功能（分为 docs/slug/course 路径下的我的课程 s，和 docs/public/course 路径下的共享课程），点击课程进
   入查看课程内容页面；
1. 完成创建课程学习功能，给课程学习绑定课程内容；
1. 完成加入课程学习功能，记录每个用户对课程学习所绑定的课程内容的学习进度；
1. 点登录/注销以后，客户端立即显示 loading 或其它方案，不允许重复点击；
1. 用户的全部课程内容列表页面；
1. 显示用户的某个课程内容页面；
1. 当前页面如果没有 session，重定向到首页进行登录；

## DONE

查看课程页面：

1. md content 空内容显示不正常；
1. 在 md content 的前面增加一个 h1 标题，作为课程标题；
1. 查看页面 currentStep 逻辑不正确，永远都是显示第 1 个，应该显示当前选择的 step；
1. 点击 unit_header 的 guidebook 跳转到该 unit 的全部 steps 的页面（路由
   ：src/app/[lang]/docs/[slug]/course/[courseId]/[unitIndex]/view）；
1. 点击 tile 跳转到该 tile 绑定的 4 个 steps 页面(路由同上，加 queryString 参数：tileIndex=2)；
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
