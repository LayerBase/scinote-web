/* global dropdownSelector I18n */

var DataTableHelpers = (function() {
  return {
    initLengthApearance: function(dataTableWraper) {
      var tableLengthSelect = $(dataTableWraper).find('.dataTables_length select');
      if (tableLengthSelect.val() == null) {
        tableLengthSelect.val(10).change();
      }
      $.each(tableLengthSelect.find('option'), (i, option) => {
        option.innerHTML = I18n.t('repositories.index.show_per_page', { number: option.value });
      });
      $(dataTableWraper).find('.dataTables_length')
        .append(tableLengthSelect).find('label')
        .remove();
      dropdownSelector.init(tableLengthSelect, {
        noEmptyOption: true,
        singleSelect: true,
        closeOnSelect: true,
        disableSearch: true,
        selectAppearance: 'simple'
      });
    },

    initSearchField: function(dataTableWraper) {
      var tableFilterInput = $(dataTableWraper).find('.dataTables_filter input');
      tableFilterInput.attr('placeholder', I18n.t('repositories.index.filter_inventory'))
        .addClass('sci-input-field')
        .css('margin', 0);
      $('.dataTables_filter').append(`
          <div class="sci-input-container left-icon">
            <i class="fas fa-search"></i>
          </div>`).find('.sci-input-container').prepend(tableFilterInput);
      $('.dataTables_filter').find('label').remove();
    }
  };
}());

class DataTableCheckboxes {

  /* config = {
    checkboxSelector: selector for checkboxes,
    selectAllSelector: selector for select all checkbox
  }*/

  constructor(tableWrapper, config) {
    this.selectedRows = [];
    this.tableWrapper = $(tableWrapper);
    this.config = config;

    this.#initCheckboxes();
    this.#initSelectAllCheckbox();
  }

  checkRowStatus = (row) => {
    var checkbox = $(row).find(this.config.checkboxSelector);
    if (this.selectedRows.includes(row.id)) {
      $(row).addClass('selected');
      checkbox.attr('checked', true);
    } else {
      $(row).removeClass('selected');
      checkbox.attr('checked', false);
    }
  }

  checkSelectAllStatus = () => {
    var checkboxes = this.tableWrapper.find(this.config.checkboxSelector);
    var selectedCheckboxes = this.tableWrapper.find(this.config.checkboxSelector + ':checked');
    var selectAllCheckbox = this.tableWrapper.find(this.config.selectAllSelector);
    selectAllCheckbox.prop('indeterminate', false);
    if (selectedCheckboxes.length === 0) {
      selectAllCheckbox.prop('checked', false);
    } else if (selectedCheckboxes.length === checkboxes.length) {
      selectAllCheckbox.prop('checked', true);
    } else {
      selectAllCheckbox.prop('indeterminate', true);
    }
  }

  clearSelection = () => {
    var rows = this.tableWrapper.find('tbody tr');
    this.selectedRows = [];
    $.each(rows, (i, row) => {
      $(row).removeClass('selected');
      $(row).find(this.config.checkboxSelector).attr('checked', false);
    });
    this.checkSelectAllStatus();
  }

  // private methods

  #initCheckboxes = () => {
    this.tableWrapper.on('click', '.table tbody tr', (e) => {
      var checkbox = $(e.currentTarget).find(this.config.checkboxSelector);
      checkbox.prop('checked', !checkbox.prop('checked'));
      this.#selectRow(e.currentTarget);
    }).on('click', this.config.checkboxSelector, (e) => {
      this.#selectRow($(e.currentTarget).closest('tr')[0]);
      e.stopPropagation();
    });
  }

  #selectRow = (row) => {
    var id = row.id;
    if (this.selectedRows.includes(id)) {
      this.selectedRows.splice(this.selectedRows.indexOf(id), 1);
    } else {
      this.selectedRows.push(id);
    }
    $(row).toggleClass('selected');
    this.checkSelectAllStatus();

    if (this.config.onChanged) this.config.onChanged();
  }

  #initSelectAllCheckbox = () => {
    this.tableWrapper.on('click', this.config.selectAllSelector, (e) => {
      var selectAllCheckbox = $(e.currentTarget);
      var rows = this.tableWrapper.find('tbody tr');
      $.each(rows, (i, row) => {
        var checkbox = $(row).find(this.config.checkboxSelector);
        if (checkbox.prop('checked') === selectAllCheckbox.prop('checked')) return;

        checkbox.prop('checked', !checkbox.prop('checked'));
        this.#selectRow(row);
      });
    });
  }
}
