# frozen_string_literal: true

module ReportActions
  class ReportContent
    include Canaid::Helpers::PermissionsHelper

    MY_MODULE_ADDONS_ELEMENTS = []

    def initialize(report, content, template_values, user)
      @content = content
      @settings = report.settings
      @user = user
      @element_position = 0
      @report = report
      @template_values = template_values
    end

    def save_with_content
      Report.transaction do
        # Save the report itself
        @report.save!

        # Delete existing report elements
        @report.report_elements.destroy_all

        # Save new report elements
        generate_content

        # Delete existing template values
        @report.report_template_values.destroy_all

        if @template_values.present?
          formatted_template_values = @template_values.as_json.map { |k, v| v['name'] = k; v }
          # Save new template values
          @report.report_template_values.create!(formatted_template_values)
        end
      end

      @report
    rescue ActiveRecord::ActiveRecordError, ArgumentError => e
      Rails.logger.error e.message
      raise ActiveRecord::Rollback
    end

    private

    def generate_content
      @content['experiments'].each do |exp_id, my_modules|
        generate_experiment_content(exp_id, my_modules)
      end
    end

    def generate_experiment_content(exp_id, my_modules)
      experiment = Experiment.find_by(id: exp_id)
      return if !experiment && !can_read_experiment?(experiment, @user)

      experiment_element = save_element({ 'experiment_id' => experiment.id }, :experiment, nil)
      generate_my_modules_content(experiment, experiment_element, my_modules)
    end

    def generate_my_modules_content(experiment, experiment_element, selected_my_modules)
      my_modules = experiment.my_modules
                             .active
                             .includes(:results, protocols: [:steps])
                             .where(id: selected_my_modules)
      my_modules.sort_by { |m| selected_my_modules.index m.id }.each do |my_module|
        my_module_element = save_element({ 'my_module_id' => my_module.id }, :my_module, experiment_element)

        my_module.experiment.project.assigned_repositories_and_snapshots.each do |repository|
          next unless @content['repositories'].include?(repository.id)

          save_element(
            { 'my_module_id' => my_module.id, 'repository_id' => repository.id },
            :my_module_repository,
            my_module_element
          )
        end

        MY_MODULE_ADDONS_ELEMENTS.each do |e|
          public_send("generate_#{e}_content", my_module, my_module_element)
        end
      end
    end

    def save_element(reference, type_of, parent)
      el = ReportElement.new
      el.position = @element_position
      el.report = @report
      el.parent = parent
      el.type_of = type_of
      el.set_element_references(reference)
      el.save!

      @element_position += 1

      el
    end
  end
end
