# frozen_string_literal:true

class ViewState < ApplicationRecord
  belongs_to :user
  belongs_to :viewable, polymorphic: true

  validates :viewable_id, uniqueness: {
    scope: %i(viewable_type user_id),
    message: :not_unique
  }

  validate :validate_state

  private

  def validate_state
    viewable.validate_view_state(self)
  end
end
