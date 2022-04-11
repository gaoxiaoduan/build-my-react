/** @jsx react.createElement */
import react from "./lib/index.js";

const randomLikes = () => Math.ceil(Math.random() * 100);

const stories = [{
  name: "Didact introduction",
  url: "http://bit.ly/2pX7HNn",
  likes: randomLikes()
}, {
  name: "Rendering DOM elements ",
  url: "http://bit.ly/2qCOejH",
  likes: randomLikes()
}, {
  name: "Element creation and JSX",
  url: "http://bit.ly/2qGbw8S",
  likes: randomLikes()
}, {
  name: "Instances and reconciliation",
  url: "http://bit.ly/2q4A746",
  likes: randomLikes()
}, {
  name: "Components and state",
  url: "http://bit.ly/2rE16nh",
  likes: randomLikes()
}]; // const appElement = () => (
//   <div>
//     <ul>{stories.map(storyElement)}</ul>
//   </div>
// );
// function storyElement(story) {
//   return (
//     <li>
//       <button onClick={(e) => handleClick(story)}>
//         {story.likes}
//         <b>❤️</b>
//       </button>
//       <a
//       // href={story.url}
//       >
//         {story.name}
//       </a>
//     </li>
//   );
// }
// function handleClick(story) {
//   story.likes += 1;
//   // 缺点：
//   // 每次点击都会完整的更新DOM
//   // 需要显示的调用render函数
//   // 状态是全局的
//   react.render(appElement(), document.getElementById("root"));
// }
// react.render(appElement(), document.getElementById("root"));
// 支持组件和状态

class App extends react.Component {
  render() {
    return react.createElement("div", null, react.createElement("h1", null, " Stories"), react.createElement("ul", null, this.props.stories.map(story => {
      return react.createElement(Story, {
        name: story.name,
        url: story.url
      });
    })));
  }

}

class Story extends react.Component {
  constructor(props) {
    super(props);
    this.state = {
      likes: Math.ceil(Math.random() * 100)
    };
  }

  like() {
    this.setState({
      likes: this.state.likes + 1
    });
  }

  render() {
    const {
      name,
      url
    } = this.props;
    const {
      likes
    } = this.state;
    return react.createElement("li", null, react.createElement("button", {
      onClick: e => this.like()
    }, likes, react.createElement("b", null, "\u2764\uFE0F")), react.createElement("a", null, name));
  }

}

react.render(react.createElement(App, {
  stories: stories
}), document.getElementById("root"));