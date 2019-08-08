# frozen_string_literal: true

class ConvertToActiveStorage < ActiveRecord::Migration[5.2]
  require 'open-uri'

  ID_PARTITION_LIMIT = 1_000_000_000
  DIGEST = OpenSSL::Digest.const_get('SHA1').new

  def up
    ActiveRecord::Base.connection.raw_connection.prepare('active_storage_blob_statement', <<-SQL)
      INSERT INTO active_storage_blobs (
        key, filename, content_type, metadata, byte_size, checksum, created_at
      ) VALUES ($1, $2, $3, '{}', $4, $5, $6)
      RETURNING id;
    SQL

    ActiveRecord::Base.connection.raw_connection.prepare('active_storage_attachment_statement', <<-SQL)
      INSERT INTO active_storage_attachments (
        name, record_type, record_id, blob_id, created_at
      ) VALUES ($1, $2, $3, $4, $5)
    SQL

    Rails.application.eager_load!
    models = ApplicationRecord.descendants.reject(&:abstract_class?)

    transaction do
      models.each do |model|
        attachments = model.column_names.map do |c|
          $1 if c =~ /(.+)_file_name$/
        end.compact

        next if attachments.blank?

        model.find_each.each do |instance|
          attachments.each do |attachment|
            next if instance.__send__("#{attachment}_file_name").blank?

            res = ActiveRecord::Base.connection.raw_connection.exec_prepared(
              'active_storage_blob_statement', [
                key(instance, attachment),
                instance.__send__("#{attachment}_file_name"),
                instance.__send__("#{attachment}_content_type"),
                instance.__send__("#{attachment}_file_size") || 0,
                checksum(attachment),
                instance.updated_at.iso8601
              ]
            )

            ActiveRecord::Base.connection.raw_connection.exec_prepared(
              'active_storage_attachment_statement', [
                attachment,
                model.name,
                instance.id,
                res[0]['id'],
                instance.updated_at.iso8601
              ]
            )
          end
        end
      end
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end

  private

  ID_PARTITION_LIMIT = 1_000_000_000
  DIGEST = OpenSSL::Digest.const_get('SHA1').new

  def id_partition(id)
    if id < ID_PARTITION_LIMIT
      format('%09d', id).scan(/\d{3}/).join('/')
    else
      format('%012d', id).scan(/\d{3}/).join('/')
    end
  end

  def hash_data(instance, attachment)
    "#{instance.class.to_s.underscore.pluralize}/#{attachment.pluralize}/#{instance.id}/original"
  end

  def interpolate(pattern, instance, attachment)
    path = pattern
    path = path.gsub(':class', instance.class.to_s.underscore.pluralize)
    path = path.gsub(':attachment', attachment.pluralize)
    path = path.gsub(':id_partition', id_partition(instance.id))
    path = path.gsub(':hash', OpenSSL::HMAC.hexdigest(DIGEST,
                                                      ENV['PAPERCLIP_HASH_SECRET'],
                                                      hash_data(instance, attachment)))
    path.gsub(':filename', instance.__send__("#{attachment}_file_name"))
  end

  def key(instance, attachment)
    # SecureRandom.uuid
    # Alternatively:
    if ENV['PAPERCLIP_STORAGE'] == 's3'
      interpolate(':class/:attachment/:id_partition/:hash/original/:filename', instance, attachment)
    else
      instance.class.generate_unique_secure_token
      # File.join('storage', key.first(2), key.first(4).last(2))
    end
  end

  def checksum(_attachment)
    'dummy'
    # local files stored on disk:
    # url = attachment.path
    # Digest::MD5.base64digest(File.read(url))

    # remote files stored on another person's computer:
    # url = attachment.url
    # Digest::MD5.base64digest(Net::HTTP.get(URI(url)))
  end
end
