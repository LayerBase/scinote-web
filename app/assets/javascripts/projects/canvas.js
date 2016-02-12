//************************************
// CONSTANTS
//************************************

var NAME_VALID = 0;
var NAME_LENGTH_ERROR = -1;
var NAME_INVALID_CHARACTERS_ERROR = -2;
var NAME_WHITESPACES_ERROR = -3;

var DRAG_INVALID = 0;
var DRAG_MOUSE = 1;
var DRAG_TOUCH = 2;

// This JS code also contains some .css styling instructions.
// Those defaults are used in code where there is a "CSS_STYLE" comment.
var DEFAULT_ENDPOINT_STYLE = "Blank";
var DEFAULT_CONNECTION_HOVER_STYLE =
{
  lineWidth: 5
};
var DEFAULT_CONNECTION_OVERLAY_STYLE =
[ "Arrow", {
  location: 1,
  id: "arrow",
  length: 12,
  width: 10,
  foldback: 1
} ];
var DEFAULT_CONNECTION_LABEL_STYLE =
{
  label: "x",
  id: "label",
  cssClass: "connLabel"
};
var DEFAULT_ANCHOR_STYLE = "Continuous";
var DEFAULT_CONNECTOR_STYLE =
[ "Straight", {
  gap: 2
} ];
var DEFAULT_CONNECTOR_STYLE_2 =
{
  strokeStyle: "#FFFFFF",
  lineWidth: 1.5,
  outlineColor: "transparent",
  outlineWidth: 0
};

// Zoom-level specific variables
var GRID_DIST_EDIT_X = 300;
var GRID_DIST_EDIT_Y = 135;
var EDIT_ENDPOINT_STYLE =
[ "Dot", {
  radius: 4,
  cssClass: "ep-normal",
  hoverClass: "ep-hover"
} ];
var EDIT_CONNECTOR_STYLE_2 =
{
  strokeStyle: "#FFFFFF",
  lineWidth: 3,
  outlineColor: "transparent",
  outlineWidth: 0
};
var GRID_DIST_FULL_X = 340;
var GRID_DIST_FULL_Y = 201;
var GRID_DIST_MEDIUM_X = 250;
var GRID_DIST_MEDIUM_Y = 88;
var GRID_DIST_SMALL_X = 100;
var GRID_DIST_SMALL_Y = 100;
var SUBMIT_FORM_NAME_SEPARATOR = "|";

//************************************
// GLOBAL VARIABLES
//************************************

// Current GUI mode
var currentMode = "full_zoom";

// JSNetworkX graph structure, used for graph analysis
var graph;

// Instance of jsPlumb, a library for canvas manipulation
var instance;

// ID "generator" for new modules
var newModuleIndex = 0;

// Global variables for module dragging
var leftInitial = 0, topInitial = 0, collided = false;

// Global variables for canvas dragging
var x_start = 0, y_start = 0;
var drag_type = DRAG_INVALID;
var draggable = null;

// Draggable position (initial values specified here)
var draggableLeft = 0.5;
var draggableTop = 0.5;

var ignoreUnsavedWorkAlert;

// Global variable for hammer js
var hammertime;

// Cookie data for tutorial
var tutorialData;

/*
 * As a guideline, all module elements should contain
 * the following attributes:
 *
 * id - ID of the module.
 * data-module-name - Name of the module.
 * data-module-id - ID of the module.
 * data-module-group - ID of the group the module belongs to (if it exists).
 * data-module-x - X position of the module (integer).
 * data-module-y - Y position of the module (integer).
 * data-module-conns - List of module IDs this module is connected
 * to (outbound connections).
 */

//************************************
// DEFAULT INITIALIZATION CODE
//************************************
jsPlumb.ready(function () {
  bindModeChange();
  bindAjax();
  bindWindowResizeEvent();
  initializeGraph(".diagram .module-large");
  initializeFullZoom();
  initializeTutorial();
});

//************************************
// INDIVIDUAL ACTION INIT & DESTROY
//************************************

function initializeEdit() {
  newModuleIndex = 0;
  ignoreUnsavedWorkAlert = false;

  // Read permissions from the data attributes of the form
  var canEditModules = _.isEqual($("#update-canvas").data("can-edit-modules"), "yes");
  var canEditModuleGroups = _.isEqual($("#update-canvas").data("can-edit-module-groups"), "yes");
  var canCreateModules = _.isEqual($("#update-canvas").data("can-create-modules"), "yes");
  var canCloneModules = _.isEqual($("#update-canvas").data("can-clone-modules"), "yes");
  var canDeleteModules = _.isEqual($("#update-canvas").data("can-delete-modules"), "yes");
  var canDragModules = _.isEqual($("#update-canvas").data("can-reposition-modules"), "yes");
  var canEditConnections = _.isEqual($("#update-canvas").data("can-edit-connections"), "yes");

  $("#canvas-container").addClass("canvas-container-edit-mode");

  // Hide sidebar & also its toggle button
  $("#wrapper").addClass("hidden2");
  $("#wrapper").find(".sidebar-header-toggle").hide();
  $(".navbar-secondary").addClass("navbar-without-sidebar");

  // Also, hide zoom levels button group
  $("#diagram-buttons").hide();

  // Resize container
  resizeContainer();

  positionModules(".diagram .module", GRID_DIST_EDIT_X, GRID_DIST_EDIT_Y);
  initJsPlumb(
    "#diagram-container",
    "#diagram",
    "div.module",
    {
      scrollEnabled: true,
      gridDistX: GRID_DIST_EDIT_X,
      gridDistY: GRID_DIST_EDIT_Y,
      endpointStyle: EDIT_ENDPOINT_STYLE,
      connectorStyle2: EDIT_CONNECTOR_STYLE_2,
      zoomEnabled: true,
      modulesDraggable: canDragModules,
      connectionsEditable: canEditConnections
    }
  );
  bindEditModeDropdownHandlers();
  if (canCreateModules) {
    bindNewModuleAction(GRID_DIST_EDIT_X, GRID_DIST_EDIT_Y);
  }
  bindEditFormSubmission(GRID_DIST_EDIT_X, GRID_DIST_EDIT_Y);

  if (canEditModules) {
    initEditModules();
    $(".edit-module").on("click touchstart", editModuleHandler);
  }

  if (canEditModuleGroups) {
    initEditModuleGroups();
    $(".edit-module-group").on("click touchstart", editModuleGroupHandler);
  }

  if (canCloneModules) {
    bindCloneModuleAction(
      $(".module-options a.clone-module"),
      ".diagram .module",
      GRID_DIST_EDIT_X,
      GRID_DIST_EDIT_Y);
    bindCloneModuleGroupAction(
      $(".module-options a.clone-module-group"),
      ".diagram .module",
      GRID_DIST_EDIT_X,
      GRID_DIST_EDIT_Y);
  }
  if (canDeleteModules) {
    bindDeleteModuleAction();
    bindDeleteModuleGroupAction();
  }

  bindEditModeCloseWindow();
  bindTouchDropdowns($(".dropdown-toggle"));

  // Restore draggable position
  restoreDraggablePosition($("#diagram"), $("#canvas-container"));

  $("#canvas-container").submit(function (){
    animateSpinner(
      this,
      true,
      { color: 'white', shadow: true }
    );
  });

  // Add edit canvas tutorial step and show it
  if (showTutorial() && Cookies.get('current_tutorial_step') == '4') {
    var editWorkflowTutorial = $("#canvas-container").attr("data-edit-workflow-step-text");
    Cookies.set('current_tutorial_step', '5');
    $(".introjs-overlay").remove();
    $(".introjs-helperLayer").remove();
    $(".introjs-tooltipReferenceLayer").remove();

    introJs()
      .setOptions({
        steps: [{
          intro: editWorkflowTutorial
        }],
        overlayOpacity: '0.1',
        doneLabel: 'End tutorial',
        showBullets: false,
        showStepNumbers: false,
        tooltipClass: 'custom disabled-next'
      })
      .start();

    $(".introjs-overlay").addClass("introjs-no-overlay");
    var positionLeft = $(".introjs-tooltipReferenceLayer").position().left / 4;
    $(".introjs-tooltipReferenceLayer")
      .addClass("bring-to-front")
      .css({ left: positionLeft + 'px' });

    // Destroy first-time tutorial cookies when skip tutorial
    // or end tutorial is clicked
    $(".introjs-skipbutton").each(function (){
      $(this).click(function (){
        Cookies.remove('tutorial_data');
        Cookies.remove('current_tutorial_step');
      });
    });
  }
}

function destroyEdit() {
  // Read permissions from the data attributes of the form
  var canCreateModules = _.isEqual($("#update-canvas").data("can-create-modules"), "yes");
  var canCloneModules = _.isEqual($("#update-canvas").data("can-clone-modules"), "yes");
  var canDeleteModules = _.isEqual($("#update-canvas").data("can-delete-modules"), "yes");

  instance.cleanupListeners();
  $(".dropdown").off("show.bs.dropdown hide.bs.dropdown");
  $("#diagram-container").off("mousewheel mousedown mouseup mousemove");
  hammertime.off('pinch');
  $("form#update-canvas").off("submit");
  if (canDeleteModules) {
    $(".delete-container a").off("click");
    $("#modal-delete-module").off("show.bs.modal hide.bs.modal");
    $("#modal-delete-module").find("button[data-action='confirm']").off("click");

    $(".buttons-container a.delete-module").off("click touchstart");
    $(".buttons-container a.delete-module-group").off("click touchstart");
    $("#modal-delete-module-group").off("show.bs.modal hide.bs.modal");
    $("#modal-delete-module-group").find("button[data-action='confirm']").off("click");
  }
  if (canCreateModules) {
    $("#modal-new-module").off("show.bs.modal shown.bs.modal hide.bs.modal");
    $("#modal-new-module").find("button[data-action='confirm']").off("click");
    $("#canvas-new-module").draggable("destroy");
    $("#canvas-new-module").off("click");
  }
  if (canCloneModules) {
    $(".buttons-container a.clone-module").off("click touchstart");
    $(".buttons-container a.clone-module-group").off("click touchstart");
  }

  $("#update-canvas .cancel-edit-canvas").off("click");
  $(window).off("beforeunload");
  $(document).off("page:before-change");
  $(".dropdown-toggle").off("touchstart");

  // Remember the draggable position
  rememberDraggablePosition($("#diagram"), $("#canvas-container"));
}

function initializeFullZoom() {
  // Resize container
  resizeContainer();

  positionModules(".diagram .module-large", GRID_DIST_FULL_X, GRID_DIST_FULL_Y);
  initJsPlumb(
    "#diagram-container",
    "#diagram",
    "div.module-large",
    {
      scrollEnabled: true,
      gridDistX: GRID_DIST_FULL_X,
      gridDistY: GRID_DIST_FULL_Y
    });
  bindEditDueDateAjax();
  bindEditTagsAjax($("div.module-large"));
  bindFullZoomAjaxTabs();
  initModulesHover($("div.module-large"), $("#slide-panel"));
  initSidebarClicks($("div.module-large"), $("#slide-panel"), $("#diagram"), $("#canvas-container"), 20);

  // Restore draggable position
  restoreDraggablePosition($("#diagram"), $("#canvas-container"));
}

function destroyFullZoom() {
  instance.cleanupListeners();
  $("#diagram-container").off("mousedown mouseup mousemove");
  $(".module-large .buttons-container [role=tab]").off("ajax:before ajax:success ajax:error");
  $("div.module-large").off("mouseenter mouseleave");
  $("div.module-large a.due-date-link").off("ajax:success ajax:error");
  $("#manage-module-description-modal [data-action='submit']").off("click");
  $("#manage-module-due-date-modal [data-action='submit']").off("click");
  $("div.module-large a.edit-tags-link").off("ajax:before ajax:success");
  $("li[data-module-group]").off("mouseenter mouseleave");
  $("li[data-module-group] > span > a.canvas-center-on").off("click");
  $("li[data-module-id]").off("mouseenter mouseleave");
  $("li[data-module-id] > span > a.canvas-center-on").off("click");

  // Remember the draggable position
  rememberDraggablePosition($("#diagram"), $("#canvas-container"));
}

