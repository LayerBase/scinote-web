
/* global _ hljs tinyMCE SmartAnnotation MarvinJsEditor FilePreviewModal */

/* global _  I18n */

/* eslint-disable no-unused-vars */

var TinyMCE = (function() {
  'use strict';

  function initHighlightjs() {
    $('[class*=language]').each(function(i, block) {
      hljs.highlightBlock(block);
    });
  }

  function initHighlightjsIframe(iframe) {
    $('[class*=language]', iframe).each(function(i, block) {
      hljs.highlightBlock(block);
    });
  }


  function initImageToolBar(editor) {
    var editorForm = $(editor.getContainer()).closest('form');
    var editorContainer = $(editor.getContainer());
    var menuBar = editorForm.find('.mce-menubar.mce-toolbar.mce-first .mce-flow-layout');
    var editorToolbar = editorForm.find('.mce-top-part');
    var editorIframe = $('#' + editor.id).prev().find('.mce-edit-area iframe');
    $('<div class="tinymce-active-object-handler" style="display:none">'
                + '<a class="file-download-link tool-button" href="#" data-turbolinks="false"><i class="mce-ico mce-i-donwload"></i></a>'
                + '<span class="file-edit-link tool-button" href="#" data-turbolinks="false"><i class="mce-ico mce-i-pencil"></i></span>'
                + '<span class="file-image-editor-link tool-button" href="#" data-turbolinks="false"><i class="mce-ico mce-i-image"></i></span>'
              + '</div>').appendTo(editorToolbar.find('.mce-stack-layout'));
    editorIframe.contents().click(function() {
      var marvinJsEdit;
      setTimeout(() => {
        var image = editorIframe.contents().find('img[data-mce-selected="1"]');
        var editLink;
        var imageEditorLink;
        if (image.length > 0) {
          image.on('load', function() {
            editor.fire('Dirty');
          });
          editorContainer.find('.tinymce-active-object-handler').css('display', 'block');
          editorContainer.find('.tinymce-active-object-handler .file-download-link')
            .attr('href', image[0].src)
            .attr('download', 'tinymce-image');

          // Edit link
          editLink = editorContainer.find('.tinymce-active-object-handler .file-edit-link');
          if (image[0].dataset.sourceId) {
            editLink.css('display', 'inline-block');
            marvinJsEdit = (image[0].dataset.sourceType === 'MarvinJsAsset' && typeof (MarvinJsEditor) !== 'undefined');
            if (!marvinJsEdit) editLink.css('display', 'none');
            editLink.on('click', function() {
              if (marvinJsEdit) {
                MarvinJsEditor().open({
                  mode: 'edit-tinymce',
                  marvinUrl: '/marvin_js_assets/' + image[0].dataset.sourceId,
                  image: image
                });
              }
            });
          } else {
            editLink.css('display', 'none');
            editLink.off('click');
          }

          // imaged editor Link
          imageEditorLink = editorContainer.find('.tinymce-active-object-handler .file-image-editor-link');
          if (image[0].dataset.mceToken && image[0].dataset.sourceId) {
            imageEditorLink.css('display', 'inline-block');
            imageEditorLink.on('click', function() {
              FilePreviewModal.imageEditor({
                'download-url': image[0].src,
                filename: 'tinymce-image.jpg',
                mode: 'tinymce',
                url: '/tiny_mce_assets/' + image[0].dataset.mceToken,
                quality: 100,
                'mime-type': 'image/jpeg',
                image: image[0]
              });
            });
          } else {
            imageEditorLink.css('display', 'none');
            imageEditorLink.off('click');
          }
        } else {
          editorContainer.find('.tinymce-active-object-handler').css('display', 'none');
        }
      }, 100);
    });
  }

  // returns a public API for TinyMCE editor
  return Object.freeze({
    init: function(selector, onSaveCallback) {
      var tinyMceContainer;
      var tinyMceInitSize;
      var plugins;
      if (typeof tinyMCE !== 'undefined') {
        // Hide element containing HTML view of RTE field
        tinyMceContainer = $(selector).closest('form').find('.tinymce-view');
        tinyMceInitSize = tinyMceContainer.height();
        $(selector).closest('.form-group')
          .before('<div class="tinymce-placeholder" style="height:' + tinyMceInitSize + 'px"></div>');
        tinyMceContainer.addClass('hidden');
        plugins = 'autosave autoresize customimageuploader link advlist codesample autolink lists charmap hr anchor searchreplace wordcount visualblocks visualchars insertdatetime nonbreaking save directionality paste textcolor colorpicker textpattern placeholder';
        if (typeof (MarvinJsEditor) !== 'undefined') plugins += ' marvinjsplugin';
        tinyMCE.init({
          cache_suffix: '?v=4.9.3', // This suffix should be changed any time library is updated
          selector: selector,
          menubar: 'file edit view insert format',
          toolbar: 'undo redo restoredraft | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link | forecolor backcolor | customimageuploader marvinjsplugin | codesample',
          plugins: plugins,
          autoresize_bottom_margin: 20,

          codesample_languages: [
            { text: 'R', value: 'r' },
            { text: 'MATLAB', value: 'matlab' },
            { text: 'Python', value: 'python' },
            { text: 'JSON', value: 'javascript' },
            { text: 'HTML/XML', value: 'markup' },
            { text: 'JavaScript', value: 'javascript' },
            { text: 'CSS', value: 'css' },
            { text: 'PHP', value: 'php' },
            { text: 'Ruby', value: 'ruby' },
            { text: 'Java', value: 'java' },
            { text: 'C', value: 'c' },
            { text: 'C#', value: 'csharp' },
            { text: 'C++', value: 'cpp' }
          ],
          browser_spellcheck: true,
          branding: false,
          fixed_toolbar_container: '#mytoolbar',
          autosave_interval: '15s',
          autosave_retention: '1440m',
          removed_menuitems: 'newdocument',
          object_resizing: true,
          elementpath: false,
          forced_root_block: false,
          default_link_target: '_blank',
          target_list: [
            { title: 'New page', value: '_blank' },
            { title: 'Same page', value: '_self' }
          ],
          style_formats: [
            {
              title: 'Headers',
              items: [
                { title: 'Header 1', format: 'h1' },
                { title: 'Header 2', format: 'h2' },
                { title: 'Header 3', format: 'h3' },
                { title: 'Header 4', format: 'h4' },
                { title: 'Header 5', format: 'h5' },
                { title: 'Header 6', format: 'h6' }
              ]
            },
            {
              title: 'Inline',
              items: [
                { title: 'Bold', icon: 'bold', format: 'bold' },
                { title: 'Italic', icon: 'italic', format: 'italic' },
                { title: 'Underline', icon: 'underline', format: 'underline' },
                { title: 'Strikethrough', icon: 'strikethrough', format: 'strikethrough' },
                { title: 'Superscript', icon: 'superscript', format: 'superscript' },
                { title: 'Subscript', icon: 'subscript', format: 'subscript' },
                { title: 'Code', icon: 'code', format: 'code' }
              ]
            },
            {
              title: 'Blocks',
              items: [
                { title: 'Paragraph', format: 'p' },
                { title: 'Blockquote', format: 'blockquote' }
              ]
            },
            {
              title: 'Alignment',
              items: [
                { title: 'Left', icon: 'alignleft', format: 'alignleft' },
                { title: 'Center', icon: 'aligncenter', format: 'aligncenter' },
                { title: 'Right', icon: 'alignright', format: 'alignright' },
                { title: 'Justify', icon: 'alignjustify', format: 'alignjustify' }
              ]
            }
          ],
          init_instance_callback: function(editor) {
            var editorForm = $(editor.getContainer()).closest('form');
            var editorContainer = $(editor.getContainer());
            var menuBar = editorForm.find('.mce-menubar.mce-toolbar.mce-first .mce-flow-layout');
            var editorToolbar = editorForm.find('.mce-top-part');

            var editorToolbaroffset
            var editorIframe = $('#' + editor.id).prev().find('.mce-edit-area iframe');

            var editorToolbaroffset;


            $('.tinymce-placeholder').css('height', $(editor.editorContainer).height() + 'px');
            setTimeout(() => {
              $(editor.editorContainer).addClass('show');
              $('.tinymce-placeholder').remove();
            }, 400);

            // Init saved status label
            if (editor.getContent() !== '') {
              editorForm.find('.tinymce-status-badge').removeClass('hidden');
            }

            if ($('.navbar-secondary').length) {
              editorToolbaroffset = $('.navbar-secondary').position().top + $('.navbar-secondary').height();
            } else if ($('#main-nav').length) {
              editorToolbaroffset = $('#main-nav').height();
            } else {
              editorToolbaroffset = 0;
            }

            if (globalConstants.is_safari) {
              editorToolbar.css('position', '-webkit-sticky');
            } else {
              editorToolbar.css('position', 'sticky');
            }
            editorToolbar.css('top', editorToolbaroffset + 'px');

            // Init image toolbar
            initImageToolBar(editor);

            // Update scroll position after exit
            function updateScrollPosition() {
              if (editorForm.offset().top < $(window).scrollTop()) {
                $(window).scrollTop(editorForm.offset().top - 150);
              }
            }

            // Init Save button
            editorForm
              .find('.tinymce-save-button')
              .clone()
              .appendTo(menuBar)
              .on('click', function(event) {
                event.preventDefault();
                editorForm.clearFormErrors();
                editor.setProgressState(1);
                editor.save();
                editorForm.submit();
                updateScrollPosition();
              });

            // After save action
            editorForm
              .on('ajax:success', function(ev, data) {
                editor.save();
                editor.setProgressState(0);
                editorForm.find('.tinymce-status-badge').removeClass('hidden');
                editor.remove();
                editorForm.find('.tinymce-view').html(data.html).removeClass('hidden');
                if (onSaveCallback) { onSaveCallback(); }
              }).on('ajax:error', function(ev, data) {
                var model = editor.getElement().dataset.objectType;
                $(this).renderFormErrors(model, data.responseJSON);
                editor.setProgressState(0);
              });

            // Init Cancel button
            editorForm
              .find('.tinymce-cancel-button')
              .clone()
              .appendTo(menuBar)
              .on('click', function(event) {
                event.preventDefault();
                if (editor.isDirty()) {
                  editor.setContent($(selector).val());
                }
                editorForm.find('.tinymce-status-badge').addClass('hidden');
                editorForm.find('.tinymce-view').removeClass('hidden');
                editor.remove();
                updateScrollPosition();
              })
              .removeClass('hidden');

            // Set cursor to the end of the content
            editor.focus();
            editor.selection.select(editor.getBody(), true);
            editor.selection.collapse(false);

            SmartAnnotation.init($(editor.contentDocument.activeElement));
            SmartAnnotation.preventPropagation('.atwho-user-popover');
            initHighlightjsIframe($(this.iframeElement).contents());
          },
          setup: function(editor) {
            editor.on('keydown', function(e) {
              if (e.keyCode === 13 && $(editor.contentDocument.activeElement).atwho('isSelecting')) {
                return false;
              }
              return true;
            });

            editor.on('NodeChange', function(e) {
              var node = e.element;
              setTimeout(function() {
                if ($(node).is('pre') && !editor.isHidden()) {
                  initHighlightjsIframe($(editor.iframeElement).contents());
                }
              }, 200);
            });

            editor.on('Dirty', function() {
              var editorForm = $(editor.getContainer()).closest('form');
              editorForm.find('.tinymce-status-badge').addClass('hidden');
              $(editor.getContainer())
                .find('.tinymce-save-button').removeClass('hidden');
            });

            editor.on('remove', function() {
              var menuBar = $(editor.getContainer()).find('.mce-menubar.mce-toolbar.mce-first .mce-flow-layout');
              menuBar.find('.tinymce-save-button').remove();
              menuBar.find('.tinymce-cancel-button').remove();
            });
          },
          codesample_content_css: $(selector).data('highlightjs-path')
        });
      }
    },
    destroyAll: function() {
      _.each(tinyMCE.editors, function(editor) {
        if (editor) {
          editor.remove();
          initHighlightjs();
        }
      });
    },
    refresh: function() {
      this.destroyAll();
      this.init();
    },
    getContent: function() {
      return tinyMCE.editors[0].getContent();
    },
    updateImages(editor) {
      var images;
      var iframe = $('#' + editor.id).prev().find('.mce-edit-area iframe').contents();
      images = $.map($('img', iframe), e => {
        return e.dataset.mceToken;
      });
      $('#' + editor.id).next()[0].value = JSON.stringify(images);
      return JSON.stringify(images);
    },

    highlight: initHighlightjs
  });
}());

$(document).on('turbolinks:before-visit', function(e) {
  _.each(tinyMCE.editors, function(editor) {
    if (editor.isNotDirty === false) {
      if (confirm(I18n.t('tiny_mce.leaving_warning'))) {
        return false;
      }
      e.preventDefault();
      return false;
    }
    return false;
  });
});
