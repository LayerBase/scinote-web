require 'sanitize'

module InputSanitizeHelper
  # Rails default ActionController::Base.helpers.sanitize method call
  # the ActiveRecord connecton method on the caller object which in
  # our cases throws an error when called from not ActiveRecord objects
  # such as SamplesDatatables
  def sanitize_input(text, tags = [], attributes = [])
    Sanitize.fragment(
      text,
      elements: Constants::WHITELISTED_TAGS + tags,
      attributes: { all: Constants::WHITELISTED_ATTRIBUTES + attributes }
    )
  end

  def escape_input(text)
    ERB::Util.html_escape(text)
  end

  def custom_auto_link(text, options = {})
    simple_f = options.fetch(:simple_format) { true }
    team = options.fetch(:team) { nil }
    wrapper_tag = options.fetch(:wrapper_tag) { {} }
    tags = options.fetch(:tags) { [] }
    fromat_opt = wrapper_tag.merge(sanitize: false)
    text = sanitize_input(text, tags)
    text = simple_format(sanitize_input(text), {}, fromat_opt) if simple_f
    auto_link(
      smart_annotation_parser(text, team),
      link: :urls,
      sanitize: false,
      html: { target: '_blank' }
    ).html_safe
  end
end