function initializeMediumZoom() {
  // Resize container
  resizeContainer();

  positionModules(".diagram .module-medium", GRID_DIST_MEDIUM_X, GRID_DIST_MEDIUM_Y);
  initJsPlumb("#diagram-container", "#diagram", "div.module-medium", { scrollEnabled: true, gridDistX: GRID_DIST_MEDIUM_X, gridDistY: GRID_DIST_MEDIUM_Y });
  bindEditTagsAjax($("div.module-medium"));
  initModulesHover($("div.module-medium"), $("#slide-panel"));
  initSidebarClicks($("div.module-medium"), $("#slide-panel"), $("#diagram"), $("#canvas-container"), 20);

  // Restore draggable position
  restoreDraggablePosition($("#diagram"), $("#canvas-container"));
}

function destroyMediumZoom() {
  instance.cleanupListeners();
  $("#diagram-container").off("mousedown mouseup mousemove");
  $("div.module-medium").off("mouseenter mouseleave");
  $("div.module-medium a.edit-tags-link").off("ajax:before ajax:success");
  $("li[data-module-group]").off("mouseenter mouseleave");
  $("li[data-module-group] > span > a.canvas-center-on").off("click");
  $("li[data-module-id]").off("mouseenter mouseleave");
  $("li[data-module-id] > span > a.canvas-center-on").off("click");

  // Remember the draggable position
  rememberDraggablePosition($("#diagram"), $("#canvas-container"));
}

function initializeSmallZoom() {
  // Resize container
  resizeContainer();

  positionModules(".diagram .module-small", GRID_DIST_SMALL_X, GRID_DIST_SMALL_Y);
  initJsPlumb("#diagram-container", "#diagram", "div.module-small", { scrollEnabled: true, gridDistX: GRID_DIST_SMALL_X, gridDistY: GRID_DIST_SMALL_Y });
  initModulesHover($("div.module-small"), $("#slide-panel"));
  initSidebarClicks($("div.module-small"), $("#slide-panel"), $("#diagram"), $("#canvas-container"), 20);

  // Restore draggable position
  restoreDraggablePosition($("#diagram"), $("#canvas-container"));
}

function destroySmallZoom() {
  instance.cleanupListeners();
  $("#diagram-container").off("mousedown mouseup mousemove");
  $("div.module-small").off("mouseenter mouseleave");
  $("li[data-module-group]").off("mouseenter mouseleave");
  $("li[data-module-group] > span > a.canvas-center-on").off("click");
  $("li[data-module-id]").off("mouseenter mouseleave");
  $("li[data-module-id] > span > a.canvas-center-on").off("click");

  // Remember the draggable position
  rememberDraggablePosition($("#diagram"), $("#canvas-container"));
}

//************************************
// FUNCTIONS
//************************************

/**
 * Enable/disable canvas events (related to dragging, zooming, ...).
 * @param activate - True to activate events; false
 * to deactivate them.
 */
function toggleCanvasEvents(activate) {
  var cmd = "pause";
  if (activate) {
    cmd = "active";
  }
  $("#diagram-container").eventPause(cmd,
    "mousedown mouseup mouseout mousewheel touchstart touchend touchcancel touchmove");
  hammertime.get('pinch').set({ enable: activate });
}

/**
 * Validate the module/module group name.
 * @param The value to be validated.
 * @return 0 if valid; -1 if length too small/large; -2 if
 * it contains invalid characters.
 */
function validateName(val) {
  var result = NAME_VALID;
  if (_.isUndefined(val) ||
    val.length < 2 ||
    val.length > 50) {
    result = NAME_LENGTH_ERROR;
  } else if (val.indexOf(SUBMIT_FORM_NAME_SEPARATOR) != -1) {
    result = NAME_INVALID_CHARACTERS_ERROR;
  } else if (/^\s+$/.test(val)){
    result = NAME_WHITESPACES_ERROR;
  }
  return result;
}

/**
 * Gets or sets the left CSS position of the element.
 * @param el - The element.
 * @param newVal - The new left CSS value, if setting value.
 * @return The new float value of the element's left CSS position.
 */
function elLeft(el, newVal) {
  if (_.isUndefined(newVal)) {
    return parseFloat($(el).css("left").replace("px", ""));
  } else {
    $(el).css("left", newVal + "px");
    return newVal;
  }
}

/**
 * Gets or sets the top CSS position of the element.
 * @param el - The element.
 * @param newVal - The new top CSS value, if setting value.
 * @return The new float value of the element's top CSS position.
 */
function elTop(el, newVal) {
  if (_.isUndefined(newVal)) {
    return parseFloat($(el).css("top").replace("px", ""));
  } else {
    $(el).css("top", newVal + "px");
    return newVal;
  }
}

/**
 * Animate the reposition of the specified element.
 * @param el - The element to be repositioned.
 * @param left - The new left CSS property.
 * @param top - The new top CSS property.
 */
function animateReposition(el, left, top) {
  var leftMove, topMove, leftDir, topDir;
  if (_.isUndefined($(el).css("left"))) {
    leftMove = left;
  } else {
    leftMove = (-parseInt($(el).css("left").replace("px", ""), 10) + left);
  }
  if (_.isUndefined($(el).css("top"))) {
    topMove = top;
  } else {
    topMove = (-parseInt($(el).css("top").replace("px", ""), 10) + top);
  }
  leftDir = leftMove >=0 ? "+=" : "-=";
  topDir = topMove >=0 ? "+=" : "-=";
  el.animate({
    left: leftDir + Math.abs(leftMove) + "px",
    top: topDir + Math.abs(topMove) + "px"
  }, 300);
}

/**
 * Bind the change of the canvas mode.
 */
function bindModeChange() {
  var buttons = $('#diagram-buttons').find("a[type='button']");

  buttons.on('click', function() {
    var action = $(this).data("action");

    // Ignore clicks on the currently active button
    if (_.isEqual(action, currentMode)) {
      return false;
    }

    // Else, call destroy action function
    switch (action) {
      case "edit":
        destroyEdit();
        break;
      case "full_zoom":
        destroyFullZoom();
        break;
      case "medium_zoom":
        destroyMediumZoom();
        break;
      case "small_zoom":
        destroySmallZoom();
        break;
    }
  });
}

function bindTouchDropdowns(selector) {
  selector.on("touchstart", function(event) {
    event.stopPropagation();
  });
}

function bindEditModeCloseWindow() {
  var alertText = $("#update-canvas").attr("data-unsaved-work-text");

  $("#update-canvas .cancel-edit-canvas").click(function(ev) {
    ignoreUnsavedWorkAlert = true;
  });
  $(window).on("beforeunload", function(ev) {
    if (ignoreUnsavedWorkAlert) {
      // Remove unload listeners
      $(window).off("beforeunload");
      $(document).off("page:before-change");

      ev.returnValue = undefined;
      return undefined;
    } else {
      return alertText;
    }
  });
  $(document).on("page:before-change", function(ev) {
    var exit;
    if (ignoreUnsavedWorkAlert) {
      exit = true;
    } else {
      exit = confirm(alertText);
    }

    if (exit) {
      // Remove unload listeners
      $(window).off("beforeunload");
      $(document).off("page:before-change");
    }

    return exit;
  });
}

function bindEditModeDropdownHandlers(node) {
  // When "module clone/delete" dropdowns are opened,
  // module needs to increase z-index in order for the dropdown
  // menu to be above connections etc.
  $(".dropdown", node).on("show.bs.dropdown", function(event) {
    $(this).parents(".module").css("z-index", "30");
  });
  $(".dropdown", node).on("hide.bs.dropdown", function(event) {
    $(this).parents(".module").css("z-index", "20");
  });
}

function resizeContainer() {
  // Resize diagram container
  var cont = $("#diagram-container");

  if (cont.length > 0) {
    cont.css(
      "height",
      ($(window).height() - cont.offset().top - 15) + "px"
    );
  }
}

function bindWindowResizeEvent() {
  $(window).resize(function() {
    resizeContainer();
  });
}

function bindFullZoomAjaxTabs() {
  var manageUsersModal = null;
  var manageUsersModalBody = null;
  var editDescriptionModal = null;
  var editDescriptionModalBody = null;

  // Initialize edit description modal window
  function initEditDescription($el) {
    $el.find(".description-link")
    .on("ajax:success", function(ev, data, status) {
      var descriptionLink = $(this);
      var descriptionTab = descriptionLink.closest(".tab-pane");

      // Set modal body & title
      editDescriptionModalBody.html(data.html);
      editDescriptionModal
      .find("#manage-module-description-modal-label")
      .text(data.title);

      editDescriptionModalBody.find("form")
      .on("ajax:success", function(ev2, data2, status2) {
        // Update module's description in the tab
        descriptionTab.find(".description-label")
        .html(data2.description_label);

        // Close modal
        editDescriptionModal.modal("hide");
      })
      .on("ajax:error", function(ev2, data2, status2) {
        // Display errors if needed
        $(this).render_form_errors("my_module", data.responseJSON);
      });

    // Disable canvas dragging events
    toggleCanvasEvents(false);

      // Show modal
      editDescriptionModal.modal("show");
    })
    .on("ajax:error", function(ev, data, status) {
      // TODO
    });
  }

  // Initialize users editing modal remote loading.
  function initUsersEditLink($el) {
     $el.find(".manage-users-link")
       .on("ajax:before", function () {
          var moduleId = $(this).closest(".panel-default").attr("id");
          manageUsersModal.attr("data-module-id", moduleId);
          manageUsersModal.modal('show');
       })
       .on("ajax:success", function (e, data) {
         $("#manage-module-users-modal-module").text(data.my_module.name);
         initUsersModalBody(data);
       });
  }

  // Initialize comment form.
  function initCommentForm($el) {

    var $form = $el.find("ul form");

    $(".help-block", $form).addClass("hide");

    $form.on("ajax:send", function (data) {
      $("#comment_message", $form).attr("readonly", true);
    })
    .on("ajax:success", function (e, data) {
      if (data.html) {
        var list = $form.parents("ul");

        // Remove potential "no comments" element
        list.parent().find(".content-comments")
          .find("li.no-comments").remove();

        list.parent().find(".content-comments")
          .prepend("<li class='comment'>" + data.html + "</li>")
          .scrollTop(0);
        list.parents("ul").find("> li.comment:gt(8)").remove();
        $("#comment_message", $form).val("");
        $(".form-group", $form)
          .removeClass("has-error");
        $(".help-block", $form)
            .html("")
            .addClass("hide");
      }
    })
    .on("ajax:error", function (ev, xhr) {
      if (xhr.status === 400) {
        var messageError = xhr.responseJSON.errors.message;

        if (messageError) {
          $(".form-group", $form)
            .addClass("has-error");
          $(".help-block", $form)
              .html(messageError[0])
              .removeClass("hide");
        }
      }
    })
    .on("ajax:complete", function () {
      $("#comment_message", $form)
        .attr("readonly", false)
        .focus();
    });
  }

  // Initialize show more comments link.
  function initCommentsLink($el) {

    $el.find(".btn-more-comments")
      .on("ajax:success", function (e, data) {
        if (data.html) {
          var list = $(this).parents("ul");
          var moreBtn = list.find(".btn-more-comments");
          var listItem = moreBtn.parents('li');
          $(data.html).insertBefore(listItem);
          if (data.results_number < data.per_page) {
            moreBtn.remove();
          } else {
            moreBtn.attr("href", data.more_url);
          }
        }
      });
  }

  // Initialize reloading manage user modal content after posting new
  // user.
  function initAddUserForm() {
    manageUsersModalBody.find(".add-user-form")
      .on("ajax:success", function (e, data) {
        initUsersModalBody(data);
      });
  }

  // Initialize remove user from my_module links.
  function initRemoveUserLinks() {
    manageUsersModalBody.find(".remove-user-link")
      .on("ajax:success", function (e, data) {
        initUsersModalBody(data);
      });
  }

  // Initialize ajax listeners and elements style on modal body. This
  // function must be called when modal body is changed.
  function initUsersModalBody(data) {
    manageUsersModalBody.html(data.html);
    manageUsersModalBody.find(".selectpicker").selectpicker();
    initAddUserForm();
    initRemoveUserLinks();
  }

  manageUsersModal = $("#manage-module-users-modal");
  manageUsersModalBody = manageUsersModal.find(".modal-body");
  editDescriptionModal = $("#manage-module-description-modal");
  editDescriptionModalBody = editDescriptionModal.find(".modal-body");

  // Reload users tab HTML element when modal is closed
  manageUsersModal.on("hide.bs.modal", function () {
    var moduleEl = $("#" + $(this).attr("data-module-id"));

    // Load HTML to refresh users list
    $.ajax({
      url: moduleEl.attr("data-module-users-tab-url"),
      type: "GET",
      dataType: "json",
      success: function (data) {
        moduleEl.find("#" + moduleEl.attr("id") + "_users").html(data.html);
        initUsersEditLink(moduleEl);
      },
      error: function (data) {
        // TODO
      }
    });
  });

  // Remove users modal content when modal window is closed.
  manageUsersModal.on("hidden.bs.modal", function () {
    manageUsersModalBody.html("");
  });

  // When clicking on description modal "Update" button,
  // submit its inner-lying form
  editDescriptionModal.find("[data-action='submit']").click(function() {
    editDescriptionModalBody.find("form").submit();
  });

  // Remove description modal content when window is closed
  editDescriptionModal.on("hidden.bs.modal", function() {
    $(this).find("form").off("ajax:success ajax:error");
    editDescriptionModalBody.html("");

    // Re-activate canvas dragging events
    toggleCanvasEvents(true);
  });

  // initialize my_module tab remote loading
  var elements = $(".module-large .buttons-container [role=tab]");
  elements.on("ajax:before", function (e) {
    var $this = $(this);
    var parentNode = $this.parents("li");
    var targetId = $this.attr("aria-controls");

    if (parentNode.hasClass("active")) {
      parentNode.removeClass("active");
      $("#" + targetId).removeClass("active");
      $this.parents(".module-large").addClass("expanded");
      return false;
    }
  })
  .on("ajax:success", function (e, data, status, xhr) {

    // Hide all potentially shown tabs
    elements.parents("li").removeClass("active");
    $(".tab-content").children().removeClass("active");
    $(".module-large").removeClass("expanded");

    var $this = $(this);
    var targetId = $this.attr("aria-controls");
    var target = $("#" + targetId);
    var targetContents = target.attr("data-contents");
    var parentNode = $this.parents("ul").parent();

    target.html(data.html);
    if (targetContents === "info") {
      initEditDescription(parentNode);
    } else if (targetContents === "users") {
      initUsersEditLink(parentNode);
    } else if (targetContents === "comments") {
      initCommentForm(parentNode);
      initCommentsLink(parentNode);
    }

    $this.parents("ul").parent().find(".active").removeClass("active");
    $this.parents("li").addClass("active");
    target.addClass("active");
    $this.parents(".module-large").addClass("expanded");
  })
  .on("ajax:error", function (e, xhr, status, error) {
    // TODO
  });
}

