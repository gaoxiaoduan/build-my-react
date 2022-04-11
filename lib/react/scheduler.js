/**
 * scheduler实例
 */
const ENOUGH_TIME = 1; // ms

let workQueue = [];
let nextUnitOfWork = null; // 调度器

function schedule(task) {
  workQueue.push(stak);
  requestIdleCallback(performWork);
}
/**
 * 开始工作
 * @param {*} deadline
 */


function performWork(deadline) {
  if (!nextUnitOfWork) {
    // 取出一个任务
    nextUnitOfWork = workQueue.shift();
  } // 浏览器渲染一帧后还有剩余时间，执行下一个任务


  while (nextUnitOfWork && deadline.timeRemaining() > ENOUGH_TIME) {
    // TODO:真正的工作发生在performUnitOfWork函数内
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  } // 执行队列中的剩余任务


  if (nextUnitOfWork || workQueue.length > 0) {
    requestIdleCallback(performWork);
  }
}