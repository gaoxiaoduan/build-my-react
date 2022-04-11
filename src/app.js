/** @jsx react.createElement */
import react from "./lib/index.js";

const randomLikes = () => Math.ceil(Math.random() * 100);

const stories = [
  {
    name: "Didact introduction",
    url: "http://bit.ly/2pX7HNn",
    likes: randomLikes(),
  },
  {
    name: "Rendering DOM elements ",
    url: "http://bit.ly/2qCOejH",
    likes: randomLikes(),
  },
  {
    name: "Element creation and JSX",
    url: "http://bit.ly/2qGbw8S",
    likes: randomLikes(),
  },
  {
    name: "Instances and reconciliation",
    url: "http://bit.ly/2q4A746",
    likes: randomLikes(),
  },
  {
    name: "Components and state",
    url: "http://bit.ly/2rE16nh",
    likes: randomLikes(),
  },
];

// const appElement = () => (
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

// ---------------支持组件和状态-------------------
// 解决的问题：
// 1.每次点击只会影响需要变化的元素
// 2.增加组件后，在每次调用setState时，会自动render
// 3.封装组件状态
class App extends react.Component {
  render() {
    return (
      <div>
        <h1>hello my react</h1>
        <ul>
          {this.props.stories.map((story) => {
            return <Story name={story.name} url={story.url} />;
          })}
        </ul>
      </div>
    );
  }
}

class Story extends react.Component {
  constructor(props) {
    super(props);
    this.state = {
      likes: Math.ceil(Math.random() * 100),
    };
  }

  like() {
    this.setState({
      likes: this.state.likes + 1,
    });
  }

  render() {
    const { name } = this.props;
    const { likes } = this.state;
    return (
      <li>
        <button onClick={(e) => this.like()}>
          {likes}
          <b>❤️</b>
        </button>
        <a
        // href={url}
        >
          {name}
        </a>
      </li>
    );
  }
}

react.render(<App stories={stories} />, document.getElementById("root"));
