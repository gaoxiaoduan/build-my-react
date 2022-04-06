import { updateDomProperties } from "./dom-utils.js";

let rootInstance = null;

export function render(element, container) {
  const prevInstance = rootInstance;
  const nextInstance = reconcile(container, prevInstance, element);
  rootInstance = nextInstance;
}

// 尽可能多的重用dom节点
function reconcile(parentDom, instance, element) {
  // 当上一个实例为null，说明还未挂载
  if (instance === null) {
    // 挂载
    const newInstance = instantiate(element);
    parentDom.appendChild(newInstance.dom);
    return newInstance;
  } else if (element === null) {
    // 若新元素为null，则移除
    parentDom.removeChild(instance.dom);
    return null;
  } else if (instance.element.type === element.type) {
    // 如果类型相同，复用之前渲染的元素，更新属性和方法
    updateDomProperties(instance.dom, instance.element.props, element.props);
    instance.childInstances = reconcileChildren(instance, element);
    instance.element = element;
    return instance;
  } else {
    // 替换
    const newInstance = instantiate(element);
    parentDom.replaceChild(newInstance.dom, instance.dom);
    return newInstance;
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

function instantiate(element) {
  const { type, props } = element;

  // 创建dom节点
  const isTextElement = type === "TEXT ELEMENT";
  const dom = isTextElement
    ? document.createTextNode("")
    : document.createElement(type);

  updateDomProperties(dom, [], props);

  // 渲染child
  const childElements = props.children || [];
  const childInstances = childElements.map(instantiate);
  const childDoms = childInstances.map((childInstances) => childInstances.dom);
  childDoms.forEach((childDom) => dom.appendChild(childDom));

  const instance = { dom, element, childInstances };
  return instance;
}
