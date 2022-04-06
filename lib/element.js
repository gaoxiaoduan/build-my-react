/**
const element = (
  <div id="container">
    <input value="foo" type="text" />
    <a href="/bar">bar</a>
    <span onClick={e => alert("Hi")}>click me</span>
  </div>
);

const element = createElement(
  "div",
  { id: "container" },
  createElement("input", { value: "foo", type: "text" }),
  createElement(
    "a",
    { href: "/bar" },
    "bar"
  ),
  createElement(
    "span",
    { onClick: e => alert("Hi") },
    "click me"
  )
);
 */
const TEXT_ELEMENT = "TEXT ELEMENT";
/**
 * 支持jsx的creacteElement函数
 * @param {*} type
 * @param {*} config
 * @param  {...any} args
 * @returns
 */

export function createElement(type, config, ...args) {
  const props = Object.assign({}, config);
  const hasChildren = args.length > 0;
  const rawChildren = hasChildren ? [].concat(...args) : [];
  props.children = rawChildren // 过滤null和false
  .filter(c => c !== null && c !== false).map(c => c instanceof Object ? c : createTextElement(c));
  return {
    type,
    props
  };
}

function createTextElement(value) {
  return createElement(TEXT_ELEMENT, {
    nodeValue: value
  });
}