# 构建一个自己的react

> 本仓库用与实践 [didact](https://github.com/pomber/didact)，构建一个你自己的简版react

## 目标实现

- [x] 渲染dom元素
- [x] 创建element & JSX
- [x] 虚拟dom & diff
- [x] components & state
- [x] Fiber

## 启动项目🚀

- clone本项目 `git clone https://github.com/gaoxiaoduan/build-my-react.git`
- 进入项目 目录 `cd build-my-react`
- 编译项目 `npm run build`  ⚠️项目暂未使用热更新，每次修改代码后需要重新build : ( 
- 可以使用[http-server](https://www.npmjs.com/package/http-server) 或者 使用vscode插件 [live-server](https://github.com/ritwickdey/vscode-live-server)运行index.html

## 关于Fiber

因为React 16带来了一个新的架构Fiber，所以需要重构大部分的代码，本项目根据[此文章](https://engineering.hexacta.com/didact-fiber-incremental-reconciliation-b2fe028dcaec)重构

### 为什么需要Fiber？

因为当浏览器的主线程被一些任务占用了较长的时间，那么会有一些关键的简短任务必须要等待长任务执行完毕才能完成。

> 这里有一个小[demo](https://pomber.github.io/incremental-rendering-demo/react-sync.html)，用于演示这个问题，为了保持行星旋转，主线程需要每 16 毫秒左右有一个瞬间可用。如果主线程被阻塞做其他事情，比如说 200 毫秒，你会注意到动画丢失帧并且行星冻结，直到主线程再次空闲

那么在我们构建的react中，是什么会占用主线程那么长的时间呢？

问题就出现在`reconcile()`的过程中，因为它依靠递归调用，所以很难让它暂停，所以一旦开始调和的过程，其他任务只能等主线程调和任务结束，这就是为什么使用Fiber来重写它，Fiber允许我们循环替换递归，达到`异步可中断更新`的目的

> `异步可中断更新`可以理解为：`更新`在执行过程中可能会被打断（浏览器时间分片用尽或有更高优任务插队），当可以继续执行时恢复之前执行的中间状态。有点类似Generator

于是全新的Fiber架构应运而生

![fiber.js](https://coderduan-image.oss-cn-hangzhou.aliyuncs.com/img/202204121440038.png)



TODO:

- 这里我们实现了`异步可中断更新`，还缺少根据优先级安排更新
