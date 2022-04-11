// fiber实例
// let fiber = {
//     tag: HOST_COMPONENT,
//     type: "div",
//     parent: parentFiber,
//     child: childFiber,
//     sibling: null,
//     alternate: currentFiber,
//     stateNode: document.createElement("div"),
//     props: { children: [], className: "foo" },
//     partialState: null,
//     effectTag: PLACEMENT,
//     effects: [],
//   };
import { createDomElement, updateDomProperties } from "./dom-utils.js";
import { createInstance } from "./component.js"; // fiber tag

const HOST_COMPONENT = "host"; // stateNode

const CLASS_COMPONENT = "class"; // 类组件

const HOST_ROOT = "root"; // 宿主根

const ENOUGH_TIME = 1; // ms 检查是否足以运行下一个工作单元
// 全局状态

const updateQueue = [];
let nextUnitOfWork = null;
let pendingCommit = null; // Effect tags

const PLACEMENT = 1;
const DELETION = 2;
const UPDATE = 3;

function arrify(val) {
  return val === null ? [] : Array.isArray(val) ? val : [val];
}

export function render(elements, containerDom) {
  updateQueue.push({
    from: HOST_ROOT,
    dom: containerDom,
    newProps: {
      children: elements
    }
  });
  requestIdleCallback(performWork);
}
export function scheduleUpdate(instance, partialState) {
  updateQueue.push({
    form: CLASS_COMPONENT,
    instance: instance,
    partialState: partialState
  });
  requestIdleCallback(performWork);
}

function performWork(deadline) {
  workLoop(deadline);

  if (nextUnitOfWork || updateQueue.length > 0) {
    requestIdleCallback(performWork);
  }
}

