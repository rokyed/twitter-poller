import React from "react"
import socketIOClient from "socket.io-client"
import Spinner from "./Spinner"
import Tweet from "./Tweet"
import ErrorMessage from "./ErrorMessage"
import ERROR_MESSAGES from "./messages.js"

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      interval: null,
      tweets: [],
      error: null,
      isWaiting: true,
      socket: null
    }
  }

  render() {
    let loading = this.state.isWaiting ? <Spinner/> : null
    let error = this.state.error ? <ErrorMessage key={this.state.error.title} error={this.state.error} styleType="warning" /> : null

    return (<div>
      {loading}
      {error}
      {this.showTweets()}
    </div>)
  }

  showTweets() {
    let tweets = this.state.tweets
    if (tweets.length > 0) {
    return <React.Fragment>
        {tweets.map((tweet, index) => (
          <Tweet key={index} tweet={tweet} />
        ))}
      </React.Fragment>
    }
    return <ErrorMessage key={ERROR_MESSAGES.empty.title} error={ERROR_MESSAGES.empty} styleType="success" />
  }

  componentWillReceiveProps(nextProps) {
      if (nextProps.query != this.props.query) {
        this.setState({
          tweets: [],
          isWaiting: true,
          error: null
        })
        this.tick(nextProps.query)
      }
  }

  componentDidMount() {
    let socket = socketIOClient("http://localhost:3001/");

    socket.on("connect", () => {
      this.tick();
    });

    socket.on("tweet", (json) => {
      if (json.data) {
        this.setTweets(json.data, json.query)
      }
    })
    socket.on("disconnected", () => {
      this.disconnected()
    })
    socket.on("heartbeat", (data) => {
      //dispatch({ type: "update_waiting" });
    })
    socket.on("error", (data) => {
      //dispatch({ type: "show_error", payload: data });
    })
    socket.on("authError", (data) => {
      console.log("data =>", data);
      //dispatch({ type: "add_errors", payload: [data] });
    })

    this.setState({
      socket,
      interval: setInterval(this.tick.bind(this), 10000)
    })
  }

  componentWillUnmount() {
    clearInterval(this.state.interval)
    this.setState({
      interval: null,
      socket: null
    })
  }

  disconnected() {
    clearInterval(this.state.interval)
    this.setState({
      interval: null,
      socket: null
    })
  }

  tick(overrideQuery) {
    if (this.state.socket) {
      this.state.socket.emit("data", overrideQuery || this.props.query)
    }
  }

  setWaiting(value) {
    this.setWaiting({
      isWaiting: value
    })
  }

  setError(error) {
    this.setState({
      error
    })
  }

  setTweets(tweets, query) {
    let arr = [...tweets, ...this.state.tweets]

    arr = arr.sort((a, b)=> {
      if (+a.id == +b.id)
        return 0;
      if (+a.id > +b.id)
        return -1;
      return 1;
    }).filter(function(item, pos, ary) {
      return !pos || item.id != ary[pos - 1].id;
    })

    this.setState({
      tweets: arr,
      error: null,
      isWaiting: false
    })
  }
}

export default App;
