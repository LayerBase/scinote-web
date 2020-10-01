# frozen_string_literal: true

# rubocop:disable  Style/ClassAndModuleChildren

class Reports::Docx
  include ActionView::Helpers::TextHelper
  include ActionView::Helpers::UrlHelper
  include ApplicationHelper
  include InputSanitizeHelper
  include TeamsHelper
  include GlobalActivitiesHelper
  include Canaid::Helpers::PermissionsHelper

  Dir[File.join(File.dirname(__FILE__), 'docx') + '**/*.rb'].each do |file|
    include_module = File.basename(file).gsub('.rb', '').split('_').map(&:capitalize).join
    include "Reports::Docx::#{include_module}".constantize
  end

  def initialize(json, docx, options)
    @json = JSON.parse(json)
    @docx = docx
    @user = options[:user]
    @report_team = options[:team]
    @link_style = {}
    @color = {}
    @scinote_url = options[:scinote_url][0..-2]
  end

  def draw
    initial_document_load

    @json.each do |subject|
      public_send("draw_#{subject['type_of']}", subject)
    end
    @docx
  end

  def self.link_prepare(scinote_url, link)
    link[0] == '/' ? scinote_url + link : link
  end

  def self.render_p_element(docx, element, options = {})
    docx.p do
      element[:children].each do |text_el|
        if text_el[:type] == 'text'
          style = text_el[:style] || {}
          text text_el[:value], style
          text ' ' if text_el[:value] != ''
        elsif text_el[:type] == 'br' && !options[:skip_br]
          br
        elsif text_el[:type] == 'a'
          Reports::Docx.render_link_element(self, text_el, options)
        end
      end
    end
  end

  def self.render_link_element(node, link_item, options = {})
    scinote_url = options[:scinote_url]
    link_style = options[:link_style]

    if link_item[:link]
      link_url = Reports::Docx.link_prepare(scinote_url, link_item[:link])
      node.link link_item[:value], link_url, link_style
    else
      node.text link_item[:value], link_style
    end
    node.text ' ' if link_item[:value] != ''
  end

  def self.render_img_element(docx, element, options = {})
    style = element[:style]

    if options[:table]
      max_width = (style[:max_width] / options[:table][:columns].to_f)
      if style[:width] > max_width
        style[:height] = (max_width / style[:width].to_f) * style[:height]
        style[:width] = max_width
      end
    end

    docx.img element[:data] do
      data element[:blob].download
      width style[:width]
      height style[:height]
      align style[:align] || :left
    end
  end

  def self.render_list_element(docx, element)
    bookmark_items = Reports::Docx.recursive_list_items_renderer(docx, element)

    bookmark_items.each_with_index do |(key, item), index|
      if item[:type] == 'image'
        docx.bookmark_start id: index, name: key
        Reports::Docx.render_img_element(docx, item)
        docx.bookmark_end id: index
      elsif item[:type] == 'table'
        docx.bookmark_start id: index, name: key
        # How to draw table here?
        # docx = Caracal::Document
        # self = Reports::Docx
        # But you have instance method on Reports::Docx. How to access Reports::Docx of current docx?
        # docx.tiny_mce_table(item)
        docx.p do
          text 'Table here soon'
        end
        docx.bookmark_end id: index
      end
    end
  end

  # rubocop:disable Metrics/BlockLength

  def self.recursive_list_items_renderer(node, element, bookmark_items: {})
    node.public_send(element[:type]) do
      element[:data].each do |values_array|
        li do
          values_array.each do |item|
            case item
            when Hash
              if %w(ul ol li).include?(item[:type])
                Reports::Docx.recursive_list_items_renderer(self, item, bookmark_items: bookmark_items)
              elsif %w(a).include?(item[:type])
                Reports::Docx.render_link_element(self, item)
              elsif %w(image).include?(item[:type])
                bookmark_items[item[:bookmark_id]] = item
                link 'Appended image', item[:bookmark_id] do
                  internal true
                end
              elsif %w(table).include?(item[:type])
                bookmark_items[item[:bookmark_id]] = item
                link 'Appended table', item[:bookmark_id] do
                  internal true
                end
              end
            else
              text item
            end
          end
        end
      end
    end
    bookmark_items
  end

  # Testing renderer, will be removed
  def self.render_list_element1(docx, _elem)
    docx.ol do
      li 'some'
      li do
        text 'kekec'
        text 'kekec2'
        text 'kekec3'
        ul do
          li 'nes1'
          li 'nes2' do
            ul do
              li '3 level1'
              li '3 leve 2' do
                link 'Click Here', 'https://image.shutterstock.com/image-vector/example-stamp-260nw-426673501.jpg'
                p do
                  text 'Click Here', 'https://image.shutterstock.com/image-vector/example-stamp-260nw-426673501.jpg'
                end
              end
            end
          end
          li 'nes3'
          li do
            bookmark_start id: 'img1', name: 'image1'
            text 'bookmark is here'
            bookmark_end id: 'img1'
          end
        end
      end
      li 'som3'
      li 'some4'
    end
    docx.p do
      bookmark_start id: 'img1', name: 'image1'
      text 'bookmark is here'
      bookmark_end id: 'img1'
    end
  end
end

# rubocop:enable Metrics/BlockLength
# rubocop:enable  Style/ClassAndModuleChildren