function bindEditDueDateAjax() {
  var editDueDateModal = null;
  var editDueDateModalBody = null;
  var editDueDateModalTitle = null;
  var editDueDateModalSubmitBtn = null;

  editDueDateModal = $("#manage-module-due-date-modal");
  editDueDateModalBody = editDueDateModal.find(".modal-body");
  editDueDateModalTitle = editDueDateModal.find("#manage-module-due-date-modal-label");
  editDueDateModalSubmitBtn = editDueDateModal.find("[data-action='submit']");

  $("div.module-large .panel-body .due-date-link")
  .on("ajax:success", function(ev, data, status) {
    var dueDateLink = $(this);
    if (!dueDateLink.hasClass("due-date-refresh")) {
      dueDateLink = dueDateLink.parent().next().find(".due-date-refresh");
    }
    var moduleEl = dueDateLink.closest("div.module-large");

    // Load contents
    editDueDateModalBody.html(data.html);
    editDueDateModalTitle.text(data.title);

    // Add listener to form inside modal
    editDueDateModalBody.find("form")
    .on("ajax:success", function(ev2, data2, status2) {
      // Update module's due date
      dueDateLink.html(data2.due_date_label);

      // Update module's classes if needed
      moduleEl
      .removeClass("alert-red")
      .removeClass("alert-yellow");
      _.each(data2.alerts, function(alert) {
        moduleEl.addClass(alert);
      });

      // Close modal
      editDueDateModal.modal("hide");
    })
    .on("ajax:error", function(ev2, data2, status2) {
      // Display errors if needed
      $(this).render_form_errors("my_module", data.responseJSON);
    });

    // Disable canvas dragging events
    toggleCanvasEvents(false);

    // Open modal
    editDueDateModal.modal("show");
  })
  .on("ajax:error", function(ev, data, status) {
    // TODO
  });

  editDueDateModalSubmitBtn.on("click", function() {
    // Submit the form inside the modal
    editDueDateModalBody.find("form").submit();
  });

  editDueDateModal.on("hidden.bs.modal", function() {
    editDueDateModalBody.find("form").off("ajax:success ajax:error");
    editDueDateModalBody.html("");

    // Re-activate canvas dragging events
    toggleCanvasEvents(true);
  });
}

function bindEditTagsAjax(elements) {
  var manageTagsModal = null;
  var manageTagsModalBody = null;

  // Initialize reloading of manage tags modal content after posting new
  // tag.
  function initAddTagForm() {
    manageTagsModalBody.find(".add-tag-form")
      .on("ajax:success", function (e, data) {
        initTagsModalBody(data);
      });
  }

  // Initialize edit tag & remove tag functionality from my_module links.
  function initTagRowLinks() {
    manageTagsModalBody.find(".edit-tag-link")
      .on("click", function (e) {
        var $this = $(this);
        var li = $this.parents("li.list-group-item");
        var editDiv = $(li.find("div.tag-edit"));

        // Hide all other edit divs, show all show divs
        manageTagsModalBody.find("div.tag-edit").hide();
        manageTagsModalBody.find("div.tag-show").show();

        editDiv.find("input[type=text]").val(li.data("name"));
        editDiv.find('.edit-tag-color').colorselector('setColor', li.data("color"));

        li.find("div.tag-show").hide();
        editDiv.show();
      });
    manageTagsModalBody.find("div.tag-edit .dropdown-colorselector > .dropdown-menu li a")
      .on("click", function (e) {
        // Change background of the <li>
        var $this = $(this);
        var li = $this.parents("li.list-group-item");

        li.css("background-color", $this.data("value"));
      });
    manageTagsModalBody.find(".remove-tag-link")
      .on("ajax:success", function (e, data) {
        initTagsModalBody(data);
      });
      manageTagsModalBody.find(".delete-tag-form")
      .on("ajax:success", function (e, data) {
        initTagsModalBody(data);
      });
    manageTagsModalBody.find(".edit-tag-form")
      .on("ajax:success", function (e, data) {
        initTagsModalBody(data);
      })
      .on("ajax:error", function (e, data) {
        $(this).render_form_errors("tag", data.responseJSON);
      });
    manageTagsModalBody.find(".cancel-tag-link")
      .on("click", function (e, data) {
        var $this = $(this);
        var li = $this.parents("li.list-group-item");

        li.css("background-color", li.data("color"));
        li.find(".edit-tag-form").clear_form_errors();

        li.find("div.tag-edit").hide();
        li.find("div.tag-show").show();
      });
  }

  // Initialize ajax listeners and elements style on modal body. This
  // function must be called when modal body is changed.
  function initTagsModalBody(data) {
    manageTagsModalBody.html(data.html);
    manageTagsModalBody.find(".selectpicker").selectpicker();
    initAddTagForm();
    initTagRowLinks();
  }

  manageTagsModal = $("#manage-module-tags-modal");
  manageTagsModalBody = manageTagsModal.find(".modal-body");

  // Reload tags HTML element when modal is closed
  manageTagsModal.on("hide.bs.modal", function () {
    var moduleEl = $("#" + $(this).attr("data-module-id"));

    // Load HTML
    $.ajax({
      url: moduleEl.attr("data-module-tags-url"),
      type: "GET",
      dataType: "json",
      success: function (data) {
        moduleEl.find(".edit-tags-link").html(data.html_canvas);
      },
      error: function (data) {
        // TODO
      }
    });
  });

  // Remove modal content when modal window is closed.
  manageTagsModal.on("hidden.bs.modal", function () {
    manageTagsModalBody.html("");

  });

  // initialize my_module tab remote loading
  $(elements).find("a.edit-tags-link")
  .on("ajax:before", function () {
    var moduleId = $(this).closest(".panel-default").attr("id");
    manageTagsModal.attr("data-module-id", moduleId);
    manageTagsModal.modal('show');
  })
  .on("ajax:success", function (e, data) {
    $("#manage-module-tags-modal-module").text(data.my_module.name);
    initTagsModalBody(data);
  });
}

/**
 * Bind change of GUI buttons to Ajax success callback.
 */
function bindAjax() {
  $('#diagram-buttons .ajax').on('ajax:success', function(evt, data) {
    // Set toggled button state
    $("#diagram-buttons a").removeClass("active");
    $("#diagram-buttons a").removeAttr("aria-pressed");
    $("#diagram-buttons a").removeData("toggle");
    $(evt.target).addClass("active");
    $(evt.target).attr("aria-pressed", true);
    $(evt.target).data("toggle", "button");

    // Fill contents of container with AJAX content
    var target = $('#canvas-container');
    $(target).html(data);

    // Re-run canvas GUI initialization code
    var action = $(evt.target).data("action");
    switch (action) {
      case "edit":
        initializeEdit();
        break;
      case "full_zoom":
        initializeFullZoom();
        break;
      case "medium_zoom":
        initializeMediumZoom();
        break;
      case "small_zoom":
        initializeSmallZoom();
        break;
    }

    currentMode = action;
  });
  $('#diagram-buttons .ajax').on('ajax:error', function(evt, data) {
    // Redirect to provided URL
    var json = $.parseJSON(data.responseText);
    $(location).attr('href', json.redirect_url);
  });
}

/**
 * Add a new node to the graph.
 * @param moduleId - The ID of the module to add.
 * @param module - The module jQuery element.
 */
function addNode(moduleId, module) {
  var connsAttr = module.attr("data-module-conns");
  var conns = _.isUndefined(connsAttr) ? [] : connsAttr.split(", ");
  graph.addNode(
    moduleId,
    {
      name: module.data["module-name"],
      x: module.data["module-x"],
      y: module.data["module-y"],
      conns: conns
    }
  );
}

/**
 * Initialize the global graph variable from modules.
 * @param modulesSel - The jQuery selector text of module elements.
 */
function initializeGraph(modulesSel) {
  var modules = $(modulesSel);

  graph = new jsnx.DiGraph();

  var module, moduleId;
  _.each(modules, function(m) {
    module = $(m);
    moduleId = module.attr("id");
    if (!graph.hasNode(moduleId)) {
      addNode(moduleId, module);
    }
    var outs = module.attr("data-module-conns").split(", ");
    _.each(outs, function(targetId) {
      if (targetId === "") {
        return;
      }
      if (!graph.hasNode(targetId)) {
        addNode(targetId, $(".diagram .module[id=" + targetId + "]"));
      }

      graph.addEdge(module.attr("id"), targetId);
    });
  });
}

/**
 * Get the connected components of a specified graph and module. Alas, this
 * function doesn't exist in jsnetworkx.
 * @param graph - The graph instance.
 * @param moduleId - We're only interested in the connected component in which
 * the specified module is located.
 * @return A list of node IDs representing a connected component.
 */
function connectedComponents(graph, moduleId) {
  function getNeighbors(graph, node, visited) {
    visited.push(node);
    var neighbours = _.union(graph.predecessors(node), graph.successors(node));
    var unvisitedNeighbors = _.filter(neighbours, function(n) {
      return !_.contains(visited, n);
    });
    var result = _.flatten(_.map(unvisitedNeighbors, function(neighbour) {
      nodes = getNeighbors(graph, neighbour, visited);
      _.each(nodes, function(n) {
        if (!_.contains(visited, n)) {
          visited.push(n);
        }
      });
      return nodes;
    }));
    result.push(node);
    return result;
  }

  return _.uniq(getNeighbors(graph, moduleId, []));
}

