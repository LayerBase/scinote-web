<template>
  <div v-if="attachments.length" class="step-attachments">
    <div class="attachments-actions">
      <div class="title">
        <h4>{{ i18n.t('protocols.steps.files', {count: attachments.length}) }}</h4>
      </div>
      <div class="actions">
        <div class="dropdown sci-dropdown">
          <button class="btn btn-light dropdown-toggle" type="button" id="dropdownAttachmentsOptions" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
            <span>{{ i18n.t("protocols.steps.attachments.manage") }}</span>
            <span class="caret pull-right"></span>
          </button>
          <ul class="dropdown-menu dropdown-menu-right dropdown-attachment-options"
              aria-labelledby="dropdownAttachmentsOptions"
              :data-step-id="step.id"
          >
            <li class="divider-label">{{ i18n.t("protocols.steps.attachments.add") }}</li>
            <li>
              <a class="action-link .attachments-view-mode {" @click="$emit('attachments:openFileModal')">
                <i class="fas fa-paperclip"></i>
                {{ i18n.t('protocols.steps.insert.attachment') }}
              </a>
            </li>
            <li role="separator" class="divider"></li>
            <li class="divider-label">{{ i18n.t("protocols.steps.attachments.sort_by") }}</li>
            <li v-for="(orderOption, index) in orderOptions" :key="`orderOption_${index}`">
              <a class="action-link change-order"
                @click="changeAttachmentsOrder(orderOption)"
                :class="step.attributes.assets_order == orderOption ? 'selected' : ''"
              >
                {{ i18n.t(`general.sort_new.${orderOption}`) }}
              </a>
            </li>
            <template v-if="step.attributes.urls.update_asset_view_mode_url">
              <li role="separator" class="divider"></li>
              <li class="divider-label">{{ i18n.t("protocols.steps.attachments.attachments_view_mode") }}</li>
              <li v-for="(viewMode, index) in viewModeOptions" :key="`viewMode_${index}`">
                <a
                  class="attachments-view-mode action-link"
                  :class="viewMode == step.attributes.assets_view_mode ? 'selected' : ''"
                  @click="changeAttachmentsViewMode(viewMode)"
                  v-html="i18n.t(`protocols.steps.attachments.view_mode.${viewMode}_html`)"
                ></a>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </div>
    <div class="attachments">
      <template v-for="(attachment, index) in attachmentsOrdered">
        <component
          :is="attachment_view_mode(attachmentsOrdered[index])"
          :key="index"
          :attachment.sync="attachmentsOrdered[index]"
          :stepId="parseInt(step.id)"
          @attachment:viewMode="updateAttachmentViewMode"
          @attachment:delete="attachments.splice(index, 1)"
        />
      </template>
    </div>
  </div>
</template>
<script>
  import listAttachment from 'vue/protocol/step_attachments/list.vue'
  import inlineAttachment from 'vue/protocol/step_attachments/inline.vue'
  import thumbnailAttachment from 'vue/protocol/step_attachments/thumbnail.vue'
  import uploadingAttachment from 'vue/protocol/step_attachments/uploading.vue'


  export default {
    name: 'Attachments',
    props: {
      attachments: {
        type: Array,
        required: true
      },
      step: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        viewModeOptions: ['inline', 'thumbnail', 'list'],
        orderOptions: ['new', 'old', 'atoz', 'ztoa'],
      }
    },
    components: {
      thumbnailAttachment,
      inlineAttachment,
      listAttachment,
      uploadingAttachment
    },
    computed: {
      attachmentsOrdered() {
        return this.attachments.sort((a, b) => {
          if (a.attributes.asset_order == b.attributes.asset_order) {
            switch(this.step.attributes.assets_order) {
              case 'new':
                return b.attributes.updated_at - a.attributes.updated_at;
              case 'old':
                return a.attributes.updated_at - b.attributes.updated_at;
              case 'atoz':
                return a.attributes.file_name.toLowerCase() > b.attributes.file_name.toLowerCase() ? 1 : -1;
              case 'ztoa':
                return b.attributes.file_name.toLowerCase() > a.attributes.file_name.toLowerCase() ? 1 : -1;
            }
          }

          return a.attributes.asset_order > b.attributes.asset_order ? 1 : -1;
        })
      }
    },
    methods: {
      changeAttachmentsOrder(order) {
        this.$emit('attachments:order', order)
      },
      changeAttachmentsViewMode(viewMode) {
        this.$emit('attachments:viewMode', viewMode)
      },
      updateAttachmentViewMode(id, viewMode) {
        this.$emit('attachment:viewMode', id, viewMode)
      },
      attachment_view_mode(attachment) {
        if (attachment.attributes.uploading) {
          return 'uploadingAttachment'
        }
        return `${attachment.attributes.view_mode}Attachment`
      }
    }
  }
</script>