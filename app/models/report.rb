# frozen_string_literal: true

class Report < ApplicationRecord
  include SearchableModel
  include SearchableByNameModel

  auto_strip_attributes :name, :description, nullify: false
  validates :name,
            length: { minimum: Constants::NAME_MIN_LENGTH,
                      maximum: Constants::NAME_MAX_LENGTH },
            uniqueness: { scope: %i(user_id project_id), case_sensitive: false }
  validates :description, length: { maximum: Constants::TEXT_MAX_LENGTH }
  validates :project, presence: true
  validates :user, presence: true

  belongs_to :project, inverse_of: :reports
  belongs_to :user, inverse_of: :reports
  belongs_to :team, inverse_of: :reports
  belongs_to :last_modified_by,
             foreign_key: 'last_modified_by_id',
             class_name: 'User',
             optional: true

  # Report either has many report elements (if grouped by timestamp),
  # or many module elements (if grouped by module)
  has_many :report_elements, inverse_of: :report, dependent: :delete_all

  def self.search(
    user,
    include_archived,
    query = nil,
    page = 1,
    _current_team = nil,
    options = {}
  )

    project_ids =
      Project
      .search(user, include_archived, nil, Constants::SEARCH_NO_LIMIT)
      .pluck(:id)

    new_query =
      Report
      .distinct
      .where('reports.project_id IN (?)', project_ids)
      .where_attributes_like(%i(name description), query, options)

    # Show all results if needed
    if page == Constants::SEARCH_NO_LIMIT
      new_query
    else
      new_query
        .limit(Constants::SEARCH_LIMIT)
        .offset((page - 1) * Constants::SEARCH_LIMIT)
    end
  end

  def self.viewable_by_user(user, teams)
    where(project: Project.viewable_by_user(user, teams))
  end

  def root_elements
    report_elements.order(:position).select { |el| el.parent.blank? }
  end

  # Save the JSON represented contents to this report
  # (this action will overwrite any existing report elements)
  def save_with_contents(json_contents)
    begin
      Report.transaction do
        # First, save the report itself
        save!

        # Secondly, delete existing report elements
        report_elements.destroy_all

        # Lastly, iterate through contents
        json_contents.each_with_index do |json_el, i|
          save_json_element(json_el, i, nil)
        end
      end
    rescue ActiveRecord::ActiveRecordError, ArgumentError
      return false
    end
    true
  end

  # Clean report elements from report
  # the function runs before the report is edit
  def cleanup_report
    report_elements.each(&:clean_removed_or_archived_elements)
  end

  def self.generate_whole_project_report(project, current_user, current_team)
    report_contents = gen_element_content(project, nil, 'project_header', true)
    Extends::EXPORT_ALL_PROJECT_ELEMENTS.each do |report_element, children|
      report_contents += public_send("generate_#{report_element}_element", project, children)
    end

    report = Report.new
    report.name = loop do
      dummy_name = SecureRandom.hex(10)
      break dummy_name unless Report.where(name: dummy_name).exists?
    end
    report.project = project
    report.user = current_user
    report.team = current_team
    report.last_modified_by = current_user
    report.save_with_contents(report_contents)
    report
  end

  def self.gen_element_content(parent_obj, association_objs, type_of,
                               use_parent_id = false, sort_order = nil,
                               children = nil)
    parent_type = parent_obj.class.name.underscore
    type = type_of.split('_').last.singularize
    extra_id_needed = use_parent_id && !association_objs.nil?
    elements = []

    association_objs ||= [nil]
    association_objs.each do |obj|
      elements << {
        'type_of' => type_of,
        'id' => {}.tap do |ids_hash|
                  if use_parent_id
                    ids_hash["#{parent_type}_id"] = parent_obj.id
                  else
                    ids_hash["#{type}_id"] = obj.id
                  end
                  ids_hash["#{type}_id"] = obj.id if extra_id_needed
                end,
        'sort_order' => sort_order.presence,
        'children' => children.presence || []
      }
    end

    elements
  end

  def self.generate_experiments_element(project, elements)
    experiments = []
    project.experiments.each do |experiment|
      experiment_contents = []
      elements.each do |report_element, children|
        experiment_contents += public_send("generate_#{report_element}_element", experiment, children)
      end
      experiments += gen_element_content(experiment, nil, 'experiment', true, nil, experiment_contents)
    end
    experiments
  end

  def self.generate_my_modules_element(experiment, elements)
    my_modules = []
    experiment.my_modules.each do |my_module|
      my_module_contents = []
      elements.each do |report_element, children|
        my_module_contents += public_send("generate_#{report_element}_element", my_module, children)
      end
      my_modules += gen_element_content(my_module, nil, 'my_module', true, nil, my_module_contents)
    end
    my_modules
  end

  def self.generate_my_module_protocol_element(my_module, elements)
    protcol_contents = []
    elements.each do |report_element, children|
      protcol_contents += public_send("generate_#{report_element}_element", my_module, children)
    end
    gen_element_content(my_module, nil, 'my_module_protocol', true, nil, protcol_contents)
  end

  def self.generate_my_module_steps_element(my_module, elements)
    steps = []
    my_module.protocol.steps.each do |step|
      step_contents = []
      elements.each do |report_element, children|
        step_contents += public_send("generate_#{report_element}_element", step, children)
      end
      steps += gen_element_content(step, nil, 'step', true, nil, step_contents)
    end
    steps
  end

  def self.generate_step_assets_element(step, _elements)
    gen_element_content(step, step.assets, 'step_asset')
  end

  def self.generate_step_tables_element(step, _elements)
    gen_element_content(step, step.tables, 'step_table')
  end

  def self.generate_step_checklists_element(step, _elements)
    gen_element_content(step, step.checklists, 'step_checklist')
  end

  def self.generate_step_comments_element(step, _elements)
    gen_element_content(step, nil, 'step_comments', true, 'asc')
  end

  def self.generate_my_module_results_element(my_module, elements)
    results = []
    my_module.results.each do |result|
      result_contents = []
      elements.each do |report_element, children|
        result_contents += public_send("generate_#{report_element}_element", result, children)
      end
      result_type = if result.asset
                      'result_asset'
                    elsif result.table
                      'result_table'
                    elsif result.result_text
                      'result_text'
                    end
      results += gen_element_content(result, nil, result_type, true, nil, result_contents)
    end
    results
  end

  def self.generate_result_comments_element(result, _elements)
    gen_element_content(result, nil, 'result_comments', true, 'asc')
  end

  def self.generate_my_module_activities_element(my_module, _elements)
    gen_element_content(my_module, nil, 'my_module_activity', true, 'asc')
  end

  def self.generate_my_module_repositories_element(my_module, _elements)
    repositories = my_module.experiment.project.assigned_repositories_and_snapshots
    gen_element_content(my_module, repositories, 'my_module_repository', true, 'asc')
  end

  private

  # Recursively save a single JSON element
  def save_json_element(json_element, index, parent)
    el = ReportElement.new
    el.position = index
    el.report = self
    el.parent = parent
    el.type_of = json_element['type_of']
    el.sort_order = json_element['sort_order']
    el.set_element_references(json_element['id'])
    el.save!

    if json_element['children'].present?
      json_element['children'].each_with_index do |child, i|
        save_json_element(child, i, el)
      end
    end
  end
end