/**
 * Create a virtual new module (without links & functionality).
 * @param event - The event, can be null.
 */
function createVirtualModule(event) {
  // Generate new module div
  var newModule = document.createElement("div");
  $(newModule)
  .addClass("panel panel-default module new")
  .css("z-index", "900")
  .attr("data-module-name", "")
  .attr("data-module-group-name","")
  .attr("data-module-x", "")
  .attr("data-module-y", "")
  .attr("data-module-conns", "")
  .appendTo(draggable);

  var panelHeading = document.createElement("div");
  $(panelHeading)
  .addClass("panel-heading")
  .appendTo($(newModule));

  var panelTitle = document.createElement("div");
  $(panelTitle)
  .addClass("panel-title")
  .html("")
  .appendTo($(panelHeading));

  if (_.isEqual($("#update-canvas").data("can-edit-connections"), "yes")) {
    var panelBody = document.createElement("div");
    $(panelBody)
    .addClass("panel-body ep")
    .appendTo($(newModule));
  }

  var overlayContainer = document.createElement("div");
  $(overlayContainer)
  .addClass("overlay")
  .appendTo($(newModule));

  return $(newModule);
}

/**
 * Update a previously created virtual module with HTML elements.
 * @param module - The jQuery module selector.
 * @param id - The new module id.
 * @param name - The module name.
 * @param gridDistX - The grid distance in X direction.
 * @param gridDistY - The grid distance in Y direction.
 * @return The updated module.
 */
function updateModuleHtml(module, id, name, gridDistX, gridDistY) {
  // Update some stuff inside the module
  module
  .attr("id", id)
  .attr("data-module-id", id)
  .attr("data-module-name", name)
  .css("z-index", "");

  var panelHeading = module.find(".panel-heading");

  module.find(".panel-title").html(name);

  module.find(".ep").html($("#drag-connections-placeholder").text().trim());

  // Add dropdown
  var dropdown = document.createElement("div");
  $(dropdown)
  .addClass("dropdown pull-right module-options")
  .appendTo($(panelHeading));

  var dropdownToggle = document.createElement("a");
  $(dropdownToggle)
  .addClass("dropdown-toggle")
  .attr("id", id + "_options")
  .attr("data-toggle", "dropdown")
  .attr("aria-haspopup", "true")
  .attr("aria-expanded", "true")
  .appendTo(dropdown);

  var toggleIcon = document.createElement("span");
  $(toggleIcon)
  .addClass("glyphicon")
  .addClass("glyphicon-triangle-bottom")
  .attr("aria-hidden", "true")
  .appendTo(dropdownToggle);

  var dropdownMenu = document.createElement("ul");
  $(dropdownMenu)
  .addClass("dropdown-menu")
  .addClass("no-scale")
  .attr("aria-labelledby", id + "_options")
  .appendTo(dropdown);

  var dropdownMenuHeader = document.createElement("li");
  $(dropdownMenuHeader)
  .addClass("dropdown-header")
  .html($("#dropdown-header-placeholder").text().trim())
  .appendTo(dropdownMenu);

  // Add edit links if neccesary
  if (_.isEqual($("#update-canvas").data("can-edit-modules"), "yes")) {
    var editModuleItem = document.createElement("li");
    $(editModuleItem).appendTo(dropdownMenu);

    var editModuleLink = document.createElement("a");
    $(editModuleLink)
    .attr("href", "")
    .attr("data-module-id", id)
    .addClass("edit-module")
    .html($("#edit-link-placeholder").text().trim())
    .appendTo(editModuleItem);

    // Add click handler for the edit module
    $(editModuleLink).on("click touchstart", editModuleHandler);
  }
  if (_.isEqual($("#update-canvas").data("can-edit-module-groups"), "yes")) {
    var editModuleGroupItem = document.createElement("li");
    $(editModuleGroupItem).appendTo(dropdownMenu);
    $(editModuleGroupItem).hide();

    var editModuleGroupLink = document.createElement("a");
    $(editModuleGroupLink)
    .attr("href", "")
    .attr("data-module-id", id)
    .addClass("edit-module-group")
    .html($("#edit-group-link-placeholder").text().trim())
    .appendTo(editModuleGroupItem);

    // Add click handler for the edit module group
    $(editModuleGroupLink).on("click touchstart", editModuleGroupHandler);
  }

  // Add clone links if neccesary
  if (_.isEqual($("#update-canvas").data("can-clone-modules"), "yes")) {
    var cloneModuleItem = document.createElement("li");
    $(cloneModuleItem).appendTo(dropdownMenu);

    var cloneModuleLink = document.createElement("a");
    $(cloneModuleLink)
    .attr("href", "")
    .attr("data-module-id", id)
    .addClass("clone-module")
    .html($("#clone-link-placeholder").text().trim())
    .appendTo(cloneModuleItem);

    // Add clone click handler for the new module
    bindCloneModuleAction($(cloneModuleLink), ".diagram .module", gridDistX, gridDistY);

    var cloneModuleGroupItem = document.createElement("li");
    $(cloneModuleGroupItem).appendTo(dropdownMenu);
    $(cloneModuleGroupItem).hide();

    var cloneModuleGroupLink = document.createElement("a");
    $(cloneModuleGroupLink)
    .attr("href", "")
    .attr("data-module-id", id)
    .addClass("clone-module-group")
    .html($("#clone-group-link-placeholder").text().trim())
    .appendTo(cloneModuleGroupItem);

    // Add clone click handler for the new module
    bindCloneModuleGroupAction($(cloneModuleGroupLink), ".diagram .module", gridDistX, gridDistY);

    bindEditModeDropdownHandlers(module);
  }

  // Add delete links if neccesary
  if (_.isEqual($("#update-canvas").data("can-delete-modules"), "yes")) {
    var deleteModuleItem = document.createElement("li");
    $(deleteModuleItem).appendTo(dropdownMenu);

    var deleteModuleLink = document.createElement("a");
    $(deleteModuleLink)
    .attr("href", "")
    .attr("data-module-id", id)
    .addClass("delete-module")
    .html($("#delete-link-placeholder").text().trim())
    .appendTo(deleteModuleItem);

    // Add delete click handler for the new module
    $(deleteModuleLink).on("click touchstart", deleteModuleHandler);

    var deleteModuleGroupItem = document.createElement("li");
    $(deleteModuleGroupItem).appendTo(dropdownMenu);
    $(deleteModuleGroupItem).hide();

    var deleteModuleGroupLink = document.createElement("a");
    $(deleteModuleGroupLink)
    .attr("href", "")
    .attr("data-module-id", id)
    .addClass("delete-module-group")
    .html($("#delete-group-link-placeholder").text().trim())
    .appendTo(deleteModuleGroupItem);

    // Add delete click handler for the new module
    $(deleteModuleGroupLink).on("click touchstart", deleteModuleGroupHandler);
  }

  // Set it up for jsPlumb, depending on permissions
  if (_.isEqual($("#update-canvas").data("can-reposition-modules"), "yes")) {
    addDraggablesToInstance(module, gridDistX, gridDistY);
  }
  if (_.isEqual($("#update-canvas").data("can-edit-connections"), "yes")) {
    setElementsAsDropTargets(module);
    setElementsAsDragSources(module, null, null, EDIT_CONNECTOR_STYLE_2);
  }

  // Add dropdown touch support
  bindTouchDropdowns($(dropdownToggle));

  // Re-zoom dropdown menu, so the new module's no-scale dropdown gets
  // rescaled
  $(dropdownMenu).css("transform", "scale(" + (1.0 / instance.getZoom()) + ")");
  $(dropdownMenu).css("transform-origin", "0 0");

  // Add IDs to the form
  var formAddInput = $('#update-canvas form input#add');
  var formAddNameInput = $('#update-canvas form input#add-names');
  var inputVal = formAddInput.attr("value");
  var inputNameVal = formAddNameInput.attr("value");
  if (_.isUndefined(inputVal) || inputVal === "") {
    formAddInput.attr("value", id);
    formAddNameInput.attr("value", name);
  } else {
    formAddInput.attr("value", inputVal + "," + id);
    formAddNameInput.attr("value", inputNameVal + SUBMIT_FORM_NAME_SEPARATOR + name);
  }

  return module;
}

/**
 * Bind the new module button action.
 * @param gridDistX - The canvas grid distance in X direction.
 * @param gridDistY - The canvas grid distance in Y direction.
 */
