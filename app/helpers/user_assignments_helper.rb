# frozen_string_literal: true

module UserAssignmentsHelper
  def current_assignee_name(assignee)
    display_name = if assignee == current_user
                     [assignee.name, t('user_assignment.current_assignee')].join(' ')
                   else
                     assignee.name
                   end
    sanitize_input(display_name)
  end

  def user_assignment_resource_role_name(user_assignment, user, resource)
    # Triggers N+1 but the partial is cached

    if resource.is_a?(Experiment)
      project_user_assignment = resource.permission_parent.user_assignments.find_by(user: user)
      current_user_assignment_name = user_assignment&.user_role&.name

      [
        t('user_assignment.from_project', user_role: project_user_assignment.user_role.name),
        current_user_assignment_name
      ].compact.join(' / ')
    elsif resource.is_a?(MyModule)
      project_user_assignment = resource.permission_parent.permission_parent.user_assignments.find_by(user: user)
      experiment_user_assignment = resource.permission_parent.user_assignments.find_by(user: user)
      current_user_assignment_name = user_assignment&.user_role&.name

      [
        t('user_assignment.from_project',
          user_role: project_user_assignment.user_role.name),
        (t('user_assignment.from_experiment',
           user_role: experiment_user_assignment.user_role.name) if experiment_user_assignment.present?),
        current_user_assignment_name
      ].compact.join(' / ')
    else
      user_assignment.user_role.name
    end
  end
end
