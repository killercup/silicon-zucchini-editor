var React = require('react');
var {Link} = require('react-router');

var FileTreeNode;
FileTreeNode = React.createClass({
  displayName: "FileTreeNode",

  mixins: [
    require('../../helpers/mixins/keys')
  ],

  render() {
    var k = this.getKeyHelper();
    var node = this.props.node;

    return (
      <li {...k()}>
        {node.isFile &&
          <Link {...k('name')} to="edit-file" params={{splat: node.relative}}>
            {node.name}
          </Link>
        }
        {node.isDirectory &&
          <span {...k('name')}>{node.name}</span>
        }
        {(node.children && node.children.length) ?
          <ul {...k('list')}>
            {node.children.map((entry) => {
              return <FileTreeNode key={entry.name} node={entry} />;
            })}
          </ul>
          : null
        }
      </li>
    );
  }
});

module.exports = FileTreeNode;
