FactoryBot.define do
  factory :repository_list_item do
    name ''
    repository { Repository.first || create(:repository) }
    created_by { User.first || association(:project_user) }
    last_modified_by { User.first || association(:project_user) }
  end
end
