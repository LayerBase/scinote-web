class UserMyModulesController < ApplicationController
  before_action :load_vars
  before_action :check_view_permissions, except: %i(create destroy)
  before_action :check_manage_permissions, only: %i(create destroy)

  def index_old
    @user_my_modules = @my_module.user_my_modules

    respond_to do |format|
      format.json do
        render json: {
          html: render_to_string(
            partial: 'index_old.html.erb'
          ),
          my_module_id: @my_module.id,
          counter: @my_module.designated_users.count # Used for counter badge
        }
      end
    end
  end

  def index
    respond_to do |format|
      format.json do
        render json: {
          html: render_to_string(
            partial: 'index.html.erb'
          )
        }
      end
    end
  end

  def index_edit
    @user_my_modules = @my_module.user_my_modules
    @undesignated_users = @my_module.undesignated_users.order(full_name: :asc)
    @new_um = UserMyModule.new(my_module: @my_module)

    respond_to do |format|
      format.json do
        render json: {
          my_module: @my_module,
          html: render_to_string(
            partial: 'index_edit.html.erb'
          )
        }
      end
    end
  end

  def create
    @um = UserMyModule.new(um_params.merge(my_module: @my_module))
    @um.assigned_by = current_user
    if @um.save
      log_activity(:assign_user_to_module)

      respond_to do |format|
        format.json do
          redirect_to my_module_users_edit_path(format: :json),
                      turbolinks: false,
                      status: 303
        end
      end
    else
      respond_to do |format|
        format.json do
          render json: {
            errors: @um.errors
          }
        end
      end
    end
  end

  def destroy
    if @um.destroy
      log_activity(:unassign_user_from_module)

      respond_to do |format|
        format.json do
          redirect_to my_module_users_edit_path(format: :json),
                      turbolinks: false,
                      status: 303
        end
      end
    else
      respond_to do |format|
        format.json do
          render json: {
            errors: @um.errors
          }
        end
      end
    end
  end

  private

  def load_vars
    @my_module = MyModule.find_by_id(params[:my_module_id])

    if @my_module
      @project = @my_module.experiment.project
    else
      render_404
    end

    if action_name == "destroy"
      @um = UserMyModule.find_by_id(params[:id])
      unless @um
        render_404
      end
    end
  end

  def check_view_permissions
    render_403 unless can_read_my_module?(@my_module)
  end

  def check_manage_permissions
    render_403 unless can_manage_my_module_users?(@my_module)
  end

  def um_params
    params.require(:user_my_module).permit(:user_id, :my_module_id)
  end

  def log_activity(type_of)
    Activities::CreateActivityService
      .call(activity_type: type_of,
            owner: current_user,
            team: @um.my_module.experiment.project.team,
            project: @um.my_module.experiment.project,
            subject: @um.my_module,
            message_items: { my_module: @my_module.id,
                             user_target: @um.user.id })
  end
end
