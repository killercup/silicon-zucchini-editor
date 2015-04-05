var React = require('react/addons');

var API = require('../data/api');

var JsonEditor;
if (process.env.BROWSER) {
  JsonEditor = require('json-editor') && window.JSONEditor;
}

module.exports = React.createClass({
  displayName: "EditFilePage",
  pageTitle: "Edit file",

  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [
    require('../helpers/mixins/events'),
    require('../helpers/mixins/keys'),
    require('../helpers/mixins/page_title')
  ],

  getInitialState() {
    return {file: null};
  },

  shouldComponentUpdate() {
    return true;
  },

  fetchSchemas() {
    API.request({url: '/schemas'})
    .then(res => this.setState({schemas: res.body.schemas}))
    .catch(err => this.setState({failure: err}))
    .catch(err => console.error(err.stack));
  },

  fetchFile() {
    this.fileName = this.context.router.getCurrentParams().splat;
    this.setPageTitle("Edit `" + this.fileName + "`");

    this.setState({loading: true});

    API.request({url: '/files/' + this.fileName})
    .then(res => this.setState({loading: false, file: res.body.file}))
    .catch(err => this.setState({loading: false, failure: err}));
  },

  componentWillMount() {
    this.fetchSchemas();
    this.fetchFile();
  },

  componentWillReceiveProps() {
    if (this.fileName !== this.context.router.getCurrentParams().splat) {
      this.fetchFile();
    }
  },

  makeEditor() {
    if (!this.state.file || !this.state.schemas) {
      return;
    }
    if (this.editor) {
      this.editor.destroy();
    }

    var editor = React.findDOMNode(this.refs.editor);
    this.editor = new JsonEditor(editor, {
      schema: this.state.schemas[1],
      startval: this.state.file.content,
      refs: this.state.schemas,
      theme: 'bootstrap3',
      disable_collapse: true,
      disable_edit_json: true
    });
  },

  componentDidMount() {
    this.makeEditor();
  },
  componentDidUpdate() {
    this.makeEditor();
  },

  render() {
    var k = this.getKeyHelper();
    var s = this.state;

    return (
      <article>
        {s.loading &&
          <p {...k('loading')}>Loading file...</p>
        }
        {s.failure &&
          <pre {...k('failure')}>{s.failure}</pre>
        }
        {s.file &&
          <h1 {...k('name')}>{s.file.path}</h1>
        }
        {s.file && s.schemas &&
          <div ref="editor"/>
        }
      </article>
    );
  }
});
