# IMPORTANT: This file is generated by cucumber-rails - edit at your own peril.
# It is recommended to regenerate this file in the future when you upgrade to a
# newer version of cucumber-rails. Consider adding your own code to a new file
# instead of editing this one. Cucumber will automatically load all features/**/*.rb
# files.
ENV['CUCUMBER'] = 'cucumber'

require 'cucumber/rails'
require 'capybara/cucumber'
require 'simplecov'
require 'capybara/poltergeist'
require 'phantomjs'
require 'capybara/email'

Capybara.register_driver :poltergeist do |app|
  options = {
    # inspector: true,
    screen_size: [1200, 900],
    js_errors: false,
    timeout: 30,
    phantomjs: Phantomjs.path,
    phantomjs_options: [
      '--ignore-ssl-errors=yes',
      '--output-encoding=utf8'
    ]
  }
  Capybara::Poltergeist::Driver.new(app, options)
end

Capybara.javascript_driver = :poltergeist
Capybara.default_max_wait_time = 30
Capybara.asset_host = 'http://localhost:3001'
Capybara.server_port = 3001

# enables email helper methods
World(Capybara::Email::DSL)

# Precompile webpacker to avoid render bugs in capybara webkit
# global hook throws an error :( https://github.com/cucumber/cucumber/wiki/Hooks

compiled = false
Before do
  unless compiled
    system('NODE_ENV=production bundle exec rails webpacker:compile')
    compiled = true
  end
end

# Capybara defaults to CSS3 selectors rather than XPath.
# If you'd prefer to use XPath, just uncomment this line and adjust any
# selectors in your step definitions to use the XPath syntax.
# Capybara.default_selector = :xpath

# By default, any exception happening in your Rails application will bubble up
# to Cucumber so that your scenario will fail. This is a different from how
# your application behaves in the production environment, where an error page will
# be rendered instead.
#
# Sometimes we want to override this default behaviour and allow Rails to rescue
# exceptions and display an error page (just like when the app is running in production).
# Typical scenarios where you want to do this is when you test your error pages.
# There are two ways to allow Rails to rescue exceptions:
#
# 1) Tag your scenario (or feature) with @allow-rescue
#
# 2) Set the value below to true. Beware that doing this globally is not
# recommended as it will mask a lot of errors for you!
#
ActionController::Base.allow_rescue = false

# Remove/comment out the lines below if your app doesn't have a database.
# For some databases (like MongoDB and CouchDB) you may need to use :truncation instead.
begin
  require 'database_cleaner'
  require 'database_cleaner/cucumber'
  DatabaseCleaner.strategy = :truncation
rescue NameError
  raise "You need to add database_cleaner to your Gemfile (in the :test group) if you wish to use it."
end

# You may also want to configure DatabaseCleaner to use different strategies for certain features and scenarios.
# See the DatabaseCleaner documentation for details. Example:
#
#   Before('@no-txn,@selenium,@culerity,@celerity,@javascript') do
#     # { :except => [:widgets] } may not do what you expect here
#     # as Cucumber::Rails::Database.javascript_strategy overrides
#     # this setting.
#     DatabaseCleaner.strategy = :truncation
#   end
#
#

# Possible values are :truncation and :transaction
# The :transaction strategy is faster, but might give you threading problems.
# See https://github.com/cucumber/cucumber-rails/blob/master/features/choose_javascript_database_strategy.feature
Cucumber::Rails::Database.javascript_strategy = :truncation
