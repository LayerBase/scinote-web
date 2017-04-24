class TinyMceAssetsController < ApplicationController
  before_action :find_object

  def create
    image = params.fetch(:file) { render_404 }
    tiny_img = TinyMceAsset.new(image: image,
                                reference: @obj,
                                editing: true,
                                team_id: current_team.id)
    if tiny_img.save
      render json: {
          image: {
            url: view_context.image_url(tiny_img.url(:original)),
            token: Base62.encode(tiny_img.id)
          }
      }, content_type: 'text/html'
    else
      render_404
    end
  end

  private

  def find_object
    obj_type = params.fetch(:object_type) { render_404 }
    obj_id = params.fetch(:object_id) { render_404 }
    render_404 unless ['step', 'result_text'].include? obj_type
    @obj = obj_type.classify.constantize.find_by_id(obj_id)
  end
end
