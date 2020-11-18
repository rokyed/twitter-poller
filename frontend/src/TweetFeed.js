import React, { useEffect, useReducer } from "react";
import Tweet from "./Tweet";
import socketIOClient from "socket.io-client";
import ErrorMessage from "./ErrorMessage";
import Spinner from "./Spinner";

const reducer = (state, action) => {
  switch (action.type) {
    case "add_tweet":
      let arr = [action.payload, ...state.tweets]

      arr = arr.sort((a, b)=> {
        if (+a.id == +b.id)
          return 0;
        if (+a.id > +b.id)
          return -1;
        return 1;
      }).filter(function(item, pos, ary) {
        return !pos || item.id != ary[pos - 1].id;
      })

      return {
        ...state,
        tweets: arr,
        error: null,
        isWaiting: false,
        errors: [],
      };
    case "show_error":
      return { ...state, error: action.payload, isWaiting: false };
    case "add_errors":
      return { ...state, errors: action.payload, isWaiting: false };
    case "update_waiting":
      return { ...state, error: null, isWaiting: true };
    default:
      return state;
  }
};

const TweetFeed = (props) => {
  const initialState = {
    tweets: [],
    error: {},
    isWaiting: true,
    interval: null
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const { tweets, error, isWaiting } = state;

  const streamTweets = (query) => {
    let socket = socketIOClient("http://localhost:3001/");

    socket.on("connect", () => {
      socket.emit("data", query)
    });

    socket.on("tweet", (json) => {
      console.log(json);

      if (json.data) {
        for(let i = 0; i < json.data.length; i++)
          dispatch({ type: "add_tweet", payload: json.data[i] });
      }
    });
    socket.on("heartbeat", (data) => {
      dispatch({ type: "update_waiting" });
    });
    socket.on("error", (data) => {
      dispatch({ type: "show_error", payload: data });
    });
    socket.on("authError", (data) => {
      console.log("data =>", data);
      dispatch({ type: "add_errors", payload: [data] });
    });
  };

  const reconnectMessage = () => {
    const message = {
      title: "Reconnecting",
      detail: "Please wait while we reconnect to the stream.",
    };

    if (error && error.detail) {
      return (
        <div>
          <ErrorMessage key={error.title} error={error} styleType="warning" />
          <ErrorMessage
            key={message.title}
            error={message}
            styleType="success"
          />
          <Spinner />
        </div>
      );
    }
  };

  const errorMessage = () => {
    const { errors } = state;

    if (errors && errors.length > 0) {
      return errors.map((error) => (
        <ErrorMessage key={error.title} error={error} styleType="negative" />
      ));
    }
  };

  const waitingMessage = () => {
    const message = {
      title: "Still working",
      detail: "Waiting for new Tweets to be posted",
    };

    if (isWaiting) {
      return (
        <React.Fragment>
          <div>
            <ErrorMessage
              key={message.title}
              error={message}
              styleType="success"
            />
          </div>
          <Spinner />
        </React.Fragment>
      );
    }
  };

  useEffect(() => {
    streamTweets(props.query);
  }, [props.query]);

  const showTweets = () => {
    if (tweets.length > 0) {
      return (
        <React.Fragment>
          {tweets.map((tweet, index) => (
            <Tweet key={index} tweet={tweet} />
          ))}
        </React.Fragment>
      );
    }
  };

  return (
    <div>
      {reconnectMessage()}
      {errorMessage()}
      {waitingMessage()}
      {showTweets()}
    </div>
  );
};

export default TweetFeed;
