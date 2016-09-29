class CreateUserNotifications < ActiveRecord::Migration
  def change
    create_table :user_notifications do |t|
      t.belongs_to :user, index: true, foreign_key: true
      t.belongs_to :notification, index: true, foreign_key: true
      t.boolean :checked, default: false

      t.timestamps null: false
    end
  end
end
