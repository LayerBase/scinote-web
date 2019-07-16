# frozen_string_literal: true

class MarvinJsService
  class << self
    def url
      ENV['MARVINJS_URL']
    end

    def enabled?
      !ENV['MARVINJS_URL'].nil? || !ENV['MARVINJS_API_KEY'].nil?
    end

    def create_sketch(params, current_user)
      file = generate_image(params)
      if params[:object_type] == 'TinyMceAsset'
        asset = TinyMceAsset.new(team_id: current_user.current_team.id)
        attach_file(asset.image, file, params)
        asset.save!
        return { asset: asset }
      end

      asset = Asset.new(created_by: current_user,
                          last_modified_by: current_user,
                          team_id: current_user.current_team.id)
      attach_file(asset.file, file, params)
      asset.save!
      connect_asset(asset, params, current_user)
    end

    def update_sketch(params, current_user)
      if params[:object_type] == 'TinyMceAsset'
        asset = current_user.current_team.tiny_mce_assets.find(params[:id])
        attachment = asset&.image
      else
        asset = current_user.current_team.assets.find(params[:id])
        attachment = asset&.file
      end
      return unless attachment

      file = generate_image(params)
      attachment.purge_later
      attach_file(attachment, file, params)
      asset
    end

    private

    def connect_asset(asset, params, current_user)
      if params[:object_type] == 'Step'
        object = params[:object_type].constantize.find(params[:object_id])
        object.assets << asset
      elsif params[:object_type] == 'Result'
        my_module = MyModule.find_by_id(params[:object_id])
        return unless my_module

        object = Result.create(user: current_user,
                          my_module: my_module,
                          name: prepare_name(params[:name]),
                          asset: asset,
                          last_modified_by: current_user)
      end
      { asset: asset, object: object }
    end

    def generate_image(params)
      image_data = Base64.decode64(params[:image].split(',')[1])
      file = Tempfile.new([prepare_name(params[:name]), '.jpg'])
      file.binmode
      file << image_data
      file.rewind
      file
    end

    def attach_file(asset, file, params)
      asset.attach(
        io: file,
        filename: "#{prepare_name(params[:name])}.jpg",
        content_type: 'image/jpeg',
        metadata: {
          name: prepare_name(params[:name]),
          description: params[:description],
          asset_type: 'marvinjs'
        }
      )
    end

    def prepare_name(sketch_name)
      if !sketch_name.empty?
        sketch_name
      else
        I18n.t('marvinjs.new_sketch')
      end
    end
  end
end
