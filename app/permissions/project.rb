Canaid::Permissions.register_for(Project) do
  can :read_project do |user, project|
    user.is_user_or_higher_of_project?(project) ||
      user.is_admin_of_team?(project.team) ||
      (project.visible? && user.is_member_of_team?(project.team))
  end

  can :update_project do |user, project|
    user.is_owner_of_project?(project)
  end

  can :restore_project do |user, project|
    can_update_project?(user, project) && project.archived?
  end

  can :create_experiment do |user, project|
    user.is_user_or_higher_of_project?(project)
  end

  can :add_comment_to_project do |user, project|
    user.is_technician_or_higher_of_project?(project)
  end

  # create, update, delete
  can :manage_tags do |user, project|
    user.is_user_or_higher_of_project?(project)
  end

  # create, update, delete
  can :manage_reports do |user, project|
    user.is_technician_or_higher_of_project?(project)
  end
end

Canaid::Permissions.register_for(Comment) do
  can :update_or_delete_project_comment do |user, comment|
    comment.project.present? && (comment.user == user ||
      can_update_project?(user, comment.project))
  end
end
