module ProtocolStatusHelper

  def protocol_status_href(protocol)
    parent = protocol.parent
    res = ""
    res << "<a href=\"#\" data-toggle=\"popover\" data-html=\"true\" "
    res << "data-trigger=\"focus\" data-placement=\"bottom\" title=\""
    res << sanitize_input(protocol_status_popover_title(parent)) +
           '" data-content="' + protocol_status_popover_content(parent) +
           '">' + protocol_name(parent) + '</a>'
    sanitize_input(res)
  end

  private

  def protocol_private_for_current_user?(protocol)
    protocol.in_repository_private? && protocol.added_by != current_user
  end

  def protocol_name(protocol)
    protocol_private_for_current_user?(protocol) ? I18n.t("my_modules.protocols.protocol_status_bar.private_parent") : protocol.name
  end

  def protocol_status_popover_title(protocol)
    res = ""
    if protocol.in_repository_public?
      res << "<span class='glyphicon glyphicon-eye-open' title='" + I18n.t("my_modules.protocols.protocol_status_bar.public_desc") + "'></span>"
    elsif protocol.in_repository_private?
      res << "<span class='glyphicon glyphicon-eye-close' title='" + I18n.t("my_modules.protocols.protocol_status_bar.private_desc") + "'></span>"
    end
    res << "&nbsp;"
    if can_view_protocol(protocol)
      res << "<a href='" + edit_protocol_path(protocol) + "' target='_blank'>" + protocol_name(protocol) + "</a>"
    else
      res << "<span style='font-weight: bold;'>" + protocol_name(protocol) + "</span>"
    end
    res << "&nbsp;-&nbsp;"
    res << "<span style='font-style: italic;'>" + I18n.t("my_modules.protocols.protocol_status_bar.added_by") + "&nbsp;"
    res << "<a href='#' data-toggle='tooltip' data-placement='right' title='" + I18n.t("my_modules.protocols.protocol_status_bar.added_by_tooltip", ts: I18n.l(protocol.created_at, format: :full)) + "'>" + protocol.added_by.full_name + "</a></span>"
  end

  def protocol_status_popover_content(protocol)
    if protocol_private_for_current_user?(protocol)
      res = "<p><em>" + I18n.t("my_modules.protocols.protocol_status_bar.private_protocol_desc") + "</em></p>"
    else
      res = "<p>"
      if protocol.description.present?
        res << protocol.description
      else
        res << "<em>" + I18n.t("my_modules.protocols.protocol_status_bar.no_description") + "</em>"
      end
      res << "</p>"
      res << "<p><b>" + I18n.t("my_modules.protocols.protocol_status_bar.keywords") + ":</b>&nbsp;"
      if protocol.protocol_keywords.size > 0
        protocol.protocol_keywords.each do |kw|
          res << kw.name + ", "
        end
        res = res[0..-3]
      else
        res << "<em>" + I18n.t("my_modules.protocols.protocol_status_bar.no_keywords") + "</em>"
      end
      res << "</p>"
    end
    res
  end
end
