var React = require('react');

var bus = require('../../data');
var FileTreeStore = require('../../data/file-tree');

var Node = require('./node');

module.exports = React.createClass({
  displayName: "FileTree",

  mixins: [
    require('../../helpers/mixins/events'),
    require('../../helpers/mixins/keys')
  ],

  getInitialState() {
    return {tree: FileTreeStore.get()};
  },

  componentWillMount() {
    this.setState({loading: true});
    bus.dispatch({type: 'FILE_TREE_FETCH'});
  },

  events: {
    FILE_TREE_UPDATED() {
      var data = this.getInitialState();
      data.loading = false;
      this.setState(data);
    },
    FILE_TREE_FAILURE(err) {
      console.error("FILE_TREE_FAILURE", err.stack);
      this.setState({failure: err});
    }
  },

  render() {
    var k = this.getKeyHelper();
    var s = this.state;

    var tree = s.tree || {};

    return (
      <nav className="container">
        {s.loading &&
          <p {...k('loading')}>Loading...</p>
        }
        {s.failure &&
          <pre {...k('failure')}>{s.failure}</pre>
        }
        {(tree.children && tree.children.length) ?
          <ul {...k('list')}>
            {tree.children.map((entry) => {
              return <Node key={entry.name} node={entry} />;
            })}
          </ul>
          : null
        }
      </nav>
    );
  }
});
