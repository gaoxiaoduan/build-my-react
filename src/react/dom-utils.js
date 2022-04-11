import { TEXT_ELEMENT } from "./element.js";
/**
 * 更新dom上的属性和事件
 * @param {*} dom
 * @param {*} prevProps
 * @param {*} nextProps
 */
export function updateDomProperties(dom, prevProps, nextProps) {
  const isEvent = (name) => name.startsWith("on");
  const isAttribute = (name) => !isEvent(name) && name !== "children";

  // 移除旧事件和属性
  Object.keys(prevProps)
    .filter(isEvent)
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  Object.keys(prevProps)
    .filter(isAttribute)
    .forEach((name) => (dom[name] = null));

  // 添加新事件和属性
  Object.keys(nextProps)
    .filter(isEvent)
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });

  Object.keys(nextProps)
    .filter(isAttribute)
    .forEach((name) => (dom[name] = nextProps[name]));
}

/**
 * 创建dom元素
 * @param {*} fiber
 * @returns dom
 */
export function createDomElement(fiber) {
  const isTextElement = fiber.type === TEXT_ELEMENT;
  const dom = isTextElement
    ? document.createTextNode("")
    : document.createElement(fiber.type);

  updateDomProperties(dom, [], fiber.props);
  return dom;
}
