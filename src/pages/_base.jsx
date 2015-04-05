var React = require('react');
var {RouteHandler} = require('react-router');

var FileTree = require('../components/file-tree');

if (process.env.BROWSER) { require('./base_layout.less'); }

module.exports = React.createClass({
  displayName: "BasePage",

  render() {
    return (
      <div className="BasePage-container container">
        <aside key="aside">
          <FileTree/>
        </aside>
        <main key="main">
          <RouteHandler key="content" appState={this.props.data} />
        </main>
      </div>
    );
  }
});
