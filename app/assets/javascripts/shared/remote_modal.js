/* global animateSpinner */
(function() {
  'use strict';

  function initRemoteModalListeners() {
    $(document).on('click', 'a[data-action="remote-modal"]', function(ev) {
      ev.stopImmediatePropagation();
      ev.stopPropagation();
      ev.preventDefault();

      animateSpinner();
      $.get(ev.currentTarget.getAttribute('href')).then(function({ modal }) {
        $(modal)
          .on('shown.bs.modal', function() {
            if ($(this).hasClass('project-assignments-modal')) {
              $(this).on('ajax:success', 'form', function() {
                ProjectsIndex.loadCardsView();
              });
            }
            $(this).find('.selectpicker').selectpicker();
          })
          .on('hidden.bs.modal', function() {
            $(this).remove();
          })
          .modal('show');
        animateSpinner(null, false);
      });
    });
  }

  $(document).one('turbolinks:load', initRemoteModalListeners);
}());