function bindNewModuleAction(gridDistX, gridDistY) {
  function handleDragStart(event, ui) {
    collided = false;
  }

  function handleDrag(event, ui) {
    // Custom grid implementation is needed
    // (so the new module snaps on the same grid offset
    // as the other modules)
    var l = ui.position.left;
    var t = ui.position.top;
    var gdx = gridDistX;
    var gdy = gridDistY;
    var z = instance.getZoom();

    ui.position.left = Math.floor(l / (gdx * z)) * gdx;
    ui.position.top = Math.floor(t / (gdy * z)) * gdy;

    // Check if collision occured
    var modules = $(".module");
    var module;
    for (var i = 0; i < modules.length; i++) {
      module = $(modules[i]);
      if (module.hasClass("new")) {
        continue;
      }

      if (_.isEqual(ui.helper.position(), module.position())) {
        // Collision!
        collided = true;
        break;
      } else {
        collided = false;
      }
    }

    if (collided) {
      ui.helper.addClass("collided");
    } else {
      ui.helper.removeClass("collided");
    }
  }

  function handleDragStop(event, ui) {
    if (!collided) {
      // Disable scroll on canvas temporarily, as it can be
      // dragged from modal area
      toggleCanvasEvents(false);

      // Copy the ui.helper, since it's gonna vanish soon!
      var clone = ui.helper.clone(true, true);
      clone.appendTo(draggable);
      clone.css("z-index", "20");

      // Open modal window
      $("#modal-new-module").modal({
        "backdrop": "static"
      });
    }

    collided = false;
  }

  function handleNewNameConfirm() {
    var input = $("#new-module-name-input");
    var error = false;
    var message;

    // Validate module name
    var res = validateName(input.val());
    if (res === NAME_LENGTH_ERROR) {
      error = true;
      message = modal.find(".module-name-length-error").html();
    } else if (res === NAME_INVALID_CHARACTERS_ERROR) {
      error = true;
      message = modal.find(".module-name-invalid-error").html();
    } else if (res === NAME_WHITESPACES_ERROR) {
      error = true;
      message = modal.find(".module-name-whitespaces-error").html();
    }

    if (error) {
      // Style the form so it displays error
      input.parent().addClass("has-error");
      input.parent().find("span.help-block").remove();
      var errorSpan = document.createElement("span");
      $(errorSpan)
      .addClass("help-block")
      .html(message)
      .appendTo(input.parent());

      return false;
    } else {
      // Set the "clicked" property to true
      modal.data("submit", "true");
      return true;
    }
  }

  var newModuleBtn = $("#canvas-new-module");
  var modal = $("#modal-new-module");

  newModuleBtn.draggable({
    cursor: "move",
    helper: createVirtualModule,
    start: handleDragStart,
    drag: handleDrag,
    stop: handleDragStop
  });

  // Prevent "new module" button from submitting form
  newModuleBtn.click(function(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  });

  // Bind the confirm button on modal
  modal.find("button[data-action='confirm']").on("click", function(event) {
    if (!handleNewNameConfirm()) {
      // Prevent modal from closing if errorous form
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });

  // Also, bind on modal window open & close
  modal.on("show.bs.modal", function(event) {
    // Clear input
    $(this).removeData("submit");
    $(this).find("#new-module-name-input").val("");

    // Remove potential error classes from form
    $(this).find("#new-module-name-input").parent().removeClass("has-error");
    $(this).find("span.help-block").remove();

    // Bind onto input keypress (to prevent form from being submitted)
    $(this).find("#new-module-name-input").keydown(function(ev) {
      if (ev.keyCode == 13) {
        if (handleNewNameConfirm()) {
          // Close modal
          modal.modal("hide");
        }

        // In any case, prevent form submission
        ev.preventDefault();
        ev.stopPropagation();
        return false;
      }
    });
  });

  modal.on("shown.bs.modal", function(event) {
    // Focus the text element
    $(this).find("#new-module-name-input").focus();
  });

  modal.on("hide.bs.modal", function (event) {
    var newModule = $(".module.new");

    $(this).find("#new-module-name-input").off("keydown");

    if (_.isEqual($(event.target).data("submit"), "true")) {
      // If modal was successfully submitted, generate the module
      var id = "n" + newModuleIndex++;
      graph.addNode(id);
      var name = $(this).find("#new-module-name-input").val();
      updateModuleHtml(newModule, id, name, gridDistX, gridDistY);
      newModule.removeClass("new");
    } else {
      // Else, remove the element
      newModule.remove();
    }

    // In any case, enable scrolling on edit screen again
    toggleCanvasEvents(true);
  });
}

function initEditModules() {
  function handleRenameConfirm(modal) {
    var input = modal.find("#edit-module-name-input");

    var moduleId = modal.attr("data-module-id");
    var moduleEl = $("#" + moduleId);

    var error = false;
    var message;
    var newName;

    // Validate module name
    newName = input.val();
    var res = validateName(newName);
    if (res === NAME_LENGTH_ERROR) {
      error = true;
      message = modal.find(".module-name-length-error").html();
    } else if (res === NAME_INVALID_CHARACTERS_ERROR) {
      error = true;
      message = modal.find(".module-name-invalid-error").html();
    } else if (res === NAME_WHITESPACES_ERROR) {
      error = true;
      message = modal.find(".module-name-whitespaces-error").html();
    }

    if (error) {
      // Style the form so it displays error
      input.parent().addClass("has-error");
      input.parent().find("span.help-block").remove();
      var errorSpan = document.createElement("span");
      $(errorSpan)
      .addClass("help-block")
      .html(message)
      .appendTo(input.parent());
    } else {
      // Update the module's name in GUI
      moduleEl.attr("data-module-name", newName);
      moduleEl.find(".panel-heading .panel-title").html(newName);

      // Add this information to form
      var formAddInput = $('#update-canvas form input#add');
      var formAddNameInput = $('#update-canvas form input#add-names');
      var formRenameInput = $("#update-canvas form input#rename");
      var addedIds = formAddInput.attr("value").split(",");
      var existingIndex = _.indexOf(addedIds, moduleEl.attr("id"));
      if (existingIndex === -1) {
        // Actually rename an existing module
        var renameVal = JSON.parse(formRenameInput.attr("value"));
        renameVal[moduleEl.attr("id")] = newName;
        formRenameInput.attr("value", JSON.stringify(renameVal));
      } else {
        // Just rename the add-name entry
        var addedNames = formAddNameInput.attr("value").split(SUBMIT_FORM_NAME_SEPARATOR);
        addedNames[existingIndex] = newName;
        formAddNameInput.attr("value", addedNames.join(SUBMIT_FORM_NAME_SEPARATOR));
      }

      // Hide modal
      modal.modal("hide");
    }
  }

  $("#modal-edit-module")
  .on("show.bs.modal", function (event) {
    var modal = $(this);
    var moduleId = modal.attr("data-module-id");
    var moduleEl = $("#" + moduleId);
    var input = modal.find("#edit-module-name-input");

    // Set the input to the current module's name
    input.attr("value", moduleEl.attr("data-module-name"));
    input.val(moduleEl.attr("data-module-name"));

    // Bind on enter button
    input.keydown(function(ev) {
      if (ev.keyCode == 13) {
        // "Submit" modal
        handleRenameConfirm(modal);

        // In any case, prevent form submission
        ev.preventDefault();
        ev.stopPropagation();
        return false;
      }
    });
  })
  .on("shown.bs.modal", function(event) {
    // Focus the text element
    $(this).find("#edit-module-name-input").focus();
  })
  .on("hide.bs.modal", function (event) {
    // Remove potential error classes
    $(this).find("#edit-module-name-input").parent().removeClass("has-error");
    $(this).find("span.help-block").remove();

    $(this).find("#edit-module-name-input").off("keydown");

    // When hiding modal, re-enable events
    toggleCanvasEvents(true);
  });

  // Bind the confirm button on modal
  $("#modal-edit-module").find("button[data-action='confirm']").on("click", function(event) {
    var modal = $(this).closest(".modal");
    handleRenameConfirm(modal);
  });
}

/**
 * Handler when editing a specific module.
 */
editModuleHandler = function(ev) {
  var modal = $("#modal-edit-module");
  var moduleEl = $(this).closest(".module");

  // Set modal's module id
  modal.attr("data-module-id", moduleEl.attr("id"));

  // Disable dragging & zooming events on canvas temporarily
  toggleCanvasEvents(false);

  // Show modal
  modal.modal("show");

  ev.preventDefault();
  ev.stopPropagation();
  return false;
};

/**
 * Initialize editing of module groups.
 */
function initEditModuleGroups() {
  function handleRenameConfirm(modal) {
    var input = modal.find("#edit-module-group-name-input");

    var moduleId = modal.attr("data-module-id");
    var moduleEl = $("#" + moduleId);

    var error = false;
    var message;
    var newModuleGroupName;

    // Validate module name
    newModuleGroupName = input.val();
    var res = validateName(newModuleGroupName);
    if (res === NAME_LENGTH_ERROR) {
      error = true;
      message = modal.find(".module-name-length-error").html();
    } else if (res === NAME_INVALID_CHARACTERS_ERROR) {
      error = true;
      message = modal.find(".module-name-invalid-error").html();
    } else if (res === NAME_WHITESPACES_ERROR) {
      error = true;
      message = modal.find(".module-name-whitespaces-error").html();
    }

    if (error) {
      // Style the form so it displays error
      input.parent().addClass("has-error");
      input.parent().find("span.help-block").remove();
      var errorSpan = document.createElement("span");
      $(errorSpan)
      .addClass("help-block")
      .html(message)
      .appendTo(input.parent());
    } else {
      // Update the module group name for all modules
      // currently in the module group
      var ids = connectedComponents(graph, moduleEl.attr("id"));
      _.each(ids, function(id) {
        $("#" + id).attr("data-module-group-name", newModuleGroupName);
      });

      // Hide modal
      modal.modal("hide");
    }
  }

  $("#modal-edit-module-group")
  .on("show.bs.modal", function (event) {
    var modal = $(this);
    var moduleId = modal.attr("data-module-id");
    var moduleEl = $("#" + moduleId);
    var input = modal.find("#edit-module-group-name-input");

    // Set the input to the current module's name
    input
    .attr("value", moduleEl.attr("data-module-group-name"));
    input.val(moduleEl.attr("data-module-group-name"));

    // Bind on enter button
    input.keydown(function(ev) {
      if (ev.keyCode == 13) {
        // "Submit" modal
        handleRenameConfirm(modal);

        // In any case, prevent form submission
        ev.preventDefault();
        ev.stopPropagation();
        return false;
      }
    });
  })
  .on("shown.bs.modal", function (event) {
    $(this).find("#edit-module-group-name-input").focus();
  })
  .on("hide.bs.modal", function (event) {
    // Remove potential error classes
    $(this).find("#edit-module-group-name-input").parent().removeClass("has-error");
    $(this).find("span.help-block").remove();

    $(this).find("#edit-module-group-name-input").off("keydown");

    // When hiding modal, re-enable events
    toggleCanvasEvents(true);
  });

  // Bind the confirm button on modal
  $("#modal-edit-module-group").find("button[data-action='confirm']").on("click", function(event) {
    var modal = $(this).closest(".modal");
    handleRenameConfirm(modal);
  });
}

/**
 * Handler when editing a module group.
 */
editModuleGroupHandler = function(ev) {
  var modal = $("#modal-edit-module-group");
  var moduleEl = $(this).closest(".module");

  // Set modal's module id
  modal.attr("data-module-id", moduleEl.attr("id"));

  // Disable dragging & zooming events on canvas temporarily
  toggleCanvasEvents(false);

  // Show modal
  modal.modal("show");

  ev.preventDefault();
  ev.stopPropagation();
  return false;
};

/**
 * Bind the delete module buttons actions.
 */
function bindDeleteModuleAction() {
  // First, bind the delete module handler onto all "delete module" links
  $(".module-options a.delete-module").on("click touchstart", deleteModuleHandler);

  // Then, bind on modal events
  var modal = $("#modal-delete-module");

  // Bind the confirm button on modal
  modal.find("button[data-action='confirm']").on("click", function(event) {
    // Set the "clicked" property to true
    modal.data("submit", "true");
  });

  // Also, bind on modal window open & close
  modal.on("show.bs.modal", function(event) {
    // Remove submit flag
    $(this).removeData("submit");

    // Disable dragging & zooming events on canvas temporarily
    toggleCanvasEvents(false);
  });

  modal.on("hide.bs.modal", function (event) {
    if (_.isEqual($(event.target).data("submit"), "true")) {
      // If modal was successfully submitted, delete the module
      var id = $(event.target).data("module-id");

      deleteModule(id.toString(), true);
    }

    // In any case, re-enable events on canvas
    toggleCanvasEvents(true);
  });
}

function deleteModule(id, linkConnections) {
  var ins = graph.inEdges(id);
  var outs = graph.outEdges(id);
  var tempModuleEl;

  // Remove id from the graph structure, along with all connections
  if (graph.hasNode(id)) {
    graph.removeNode(id);
  }

  // Remove the module <div>, along with all connections
  instance.remove($("#" + id));

  // Connect the sources to destinations
  if (linkConnections) {
    _.each(ins, function(inEdge) {
      _.each(outs, function(outEdge) {
        // Only connect 2 nodes if
        // such a connection doesn't exist already
        if (!graph.hasEdge(inEdge[0], outEdge[1])) {
          graph.addEdge(inEdge[0], outEdge[1]);
          instance.connect({
            source: $("#" + inEdge[0]),
            target: $("#" + outEdge[1])
          });
        }
      });
    });

    //Hide module group options for unconnected modules
    if (outs.length === 0) { // If node is sink
      _.each (ins, function(inEdge) {
        if (graph.degree(inEdge[0]) === 0) {
          tempModuleEl = $("#" + inEdge[0]);
          tempModuleEl.find(".edit-module-group").parents("li").hide();
          tempModuleEl.find(".clone-module-group").parents("li").hide();
          tempModuleEl.find(".delete-module-group").parents("li").hide();
        }
      });
    }
    if (ins.length === 0) { // If node is source
      _.each (outs, function(outEdge) {
        if (graph.degree(outEdge[1]) === 0) {
          tempModuleEl = $("#" + outEdge[1]);
          tempModuleEl.find(".edit-module-group").parents("li").hide();
          tempModuleEl.find(".clone-module-group").parents("li").hide();
          tempModuleEl.find(".delete-module-group").parents("li").hide();
        }
      });
    }
  }

  // Add ID to the form
  var formAddInput = $('#update-canvas form input#add');
  var formAddNamesInput = $('#update-canvas form input#add-names');
  var formClonedInput = $('#update-canvas form input#cloned');
  var formRemoveInput = $('#update-canvas form input#remove');
  var inputVal, newVal;
  var vals, idx;
  var addToRemoveList = true;

  // If the module we are deleting was added via JS
  // (and hasn't been saved yet), we don't need to "add" it
  // neither "remove" it, it simply ceases to exist
  inputVal = formAddInput.attr("value");
  if (!_.isUndefined(inputVal) && inputVal !== "") {
    vals = inputVal.split(",");
    if (_.contains(vals, id)) {
      addToRemoveList = false;
      idx = vals.indexOf(id);
      vals.splice(idx, 1);
      formAddInput.attr("value", vals.join());
      vals = formAddNamesInput.attr("value").split(SUBMIT_FORM_NAME_SEPARATOR);
      vals.splice(idx, 1);
      formAddNamesInput.attr("value", vals.join(SUBMIT_FORM_NAME_SEPARATOR));
    }
  }

  // Okay, the module was not created, but it might be cloned,
  // so we need to check that as well
  if (!addToRemoveList) {
    inputVal = formClonedInput.attr("value");
    if (!_.isUndefined(inputVal) && inputVal !== "") {
      vals = _.map(inputVal.split(";"), function(val) {
        return val.split(",")[1];
      });
      if (_.contains(vals, id)) {
        addToRemoveList = false;

        // Remove the cloned module from the cloned list
        newVal = "";
        _.each(inputVal.split(";"), function(val) {
          if (!_.isEqual(val.split(",")[1], id)) {
            newVal = (newVal === "" ? "" : (newVal + ";")) + val;
          }
        });
        formClonedInput.attr("value", newVal);
      }
    }
  }

  if (addToRemoveList) {
    inputVal = formRemoveInput.attr("value");
    if (_.isUndefined(inputVal) || inputVal === "") {
      formRemoveInput.attr("value", id);
    } else {
      formRemoveInput.attr("value", inputVal + "," + id);
    }
  }
}

/**
 * Handler function when deleting a single module.
 */
deleteModuleHandler  =function() {
  var id = $(this).data("module-id");
  var modal = $("#modal-delete-module");

  var name = $(".module#" + id).data("module-name");
  var template = modal.find("#message-template").text().trim();

  // Set the modal message
  modal.find("#delete-message").text(template.replace("%{module}", name));

  // Send module id to modal
  modal.data("module-id", id);

  // Display delete modal
  modal.modal({
    "backdrop": "static"
  });

  return false;
};

/**
 * Bind the delete module group buttons actions.
 */
function bindDeleteModuleGroupAction() {
  // First, bind the delete module group handler onto all
  // "delete module group" links
  $(".module-options a.delete-module-group").on("click touchstart", deleteModuleGroupHandler);

  // Then, bind on modal events
  var modal = $("#modal-delete-module-group");

  // Bind the confirm button on modal
  modal.find("button[data-action='confirm']").on("click", function(event) {
    // Set the "clicked" property to true
    modal.data("submit", "true");
  });

  // Also, bind on modal window open & close
  modal.on("show.bs.modal", function(event) {
    // Remove submit flag
    $(this).removeData("submit");

    // Disable dragging & zooming events on canvas temporarily
    toggleCanvasEvents(false);
  });

  modal.on("hide.bs.modal", function (event) {
    if (_.isEqual($(event.target).data("submit"), "true")) {
      // If modal was successfully submitted, delete the module
      var id = $(event.target).data("module-id");

      // Find all modules in the connected component
      var modules = connectedComponents(graph, id.toString());

      // Delete all modules of the module group
      _.each(modules, function(moduleId) {
        deleteModule(moduleId, false);
      });
    }

    // In any case, re-enable events on canvas
    toggleCanvasEvents(true);
  });
}

/**
 * Handler function when deleting module group.
 */
deleteModuleGroupHandler = function() {
  var id = $(this).data("module-id");
  var modal = $("#modal-delete-module-group");

  var name = $(".module#" + id).data("module-name");
  var template = modal.find("#message-template").text().trim();

  // Set the modal message
  modal.find("#delete-message").text(template.replace("%{module}", name));

  // Send module id to modal
  modal.data("module-id", id);

  // Display delete modal
  modal.modal({
    "backdrop": "static"
  });

  return false;
};

/**
 * Bind the clone module action.
 * @param element - jQUery selector for the element on which the click action will run.
 * @param modulesSel - The selector string for all modules.
 * @param gridDistX - The grid distance in X direction.
 * @param gridDistY - The grid distance in Y direction.
 */
function bindCloneModuleAction(element, modulesSel, gridDistX, gridDistY) {
  element.on("click touchstart", function(event) {
    cloneModuleHandler($(this).data("module-id"), modulesSel, gridDistX, gridDistY);
    event.preventDefault();
    event.stopPropagation();
    return false;
  });
}

/**
 * Handler function when cloning a single module.
 * @param moduleId - The ID of the original module.
 * @param modulesSel - The selector string for all modules.
 * @param gridDistX - The grid distance in X direction.
 * @param gridDistY - The grid distance in Y direction.
 */
cloneModuleHandler = function(moduleId, modulesSel, gridDistX, gridDistY) {
  var modules = $(modulesSel);
  var module = modules.filter("#" + moduleId);

  // Figure out the free position for the cloned module
  var top = elTop(module);
  var left = elLeft(module);
  var modulesInRow = [];
  _.each(modules, function(m) {
    if (elTop(m) === top) {
      modulesInRow.push(m);
    }
  });
  var i, free;
  while (true) {
    left += gridDistX;
    free = true;
    for (i = 0; i < modulesInRow.length; i++) {
      if (elLeft(modulesInRow[i]) === left) {
        free = false;
        break;
      }
    }

    if (free) {
      break;
    }
  }

  cloneModule(module, gridDistX, gridDistY, left, top);

  // Hide all open dropdowns
  $(".module-options").removeClass("open");
};

/**
 * Clone the original module.
 * @param originalModule - The jQuery original module selector.
 * @param gridDistX - The grid distance in X direction.
 * @param gridDistY - The grid distance in Y direction.
 * @param left - The left position of the new module.
 * @param top - The top position of the new module.
 * @return The new module.
 */
function cloneModule(originalModule, gridDistX, gridDistY, left, top) {
  var moduleId = originalModule.data("module-id");

  // Create new module element
  var id = "n" + newModuleIndex++;
  graph.addNode(id);
  var newModule = createVirtualModule();
  elLeft(newModule, left);
  elTop(newModule, top);
  updateModuleHtml(newModule, id, originalModule.data("module-name"), gridDistX, gridDistY);
  newModule.removeClass("new");

  // Add the cloned module id into the hidden input field
  var formAddInput = $('#update-canvas form input#add');
  var formAddNamesInput = $('#update-canvas form input#add-names');
  var formClonedInput = $('#update-canvas form input#cloned');
  var inputVal, inputNameVal;

  // If we cloned a module with virtual id, there are 2 possibilities:
  // 1. Original module is newly created, which means that our cloned
  // module can also simply be treated as a new module;
  // 2. Original module is a cloned module, which means we want to extend
  // original module's original module into this new module
  var originalId = moduleId;
  var originalWasCloned = false;
  var fillClonedInput = true;

  if (_.isEqual(moduleId.toString().charAt(0), "n")) {
    // Find the original module's "original module", and retrieve its id
    // If such ID cannot be found, original module was not cloned
    fillClonedInput = false;
    inputVal = formClonedInput.attr("value");
    _.each(inputVal.split(";"), function(val) {
      var val2 = val.split(",");
      if (_.isEqual(val2[1], moduleId)) {
        originalId = val2[0];
        fillClonedInput = true;
      }
    });
  }

  if (fillClonedInput) {
    inputVal = formClonedInput.attr("value");
    if (_.isUndefined(inputVal) || inputVal === "") {
      formClonedInput.attr("value", originalId + "," + id);
    } else {
      formClonedInput.attr("value", inputVal + ";" + originalId + "," + id);
    }
  }

  instance.repaintEverything();

  return newModule;
}

/**
 * Bind the clone module group action.
 * @param element - jQUery selector for the element on which the click action will run.
 * @param modulesSel - The selector string for all modules.
 * @param gridDistX - The grid distance in X direction.
 * @param gridDistY - The grid distance in Y direction.
 */
function bindCloneModuleGroupAction(element, modulesSel, gridDistX, gridDistY) {
  element.on("click touchstart", function(event) {
    cloneModuleGroupHandler($(this).data("module-id"), modulesSel, gridDistX, gridDistY);
    event.preventDefault();
    event.stopPropagation();
    return false;
  });
}

/**
 * Handler function when cloning a module group.
 * @param moduleId - The ID of the original module.
 * @param modulesSel - The selector string for all modules.
 * @param gridDistX - The grid distance in X direction.
 * @param gridDistY - The grid distance in Y direction.
 */
cloneModuleGroupHandler = function(moduleId, modulesSel, gridDistX, gridDistY) {
  var modules = $(modulesSel);

  // Retrieve all modules in this module group
  var components = connectedComponents(graph, moduleId.toString());
  var group = _.map(components, function(id) { return $("#" + id); });

  // Calculate the size of the rectangle containing the whole workflow
  var width, height;
  var minX = Number.MAX_VALUE, maxX = -Number.MAX_VALUE;
  var minY = Number.MAX_VALUE, maxY = -Number.MAX_VALUE;

  _.each(group, function(m) {
    var l = elLeft(m);
    var t = elTop(m);
    if (l < minX) { minX = l; }
    if (l > maxX) { maxX = l; }
    if (t < minY) { minY = t; }
    if (t > maxY) { maxY = t; }
  });
  width = maxX - minX + gridDistX;
  height = maxY - minY + gridDistY;

  // Find the appropriate "free space"
  var left = minX != Number.MAX_VALUE ? minX : 0;
  var top = maxY != -Number.MAX_VALUE ? maxY : 0;
  var offset = height;
  var moduleContained;

  while (true) {
    moduleContained = false;
    for (var i = 0; i < modules.length; i++) {
      var module = $(modules[i]);

      // Skip modules from the module group
      if (_.contains(components, module.data("module-id").toString())) {
        continue;
      }

      var ml = elLeft(module);
      var mt = elTop(module);

      if (ml >= left &&
        ml <= left + width - gridDistX &&
        mt >= top + offset &&
        mt <= top + offset + height - gridDistY) {
        moduleContained = true;
        break;
      }
    }

    // If no module contained, exit
    if (!moduleContained) {
      break;
    }

    offset += gridDistY;
  }

  // Alright, clone all modules from the group and
  // move them by the vertical offset
  clones = {};
  _.each(group, function(m) {
    var nm = cloneModule(m, gridDistX, gridDistY, elLeft(m), elTop(m) + height + offset - gridDistY);

    //Show module group options
    nm.find(".edit-module-group").parents("li").show();
    nm.find(".clone-module-group").parents("li").show();
    nm.find(".delete-module-group").parents("li").show();

    clones[m.attr("id")] = nm.attr("id");
  });

  // Also, copy the outbound connections
  _.each(_.keys(clones), function(originalId) {
    var clonedId = clones[originalId];

    _.each(graph.successors(originalId), function(outNode) {
      graph.addEdge(clonedId, clones[outNode]);
      instance.connect({
        source: $("#" + clonedId),
        target: $("#" + clones[outNode])
      });
    });
  });

  // Hide all open dropdowns
  $(".module-options").removeClass("open");

  // Repainting is needed twice (weird, huh)
  instance.repaintEverything();
  instance.repaintEverything();
};

/**
 * Before submission, graph & module group info needs to be
 * copied into hidden input fields via form
 * submission callback.
 * @param gridDistX - The canvas grid distance in X direction.
 * @param gridDistY - The canvas grid distance in Y direction.
 */
function bindEditFormSubmission(gridDistX, gridDistY) {
  $('#update-canvas form').submit(function(){
    var modules = $(".diagram .module");
    var connectionsDiv = $('#update-canvas form input#connections');
    var positionsDiv = $('#update-canvas form input#positions');
    var moduleNamesDiv = $('#update-canvas form input#module-groups');

    // Connections are easy, just copy graph data
    connectionsDiv.attr("value", graph.edges().toString());

    // Positions are a bit more tricky, but still pretty straightforward
    var moduleGroupNames = {};
    var positionsVal = "";
    var module, id, x, y;
    _.each(modules, function(m) {
      module = $(m);
      id = module.attr("id");
      x = elLeft(module) / gridDistX;
      y = elTop(module) / gridDistY;
      positionsVal += id + "," + x + "," + y + ";";
      moduleGroupNames[id] = module.attr("data-module-group-name");
    });
    positionsDiv.attr("value", positionsVal);
    moduleNamesDiv.attr("value", JSON.stringify(moduleGroupNames));

    ignoreUnsavedWorkAlert = true;
    return true;
  });
}

/**
 * Position the modules onto the canvas.
 * @param modulesSel - The jQuery selector text of module elements.
 * @param gridDistX - The X canvas grid distance.
 * @param gridDistY - The Y canvas grid distance.
 */
function positionModules(modulesSel, gridDistX, gridDistY) {
  var modules = $(modulesSel);

  var module, x, y;
  _.each(modules, function(m) {
    module = $(m);
    x = module.data("module-x");
    y = module.data("module-y");
    elLeft(module, x * gridDistX);
    elTop(module, y * gridDistY);
  });
}

/**
 * Add draggable element/s to the jsPlumb instance.
 * @param elements - The elements selector.
 * @param gridDistX - The grid distance in X direction.
 * @param gridDistY - The grid distance in Y direction.
 */
function addDraggablesToInstance(elements, gridDistX, gridDistY) {
  function handleDragStart(event, ui) {
    var draggedModule = $(event.el);

    leftInitial = elLeft(draggedModule);
    topInitial = elTop(draggedModule);
    collided = false;

    draggedModule
    .css("z-index", "25")
    .addClass("dragged");
  }

  function handleDrag(event, ui) {
    var draggedModule = $(event.el);
    var modules = $(".module");

    // Check if collision occured
    var module;
    for (var i = 0; i < modules.length; i++) {
      module = $(modules[i]);
      if (_.isEqual(module, draggedModule)) {
        continue;
      }

      if (_.isEqual(draggedModule.position(), module.position())) {
        // Collision!
        collided = true;
        break;
      } else {
        collided = false;
      }
    }

    if (collided) {
      draggedModule.addClass("collided");
    } else {
      draggedModule.removeClass("collided");
    }
  }

  function handleDragStop(event, ui) {
    var draggedModule = $(event.el);

    draggedModule
    .css("z-index", "20")
    .removeClass("dragged");

    // Reposition element to back where it was
    if (collided) {
      draggedModule.removeClass("collided");
      elLeft(draggedModule, leftInitial);
      elTop(draggedModule, topInitial);
      instance.repaintEverything();
    }

    collided = false;
  }

  instance.draggable(elements, {
    snapThreshold: Math.max(gridDistX, gridDistY),
    grid: [gridDistX, gridDistY],
    start: handleDragStart,
    drag: handleDrag,
    stop: handleDragStop
  });
}

/**
 * Set the specified elements as drop targets in jsPlumb instance.
 * @param elements - The elements to be used as drop targets.
 */
function setElementsAsDropTargets(elements) {
  instance.makeTarget(elements, {
    dropOptions: { hoverClass: "dragHover" },
    anchor: "AutoDefault",
    allowLoopback: false
  });
}

/**
 * Set the specified elements as drag sources in jsPlumb instance.
 * @param elements - The elements to be used as drag sources.
 * @param anchorStyle - Anchor style.
 * @param connectorStyle - Connector style.
 * @param connectorStyle2 - Connector style 2.
 */
function setElementsAsDragSources(elements, anchorStyle, connectorStyle, connectorStyle2) {
  // CSS_STYLE
  var newAnchorStyle = anchorStyle || DEFAULT_ANCHOR_STYLE;
  var newConnectorStyle = connectorStyle || DEFAULT_CONNECTOR_STYLE;
  var newConnectorStyle2 = connectorStyle2 || DEFAULT_CONNECTOR_STYLE_2;

  instance.makeSource(elements, {
    filter: ".ep",
    anchor: newAnchorStyle,
    connector: newConnectorStyle,
    allowLoopback: false,
    connectorStyle: newConnectorStyle2,
  });
}

/**
 * Zooms the specified instance element, while retaining
 * the non-zoomable children.
 * @param zoomableElement - The element to be zoomed.
 * @param zoom - The zoom level (value between 0 and 1).
 * @param origin - The zoom origin, can be null.
 */
function zoomInstance(zoomableElement, zoom, origin) {
  zoomableElement.css("transform", "scale(" + zoom + ")");

  if (!_.isUndefined(origin)) {
    zoomableElement.css("transform-origin", origin);
  }

  instance.setZoom(zoom);

  // Make sure the no-scale elements are kept on original scale:
  var noscale = zoomableElement.find(".no-scale");
  noscale.css("transform", "scale(" + (1.0 / zoom) + ")");
  noscale.css("transform-origin", "0 0");
}

/**
 * Calculates the draggable element's size.
 * @param draggable - The draggable element.
 * @return - An object {width: <width>, height: <height>}.
 */
function calculateDraggableSize(draggable) {
  // Since draggable's width & height is usually 0,
  // we need to calculate its actual width & height
  // by extracting positions of its children (e.g. modules)
  var minX = Number.MAX_VALUE, maxX = -Number.MAX_VALUE;
  var minY = Number.MAX_VALUE, maxY = -Number.MAX_VALUE;
  var child, left, top, right, bottom;
  _.each(draggable.children(), function(c) {
    child = $(c);
    left = elLeft(child);
    top = elTop(child);
    right = left + child.width();
    bottom = top + child.height();
    if (left < minX) { minX = left; }
    if (right > maxX) { maxX = right; }
    if (top < minY) { minY = top; }
    if (bottom > maxY) { maxY = bottom; }
  });
  if (minX === Number.MAX_VALUE) { minX = -1; }
  if (maxX === -Number.MAX_VALUE) { maxX = 1; }
  if (minY === Number.MAX_VALUE) { minY = -1; }
  if (maxY === -Number.MAX_VALUE) { maxY = 1; }

  return { width: maxX - minX, height: maxY - minY };
}

/**
 * Remembers the draggable element's position.
 * @param draggable - The draggable element.
 * @param parent - The parent element to which the draggable element
 * is relative to.
 */
function rememberDraggablePosition(draggable, parent) {
  // Calculate the center of the draggable's parent X & Y
  var centerX = parent.width() / 2 - elLeft(draggable);
  var centerY = parent.height() / 2 - elTop(draggable);

  var draggableSize = calculateDraggableSize(draggable);

  draggableLeft = centerX / draggableSize.width;
  draggableTop = centerY / draggableSize.height;
}

/**
 * Restores the draggable element's position.
 * @param draggable - The draggable element.
 */
function restoreDraggablePosition(draggable, parent) {
  // Calculate the center of the draggable's parent X & Y
  var centerX = parent.width() / 2;
  var centerY = parent.height() / 2;

  var draggableSize = calculateDraggableSize(draggable);

  var left = draggableLeft * draggableSize.width;
  var top = draggableTop * draggableSize.height;

  elLeft(draggable, centerX - left);
  elTop(draggable, centerY - top);
}

/**
 * Initialize the modules group hover animation.
 * @param modules - The modules jQuery selector.
 * @param sidebar - The sidebar jQuery selector.
 */
function initModulesHover(modules, sidebar) {
  function handlerIn() {
    var groupId = $(this).data("module-group");
    var groupModules = modules.filter("[data-module-group='" + groupId + "']");
    var groupMenu = sidebar.find("li[data-module-group='" + groupId + "']");
    groupModules.addClass("group-hover");
    groupMenu.addClass("group-hover");

    var moduleId = $(this).data("module-id");
    if (!_.isUndefined(moduleId)) {
      var currentModule = modules.filter("[data-module-id='" + moduleId + "']");
      var currentMenu = sidebar.find("li[data-module-id='" + moduleId + "']");
      currentModule.addClass("module-hover");
      currentMenu.addClass("module-hover");
    }
  }
  function handlerOut() {
    var groupId = $(this).data("module-group");
    var groupModules = modules.filter("[data-module-group='" + groupId + "']");
    var groupMenu = $("li[data-module-group='" + groupId + "']");
    groupModules.removeClass("group-hover");
    groupMenu.removeClass("group-hover");

    var moduleId = $(this).data("module-id");
    if (!_.isUndefined(moduleId)) {
      var currentModule = modules.filter("[data-module-id='" + moduleId + "']");
      var currentMenu = sidebar.find("li[data-module-id='" + moduleId + "']");
      currentModule.removeClass("module-hover");
      currentMenu.removeClass("module-hover");
    }
  }
  modules.hover(handlerIn, handlerOut);
  sidebar.find("li[data-module-id]").hover(handlerIn, handlerOut);
  sidebar.find("li[data-module-group]").hover(handlerIn, handlerOut);
}

/**
 * Calculates the specified module group size.
 * @param modules - The modules belonging to this module group.
 * @return - An object {width: <width>, height: <height>}.
 */
function calculateModuleGroupSize(modules) {
  var minX = Number.MAX_VALUE, maxX = -Number.MAX_VALUE;
  var minY = Number.MAX_VALUE, maxY = -Number.MAX_VALUE;
  var module, left, top, right, bottom;
  _.each(modules, function(m) {
    module = $(m);
    left = elLeft(module);
    top = elTop(module);
    right = left + module.width();
    bottom = top + module.height();
    if (left < minX) { minX = left; }
    if (right > maxX) { maxX = right; }
    if (top < minY) { minY = top; }
    if (bottom > maxY) { maxY = bottom; }
  });
  if (minX === Number.MAX_VALUE) { minX = -1; }
  if (maxX === -Number.MAX_VALUE) { maxX = 1; }
  if (minY === Number.MAX_VALUE) { minY = -1; }
  if (maxY === -Number.MAX_VALUE) { maxY = 1; }

  return {
    left: minX,
    top: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Initialize the modules & groups click action on sidebar
 * so the modules/groups are then centered in canvas.
 * @param modules - The modules jQuery selector.
 * @param sidebar - The sidebar jQuery selector.
 * @param draggable - The canvas draggable jQuery selector.
 * @param parent - The parent of the draggable element.
 * @param modulePadding - The top-left padding form module display.
 */
function initSidebarClicks(modules, sidebar, draggable, parent, modulePadding) {
  function moduleHandler(event) {
    var moduleId = $(this).closest("li").data("module-id");
    var module = modules.filter("[data-module-id='" + moduleId + "']");
    var centerX = parent.width() / 2;
    var centerY = parent.height() / 2;
    var left = centerX - elLeft(module) - (module.width() / 2);
    var top = centerY - elTop(module) - (module.height() / 2);

    event.preventDefault();
    event.stopPropagation();
    animateReposition(draggable, left, top);
    return false;
  }
  function moduleGroupHandler(event) {
    var groupId = $(this).closest("li").data("module-group");
    var groupModules = modules.filter("[data-module-group='" + groupId + "']");
    var groupSize = calculateModuleGroupSize(groupModules);
    var centerX = parent.width() / 2;
    var centerY = parent.height() / 2;
    var left, top;
    if (groupSize.width > parent.width() || groupSize.height > parent.height()) {
      left = -groupSize.left + modulePadding;
      top = -groupSize.top + modulePadding;
    } else {
      left = centerX - groupSize.left - (groupSize.width / 2);
      top = centerY - groupSize.top - (groupSize.height / 2);
    }

    event.preventDefault();
    event.stopPropagation();
    animateReposition(draggable, left, top);
    return false;
  }
  sidebar.find("li[data-module-id] > span > a.canvas-center-on").click(moduleHandler);
  sidebar.find("li[data-module-group] > span > a.canvas-center-on").click(moduleGroupHandler);
}

/**
 * Initialize the jsPlumb by creating a new jsPlumb instance
 * (overrides the currently set global variable 'instance').
 * @param containerSel - The jQuery selector text of the canvas container.
 * @param containerChildSel - The jQuery selector text of the canvas container child.
 * @param modulesSel - The jQuery selector text of module elements.
 * @param params - Various parameters:
 * @param params.gridDistX - Grid distance between modules in X direction.
 * @param params.gridDistY - Grid distance between modules in Y direction.
 * @param params.modulesDraggable - True if modules are draggable.
 * @param params.connectionsEditable - True if connections can be created/edited/removed.
 * @param params.zoomEnabled - True if zooming in/out is enabled.
 * @param params.zoomMin - The minimum zoom level (0. or greater, 1.0 is no zoom).
 * @param params.zoomMax - The maximum zoom level (0. or greater, 1.0 is no zoom).
 * @param params.zoomDist - The distance to travel towards mouse position on zoom.
 * @param params.scrollEnabled - True if dragging/scrolling of content is enabled.
 * @param params.endpointStyle - jsPlumb endpoint style.
 * @param params.connectionHoverStyle - jsPlumb style.
 * @param params.connectionOverlayStyle - jsPlumb style.
 * @param params.connectionLabelStyle - jsPlumb style.
 * @param params.anchorStyle - jsPlumb anchor style.
 * @param params.connectorStyle - jsPlumb endpoint style.
 * @param params.connectorStyle2 - jsPlumb endpoint style.
 */
function initJsPlumb(containerSel, containerChildSel, modulesSel, params) {
  // Functions used for scrolling
  function mouseUp(event) {
    container.off("mousemove touchmove");
  }
  function mouseDown(event) {
    var source = $(event.target);
    if (!$(modulesSel).is(source) &&
        $(modulesSel).has(source).length === 0 &&
        source.is($(container))) {
      // Only do drag & drop if it doesn't
      // origin from module element
      drag_type = DRAG_INVALID;
      if (event.type == "mousedown" && (event.which || event.button) == 1) {
        drag_type = DRAG_MOUSE;
      } else if (event.type == "touchstart" && event.originalEvent.touches.length == 1) {
        drag_type = DRAG_TOUCH;
      }
      if (drag_type > 0) {
        event.preventDefault();
        event.stopPropagation();
        x_start = calcOffsetX(event);
        y_start = calcOffsetY(event);
        container.on("mousemove touchmove", moveDiagram);
      }
    }
    function moveDiagram(event, x_offset, y_offset) {
      // This function is invoked on mousemove
      var x_pos = 0, y_pos = 0, x_el = 0, y_el = 0;
      event.preventDefault();
      event.stopPropagation();
      x_el = draggable.offset().left - draggable.parent().offset().left;
      y_el = draggable.offset().top - draggable.parent().offset().top;
      // Scale offset for X
      // (otherwise, this function only works on scale = 1.0)
      x_so = draggable.parent().width() / 2 * (1 - instance.getZoom());
      x_pos = x_el - x_so + (calcOffsetX(event) - x_start);
      y_pos = y_el + (calcOffsetY(event) - y_start);
      x_start = calcOffsetX(event);
      y_start = calcOffsetY(event);
      if (draggable !== null) {
        elLeft(draggable, x_pos);
        elTop(draggable, y_pos);
      }
    }
  }
  // This needs to be here due to Firefox
  function calcOffsetX(e) {
    return (drag_type == DRAG_TOUCH ?
        (e.originalEvent.touches[0].offsetX || e.originalEvent.touches[0].pageX) :
        (e.offsetX || e.pageX)
      ) - $(e.target).offset().left;
  }
  function calcOffsetY(e) {
    return (drag_type == DRAG_TOUCH ?
        (e.originalEvent.touches[0].offsetY || e.originalEvent.touches[0].pageY) :
        (e.offsetY || e.pageY)
      ) - $(e.target).offset().top;
  }

  // Default parameter values
  var params2 = params ? params : {};
  var gridDistX = params2.gridDistX || 350;
  var gridDistY = params2.gridDistY || 350;
  var modulesDraggable = params2.modulesDraggable || false;
  var connectionsEditable = params2.connectionsEditable || false;
  var zoomEnabled = params2.zoomEnabled || false;
  var zoomMin = params2.zoomMin || 0.3;
  var zoomMax = params2.zoomMax || 1.0;
  var zoomDist = params2.zoomDist || 150;
  var scrollEnabled = params2.scrollEnabled || true;

  // CSS_STYLE
  var endpointStyle = params2.endpointStyle || DEFAULT_ENDPOINT_STYLE;
  var connectionHoverStyle = params2.connectionHoverStyle || DEFAULT_CONNECTION_HOVER_STYLE;
  var connectionOverlayStyle = params2.connectionOverlayStyle || DEFAULT_CONNECTION_OVERLAY_STYLE;
  var connectionLabelStyle = params2.connectionLabelStyle || DEFAULT_CONNECTION_LABEL_STYLE;
  var anchorStyle = params2.anchorStyle || null;
  var connectorStyle = params2.connectorStyle || null;
  var connectorStyle2 = params2.connectorStyle2 || null;

  // End of parameters block

  var container = $(containerSel);
  var containerChild = $(containerChildSel);

  // Script for multitouch events
  hammertime = new Hammer(document.getElementById("canvas-container"));
  hammertime.get('pinch').set({ enable: true });


  function hammerZoom (event) {
    zoom = instance.getZoom() * event.scale;
    if (zoom < zoomMin)
      zoom = zoomMin;
    else if (zoom > zoomMax)
      zoom = zoomMax;
    zoomInstance(containerChild, zoom);
  }

  // Setup some styling defaults for jsPlumb
  instance = jsPlumb.getInstance({
    Endpoint: endpointStyle,
    ConnectionOverlays: [ connectionOverlayStyle ],
    Container: containerChild
  });

  window.jsp = instance;
  var modules = $(modulesSel);
  var jsp_modules = jsPlumb.getSelector(modulesSel);
  draggable = $(containerChildSel);

  if (modulesDraggable) {
    // Initialize draggable elements
    addDraggablesToInstance(jsp_modules, gridDistX, gridDistY);
  }

  if (connectionsEditable) {
    // Prevent a connection to be made if it already exists between 2 modules
    instance.bind("beforeDrop", function(info) {
      var newConnection = info.connection;
      var allConnections = instance.getAllConnections();
      var conn;
      for (var i = 0; i < allConnections.length; i++) {
        conn = allConnections[i];
        if (_.isEqual(conn.source, newConnection.source) &&
          _.isEqual(conn.target, newConnection.target)) {
          return false;
        }
      }

      // Now, check if we created a cycle
      var srcNode = $(newConnection.source).attr("id");
      var targetNode = $(newConnection.target).attr("id");
      graph.addEdge(srcNode, targetNode);
      if (!jsnx.isDirectedAcyclicGraph(graph)) {
        graph.removeEdge(srcNode, targetNode);
        return false;
      }

      var srcModuleEl = $("#" + srcNode);
      var targetModuleEl = $("#" + targetNode);

      //Modules should belong to module group now
      //Show module group options for target and source

      srcModuleEl.find(".edit-module-group").parents("li").show();
      srcModuleEl.find(".clone-module-group").parents("li").show();
      srcModuleEl.find(".delete-module-group").parents("li").show();

      targetModuleEl.find(".edit-module-group").parents("li").show();
      targetModuleEl.find(".clone-module-group").parents("li").show();
      targetModuleEl.find(".delete-module-group").parents("li").show();
      return true;
    });

    // Bind a connection listener. Note that the parameter passed to this function contains more than
    // just the new connection - see the documentation for a full list of what is included in 'info'.
    // this listener sets the connection's internal
    // id as the label overlay's text.
    instance.bind("connection", function (info) {
    });

    // Bind a click listener to each connection
    instance.bind("click", function (c) {
      // Remove the edge from our graph data structure
      graph.removeEdge(c.sourceId, c.targetId);

      // Remove edge from GUI
      instance.detach(c);

      // Hide module group options if source or target module
      // is not part of a module group anymore

      var srcModuleEl = $("#" + c.sourceId);
      var targetModuleEl = $("#" + c.targetId);
      //First source
      if (graph.degree(c.sourceId) === 0) {
        srcModuleEl.find(".edit-module-group").parents("li").hide();
        srcModuleEl.find(".clone-module-group").parents("li").hide();
        srcModuleEl.find(".delete-module-group").parents("li").hide();
      }
      if (graph.degree(c.targetId) === 0) {
        targetModuleEl.find(".edit-module-group").parents("li").hide();
        targetModuleEl.find(".clone-module-group").parents("li").hide();
        targetModuleEl.find(".delete-module-group").parents("li").hide();
      }
    });
  }

  // Suspend drawing and initialize
  if (modules.length > 0) {
    instance.batch(function () {
      // Set elements as connection sources
      setElementsAsDragSources(jsp_modules, anchorStyle, connectorStyle, connectorStyle2);

      // Initialise all elements as connection targets
      setElementsAsDropTargets(jsp_modules);

      // Initialize module connections
      var module, outs;
      _.each(modules, function(m) {
        module = $(m);
        outs = graph.successors(module.attr("id"));
        _.each(outs, function(out) {
          instance.connect({source: module.attr("id"), target: out });
        });
      });
    });
  }

  // Enable/disable connection endpoints
  _.each(instance.getAllConnections(), function(conn) {
    conn.endpoints[0].setEnabled(connectionsEditable);
    conn.endpoints[1].setEnabled(connectionsEditable);
  });

  // Update style on existing connections
  if (connectionsEditable) {
    _.each(instance.getAllConnections(), function(conn) {
      conn.setHoverPaintStyle(connectionHoverStyle);
      conn.setLabel(connectionLabelStyle);
    });
  }

  // Make sure the new connections will have same style
  if (connectionsEditable) {
    instance.importDefaults({
      HoverPaintStyle: connectionHoverStyle,
      ConnectionOverlays: [
        connectionOverlayStyle,
        [ "Label", connectionLabelStyle ]
      ]
    });
  } else {
    instance.importDefaults({
      HoverPaintStyle: connectionHoverStyle,
      ConnectionOverlays: [ connectionOverlayStyle ]
    });
  }

  // Enable / disable instance configs
  if (modules.length > 0) {
    instance.setDraggable(jsp_modules, modulesDraggable);
    instance.setSourceEnabled(jsp_modules, connectionsEditable);
    instance.setTargetEnabled(jsp_modules, connectionsEditable);
  }

  // Bind the mouse scroll event to scaling
  if (zoomEnabled) {
    container.mousewheel(function(event) {
      zoom = instance.getZoom() + (event.deltaY / 20);
      if (zoom < zoomMin || zoom > zoomMax) {
        return;
      }
      zoomInstance(containerChild, zoom);
    });

    hammertime.on('pinch', hammerZoom);
  }

  if (scrollEnabled) {
    // Make the jsPlumb container movable/draggable for "google maps" effect
    container.on("mousedown touchstart", mouseDown);
    container.on("mouseup mouseout touchend", mouseUp);
  }

  // If this is not triggered, dropdown in edit mode
  // don't work on Firefox prior to zooming the canvas
  zoomInstance(containerChild, 1.0);

  jsPlumb.fire("jsPlumbLoaded", instance);
}

// Initialize first-time tutorial
function initializeTutorial() {
  if (showTutorial()) {
    var currentStep = Cookies.get('current_tutorial_step');
    if (currentStep == '5' || currentStep == '6') {
      var sidebarTutorial = $("#canvas-container").attr("data-sidebar-step-text");
      Cookies.set('current_tutorial_step', '6');

      introJs()
        .setOptions({
          steps: [{
            element: document.querySelector("li.leaf[data-module-id='" + tutorialData[0].qpcr_module + "']"),
            intro: sidebarTutorial,
            position: 'right'
          }],
          overlayOpacity: '0.2',
          doneLabel: 'End tutorial',
          showBullets: false,
          showStepNumbers: false,
          tooltipClass: 'custom disabled-next'
        })
        .start();
    }
    else if (currentStep == '3' || currentStep == '4') {
      Cookies.set('current_tutorial_step', '4');
      introJs()
        .setOptions({
          overlayOpacity: '0.2',
          doneLabel: 'End tutorial',
          showBullets: false,
          showStepNumbers: false,
          tooltipClass: 'custom disabled-next'
        })
        .start();

      $(".introjs-overlay").addClass("introjs-no-overlay");
      var top = $('#canvas-container').position().top +  $('#canvas-container').height()/3;
      $(".introjs-tooltipReferenceLayer").css({
        top: top + 'px'
      });
    }

    // Destroy first-time tutorial cookies when skip tutorial
    // or end tutorial is clicked
    $(".introjs-skipbutton").each(function (){
      $(this).click(function (){
        Cookies.remove('tutorial_data');
        Cookies.remove('current_tutorial_step');
      });
    });
  }
}

function showTutorial() {
  if (Cookies.get('tutorial_data'))
    tutorialData = JSON.parse(Cookies.get('tutorial_data'));
  else
    return false;
  var tutorialProjectId = tutorialData[0].project;
  var currentProjectId = $("#canvas-container").attr("data-project-id");
  return tutorialProjectId == currentProjectId;
}
