import { scheduleUpdate } from "./fiber.js"; // import { reconcile } from "./render.js";

export class Component {
  constructor(props) {
    this.props = props || {};
    this.state = this.state || {};
  }

  setState(partialState) {
    // 加入调度器
    scheduleUpdate(this, partialState); // this.state = Object.assign({}, this.state, partialState);
    // updateInstance(this.__internalInstance);
  }

}
export function createInstance(fiber) {
  const instance = new fiber.type(fiber.props);
  instance.__fiber = fiber;
  return instance;
}
/**
 * 创建公共实例
 * @param {*} element 元素
 * @param {*} interalInstance 部分实例
 * @returns
 */

export function createPublicInstance(element, interalInstance) {
  const {
    type,
    props
  } = element; // eg: publicInstance = new Component(props)

  const publicInstance = new type(props);
  publicInstance.__internalInstance = interalInstance;
  return publicInstance;
} // /**
//  * 更新实例
//  * @param {*} interalInstance
//  */
// function updateInstance(interalInstance) {
//   const parentDom = interalInstance.dom.parentNode;
//   const element = interalInstance.element;
//   // 复用dom节点
//   reconcile(parentDom, interalInstance, element);
// }