Given(/^I'm on "([^"]*)" team settings page$/) do |team_name|
  team = Team.find_by_name(team_name)
  visit '/settings/teams/' + team.id.to_s
end

Then(/^I click on "(.+)" action button within Team members table$/) do |email|
  mail_td = find('td', text: /\A#{email}\z/)
  parent = mail_td.first(:xpath, './/..')
  parent.find_by_id('actions-dropdown').click
end

Then(/^I click "(.+)" link within "(.+)" actions dropdown within Team members table$/) do |role, email|
  mail_td = find('td', text: /\A#{email}\z/)
  parent = mail_td.first(:xpath, './/..')
  within(parent) do
    click_link role
  end
end

Then(/^I should see "(.+)" in Role column of "(.+)" within Team members table$/) do |role, email|
  wait_for_ajax
  mail_td = find('td', text: /\A#{email}\z/)
  parent = mail_td.first(:xpath, './/..')
  expect(parent).to have_css('td', text: /\A#{role}\z/)
end

Then(/^I should not see "([^"]*)" in Team members table$/) do |email|
  expect(page).to have_no_css('td', text: /\A#{email}\z/)
end
