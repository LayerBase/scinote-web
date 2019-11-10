/* global GLOBAL_CONSTANTS  I18n */
/* eslint-disable no-unused-vars */
var RepositoryListColumnType = (function() {
  var manageModal = '#manageRepositoryColumn';

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  function textToItems(text, delimiter) {
    var res = [];
    var usedDelimiter = '';
    var definedDelimiters = {
      return: '\n',
      comma: ',',
      semicolon: ';',
      space: ' '
    };

    var delimiters = [];
    if (delimiter === 'auto') {
      delimiters = ['\n', ',', ';', ' '];
    } else {
      delimiters.push(definedDelimiters[delimiter]);
    }

    $.each(delimiters, (index, currentDelimiter) => {
      res = text.trim().split(currentDelimiter);
      usedDelimiter = Object
        .keys(definedDelimiters)
        .find(key => definedDelimiters[key] === currentDelimiter);

      if (res.length > 1) {
        return false;
      }
      return true;
    });

    res = res.filter(Boolean).filter(onlyUnique);

    $.each(res, (index, option) => {
      res[index] = option.slice(0, GLOBAL_CONSTANTS.NAME_MAX_LENGTH);
    });

    $('select#delimiter').attr('data-used-delimiter', usedDelimiter);
    return res;
  }

  function pluralizeWord(count, noun, suffix = 's') {
    return `${noun}${count !== 1 ? suffix : ''}`;
  }


  function drawDropdownPreview(items) {
    var $manageModal = $(manageModal);
    var $dropdownPreview = $manageModal.find('.dropdown-preview select');
    $('option', $dropdownPreview).remove();
    $.each(items, function(i, item) {
      $dropdownPreview.append($('<option>', {
        value: item,
        text: item
      }));
    });

    if (items.length === 0) {
      $dropdownPreview.append($('<option>', {
        value: '',
        text: I18n.t('libraries.manange_modal_column.list_type.dropdown_item_select_option')
      }));
    }
  }

  function refreshCounter(number) {
    var $manageModal = $(manageModal);
    $manageModal.find('.list-items-count').html(number);
    $manageModal.find('.list-items-count').attr('data-count', number);

    if (number >= GLOBAL_CONSTANTS.REPOSITORY_LIST_ITEMS_PER_COLUMN) {
      $manageModal.find('.limit-counter-container').addClass('error-to-many-items');
      $manageModal.find('button[data-action="save"]').addClass('disabled');
    } else {
      $manageModal.find('.limit-counter-container').removeClass('error-to-many-items');
      $manageModal.find('button[data-action="save"]').removeClass('disabled');
    }
  }

  function refreshPreviewDropdownList() {
    var listItemsTextarea = '[data-column-type="RepositoryListValue"] #list-items-textarea';
    var dropdownDelimiter = 'select#delimiter';

    var items = textToItems($(listItemsTextarea).val(), $(dropdownDelimiter).val());
    var hashItems = [];
    drawDropdownPreview(items);
    refreshCounter(items.length);

    $.each(items, (index, option) => {
      hashItems.push({ data: option });
    });

    $('#dropdown_options').val(JSON.stringify(hashItems));
    $('.limit-counter-container .items-label').html(pluralizeWord(items.length, 'item'));
  }

  function initDropdownItemsTextArea() {
    var $manageModal = $(manageModal);
    var listItemsTextarea = '[data-column-type="RepositoryListValue"] #list-items-textarea';
    var dropdownDelimiter = 'select#delimiter';
    var columnNameInput = 'input#repository-column-name';

    $manageModal.off('change keyup paste', listItemsTextarea).on('change keyup paste', listItemsTextarea, function() {
      refreshPreviewDropdownList();
    });

    $manageModal.off('change', dropdownDelimiter).on('change', dropdownDelimiter, function() {
      refreshPreviewDropdownList();
    });

    $manageModal.off('columnModal::partialLoadedForLists').on('columnModal::partialLoadedForLists', function() {
      refreshPreviewDropdownList();
    });

    $manageModal.off('keyup change', columnNameInput).on('keyup change', columnNameInput, function() {
      $manageModal.find('.preview-label').html($manageModal.find(columnNameInput).val());
    });
  }

  return {
    init: () => {
      initDropdownItemsTextArea();
    },
    checkValidation: () => {
      var $manageModal = $(manageModal);
      var count = $manageModal.find('.list-items-count').attr('data-count');
      return count < GLOBAL_CONSTANTS.REPOSITORY_LIST_ITEMS_PER_COLUMN;
    }
  };
}());
