class ResultText < ActiveRecord::Base
  auto_strip_attributes :text, nullify: false
  validates :text,
            presence: true,
            length: { maximum: Constants::TEXT_MAX_LENGTH }
  validates :result, presence: true

  belongs_to :result, inverse_of: :result_text
end
