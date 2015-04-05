var baseName = "Silicon Zucchini";

module.exports = {
  setPageTitle: function () {
    if (!process.env.BROWSER) { return; }
    if (this.pageTitle) {
      document.title = this.pageTitle + " | " + baseName;
    } else {
      document.title = baseName;
    }
  },

  componentWillMount: function () {
    this.setPageTitle();
  },

  changePageTitle: function (title) {
    this.pageTitle = title;
    this.setPageTitle();
  }
};
