import { updateDomProperties } from "./dom-utils.js";
import { TEXT_ELEMENT } from "./element.js";
import { createPublicInstance } from "./component.js";

let rootInstance = null;

export function render(element, container) {
  const prevInstance = rootInstance;
  const nextInstance = reconcile(container, prevInstance, element);
  rootInstance = nextInstance;
}

/**
 * 尽可能多的重用dom节点
 * @param {*} parentDom
 * @param {*} instance
 * @param {*} element
 * @returns
 */
export function reconcile(parentDom, instance, element) {
  // 当上一个实例为null，说明还未挂载
  if (instance === null) {
    // 挂载 实例
    const newInstance = instantiate(element);
    parentDom.appendChild(newInstance.dom);
    return null;
  } else if (element === null) {
    // 若新元素为null，则移除实例
    parentDom.removeChild(instance.dom);
    return null;
  } else if (instance.element.type !== element.type) {
    // 若类型不同，则直接替换实例
    const newInstance = instantiate(element);
    parentDom.replaceChild(newInstance.dom, instance.dom);
    return newInstance;
  } else if (typeof element.type === "string") {
    // 如果类型相同，复用之前渲染的元素，更新属性和方法
    updateDomProperties(instance.dom, instance.element.props, element.props);
    instance.childInstances = reconcileChildren(instance, element);
    instance.element = element;
    return instance;
  } else {
    // 更新 组件实例
    instance.publicInstance.props = element.props;
    const childElement = instance.publicInstance.render();
    const oldChildInstance = instance.childInstance;
    // 组件实例reconcile
    const childInstance = reconcile(parentDom, oldChildInstance, childElement);

    instance.dom = childInstance.dom;
    instance.childInstance = childInstance;
    instance.element = element;
    return instance;
  }
}

/**
 * 比较子元素
 * 简单实现:只比较 children 数组中相同位置的孩子
 * 代价: dom改变子数组的顺序时，将不能复用子元素
 * @param {*} instance
 * @param {*} element
 */
function reconcileChildren(instance, element) {
  const dom = instance.dom;
  const childInstances = instance.childInstances;
  const nextChildElements = element.props.children || [];
  const newChildInstances = [];

  const count = Math.max(childInstances.length, nextChildElements.length);

  for (let i = 0; i < count; i++) {
    const childInstance = childInstances[i];
    const childElement = nextChildElements[i];
    const newChildInstance = reconcile(dom, childInstance, childElement);
    newChildInstances.push(newChildInstance);
  }
  return newChildInstances.filter((instance) => instance !== null);
}

/**
 * 实例化组件 & 创建dom元素
 * @param {*} element
 * @returns
 */
function instantiate(element) {
  const { type, props } = element;
  const isDomElement = typeof type === "string";

  if (isDomElement) {
    // 创建dom节点
    const isTextElement = type === TEXT_ELEMENT;
    const dom = isTextElement
      ? document.createTextNode("")
      : document.createElement(type);

    updateDomProperties(dom, [], props);

    // 渲染child
    const childElements = props.children || [];
    const childInstances = childElements.map(instantiate);
    const childDoms = childInstances.map(
      (childInstances) => childInstances.dom
    );
    childDoms.forEach((childDom) => dom.appendChild(childDom));

    const instance = { dom, element, childInstances };
    return instance;
  } else {
    // 创建组件实例
    const instance = {};
    const publicInstance = createPublicInstance(element, instance); // 创建组件实例
    const childElement = publicInstance.render(); // 获取jsx
    const childInstance = instantiate(childElement); // 创建dom
    const dom = childInstance.dom;

    Object.assign(instance, { dom, element, childInstance, publicInstance });
    return instance;
  }
}
