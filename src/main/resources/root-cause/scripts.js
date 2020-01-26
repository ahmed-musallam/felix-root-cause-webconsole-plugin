$(function () {

  var componentsDeferred = $.getJSON("/system/console/components.json")
  .done(function (resp) {
    window.components = resp.data;
  }).fail(function (err) {
    console.error("Could not get components" , err)
  })

  $.widget("custom.rootcause", {
    // default options
    options: {
      rootCause: [],
      // Callbacks
      getRootCause: null
    },

    // The constructor
    _create: function () {
      this.path = this.element.data("path");
      this.findButton = this.element.find(".root-cause-form__find-button");
      this.componentName = this.element.find(".root-cause-form__component-name")
      this.result = this.element.find(".root-cause__result");
      this.loading = this.element.find(".root-cause__loading");
      var that = this;

      componentsDeferred.done(function (resp) {
        var names = resp.data.map(function (item) {
          return item.name;
        })
        that.componentName.autocomplete({
          source: names,
          minLength: 3
        });
      })
      // Bind click events on the changer button to the random method
      this._on(this.findButton, {
        // _on won't call random when widget is disabled
        click: "getRootCause"
      });
      this._refresh();
    },

    // Called when created, and later when changing options
    _refresh: function () {
      var that = this;
      this.result.empty();
      this.options.rootCause
      .filter(Boolean)
      .forEach(function(line) {
        that.result.append($("<span>" + line.replace(/ /g, "&nbsp;&nbsp;") +"</span></br>"));
      })

      // Trigger a callback/event
      this._trigger("change");
    },
    getRootCause: function (event) {
      var that = this;
      this.result.empty();
      this.loading.show();
      $.getJSON(this.path + "?name=" + this.componentName.val())
      .always(function (result) {
        that._setOption("rootCause", result);
        that.loading.hide();
      })
    },

    // _setOptions is called with a hash of all options that are changing
    // always refresh when changing options
    _setOptions: function () {
      // _super and _superApply handle keeping the right this-context
      this._superApply(arguments);
      this._refresh();
    },

    // _setOption is called for each individual option that is changing
    _setOption: function (key, value) {
      // prevent invalid option
      if (key !== "rootCause") {
        return;
      }
      this._super(key, value);
      this._refresh();
    }
  });
  $(".root-cause").rootcause();
});
