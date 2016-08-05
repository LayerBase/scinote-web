// Define AJAX methods for handling errors on forms

// Render errors specified in JSON format for many form elements
$.fn.render_form_errors = function(modelName, errors, clear = true, ev) {
  if (clear || _.isUndefined(clear)) {
    this.clear_form_errors();
  }

  var form = $(this);
  $.each(errors, function(field, messages) {
    $input = $(_.filter(form.find('input, select, textarea'), function(el) {
      var name = $(el).attr('name');
      if (name) {
        return name.match(new RegExp(modelName + '\\[' + field + '\\(?'));
      }
      return false;
    }));

    renderFormError(ev, $input, messages);
  });
};

 // Render errors specified in array of strings format (or string if
 // just one error) for a single form element
 //
 // Show error message/s and mark error input (if errMsgs is defined)
 // and, if present, mark and show the tab where the error occured and
 // focus/scroll to the error input, if it is the first one to be
 // specified or if errMsgs is undefined
function renderFormError(ev, input, errMsgs, errAttributes) {
  if (!_.isUndefined(errMsgs)) {
    // Mark error form group
    $formGroup = $(input).closest(".form-group");
    if (!$formGroup.hasClass("has-error")) {
      $formGroup.addClass("has-error");
    }

    // Add error message/s
    errAttributes = _.isUndefined(errAttributes) ? "" : " " + errAttributes;
    error_text = ($.makeArray(errMsgs).map(function(m) {
      return m.strToErrorFormat();
    })).join("<br />");
    $errSpan = "<span class='help-block'" + errAttributes + ">" + error_text + "</span>";
    $formGroup.append($errSpan);
  }

  $form = $(input).closest("form");
  $tab = $(input).closest(".tab-pane");
  if ($tab.length) {
    // Mark error tab
    tabsPropagateErrorClass($form);
    $parent = $tab;
  } else {
    $parent = $form;
  }

  // Focus and scroll to the error if it is the first (most upper) one
  if ($parent.find(".form-group.has-error").length === 1 || _.isUndefined(errMsgs)) {
    goToFormElement(input);
  }

  if(!_.isUndefined(ev)) {
    // Don't submit form
    ev.preventDefault();
    ev.stopPropagation();
  }
}

// If any of form tabs (if exist) has errors, mark it and
// and show the first erroneous tab
function tabsPropagateErrorClass($form) {
  var $contents = $form.find("div.tab-pane");
  _.each($contents, function(tab) {
    var $tab = $(tab);
    var $errorFields = $tab.find(".has-error");
    if ($errorFields.length) {
      var id = $tab.attr("id");
      var navLink = $form.find("a[href='#" + id + "'][data-toggle='tab']");
      if (navLink.parent().length) {
        navLink.parent().addClass("has-error");
      }
    }
  });
  $form.find(".nav-tabs .has-error:first > a", $form).tab("show");
}
