import React from "react";

import TweetFeed from "./Feed";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 'from:realDonaldTrump'
    };
    this.onButtonClick = this.onButtonClick.bind(this);
  }
  onButtonClick(value) {
    this.setState({
      show: value
    })
  }
  render() {
    return (
      <div className="ui container">
        <div className="introduction"></div>
        <h1 className="ui header">
          <div className="content">
            Currently in query: {this.state.show}
          </div>
          <div className="ui container">
            <div className="ui button" onClick={()=>{this.onButtonClick('from:realDonaldTrump')}}>
            Trump
            </div>
            <div className="ui button" onClick={()=>{this.onButtonClick('from:HillaryClinton')}}>
            Hillary
            </div>
          </div>
        </h1>
        <div className="ui container">
          <TweetFeed query={this.state.show} />
        </div>
      </div>
    );
  }
}

export default App;