function workLoop(deadline) {
  if (!nextUnitOfWork) {
    // 重置一个工作单元
    resetNextUnitOfWork();
  }

  while (nextUnitOfWork && deadline.timeRemaining() > ENOUGH_TIME) {
    // 找出我们需要对dom进行那些修改
    // 如果完成当前更新的所有工作，返回null，并将待处理的更改存进pendingCommit中
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  if (pendingCommit) {
    // 最后使用commitAllWork从pendingCommit中获取effects，并对dom进行更改
    // 为了避免ui不一致，这里应该一次性更新所有dom
    commitAllWork(pendingCommit);
  }
}

function resetNextUnitOfWork() {
  // 取出一个更新任务
  const update = updateQueue.shift();

  if (!update) {
    return;
  } // 如果更新任务时，有partialState，则将它赋值给fiber的partialState


  if (update.partialState) {
    update.instance.__fiber.partialState = update.partialState;
  } // 找到旧的根节点
  // 如果更新来自第一次render(),这个时候没有root fiber,所以root会是null
  // 如果render来自后续的调用，我们可以在dom上找到root fiber
  // 如果更新来自setState(),我们需要从实例fiber出发，一直向上找到root fiber


  const root = update.from === HOST_ROOT ? update.dom._rootComtainerFiber : getRoot(update.instance.__fiber); // 工作进行树的根

  nextUnitOfWork = {
    tag: HOST_ROOT,
    stateNode: update.dom || root.stateNode,
    props: update.newProps || root.props,
    alternate: root
  };
}

function getRoot(fiber) {
  let node = fiber;

  while (node.parent) {
    node = node.parent;
  }

  return node;
} // 处理工作中的fiber


function performUnitOfWork(wipFiber) {
  // 任务开始
  beginWork(wipFiber);

  if (wipFiber.child) {
    return wipFiber.child;
  } // 如果没有child，就执行completeWork，直到 找到兄弟节点


  let uow = wipFiber;

  while (uow) {
    completeWork(uow);

    if (uow.sibling) {
      return uow.sibling;
    }

    uow = uow.parent;
  }
}
/**
 * beginWork做两件事
 * - stateNode如果没有就创建一个
 * - 获取子组件，并将他们传给reconcileChildrenArray()
 * @param {*} wipFiber
 */


function beginWork(wipFiber) {
  if (wipFiber.tag === CLASS_COMPONENT) {
    updateClassComponent(wipFiber);
  } else {
    updateHostComponent(wipFiber);
  }
} // 更新host组件


function updateHostComponent(wipFiber) {
  if (!wipFiber.stateNode) {
    wipFiber.stateNode = createDomElement(wipFiber);
  }

  const newChildElements = wipFiber.props.children;
  reconcileChildrenArray(wipFiber, newChildElements);
} // 更新class组件


function updateClassComponent(wipFiber) {
  let instance = wipFiber.stateNode;

  if (!instance) {
    instance = wipFiber.stateNode = createInstance(wipFiber);
  } else if (wipFiber.props === instance.props && !wipFiber.partialState) {
    // 如果props没有变化，并且没有partialState，那么就不需要更新，相当于一个简版的shouldComponentUpdate
    cloneChildFibers(wipFiber);
    return;
  }

  instance.props = wipFiber.props; // 更新props

  instance.state = Object.assign({}, instance.state, wipFiber.partialState); // 更新state

  wipFiber.partialState = null; // 将partialState置空

  const newChildElements = wipFiber.stateNode.render(); // 获取子组件

  reconcileChildrenArray(wipFiber, newChildElements);
}
/**
 * 调和子组件fiber
 * @param {*} wipFiber
 * @param {*} newChildElements
 */


function reconcileChildrenArray(wipFiber, newChildElements) {
  const elements = arrify(newChildElements);
  let index = 0;
  let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null;
  let newFiber = null;

  while (index < elements.length || oldFiber != null) {
    const prevFiber = newFiber;
    const element = index < elements.length && elements[index];
    const sameType = oldFiber && element && element.type === oldFiber.type;

    if (sameType) {
      // oldFiber 与element类型相同，表示可以服用，打上update的tag
      newFiber = {
        type: oldFiber.type,
        tag: oldFiber.tag,
        stateNode: oldFiber.stateNode,
        props: element.props,
        parent: wipFiber,
        alternate: oldFiber,
        partialState: oldFiber.partialState,
        effectTag: UPDATE
      };
    }

    if (element && !sameType) {
      // 有新元素，且类型与oldFiber不相同
      // 表示我们有更多新元素，打上PLACEMENT的tag
      newFiber = {
        type: element.type,
        tag: typeof element.type === "string" ? HOST_COMPONENT : CLASS_COMPONENT,
        props: element.props,
        parent: wipFiber,
        effectTag: PLACEMENT
      };
    }

    if (oldFiber && !sameType) {
      // 如果oldFiber 与element类型不同
      // 表示我们有更多老元素，打上DELETION的tag
      oldFiber.effectTag = DELETION;
      wipFiber.effects = wipFiber.effects || [];
      oldFiber.effects.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (prevFiber && element) {
      prevFiber.sibling = newFiber;
    }

    index++;
  }
}
/**
 * 克隆子组件fiber
 * @param {*} parentFiber
 * @returns
 */


function cloneChildFibers(parentFiber) {
  const oldFiber = parentFiber.alternate;

  if (!oldFiber.child) {
    return;
  }

  let oldChild = oldFiber.child;
  let prevChild = null;

  while (oldChild) {
    const newChild = {
      type: oldChild.type,
      tag: oldChild.tag,
      stateNode: oldChild.stateNode,
      props: oldChild.props,
      partialState: oldChild.partialState,
      alternate: oldChild,
      parent: parentFiber
    };

    if (prevChild) {
      prevChild.sibling = newChild;
    } else {
      parentFiber.child = newChild;
    }

    prevChild = newChild;
    oldChild = oldChild.sibling;
  }
}

function completeWork(fiber) {
  if (fiber.tag === CLASS_COMPONENT) {
    fiber.stateNode.__fiber = fiber;
  }

  if (fiber.parent) {
    const childEffects = fiber.effects || [];
    const thisEffect = fiber.effectTag !== null ? [fiber] : [];
    const parentEffects = fiber.parent.effects || [];
    fiber.parent.effects = parentEffects.concat(childEffects, thisEffect);
  } else {
    pendingCommit = fiber;
  }
}

function commitAllWork(fiber) {
  fiber.effects.forEach(f => {
    commitWork(f);
  });
  fiber.stateNode.__rootContainerFiber = fiber;
  nextUnitOfWork = null;
  pendingCommit = null;
}

function commitWork(fiber) {
  if (fiber.tag === HOST_ROOT) {
    return;
  }

  let domParentFiber = fiber.parent;

  while (domParentFiber.tag === CLASS_COMPONENT) {
    domParentFiber = domParentFiber.parent;
  }

  const domParent = domParentFiber.stateNode;

  if (fiber.effectTag === PLACEMENT && fiber.tag === HOST_COMPONENT) {
    domParent.appendChild(fiber.stateNode);
  } else if (fiber.effectTag === UPDATE) {
    updateDomProperties(fiber.stateNode, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === DELETION) {
    commitDeletion(fiber, domParent);
  }
}

function commitDeletion(fiber, domParent) {
  let node = fiber;

  while (true) {
    if (node.tag === CLASS_COMPONENT) {
      node = node.child;
      continue;
    }

    domParent.removeChild(node.stateNode);

    while (node != fiber && !node.sibling) {
      node = node.parent;
    }

    if (node === fiber) {
      return;
    }

    node = node.sibling;
  }
}