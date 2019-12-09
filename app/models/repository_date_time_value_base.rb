# frozen_string_literal: true

class RepositoryDateTimeValueBase < ApplicationRecord
  self.table_name = 'repository_date_time_values'

  belongs_to :created_by, foreign_key: :created_by_id, class_name: 'User', optional: true,
             inverse_of: :created_repository_date_time_values
  belongs_to :last_modified_by, foreign_key: :last_modified_by_id, class_name: 'User', optional: true,
             inverse_of: :modified_repository_date_time_values
  has_one :repository_cell, as: :value, dependent: :destroy, inverse_of: :repository_date_time_value
  accepts_nested_attributes_for :repository_cell

  validates :repository_cell, :data, presence: true

  SORTABLE_COLUMN_NAME = 'repository_date_time_values.data'
  SORTABLE_VALUE_INCLUDE = :repository_date_time_value

  def update_data!(new_data, user)
    destroy! && return if new_data == ''

    self.data = Time.zone.parse(new_data)
    self.last_modified_by = user
    save!
  end

  private

  def formatted(format, new_date: nil)
    d = new_date ? Time.zone.parse(new_date) : data
    I18n.l(d, format: format)
  end
end
