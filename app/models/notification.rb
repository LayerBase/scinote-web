class Notification < ActiveRecord::Base
  has_many :user_notifications, inverse_of: :notification
  has_many :users, through: :user_notifications
  belongs_to :generator_user, class_name: 'User'

  enum type_of: [:assignment, :recent_changes, :system_message]

  def already_seen(user)
    UserNotification.where(notification: self, user: user)
                    .pluck(:checked)
                    .first
  end
end
