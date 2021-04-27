# frozen_string_literal: true

module ReportsHelper
  include StringUtility

  def render_new_element(hide)
    render partial: 'reports/elements/new_element.html.erb',
          locals: { hide: hide }
  end

  def render_report_element(element, provided_locals = nil)
    # Determine partial
    file_name = element.type_of
    if element.type_of.in? ReportExtends::MY_MODULE_CHILDREN_ELEMENTS
      file_name = "my_module_#{element.type_of.singularize}"
    end
    view = "reports/elements/#{file_name}_element.html.erb"

    # Set locals

    locals = provided_locals.nil? ? {} : provided_locals.clone

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
    locals[:children] = children_html

    if provided_locals[:export_all]
      # Set path and filename locals for files and tables in export all ZIP

      if element['type_of'] == 'my_module_repository'
        obj_id = element[:repository_id]
      elsif element['type_of'].in? %w(step_asset step_table result_asset
                                      result_table)

        parent_el = ReportElement.find(element['parent_id'])
        parent_type = parent_el[:type_of]
        parent = parent_type.singularize.classify.constantize
                            .find(parent_el["#{parent_type}_id"])

        if parent.class == Step
          obj_id = if element['type_of'] == 'step_asset'
                     element[:asset_id]
                   elsif element['type_of'] == 'step_table'
                     element[:table_id]
                   end
        elsif parent.class == MyModule
          result = Result.find(element[:result_id])
          obj_id = if element['type_of'] == 'result_asset'
                     result.asset.id
                   elsif element['type_of'] == 'result_table'
                     result.table.id
                   end
        end
      end

      if obj_id
        file = provided_locals[:obj_filenames][element['type_of'].to_sym][obj_id]
        locals[:path] = {
          file: file[:file].sub(%r{/usr/src/app/tmp/temp-zip-\d+/}, ''),
          preview: file[:preview]&.sub(%r{/usr/src/app/tmp/temp-zip-\d+/}, '')
        }
        locals[:filename] = locals[:path][:file].split('/').last
      end
    end

    # ReportExtends is located in config/initializers/extends/report_extends.rb
    ReportElement.type_ofs.keys.each do |type|
      next unless element.public_send("#{type}?")

      element.element_references.each do |el_ref|
        locals[el_ref.class.name.underscore.to_sym] = el_ref
      end
      locals[:order] = element.sort_order if type.in? ReportExtends::SORTED_ELEMENTS
    end

    (render partial: view, locals: locals).html_safe
  end

  # "Hack" to omit file preview URL because of WKHTML issues
  def report_image_asset_url(asset)
    preview = asset.inline? ? asset.large_preview : asset.medium_preview
    image_tag(preview.processed
                     .service_url(expires_in: Constants::URL_LONG_EXPIRE_TIME))
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
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/fontawesome.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/regular.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/solid.min.css'
    )
  end

  def assigned_repository_or_snapshot(my_module, element_id, snapshot, repository)
    if element_id
      repository = Repository.accessible_by_teams(my_module.experiment.project.team).find_by(id: element_id)
      # Check for default set snapshots when repository still exists
      if repository
        selected_snapshot = repository.repository_snapshots.where(my_module: my_module).find_by(selected: true)
        repository = selected_snapshot if selected_snapshot
      end
      repository ||= RepositorySnapshot.joins(my_module: { experiment: :project })
                                       .where(my_module: { experiments: { project: my_module.experiment.project } })
                                       .find_by(id: element_id)
    end
    repository || snapshot
  end

  def assigned_repositories_in_project_list(project)
    live_repositories = Repository.assigned_to_project(project)
    snapshots = RepositorySnapshot.of_unassigned_from_project(project)

    snapshots.each { |snapshot| snapshot.name = "#{snapshot.name} #{t('projects.reports.index.deleted')}" }
    (live_repositories + snapshots).sort_by { |r| r.name.downcase }
  end

  def step_status_label(step)
    if step.completed
      style = 'success'
      text = t('protocols.steps.completed')
    else
      style = 'default'
      text = t('protocols.steps.uncompleted')
    end
    "<span class=\"label step-label-#{style}\">[#{text}]</span>".html_safe
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

  def filter_steps_for_report(steps, settings)
    include_completed_steps = settings.dig('task', 'protocol', 'completed_steps')
    include_uncompleted_steps = settings.dig('task', 'protocol', 'uncompleted_steps')
    if include_completed_steps && include_uncompleted_steps
      steps
    elsif include_completed_steps
      steps.where(completed: true)
    elsif include_uncompleted_steps
      steps.where(completed: false)
    else
      steps.none
    end
  end

  def order_results_for_report(results, order)
    case order
    when 'atoz'
      results.order(name: :asc)
    when 'ztoa'
      results.order(name: :desc)
    when 'new'
      results.order(updated_at: :desc)
    else
      results.order(updated_at: :asc)
    end
  end

  def report_experiment_descriptions(report)
    report.report_elements.experiment.map do |experiment_element|
      experiment_element.experiment.description
    end
  end

  def assigned_to_report_repository_items(report, repository_name)
    repository = Repository.accessible_by_teams(report.team).where(name: repository_name).take
    return RepositoryRow.none if repository.blank?

    my_modules = MyModule.where(experiment: { project: report.project })
                         .where(id: report.report_elements.my_module.select(:my_module_id))
    repository.repository_rows.joins(:my_modules).where(my_modules: my_modules)
  end

  private

  def obj_name_to_filename(obj, filename_suffix = '')
    obj_name = if obj.class == Asset
                 obj_name, extension = obj.file_name.split('.')
                 extension&.prepend('.')
                 obj_name
               elsif obj.class.in? [Table, Result, Repository]
                 extension = '.csv'
                 obj.name.present? ? obj.name : obj.class.name
               end
    obj_name = to_filesystem_name(obj_name)
    obj_name + "#{filename_suffix}#{extension}"
  end
end
