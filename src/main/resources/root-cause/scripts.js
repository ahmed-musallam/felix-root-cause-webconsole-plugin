$(function () {

  var componentsDeferred = $.getJSON("/system/console/components.json")
    .done(function (resp) {
      window.components = resp.data;
    }).fail(function (err) {
      console.error("Could not get components", err);
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
      this.componentName = this.element.find(".root-cause-form__component-name");
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

      if (location.hash) {
        this.getRootCause(null, location.hash.replace("#", ""));
      }
    },

    // Called when created, and later when changing options
    _refresh: function () {
      var that = this;
      this.result.empty();
      this.options.rootCause
        .filter(Boolean)
        .forEach(function (line, i) {
          line = line || "";
          // https://stackoverflow.com/questions/25823914/javascript-count-spaces-before-first-character-of-a-string
          var leadingSpaceCount = line.search(/\S/) + 1;
          if (i == 0) {
            that.result.append('<h3 class="bold f-14">Search Result:<h3>');
          }
          that.result.append(
            $(
              "<span class=\"inline-block\">" + "&nbsp;&nbsp;".repeat(leadingSpaceCount) + "</span>" +
              "<span class=\"inline-block f-12 root-cause-line\">" + line + "</span></br>"
            )
          );
        })

      // Trigger a callback/event
      this._trigger("change");
    },
    getRootCause: function (event, componentName) {
      var that = this;
      this.result.empty();
      this.loading.show();
      this.result.hide();
      if (componentName) {
        this.componentName.val(componentName);
      } else {
        componentName = this.componentName.val().trim();
        location.hash = "#" + componentName;
      }
      $.getJSON(this.path + "?name=" + componentName)
        .always(function (result) {
          that._setOption("rootCause", result);
          that.loading.hide();
          that.result.show();
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
