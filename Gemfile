source 'http://rubygems.org'

ruby '2.4.1'

gem 'rails', '5.1.1'
gem 'webpacker', '~> 2.0'
gem 'figaro'
gem 'pg'
gem 'devise', '~> 4.3.0'
gem 'devise_invitable'
gem 'simple_token_authentication', '~> 1.15.1' # Token authentication for Devise
gem 'bootstrap-sass', '~> 3.3.5'
gem 'sass-rails', '~> 5.0.6'
gem 'bootstrap_form'
gem 'yomu'
gem 'font-awesome-rails', '~> 4.7.0.2'
gem 'recaptcha', require: 'recaptcha/rails'
gem 'sanitize', '~> 4.4'

# JS datetime library, requirement of datetime picker
gem 'momentjs-rails', '~> 2.17.1'
# JS datetime picker
gem 'bootstrap3-datetimepicker-rails', '~> 4.15.35'
# Select elements for Bootstrap
gem 'bootstrap-select-rails'
gem 'uglifier', '>= 1.3.0'
# jQuery & plugins
gem 'jquery-turbolinks'
gem 'jquery-rails'
gem 'jquery-ui-rails'
gem 'jquery-scrollto-rails',
    git: 'https://github.com/biosistemika/jquery-scrollto-rails'
gem 'hammerjs-rails'
gem 'introjs-rails' # Create quick tutorials
gem 'js_cookie_rails' # Simple JS API for cookies
gem 'spinjs-rails'
gem 'autosize-rails' # jQuery autosize plugin

gem 'underscore-rails'
gem 'turbolinks'
gem 'sdoc', '~> 0.4.0', group: :doc
gem 'bcrypt', '~> 3.1.10'
gem 'logging', '~> 2.0.0'
gem 'aspector' # Aspect-oriented programming for Rails
gem 'rgl' # Graph framework for project diagram calculations
gem 'nested_form_fields'
gem 'ajax-datatables-rails', '~> 0.3.1'
gem 'commit_param_routing' # Enables different submit actions in the same form to route to different actions in controller
gem 'kaminari'
gem "i18n-js", ">= 3.0.0.rc11" # Localization in javascript files
gem 'roo', '~> 2.7.1' # Spreadsheet parser
gem 'wicked_pdf'
gem 'silencer' # Silence certain Rails logs
gem 'wkhtmltopdf-heroku'
gem 'remotipart', '~> 1.2' # Async file uploads
gem 'faker' # Generate fake data
gem 'auto_strip_attributes', '~> 2.1' # Removes unnecessary whitespaces from ActiveRecord or ActiveModel attributes
gem 'deface', '~> 1.0'
gem 'nokogiri' # HTML/XML parser
gem 'sneaky-save', git: 'https://github.com/einzige/sneaky-save'
gem 'rails_autolink', '~> 1.1', '>= 1.1.6'
gem 'delayed_paperclip'
gem 'rubyzip'
gem 'activerecord-import'

gem 'paperclip', '~> 5.1' # File attachment, image attachment library
gem 'aws-sdk', '~> 2'

gem 'delayed_job_active_record'
gem 'devise-async'
gem 'ruby-graphviz', '~> 1.2' # Graphviz for rails
gem 'tinymce-rails', '~> 4.6.4' # Rich text editor

gem 'base62' # Used for smart annotations
gem 'newrelic_rpm'
gem 'devise_security_extension',
    git: 'https://github.com/phatworx/devise_security_extension.git',
    ref: 'b2ee978'

group :development, :test do
  gem 'listen', '~> 3.0'
  gem 'byebug'
  gem 'pry'
  gem 'pry-byebug'
  gem 'pry-rails'
  gem 'factory_girl_rails'
  gem 'rspec-rails'
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'awesome_print'
  gem 'rubocop', require: false
  gem 'scss_lint', require: false
  gem 'starscope', require: false
end

group :test do
  gem 'shoulda-matchers'
  gem 'cucumber-rails', require: false
  gem 'database_cleaner'
  gem 'capybara'
  gem 'poltergeist'
  gem 'phantomjs', :require => 'phantomjs/poltergeist'
  gem 'simplecov', require: false
end

group :production do
  gem 'puma'
  gem 'rails_12factor'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]
