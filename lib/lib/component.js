import { reconcile } from "./render.js";
export class Component {
  constructor(props) {
    this.props = props;
    this.state = this.state || {};
  }

  setState(partialState) {
    this.state = Object.assign({}, this.state, partialState);
    updateInstance(this.__internalInstance);
  }

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
}
/**
 * 更新实例
 * @param {*} interalInstance
 */

function updateInstance(interalInstance) {
  const parentDom = interalInstance.dom.parentNode;
  const element = interalInstance.element; // 复用dom节点

  reconcile(parentDom, interalInstance, element);
}