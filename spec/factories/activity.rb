# frozen_string_literal: true

FactoryBot.define do
  factory :activity do
    type_of :create_project
    message Faker::Lorem.sentence(10)
    project
    subject { create :project }
  end
end
