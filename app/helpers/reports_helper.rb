module ReportsHelper
  include StringUtility

  def render_new_element(hide)
    render partial: 'reports/elements/new_element.html.erb',
          locals: { hide: hide }
  end

  def render_report_element(element, provided_locals = nil)
    children_html = ''.html_safe

    # First, recursively render element's children
    if element.comments? || element.project_header?
      # Render no children
    elsif element.result?
      # Special handling for result comments
      if element.has_children?
        children_html.safe_concat render_new_element(true)
        element.children.each do |child|
          children_html
            .safe_concat render_report_element(child, provided_locals)
        end
      else
        children_html.safe_concat render_new_element(false)
      end
    else
      if element.has_children?
        element.children.each do |child|
          children_html.safe_concat render_new_element(false)
          children_html
            .safe_concat render_report_element(child, provided_locals)
        end
      end
      children_html.safe_concat render_new_element(false)
    end

    file_name = element.type_of
    if element.type_of.in? ReportExtends::MY_MODULE_CHILDREN_ELEMENTS
      file_name = "my_module_#{element.type_of.singularize}"
    end
    view = "reports/elements/#{file_name}_element.html.erb"

    locals = provided_locals.nil? ? {} : provided_locals.clone
    locals[:children] = children_html

    if provided_locals[:export_all]
      # Set path and filename local variables for files and tables

      if element['type_of'] == 'my_module_repository'
        obj_name = Repository.find(element[:repository_id]).name + '.csv'
        obj_folder_name = 'Inventories'

        locals[:filename] = obj_name
        locals[:path] = "#{obj_folder_name}/#{obj_name}"
      elsif element['type_of'].in? %w(step_asset step_table result_asset
                                      result_table)

        parent_el = ReportElement.find(element['parent_id'])
        parent_type = parent_el[:type_of]
        parent = parent_type.singularize.classify.constantize
                            .find(parent_el["#{parent_type}_id"])

        if parent.class == Step
          obj_name = if element['type_of'] == 'step_asset'
                       name = Asset.find(element[:asset_id]).file_file_name
                       suffix = name.split('.').second
                       suffix.prepend('.') if suffix
                       name.split('.').first
                     else
                       name = Table.find(element[:table_id]).name
                       suffix = '.csv'
                       name.empty? ? 'Table' : name
                     end
          obj_name = to_filesystems_compatible_filename(
            obj_name.truncate(
              Constants::EXPORTED_FILE_NAME_TRUNCATION_LENGTH,
              omission: ''
            )
          )
          obj_name += "_Step#{parent.position + 1}#{suffix}"
          obj_folder_name = 'Protocol attachments'
          parent_module = if parent.protocol.present?
                            parent.protocol.my_module
                          else
                            parent.my_module
                          end
        else
          obj_name = if element['type_of'] == 'result_asset'
                       name = Asset.find(element[:result_id]).file_file_name
                       suffix = name.split('.').second
                       suffix.prepend('.') if suffix
                       name.split('.').first
                     else
                       name = Result.find(element[:result_id]).name
                       suffix = '.csv'
                       name.empty? ? 'Table' : name
                     end
          obj_name = to_filesystems_compatible_filename(
            obj_name.truncate(
              Constants::EXPORTED_FILE_NAME_TRUNCATION_LENGTH,
              omission: ''
            )
          )
          obj_name += suffix
          obj_folder_name = 'Results attachments'
          parent_module = parent
        end

        parent_module_name = to_filesystems_compatible_filename(
          parent_module.name.truncate(
            Constants::EXPORTED_FILE_NAME_TRUNCATION_LENGTH,
            omission: ''
          )
        )
        parent_exp_name = to_filesystems_compatible_filename(
          parent_module.experiment.name.truncate(
            Constants::EXPORTED_FILE_NAME_TRUNCATION_LENGTH,
            omission: ''
          )
        )

        locals[:filename] = obj_name
        locals[:path] = "#{parent_exp_name}/#{parent_module_name}/" \
          "#{obj_folder_name}/#{obj_name}"
      end
    end

    # ReportExtends is located in config/initializers/extends/report_extends.rb

    ReportElement.type_ofs.keys.each do |type|
      next unless element.public_send("#{type}?")
      element.element_references.each do |el_ref|
        locals[el_ref.class.name.underscore.to_sym] = el_ref
      end
      locals[:order] = element
                       .sort_order if type.in? ReportExtends::SORTED_ELEMENTS
    end

    (render partial: view, locals: locals).html_safe
  end

  # "Hack" to omit file preview URL because of WKHTML issues
  def report_image_asset_url(asset, type = :asset, klass = nil)
    prefix = ''
    if ENV['PAPERCLIP_STORAGE'].present? &&
       ENV['MAIL_SERVER_URL'].present? &&
       ENV['PAPERCLIP_STORAGE'] == 'filesystem'
      prefix = ENV['MAIL_SERVER_URL']
    end
    if !prefix.empty? &&
       !prefix.include?('http://') &&
       !prefix.include?('https://')
      prefix = "http://#{prefix}"
    end
    size = type == :tiny_mce_asset ? :large : :medium
    url = prefix + asset.url(size, timeout: Constants::URL_LONG_EXPIRE_TIME)
    image_tag(url, class: klass)
  end

  # "Hack" to load Glyphicons css directly from the CDN
  # site so they work in report
  def bootstrap_cdn_link_tag
    specs = Gem.loaded_specs['bootstrap-sass']
    return '' unless specs.present?
    stylesheet_link_tag("http://netdna.bootstrapcdn.com/bootstrap/" \
                        "#{specs.version.version}/css/bootstrap.min.css",
                        media: 'all')
  end

  def font_awesome_cdn_link_tag
    stylesheet_link_tag(
      'https://maxcdn.bootstrapcdn.com/font-awesome' \
      '/4.6.3/css/font-awesome.min.css'
    )
  end

  def step_status_label(step)
    if step.completed
      style = 'success'
      text = t('protocols.steps.completed')
    else
      style = 'default'
      text = t('protocols.steps.uncompleted')
    end
    "<span class=\"label label-#{style}\">#{text}</span>".html_safe
  end

  # Fixes issues with avatar images in reports
  def fix_smart_annotation_image(html)
    html_doc = Nokogiri::HTML(html)
    html_doc.search('.atwho-user-popover').each do |el|
      text = el.content
      el.replace("<a href='#' style='margin-left: 5px'>#{text}</a>")
    end
    html_doc.search('[ref="missing-img"]').each do |el|
      tag = wicked_pdf_image_tag('icon_small/missing.png')
      el.replace(tag)
    end
    html_doc.to_s
  end
end
