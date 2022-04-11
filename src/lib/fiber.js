let fiber = {
  tag: HOST_COMPONENT,
  type: "div",
  parent: parentFiber,
  child: childFiber,
  sibling: null,
  alternate: currentFiber,
  stateNode: document.createElement("div"),
  props: { children: [], className: "foo" },
  partialState: null,
  effectTag: PLACEMENT,
  effects: [],
};
